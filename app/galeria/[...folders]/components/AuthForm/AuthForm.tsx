'use client';
import httpClient from '@/src/config/httpClient';
import { FormEvent, useCallback, useState } from 'react';

type AuthFormProps = {
  folders: string[];
  onSuccess: () => void;
};

export function AuthForm({ folders, onSuccess }: AuthFormProps) {
  const [user, setUser] = useState<string>();
  const [pass, setPass] = useState<string>();
  const [error, setError] = useState<string | undefined>(undefined);

  const handleAuth = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      try {
        await httpClient.post({
          url: '/auth',
          body: {
            user,
            pass,
            folders,
          },
        });

        onSuccess();
      } catch (error: unknown) {
        const {
          body: { message },
        } = error as { body: { message: string } };
        setError(message as string);
      }
    },
    [folders, onSuccess, pass, user],
  );

  if (error) {
    return (
      <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-2 rounded-lg bg-gray-500 px-12 py-8">
        <button
          type="button"
          onClick={() => setError(undefined)}
          className="absolute top-1 right-2"
        >
          X
        </button>
        {error}
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 h-screen w-screen">
      <div className="absolute top-0 left-0 h-screen w-screen bg-gray-500/55 backdrop-blur-[1.5px]" />
      <div className="absolute top-1/2 left-1/2 flex max-w-[75%] -translate-x-1/2 -translate-y-1/2 flex-col gap-2 rounded-lg bg-gray-500 p-8 md:max-w-[100%]">
        <p className="mb-6 w-full text-center text-2xl font-bold">
          Digite a conta para ver as fotos
        </p>

        <form onSubmit={handleAuth} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2 md:flex-row">
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

          <button
            className="rounded-md border border-zinc-800 bg-transparent py-3 hover:bg-zinc-800/30"
            type="submit"
          >
            Ver as fotos
          </button>
        </form>
      </div>
    </div>
  );
}
