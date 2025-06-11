'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function PostLoginPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    console.log('user:', user);
    if (isLoading || !user) return;

    const roles = user['https://your-app.com/roles'] as string[] || [];
    console.log('roles:', roles);

    if (roles.includes('Admin')) {
      router.replace('/admin/certifications');
    } else if (roles.includes('PlantOperator')) {
      router.replace('/dashboards/dashboard');
    } else if (roles.length > 0) {
      router.replace('/unauthorized');
    }
  }, [user, isLoading, router]);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Redirecting based on role...</h2>
      <pre>user: {JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
