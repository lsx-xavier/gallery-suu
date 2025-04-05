'use client';
import httpClient from '@/(infra)/config/httpClient';
import { redirect } from 'next/navigation';
import { FormEvent, useCallback, useState } from 'react';

type FormCreateUserProps = {
  folders: string[];
};

export function FormCreateUser({ folders }: FormCreateUserProps) {
  const [user, setUser] = useState<string>();
  const [pass, setPass] = useState<string>();
  const [admin, setAdmin] = useState<string>();
  const [info, setInfo] = useState<
    | {
        isError: boolean;
        text: string;
      }
    | undefined
  >(undefined);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!admin || admin !== 'suuk1221@') {
        setInfo({
          isError: true,
          text: 'Senha de segurança errada!',
        });
        return;
      }

      if (!user || user === '' || !pass || pass === '') {
        setInfo({
          isError: true,
          text: 'Preencha o formulário!',
        });
        return;
      }

      try {
        // TODO: Pegar o response e mostrar na tela
        await httpClient.post<string>({
          url: `/create-user-to-folder`,
          body: {
            folders,
            user,
            pass,
          },
        });

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
    },
    [admin, user, pass, folders],
  );

  if (info) {
    return (
      <div
        className={`absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-2 rounded-lg px-12 py-8 ${info.isError ? 'bg-gray-500' : 'bg-green-950'}`}
      >
        <button type="button" onClick={() => setInfo(undefined)} className="absolute top-1 right-2">
          X
        </button>
        <div className="flex flex-col gap-4">
          {info.text}

          {!info.isError && (
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setInfo(undefined)}
                className="rounded-md border border-white bg-transparent p-3 py-3 hover:bg-white/30"
              >
                Fechar
              </button>

              <button
                type="button"
                onClick={() =>
                  redirect(`/galeria/${folders.filter((i) => i !== 'create').join('/')}`)
                }
                className="rounded-md border border-white bg-transparent p-3 py-3 hover:bg-white/30"
              >
                Ir para galeria
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-2 rounded-lg bg-gray-500 p-8">
      <p className="mb-6 w-full text-center text-2xl font-bold">Criar Usuário</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              className="rounded-md border border-zinc-800 bg-transparent p-2 text-white placeholder-white"
              placeholder="Usuário"
              type="text"
              name="user"
              onChange={(e) => setUser(e.target.value)}
            />
            <input
              className="rounded-md border border-zinc-800 bg-transparent p-2 text-white placeholder-white"
              placeholder="Senha"
              type="password"
              name="pass"
              onChange={(e) => setPass(e.target.value)}
            />
          </div>
          <input
            className="rounded-md border border-zinc-800 bg-transparent p-2 text-white placeholder-white"
            placeholder="Senha Admin"
            type="password"
            name="adminPass"
            onChange={(e) => setAdmin(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="rounded-md border border-zinc-800 bg-transparent py-3 hover:bg-zinc-800/30"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
