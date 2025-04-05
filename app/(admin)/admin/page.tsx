import Link from 'next/link';
import { getAllFolders } from './pastas/action';
import { getAllUsers } from './usuarios/action';

export default async function AdminIndex() {
  const allFolders = await getAllFolders();
  const allUsers = await getAllUsers();

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-base">Visualização de dados</h4>

      <div className="flex gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-sm">Pastas Mapeadas</h3>
          <p>
            <strong>{allFolders.length}</strong>
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-sm">Usuários Criados</h3>
          <p>
            <strong>{allUsers.length}</strong>
          </p>
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
  );
}
