'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/_shared/components';

type RouterModalProps = {
  children: React.ReactNode;
};

export default function RouterModal({ children }: RouterModalProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60">
      <div className="relative rounded-lg bg-white px-6 py-4">
        <Button
          onClick={() => router.back()}
          className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
        >
          ✕
        </Button>

        <div>{children}</div>
      </div>
    </div>
  );
}
