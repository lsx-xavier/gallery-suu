import { Folder } from "@prisma/client";
import { UserWithFolders } from "../../../usuarios/action";

type UserSelectionProps = {
    folderId?: Folder['id'];
    users: UserWithFolders[];
    isLoading: boolean;
    onSelect: (userId: string) => void;
}

export function UserSelection({ folderId, users, onSelect, isLoading }: UserSelectionProps) {
    return (
        <div className="max-h-[300px] overflow-y-auto">
            {isLoading? <div>Carregando...</div> : users?.map((user) => (
                <div key={user.id} className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        value={user.id}
                        onChange={(e) => onSelect(e.target.value)}
                        defaultChecked={user.folders.some((folder) => folder.id === folderId)}
                    />
                    {user.userName}
                </div>
            ))}
        </div>
    );
}