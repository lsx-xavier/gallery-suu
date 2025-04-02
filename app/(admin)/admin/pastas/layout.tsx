type AdminLayoutProps = {
    children: React.ReactNode;
    modal: React.ReactNode;
}

export default function Layout({ children, modal }: AdminLayoutProps) {
    return (
        <div className="flex flex-col gap-2">
            <h4 className="text-base">Pastas</h4>
            {children}
            {modal}
        </div>
    );
}