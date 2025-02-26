export type AuthInterceptorProps = {
  statePage: 'create' | 'auth' | 'gallery';
  folders: string[];
  handleSetStatePage: (state: 'create' | 'auth' | 'gallery') => void;
}
