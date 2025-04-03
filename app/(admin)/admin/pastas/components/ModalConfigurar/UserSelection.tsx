import { Folder, Users } from "@prisma/client";
import { UserWithFolders } from "../../../usuarios/action";
import { Dispatch } from "react";
import { SetStateAction } from "react";

type UserSelectionProps = {
    folderId?: Folder['id'];
    users: UserWithFolders[];
    defaultUsersFolders?: {
        [id: string]: boolean;
    }[];
    isLoading: boolean;
    onSelect: Dispatch<SetStateAction<{
        [id: string]: boolean;
    }[] | undefined>>;
}

export function UserSelection({ folderId, users, onSelect, isLoading, defaultUsersFolders }: UserSelectionProps) {
    console.log({defaultUsersFolders});
    return (
        <div className="flex flex-col gap-2">
            <h6 className="text-sm font-bold">Usuários</h6>
        
            <div className="max-h-[300px] overflow-y-auto">
                {isLoading? <div>Carregando...</div> : users?.map((user) => (
                    <div key={user.id} className="flex items-center gap-1">
                        <input
                            type="checkbox"
                            value={user.id}
                            onChange={(e) => onSelect((prev) => {
                                if (!prev) return [{[e.target.value]: true}];

                                if(prev.some((item) => item[e.target.value])) {
                                    return prev.filter((item) => item[e.target.value] !== e.target.checked);
                                }

                                return [...prev, {[e.target.value]: e.target.checked}];
                            })}
                            defaultChecked={defaultUsersFolders?.some((item) => item[user.id])}
                        />
                        {user.userName}
                    </div>
                ))}
            </div>
        </div>
    );
}