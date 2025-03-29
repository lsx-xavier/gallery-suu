'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { Users } from '@prisma/client';
import httpClient from '@/config/httpClient';
interface UsuariosContextData {
  usuarios: Users[];
  loading: boolean;
  error: string | null;
  fetchUsuarios: () => Promise<void>;
  addUsuario: (usuario: Omit<Users, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateUsuario: (id: string, usuario: Partial<Users>) => Promise<void>;
  deleteUsuario: (id: string) => Promise<void>;
}

const UsuariosContext = createContext<UsuariosContextData>({} as UsuariosContextData);

export function UsuariosProvider({ children }: { children: ReactNode }) {
  const [usuarios, setUsuarios] = useState<Users[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = useCallback(async () => {
    try {
      const allAccounts = await httpClient.get<Users[]>({
        url: '/get-accounts',
      });

      setUsuarios(allAccounts);
    } catch (err) {
      console.error('[get-accounts - API] Error getting accounts:', err);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchUsuarios().finally(() => setLoading(false));
  }, [fetchUsuarios]);

  const addUsuario = async (usuario: Omit<Users, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      // Implementar chamada à API para adicionar usuário
      setError(null);
    } catch (err) {
      setError('Erro ao adicionar usuário');
    } finally {
      setLoading(false);
    }
  };

  const updateUsuario = async (id: string, usuario: Partial<Users>) => {
    try {
      setLoading(true);
      // Implementar chamada à API para atualizar usuário
      setError(null);
    } catch (err) {
      setError('Erro ao atualizar usuário');
    } finally {
      setLoading(false);
    }
  };

  const deleteUsuario = async (id: string) => {
    try {
      setLoading(true);
      // Implementar chamada à API para deletar usuário
      setError(null);
    } catch (err) {
      setError('Erro ao deletar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UsuariosContext.Provider
      value={{
        usuarios,
        loading,
        error,
        fetchUsuarios,
        addUsuario,
        updateUsuario,
        deleteUsuario,
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