'use client';
import { authToken } from '@/infra/config/AuthToken';
import { getTokenCookie } from '@/infra/utils/get-token-cookie';
import { useCallback, useEffect, useState } from 'react';
import { AuthForm } from '../AuthForm';
import { FormCreateUser } from '../CreateUserForm';
import { GalleryMansory } from '../GalleryMansory';
import { AuthInterceptorProps } from './Types';

const RenderPage = ({ statePage, folders, handleSetStatePage }: AuthInterceptorProps) => {
  switch (statePage) {
    case 'create':
      return <FormCreateUser folders={folders} />;
    case 'gallery':
      return <GalleryMansory folders={folders} />;
    default:
      return <AuthForm folders={folders} onSuccess={() => handleSetStatePage('gallery')} />;
  }
};

export function AuthInterceptor({ params }: { params: Promise<{ folders: string[] }> }) {
  const [isLoading, setIsLoading] = useState(true);
  const [statePage, setStatePage] = useState<'create' | 'auth' | 'gallery'>('auth');
  const [folders, setFolders] = useState<string[]>([]);

  const handleSetStatePage = useCallback((state: 'create' | 'auth' | 'gallery') => {
    setStatePage(state);
    setIsLoading(false);
  }, []);

  const checkAuth = useCallback(async () => {
    const { folders } = await params;
    setFolders(folders);

    if (folders[folders.length - 1] === 'create') {
      handleSetStatePage('create');
      return;
    }

    const maybeToken = await getTokenCookie();
    if (!maybeToken) {
      handleSetStatePage('auth');
      return;
    }

    const isTokenValid = await authToken.verifyToken(maybeToken);

    if (!isTokenValid) {
      handleSetStatePage('auth');
      return;
    } else {
      handleSetStatePage('gallery');
      return;
    }
  }, [handleSetStatePage, params]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <RenderPage statePage={statePage} folders={folders} handleSetStatePage={handleSetStatePage} />
  );
}
