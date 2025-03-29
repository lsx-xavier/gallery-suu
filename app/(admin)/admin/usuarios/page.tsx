'use client'
import Link from "next/link";
import { useUsuarios } from "./context/ContextUsuarios";

export default function Page() {
    const { usuarios, loading } = useUsuarios();

    return (
        <div className="flex flex-col gap-2">
            <Link href="/admin/usuarios/novo" className="text-blue-500 hover:underline">
                Criar novo usuário
            </Link>

            {loading ? <p>Carregando...</p> : usuarios.map((account) => (
                <Link key={account.id} href={`/admin/usuarios/${account.id}`} className="text-blue-500 hover:underline">
                    {account.userName}
                </Link>
            ))}
        </div>
    );
}