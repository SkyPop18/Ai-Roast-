import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env'), override: true });
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('[FATAL] GEMINI_API_KEY is not set in server/.env — exiting.');
  process.exit(1);
}
const PORT      = parseInt(process.env.PORT || '3001', 10);
const NODE_ENV  = process.env.NODE_ENV || 'development';
const APP_MODE  = process.env.APP_MODE || 'test'; 
const rawOrigins = process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174';
const allowedOrigins = rawOrigins.split(',').map(o => o.trim()).filter(Boolean);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const MODEL_IDS = [
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-3.5-flash',
];
const COOLDOWN_MS = 5 * 60 * 1000; 
const modelHealth = Object.fromEntries(
  MODEL_IDS.map(id => [id, { failures: 0, cooldownUntil: 0, successfulRequests: 0 }])
);
function getAvailableModels() {
  const now = Date.now();
  const available = MODEL_IDS.filter(id => now >= modelHealth[id].cooldownUntil);
  if (available.length === 0) {
    return [MODEL_IDS.reduce((best, id) =>
      modelHealth[id].cooldownUntil < modelHealth[best].cooldownUntil ? id : best
    )];
  }
  return available;
}
function getActiveModelId() {
  return getAvailableModels()[0];
}
function markModelFailed(id) {
  const h = modelHealth[id];
  h.failures++;
  h.cooldownUntil = Date.now() + COOLDOWN_MS;
  console.warn(`[model] ⚠️  ${id} marked unavailable for 5 min (failures: ${h.failures})`);
}
function markModelSuccess(id) {
  const h = modelHealth[id];
  h.failures = 0;
  h.successfulRequests++;
}
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const responseCache = new Map();
function getCacheKey(input, category, style, length, intensity) {
  return `${input.toLowerCase().trim()}|${category}|${style}|${length}|${intensity}`;
}
function getFromCache(key) {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(key);
    return null;
  }
  return entry.data;
}
function setCache(key, data) {
  responseCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}
// Clean stale cache entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of responseCache) {
    if (now > entry.expiresAt) responseCache.delete(key);
  }
}, 60 * 60 * 1000);
const statsFilePath = join(__dirname, 'stats.json');
let statsData = {
  totalRoasts: 42199,
  usersEmoDamaged: 39857,
  avgBurnTemp: 4831,
  totalSpiceSum: 42199 * 4831,
  todaysVictims: 227,
  lastResetDate: new Date().toISOString().slice(0, 10),
};
function loadStats() {
  try {
    if (fs.existsSync(statsFilePath)) {
      const fileData = JSON.parse(fs.readFileSync(statsFilePath, 'utf8'));
      statsData = { ...statsData, ...fileData };
      console.log(`[stats] Loaded real-time statistics from stats.json: totalRoasts=${statsData.totalRoasts}, avgBurnTemp=${statsData.avgBurnTemp}`);
    } else {
      saveStats();
      console.log(`[stats] Initialized stats.json with seed statistics.`);
    }
  } catch (err) {
    console.error('[stats] Failed to load stats.json:', err.message);
  }
}

function saveStats() {
  try {
    fs.writeFileSync(statsFilePath, JSON.stringify(statsData, null, 2), 'utf8');
  } catch (err) {
    console.error('[stats] Failed to save stats.json:', err.message);
  }
}
loadStats();
function recordRoastGeneration(score, intensity, damageLevel) {
  statsData.totalRoasts += 1;
  if (damageLevel >= 3) {
    statsData.usersEmoDamaged += 1;
  }
  const spiceContribution = 3500 + (intensity * 400) + (score * 5) + Math.floor(Math.random() * 100);
  statsData.totalSpiceSum += spiceContribution;
  statsData.avgBurnTemp = Math.round(statsData.totalSpiceSum / statsData.totalRoasts);
  const today = new Date().toISOString().slice(0, 10);
  if (statsData.lastResetDate !== today) {
    statsData.todaysVictims = 1;
    statsData.lastResetDate = today;
  } else {
    statsData.todaysVictims += 1;
  }
  saveStats();
}

const dailyUsage  = new Map(); 
function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}
function getUsageKey(ip) {
  return `${ip}:${getTodayStr()}`;
}
function getLimitForLength(length) {
  if (length === 'long') return 1;
  if (length === 'medium') return 2;
  return 3; // 'short' and 'one-liner'
}
function getRemaining(ip, length) {
  if (APP_MODE !== 'production') {
    return Infinity; 
  }
  const count = dailyUsage.get(getUsageKey(ip)) || 0;
  const limit = getLimitForLength(length);
  return Math.max(0, limit - count);
}

function incrementUsage(ip) {
  if (APP_MODE !== 'production') return;
  const key = getUsageKey(ip);
  dailyUsage.set(key, (dailyUsage.get(key) || 0) + 1);
}

setInterval(() => {
  const today = getTodayStr();
  for (const key of dailyUsage.keys()) {
    if (!key.endsWith(today)) dailyUsage.delete(key);
  }
}, 60 * 60 * 1000);
// ── Constants ─────────────────────────────────────────────────────────────────
const GEMINI_TIMEOUT_MS = 15_000;
const MAX_INPUT_LENGTH  = 500;
const MIN_INPUT_LENGTH  = 3;
const VALID_CATEGORIES = new Set([
  'General', 'Startup', 'Coding', 'Instagram',
  'Twitter', 'Dating', 'Business', 'Student', 'Gamer',
]);
const VALID_STYLES = new Set([
  'Funny', 'Savage', 'Sarcastic', 'Corporate',
  'Gen Z', 'Dark Humor', 'One-Liner', 'Stand-Up Comedy',
]);

const VALID_LENGTHS = new Set(['one-liner', 'short', 'medium', 'long']);
const TOKEN_MAP = {
  'one-liner': 80,
  'short':     150,
  'medium':    250,
  'long':      450,
};

const LENGTH_INSTRUCTIONS = {
  'one-liner': 'OUTPUT EXACTLY 1 COMPLETE SENTENCE. One punchline. Nothing more.',
  'short':     'OUTPUT 1-2 COMPLETE LINES/SENTENCES ONLY.',
  'medium':    'OUTPUT 3-4 COMPLETE LINES/SENTENCES ONLY.',
  'long':      'OUTPUT 5-8 COMPLETE LINES/SENTENCES ONLY.',
};
const INTENSITY_LABELS = {
  1: 'mild and gentle',
  2: 'moderately spicy',
  3: 'savage',
  4: 'ruthless',
  5: 'nuclear — no mercy whatsoever',
};
function withTimeout(promise, ms) {
  let id;
  const timeout = new Promise((_, reject) => {
    id = setTimeout(() => reject(new Error('TIMEOUT')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(id));
}
function getDamageLevel(score) {
  if (score < 25) return { level: 1, label: 'Mild' };
  if (score < 50) return { level: 2, label: 'Medium' };
  if (score < 75) return { level: 3, label: 'Severe' };
  return { level: 4, label: 'Emotional Damage' };
}
function sanitizeInput(str) {
  return str
    .replace(/[<>]/g, '')
    .replace(/\[INST\]|\[\/INST\]|<\|im_start\|>|<\|im_end\|>|SYSTEM:|USER:|ASSISTANT:/gi, '')
    .trim();
}
/**
 * Validate and clean the roast text based on the length mode.
 * Discards any trailing incomplete sentences, half-sentences, or unfinished words.
 * Returns null if validation fails.
 */
function validateAndFormatRoast(text, lengthMode) {
  if (!text || typeof text !== 'string') return null;

  let cleanText = text.trim();
  if (cleanText.startsWith('"') && cleanText.endsWith('"')) {
    cleanText = cleanText.slice(1, -1).trim();
  }
  // Matches complete sentences ending with . ! ? (optionally followed by quotes/parentheses)
  const matches = cleanText.match(/[^.!?\r\n]+[.!?]+["')\]]?(?:\s+|$)/g) || [];
  const sentences = matches.map(s => s.trim()).filter(Boolean);
  if (sentences.length === 0) {
    return null; 
  }
  if (lengthMode === 'one-liner') {
    return sentences[0];
  } else if (lengthMode === 'short') {
    return sentences.slice(0, 2).join(' ');
  } else if (lengthMode === 'medium') {
    if (sentences.length < 3) return null;
    return sentences.slice(0, 4).join(' ');
  } else if (lengthMode === 'long') {
    if (sentences.length < 5) return null;
    return sentences.slice(0, 8).join(' ');
  }
  return sentences.join(' ');
}
function buildPrompt(input, category, style, length, intensity) {
  const lengthInstr    = LENGTH_INSTRUCTIONS[length] || LENGTH_INSTRUCTIONS['short'];
  const intensityDesc  = INTENSITY_LABELS[intensity] || INTENSITY_LABELS[3];
  const categoryCtx    = (category && category !== 'General')
    ? `\nContext/Category: ${category}.`
    : '';
  return `You are a professional roast comedian writing for a Roast Maker tool.
ABSOLUTE RULES (never break these):
1. ${lengthInstr}
2. Style: ${style}. Intensity: ${intensityDesc} (${intensity}/5).
3. Output ONLY the roast text. Zero intro. Zero "Here is your roast". Zero quotes around the output.
4. If the user asks to roast themselves, roast them — follow their instructions exactly.
5. Roast the target described. Be specific and personal to what they wrote.
6. Never attack protected characteristics (race, religion, gender identity, disability).
7. Keep it PG-13: edgy and sharp, not hateful.
8. No AI-sounding filler. No clichés. No explanations. Just the roast.${categoryCtx}
User's roast request:
${input}`;
}
// ── IP Extraction ─────────────────────────────────────────────────────────────
/**
 * Reliably extract the real client IP from behind reverse proxies.
 * Checks headers in order: CF-Connecting-IP, X-Real-IP, X-Forwarded-For, then
 * falls back to req.ip / socket address.  Handles comma-separated X-Forwarded-For
 * lists by taking the LEFT-MOST (original client) entry.
 */
function getClientIp(req) {
  // Cloudflare always sets this to the true visitor IP
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp && typeof cfIp === 'string') return cfIp.trim();

  // Nginx / other proxies
  const realIp = req.headers['x-real-ip'];
  if (realIp && typeof realIp === 'string') return realIp.trim();

  // Standard: X-Forwarded-For can be "client, proxy1, proxy2"
  const xff = req.headers['x-forwarded-for'];
  if (xff) {
    const raw = Array.isArray(xff) ? xff[0] : xff;
    const first = raw.split(',')[0].trim();
    if (first) return first;
  }

  // Express req.ip (respects trust proxy)
  if (req.ip && req.ip !== '::1' && req.ip !== '::ffff:127.0.0.1') return req.ip;

  // Final fallback
  return req.socket?.remoteAddress || '0.0.0.0';
}

// ── App Setup ─────────────────────────────────────────────────────────────────
const app = express();
app.set('trust proxy', true); // Trust the full proxy chain so req.ip / X-Forwarded-For are populated
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn(`[cors] Blocked origin: ${origin}`);
    callback(new Error('CORS_REJECTED'));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10kb' }));
// Rate limiter — skipped in test mode
const roastLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  message: { error: 'Too many requests. Please wait a few minutes and try again.' },
  skip: () => APP_MODE !== 'production',
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    env: NODE_ENV,
    appMode: APP_MODE,
    activeModel: getActiveModelId(),
    modelHealth: Object.fromEntries(
      MODEL_IDS.map(id => [id, {
        available: Date.now() >= modelHealth[id].cooldownUntil,
        failures: modelHealth[id].failures,
        cooldownUntil: modelHealth[id].cooldownUntil,
        successfulRequests: modelHealth[id].successfulRequests,
      }])
    ),
    cacheSize: responseCache.size,
    stats: {
      totalRoasts: statsData.totalRoasts,
      usersEmoDamaged: statsData.usersEmoDamaged,
      avgBurnTemp: statsData.avgBurnTemp,
      todaysVictims: statsData.todaysVictims,
    },
    timestamp: new Date().toISOString(),
  });
});
app.get('/api/stats', (_req, res) => {
  const today = getTodayStr();
  if (statsData.lastResetDate !== today) {
    statsData.todaysVictims = 0;
    statsData.lastResetDate = today;
    saveStats();
  }
  res.json({
    totalRoasts: statsData.totalRoasts,
    usersEmoDamaged: statsData.usersEmoDamaged,
    avgBurnTemp: statsData.avgBurnTemp,
    todaysVictims: statsData.todaysVictims,
  });
});
app.get('/api/usage', (req, res) => {
  const ip = getClientIp(req);
  const count = dailyUsage.get(getUsageKey(ip)) || 0;
  console.log(`[usage] IP=${ip} count=${count} key=${getUsageKey(ip)}`);
  res.json({
    count,
    appMode: APP_MODE
  });
});
app.post('/api/roast', roastLimiter, async (req, res) => {
  const ip = getClientIp(req);
  console.log(`[roast] Resolved IP=${ip} | xff=${req.headers['x-forwarded-for'] || 'none'} | cf=${req.headers['cf-connecting-ip'] || 'none'} | req.ip=${req.ip}`);
  const { input, category, style, length, intensity } = req.body;

  if (!input || typeof input !== 'string') {
    return res.status(400).json({ error: 'Input is required.' });
  }
  const trimmed = sanitizeInput(input);
  if (trimmed.length < MIN_INPUT_LENGTH) {
    return res.status(400).json({ error: `Tell us a bit more — at least ${MIN_INPUT_LENGTH} characters.` });
  }
  if (trimmed.length > MAX_INPUT_LENGTH) {
    return res.status(400).json({ error: `Input too long. Max ${MAX_INPUT_LENGTH} characters.` });
  }
  if (category !== undefined && !VALID_CATEGORIES.has(category)) {
    return res.status(400).json({ error: 'Invalid category.' });
  }
  if (style !== undefined && !VALID_STYLES.has(style)) {
    return res.status(400).json({ error: 'Invalid style.' });
  }
  if (length !== undefined && !VALID_LENGTHS.has(length)) {
    return res.status(400).json({ error: 'Invalid length.' });
  }
  if (intensity !== undefined && (typeof intensity !== 'number' || intensity < 1 || intensity > 5)) {
    return res.status(400).json({ error: 'Intensity must be a number between 1 and 5.' });
  }
  const safeCategory  = VALID_CATEGORIES.has(category) ? category : 'General';
  const safeStyle     = VALID_STYLES.has(style)         ? style    : 'Funny';
  const safeLength    = VALID_LENGTHS.has(length)       ? length   : 'short';
  const safeIntensity = (Number.isInteger(intensity) && intensity >= 1 && intensity <= 5) ? intensity : 3;
  if (APP_MODE === 'production') {
    const count = dailyUsage.get(getUsageKey(ip)) || 0;
    const limit = getLimitForLength(safeLength);
    if (count >= limit) {
      return res.status(429).json({
        error: `Daily limit reached for ${safeLength} roasts. Limit is ${limit} roast(s) per day.`,
        limitReached: true,
        remaining: 0,
        count
      });
    }
  }
  // ── Cache lookup ──
  const cacheKey = getCacheKey(trimmed, safeCategory, safeStyle, safeLength, safeIntensity);
  const cached   = getFromCache(cacheKey);
  if (cached) {
    console.log(`[cache] HIT — returning cached roast`);
    incrementUsage(ip);
    const count = dailyUsage.get(getUsageKey(ip)) || 0;
    recordRoastGeneration(cached.score, safeIntensity, cached.damageLevel);
    return res.json({
      ...cached,
      remaining: getRemaining(ip, safeLength),
      count,
      fromCache: true,
      stats: {
        totalRoasts: statsData.totalRoasts,
        usersEmoDamaged: statsData.usersEmoDamaged,
        avgBurnTemp: statsData.avgBurnTemp,
        todaysVictims: statsData.todaysVictims,
      }
    });
  }
  // ── Call Gemini with health system and failover ──
  const modelsToTry = getAvailableModels();
  const maxTokens   = TOKEN_MAP[safeLength] || 150;
  const prompt      = buildPrompt(trimmed, safeCategory, safeStyle, safeLength, safeIntensity);
  let roastText = null;
  let usedModel = null;
  for (const modelId of modelsToTry) {
    try {
      console.log(`[model] Trying ${modelId}...`);
      const callModel = async (tokens) => {
        const model = genAI.getGenerativeModel({
          model: modelId,
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: tokens,
            topP: 0.95,
            topK: 40,
          },
        });
        const result = await withTimeout(model.generateContent(prompt), GEMINI_TIMEOUT_MS);
        const text = result.response.text().trim();
        const candidate = result.response.candidates?.[0];
        // Output is truncated if it finishes because of max tokens or does not end in punctuation
        const isTruncated = (candidate?.finishReason === 'MAX_TOKENS') || !(/[.!?]["')\]]?$/.test(text));
        return { text, isTruncated };
      };
      let resData = await callModel(maxTokens);
      if (resData.isTruncated) {
        console.warn(`[model] Output from ${modelId} was truncated. Retrying once with a higher token limit...`);
        const higherTokens = Math.min(1000, maxTokens * 2.5);
        resData = await callModel(higherTokens);
      }

      let validatedText = validateAndFormatRoast(resData.text, safeLength);
      if (!validatedText) {
        console.warn(`[model] Output validation failed for ${modelId}. Automatically regenerating once...`);
        resData = await callModel(maxTokens);
        
        if (resData.isTruncated) {
          console.warn(`[model] Regenerated output was truncated. Retrying once with a higher token limit...`);
          const higherTokens = Math.min(1000, maxTokens * 2.5);
          resData = await callModel(higherTokens);
        }
        validatedText = validateAndFormatRoast(resData.text, safeLength);
      }
      if (validatedText) {
        markModelSuccess(modelId);
        usedModel = modelId;
        roastText = validatedText;
        break; 
      } else {
        console.error(`[model] ${modelId} returned invalid output structure after retry and regeneration.`);
        markModelFailed(modelId);
      }
    } catch (err) {
      if (err.message === 'TIMEOUT') {
        console.error(`[model] ${modelId} timed out`);
      } else {
        console.error(`[model] ${modelId} error:`, err.message);
      }
      markModelFailed(modelId);
    }
  }
  if (!roastText) {
    console.error('[roast] All available models failed, timed out, or returned invalid outputs.');
    return res.status(502).json({ error: 'The AI service is temporarily unavailable. Please try again.' });
  }

  const score              = Math.floor(Math.random() * 40) + 55;
  const { level, label }   = getDamageLevel(score);
  const responseData       = { roast: roastText, score, damageLevel: level, damageLabel: label };
  setCache(cacheKey, responseData);
  incrementUsage(ip);
  const count = dailyUsage.get(getUsageKey(ip)) || 0;
  recordRoastGeneration(score, safeIntensity, level);

  console.log(`[roast] ✅ Generated via ${usedModel} | length=${safeLength} style=${safeStyle} intensity=${safeIntensity}`);
  return res.json({
    ...responseData,
    remaining: getRemaining(ip, safeLength),
    count,
    stats: {
      totalRoasts: statsData.totalRoasts,
      usersEmoDamaged: statsData.usersEmoDamaged,
      avgBurnTemp: statsData.avgBurnTemp,
      todaysVictims: statsData.todaysVictims,
    }
  });
});

app.use((_req, res) => res.status(404).json({ error: 'Not found.' }));
app.use((err, _req, res, _next) => {
  console.error('[server] Unhandled error:', err.message);
  if (err.message === 'CORS_REJECTED') return res.status(403).json({ error: 'Forbidden.' });
  res.status(500).json({ error: 'Internal server error.' });
});
app.listen(PORT, () => {
  console.log(`[server] ✅ Running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`[server] ⚙️  APP_MODE: ${APP_MODE}`);
  console.log(`[server] 🔒 CORS: ${allowedOrigins.join(', ')}`);
  console.log(`[server] 🤖 Models: ${MODEL_IDS.join(' → ')}`);
  console.log(`[server] 🔥 Daily limit dynamic (Long: 1, Medium: 2, Short/1L: 3)`);
});
