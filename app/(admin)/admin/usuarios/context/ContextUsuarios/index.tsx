'use client';

import { Prisma } from '@prisma/client';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { getAllUsers } from '../../action';

export type UserWithFolders =  Prisma.UsersGetPayload<{
  include: { folders: true }
}>;

interface UsuariosContextData {
  usuarios: UserWithFolders[];
  loading: boolean;
  fetchUsuarios: () => Promise<void>;
}

const UsuariosContext = createContext<UsuariosContextData>({} as UsuariosContextData);

export function UsuariosProvider({ children }: { children: ReactNode }) {
  const [usuarios, setUsuarios] = useState<UserWithFolders[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsuarios = useCallback(async () => {
    try {
      const allAccounts = await getAllUsers();

      setUsuarios(allAccounts);
    } catch (err) {
      console.error('[get-accounts - API] Error getting accounts:', err);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchUsuarios().finally(() => setLoading(false));
  }, [fetchUsuarios]);


  return (
    <UsuariosContext.Provider
      value={{
        usuarios,
        loading,
        fetchUsuarios,
      }}
    >
      {children}
    </UsuariosContext.Provider>
  );
}

export function useUsuarios() {
  const context = useContext(UsuariosContext);
  if (!context) {
    throw new Error('useUsuarios must be used within a UsuariosProvider');
  }
  return context;
} 