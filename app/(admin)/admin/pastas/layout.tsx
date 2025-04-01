type AdminLayoutProps = {
    children: React.ReactNode;
}

export default function Layout({ children }: AdminLayoutProps) {
    return (
        <div className="flex flex-col gap-2">
            <h4 className="text-base">Pastas</h4>
            {children}
        </div>
    );
}