import { AuthInterceptor } from './components/AuthInterceptor';

export default function Page({ params }: { params: Promise<{ folders: string[] }> }) {
  return <AuthInterceptor params={params} />;
}
