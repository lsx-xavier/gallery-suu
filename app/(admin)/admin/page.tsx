import Link from 'next/link';
import { getAllFolders } from './pastas/action';
import { getAllUsers } from './usuarios/action';
import {
  getInitialFoldersOrUpdateExistingFolders,
  syncNewFolders,
} from './actions/crawler_action/action';
import { Button } from '@/(infra)/components';
import { revalidatePath } from 'next/cache';

export default async function AdminIndex() {
  const allFolders = await getAllFolders();
  const allUsers = await getAllUsers();

  const handleCrawler = async () => {
    'use server';
    await getInitialFoldersOrUpdateExistingFolders();
    revalidatePath('/admin/pastas');
  };

  const handleSyncFolders = async () => {
    'use server';
    await syncNewFolders();
    revalidatePath('/admin/pastas');
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-2">
        <h4 className="text-base">Visão Geral</h4>

        <Button
          variant="link"
          size="sm"
          className="text-red-900 hover:text-red-900/80"
          onClick={handleCrawler}
        >
          Mapear pastas iniciais
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">Pastas Mapeadas</h3>
          <p>
            <strong>{allFolders.length}</strong>
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">Usuários Criados</h3>
          <p>
            <strong>{allUsers.length}</strong>
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <Link href="/admin/pastas" className="text-sm text-blue-500">
          Ver pastas mapeadas
        </Link>

        <Link href="/admin/usuarios" className="text-sm text-blue-500">
          Ver usuários
        </Link>

        <Button
          variant="outline"
          size="sm"
          className="border-green-700 text-sm text-green-700 hover:bg-green-700/10"
          onClick={handleSyncFolders}
        >
          Ataulizar pastas mapeadas
        </Button>
      </div>
    </div>
  );
}
