'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingCard } from '@/components/common/LoadingState';

export default function LoadingRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/plant-operator/recommendations');
    }, 3000); // simulate loading delay of 3s

    return () => clearTimeout(timer);
  }, [router]);

  return <LoadingCard message="Reviewing your recommendation list" />;
}
