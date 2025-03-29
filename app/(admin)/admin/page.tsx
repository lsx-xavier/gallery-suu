import Link from "next/link";

export default function AdminIndex() {
  return  <div className="flex flex-col gap-2">
      <h4 className="text-base">Visualização de dados</h4>

      <div className="flex gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-sm">Pastas Mapeadas</h3>
          <p><strong>100</strong></p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-sm">Usuários Criados</h3>
          <p><strong>100</strong></p>
        </div>
      </div>


      <div className="flex gap-2 mt-6">
        <Link href="/admin/pastas" className="text-sm text-blue-500">
          Ver pastas mapeadas
        </Link>

        <Link href="/admin/usuarios" className="text-sm text-blue-500">
          Ver usuários
        </Link>

        <Link href="/admin/atualizar-pastas" className="text-sm text-blue-500">
          Ataulizar pastas mapeadas
        </Link>
      </div>
    </div>
}