export interface RoastRequest {
  input: string;
  category: string;
  style: string;
  length: string;
  intensity: number;
}

export interface RoastResponse {
  roast: string;
  score: number;
  damageLevel: number;
  damageLabel: string;
  remaining?: number;
  count?: number;
  fromCache?: boolean;
  stats?: {
    totalRoasts: number;
    usersEmoDamaged: number;
    avgBurnTemp: number;
    todaysVictims: number;
  };
}

export const DAILY_LIMIT = 3;

export async function generateRoast(req: RoastRequest): Promise<RoastResponse> {
  const response = await fetch('/api/roast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  const data = await response.json().catch(() => ({ error: 'Unexpected server response.' }));

  if (!response.ok) {
    const err = new Error(data?.error || `Request failed (${response.status})`);
    (err as any).limitReached = data?.limitReached ?? false;
    (err as any).count = data?.count;
    throw err;
  }

  return data as RoastResponse;
}

export async function fetchUsage(): Promise<{ count: number; appMode?: string }> {
  try {
    const res = await fetch('/api/usage');
    if (!res.ok) throw new Error('usage check failed');
    return res.json();
  } catch {
    return { count: 0, appMode: 'production' };
  }
}

export async function fetchStats(): Promise<{
  totalRoasts: number;
  usersEmoDamaged: number;
  avgBurnTemp: number;
  todaysVictims: number;
}> {
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Stats fetch failed');
    return res.json();
  } catch {
    return {
      totalRoasts: 42199,
      usersEmoDamaged: 39857,
      avgBurnTemp: 4831,
      todaysVictims: 227,
    };
  }
}

export const EXAMPLE_INPUTS = [
  "My friend who always arrives 2 hours late to everything and has zero guilt about it",
  "Startup founders who pivot 5 times in a year and call it 'vision'",
  "Instagram fitness influencers posting 'authentic' fully sponsored content",
  "JavaScript frameworks that release a major version every 3 weeks",
  "My roommate who leaves dishes in the sink for 3 days and calls it 'soaking'",
  "Overpriced gaming laptops with 45-minute battery life and a GPU the size of a toaster",
  "People who write 'per my last email' in every reply",
  "Exam systems that test memorization instead of understanding",
];
