import { FolderRouteParams } from '@/entities/folder';
import { AuthInterceptor } from './components/AuthInterceptor';

export default function Page({ params }: FolderRouteParams) {
  return <AuthInterceptor params={params} />;
}
