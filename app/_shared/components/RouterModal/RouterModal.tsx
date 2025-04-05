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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-white px-6 py-4 rounded-lg relative">
        <Button
          onClick={() => router.back()}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
        >
          ✕
        </Button>

        <div>{children}</div>
      </div>
    </div>
  );
}
