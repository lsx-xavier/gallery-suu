'use client'
import httpClient from '@/config/httpClient';
import { useRouter } from 'next/router';
import { FormEvent, useCallback, useState } from 'react';

type AuthFormProps = {
  folders: string[];
}

export function AuthForm({ folders }: AuthFormProps) {
  const router = useRouter()
  const [user, setUser] = useState<string>()
    const [pass, setPass] = useState<string>()
    const [error, setError] = useState<string | undefined>(undefined)

 const handleAuth = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await httpClient.post({
        url: '/auth',
        body: {
          user,
          pass,
          folderName: folders?.[0]
        }
      });

      router.reload()
    } catch (error: unknown) {
      const {body: { message }} = error as { body: { message: string } }
      setError(message as string)
    }
  }, [folders, pass, user, router]);

  if(error) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-500 py-8 px-12 flex flex-col gap-2 rounded-lg">
        <button type='button' onClick={() => setError(undefined)} className='absolute top-1 right-2'>X</button>
        {error}
      </div>
      );
  }

  return  (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-500 p-8 flex flex-col gap-2 rounded-lg">
      <p className='mb-6 text-center w-full font-bold text-2xl'>Digite a conta para ver as fotos</p>

      <form onSubmit={handleAuth} className="flex flex-col gap-5">
        <div className='flex gap-2'>
          <input className='border border-zinc-800 bg-transparent rounded-md p-2 text-white placeholder-white' placeholder='Usuário' type='text' name="user"  onChange={(e) => setUser(e.target.value)} />
          <input className='border border-zinc-800 bg-transparent rounded-md p-2 text-white placeholder-white' placeholder='Senha' type='password' name='pass'  onChange={(e) => setPass(e.target.value)} />
        </div>
        
        <button className="border border-zinc-800 bg-transparent rounded-md py-3 hover:bg-zinc-800/30" type="submit">Ver as fotos</button>
      </form>
    </div>
  )
}
