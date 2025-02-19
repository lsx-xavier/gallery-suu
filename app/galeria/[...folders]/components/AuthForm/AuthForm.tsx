'use client'
import { comparePassword } from '@/utils/encrypt-decrypt';
import React, { FormEvent, useCallback, useState } from 'react';


type AuthFormProps = {
  folders: string[];
  setAuthenticated: React.Dispatch<boolean>;
}

export function AuthForm({ folders, setAuthenticated }: AuthFormProps) {
  const [user, setUser] = useState<string>()
    const [pass, setPass] = useState<string>()
    const [error, setError] = useState<string | undefined>(undefined)

 const handleAuth = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthenticated(false);

    const account = await fetch(`/api/get-user-of-folder?folderName=${folders?.[0]}`, {
      cache: "force-cache"
    }).then(resp => resp.json()).catch(res => console.log({res}));
    
    if(account && account.error) {
      setError("Precisa cadastrar a conta!")

      return;
    }

    if(!pass) {
      setError("Precisa digitar a senha!")

      return;
    }

    const isSamePass = await comparePassword(pass ,account.pass)

    if(account.user === user && isSamePass) {
      setAuthenticated(true)
      return;
    }

    setError("Usuário ou senha errada!");
  }, [folders, pass, user, setAuthenticated]);

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
