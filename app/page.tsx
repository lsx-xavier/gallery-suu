'use client';
import { hashPassword } from '@/src/utils/encrypt-decrypt';
import { useState } from 'react';

export default function Page() {
  const [hash, setHash] = useState('');
  const [hashResponse, setHashResponse] = useState('');
  const getHash = async () => {
    const response = await hashPassword(hash);
    setHashResponse(response);
  };
  return (
    <div>
      <input className="text-black" type="text" onChange={(e) => setHash(e.target.value)} />
      <button onClick={getHash}>Get Hash</button>
      <p>{hashResponse}</p>
    </div>
  );
}
