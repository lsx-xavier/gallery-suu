'use client'
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function VoltarParaAdmin() {
    const isAdminPath = usePathname() === '/admin'

    return !isAdminPath && <Link href="/admin" className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm -mt-1">
        <ArrowLeft size={14} />
        Voltar
    </Link>;
}