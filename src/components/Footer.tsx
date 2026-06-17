import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      background: 'var(--footer-bg)',
      color: 'var(--footer-text)',
      borderTop: '4px solid var(--footer-border)',
      padding: '40px 0 30px',
      marginTop: '40px',
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}>
          <div>
            <div style={{
              fontWeight: 900,
              fontSize: '1.8rem',
              letterSpacing: '-1px',
              lineHeight: 1,
              marginBottom: '8px',
              color: 'var(--footer-text)',
            }}>
              🔥 AI<span style={{ color: 'var(--brut-primary)' }}>ROAST</span>
            </div>
            <p style={{
              fontWeight: 600,
              fontSize: '0.85rem',
              opacity: 0.7,
              color: 'var(--footer-text)',
            }}>
              Type anything. Regret everything.
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '8px',
          }}>
            <div style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
            }}>
              {['Made with ☕ + 🔥', 'Powered by Gemini AI', '© 2026'].map(item => (
                <span
                  key={item}
                  className="brut-tag"
                  style={{
                    background: 'transparent',
                    border: '2px solid var(--footer-text)',
                    color: 'var(--footer-text)',
                    boxShadow: 'none',
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              opacity: 0.5,
              color: 'var(--footer-text)',
            }}>
              No egos were permanently harmed (probably).
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '3px dashed var(--footer-text)',
          textAlign: 'center',
          gap: '12px'
        }}>
          <p style={{
            fontWeight: 800,
            fontSize: '1rem',
            color: 'var(--footer-text)',
            letterSpacing: '0.5px'
          }}>
            Created by Akshat Sharma
          </p>
          <a
            href="https://supportme-akshat.netlify.app/supportme"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              background: 'var(--brut-secondary)',
              color: '#000000',
              border: '3px solid #000000',
              padding: '8px 18px',
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: '4px 4px 0 #000000',
              cursor: 'pointer',
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(1px, 1px)';
              e.currentTarget.style.boxShadow = '2px 2px 0 #000000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(0px, 0px)';
              e.currentTarget.style.boxShadow = '4px 4px 0 #000000';
            }}
          >
            🍵 Buy me a Tea
          </a>
        </div>
      </div>
    </footer>
  );
};
