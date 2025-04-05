'use client';
import useDebounce from '@/hooks/useDebounce';
import { Folder } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { getAllFoldersWithHierarchy } from '../../../pastas/action';
import { create, update } from '../../action';
import { useUsuarios } from '../../context/ContextUsuarios';
import { UserWithFolders } from '../../context/ContextUsuarios';
type FormUsuarioProps = {
  usuario?: UserWithFolders;
};

export function FormUsuario({ usuario }: FormUsuarioProps) {
  const [userName, setUserName] = useState(usuario?.userName);
  const [password, setPassword] = useState(usuario?.password);
  const [role, setRole] = useState<'ADMIN' | 'USER'>(usuario?.role || 'USER');
  const [allFolders, setAllFolders] = useState<Record<string, Folder[]> | never[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<Folder['id'][]>(
    usuario?.folders.map((folder) => folder.id) || [],
  );
  const [search, setSearch] = useState('');
  const { fetchUsuarios } = useUsuarios();
  const router = useRouter();
  const term = useDebounce(search, 1000);

  useEffect(() => {
    const fetchAllFolders = async () => {
      const allFolders = await getAllFoldersWithHierarchy();

      setAllFolders(allFolders);
    };
    fetchAllFolders();
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!userName || !password || !role || !selectedFolders || selectedFolders.length === 0) {
        return alert('Preencha todos os campos');
      }

      try {
        if (usuario) {
          await update({
            id: usuario.id,
            userName,
            password,
            role,
            folders: selectedFolders,
          });
        } else {
          await create({
            userName,
            password,
            role,
            folders: selectedFolders,
          });
        }

        fetchUsuarios();
        router.back();
      } catch (err) {
        console.error(err);
      }
    },
    [fetchUsuarios, password, role, router, selectedFolders, userName, usuario],
  );

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">usuario</label>
        <input
          id="userName"
          type="text"
          name="userName"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="password">senha</label>
        <input
          id="password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="role">Cargo</label>
        <select
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as 'ADMIN' | 'USER')}
          required
          defaultValue="USER"
        >
          <option value="ADMIN">ADMIN</option>
          <option value="USER">USER</option>
        </select>
      </div>

      <div>
        <label htmlFor="folder">Qual pasta de acesso?</label>
        <div className="mt-2 flex max-h-[200px] flex-col gap-2 overflow-y-auto">
          <input
            id="search"
            type="text"
            placeholder="Pesquisar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {Object.entries(allFolders)
            .filter(([, folder]) =>
              folder.some((f) => f.folderName.toLowerCase().includes(term.toLowerCase())),
            )
            .map(([key, folder]) => (
              <div key={key}>
                <div className="mb-1 border-b border-gray-300 pb-1">
                  <h3 className="text-sm font-bold">{folder[0].parentName}</h3>
                </div>
                {folder
                  .filter((f) => f.folderName.toLowerCase().includes(term.toLowerCase()))
                  .map((f) => (
                    <div key={f.id} className="flex items-center gap-2">
                      <input
                        id={f.id}
                        type="checkbox"
                        name={f.id}
                        checked={selectedFolders.includes(f.id)}
                        onChange={(e) =>
                          setSelectedFolders(
                            e.target.checked
                              ? [...selectedFolders, f.id]
                              : selectedFolders.filter((id) => id !== f.id),
                          )
                        }
                      />
                      <label htmlFor={f.id}>{f.folderName}</label>
                    </div>
                  ))}
              </div>
            ))}
        </div>
      </div>

      <button type="submit">Salvar</button>
    </form>
  );
}
