import { getAllFoldersWithHierarchy } from "./action";
import { ListaDePastas } from "./components/listaDePastas";

export default async function Page() {
    const allFolders = await getAllFoldersWithHierarchy()

    return (
        <div className="flex flex-col gap-2">
            <ListaDePastas allFolders={allFolders} />
        </div>
    );
}