'use client';

import { getToken, getRefreshToken } from '@/lib/shared-auth';

export default function DebugToken() {
  const token = getToken();
  const refresh = getRefreshToken();

  let payload = null;
  if (token) {
    try {
      payload = JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      payload = 'Invalid token format';
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>🔑 Debug Token (localhost:3001)</h1>
      <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '8px' }}>
{JSON.stringify({
        accessTokenPreview: token ? token.substring(0, 30) + '...' : 'null',
        refreshTokenPreview: refresh ? refresh.substring(0, 30) + '...' : 'null',
        payload,
        exp: payload ? new Date(payload.exp * 1000).toLocaleString() : null,
      }, null, 2)}
      </pre>
      <p>Full access token (copy-paste into jwt.io):</p>
      <textarea
        readOnly
        rows={6}
        style={{ width: '100%', fontFamily: 'monospace' }}
        value={token || ''}
      />
    </div>
  );
}