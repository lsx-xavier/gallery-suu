'use client'
import httpClient from '@/config/httpClient';
import { redirect } from 'next/navigation';
import React, { FormEvent, useCallback, useState } from 'react';

type FormCreateUserProps = {
  params: Promise<{
    folders: string[]
  }>
}


export function FormCreateUser({ params }: FormCreateUserProps) {
  const { folders } = React.use(params);

  const [user, setUser] = useState<string>()
  const [pass, setPass] = useState<string>()
  const [admin, setAdmin] = useState<string>()
  const [info, setInfo] = useState<{
    isError: boolean;
    text: string;
  } | undefined>(undefined)

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!admin || admin !== "suuk1221@") {
      setInfo({
        isError: true,
        text: "Senha de segurança errada!",
      });
      return;
    }

    if ((!user || user === "") || (!pass || pass === "")) {
      setInfo({
        isError: true,
        text: "Preencha o formulário!",
      });
      return;
    }

    try {
      const response = await httpClient.post<string>({
        url: `/create-user-to-folder`, body: {
          folderName: folders?.[0],
          user,
          pass
        }
      });

      // TODO: Pegar o response e mostrar na tela
      setInfo({
        isError: false,
        text: 'Conta criada, pode passar para o cliente!',
      });

      setUser(undefined);
      setPass(undefined);
      setAdmin(undefined);
    } catch (error) {
      setInfo({
        isError: true,
        text: `Algum erro aconteceu! Pede para o seu amor ver. Erro: ${error}`,
      });
    }
  }, [admin, user, pass, folders])

  if (info) {
    return (
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 py-8 px-12 flex flex-col gap-2 rounded-lg ${info.isError ? "bg-gray-500" : "bg-green-950"}`}>
        <button type='button' onClick={() => setInfo(undefined)} className='absolute top-1 right-2'>X</button>
        <div className='flex flex-col gap-4'>
          {info.text}

          {!info.isError && <div className='flex gap-4 justify-end'>
            <button type="button" onClick={() => setInfo(undefined)} className="border border-white bg-transparent rounded-md py-3 hover:bg-white/30 p-3">
              Fechar
            </button>

            <button type="button" onClick={() => redirect(`/galeria/${folders.filter(i => i !== "create").join("/")}`)} className="border border-white bg-transparent rounded-md py-3 hover:bg-white/30 p-3">
              Ir para galeria
            </button>
          </div>}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-500 p-8 flex flex-col gap-2 rounded-lg">
      <p className='mb-6 text-center w-full font-bold text-2xl'>Criar Usuário</p>

      <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
        <div className='flex flex-col gap-2'>
          <div className='flex gap-2'>
            <input className='border border-zinc-800 bg-transparent rounded-md p-2 text-white placeholder-white' placeholder='Usuário' type='text' name="user" onChange={(e) => setUser(e.target.value)} />
            <input className='border border-zinc-800 bg-transparent rounded-md p-2 text-white placeholder-white' placeholder='Senha' type='password' name='pass' onChange={(e) => setPass(e.target.value)} />
          </div>
          <input className='border border-zinc-800 bg-transparent rounded-md p-2 text-white placeholder-white' placeholder='Senha Admin' type='password' name='adminPass' onChange={(e) => setAdmin(e.target.value)} />
        </div>

        <button type='submit' className="border border-zinc-800 bg-transparent rounded-md py-3 hover:bg-zinc-800/30">Enviar</button>
      </form>
    </div>
  )
}
