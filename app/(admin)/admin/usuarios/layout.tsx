import { UsuariosProvider } from "./context/ContextUsuarios";

type AdminLayoutProps = {
    children: React.ReactNode;
    modal: React.ReactNode;
}

export default function Layout({ children, modal }: AdminLayoutProps) {
    return (
        <UsuariosProvider>
            <div className="flex flex-col gap-2">
                <h4 className="text-base">Usuários</h4>
                {children}
                {modal}
            </div>
        </UsuariosProvider>
    );
}