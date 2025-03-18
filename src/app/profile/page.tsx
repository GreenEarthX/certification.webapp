'use client';

import { useUser } from '@auth0/nextjs-auth0/client';

export default function Home() {
  const { user, isLoading, error } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Auth0 Test</h1>
      {user ? (
        <div>
          <p>Logged in as: {user.email}</p>
          <button onClick={() => (window.location.href = '/api/auth/logout')}>
            Logout
          </button>
        </div>
      ) : (
        <div>
          <p>Not logged in</p>
          <button onClick={() => (window.location.href = '/api/auth/login')}>
            Login
          </button>
        </div>
      )}
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
