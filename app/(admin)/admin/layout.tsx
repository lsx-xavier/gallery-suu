
type AdminLayoutProps = {
    children: React.ReactNode;
}

export default function Layout({ children,  }: AdminLayoutProps) {
    return (
        <section className="flex flex-col gap-4 p-4">
            <h2 className="text-2xl font-bold">Painel de controle da Suu</h2>

            {children}
        </section>
    );
}