'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormUsuario } from '../components/FormUsuario';
import { useUsuarios } from '../context/ContextUsuarios';

type ModalLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export default function Layout({ children, params }: ModalLayoutProps) {
  const router = useRouter();
  const { id } = React.use(params);
  const { usuarios, loading } = useUsuarios();
  const usuario = usuarios.find((usuario) => usuario.id === id);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60">
      <div className="relative rounded-lg bg-white px-6 py-4">
        <Link
          href="/admin/usuarios"
          onClick={() => router.back()}
          className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
        >
          ✕
        </Link>

        <div className="flex flex-col gap-4">
          {children}
          {loading ? (
            <div>Carregando...</div>
          ) : id === 'novo' ? (
            <FormUsuario />
          ) : usuario ? (
            <FormUsuario usuario={usuario} />
          ) : (
            <div>Usuário não encontrado</div>
          )}
        </div>
      </div>
    </div>
  );
}
