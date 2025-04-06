'use client';
import useDebounce from '@/infra/hooks/use-debounce/use-debounce';
import { FolderWithHierarchy } from '../../action';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export function ListaDePastas({ allFolders }: { allFolders: FolderWithHierarchy }) {
  const [search, setSearch] = useState('');

  const term = useDebounce(search, 1000);

  return (
    <div className="flex flex-col gap-6">
      <input
        className="w-full rounded-md border border-gray-300 p-2"
        type="text"
        placeholder="Pesquisar"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div>
        {Object.entries(allFolders)
          .filter(([, folder]) =>
            folder.some((f) => f.folderName.toLowerCase().includes(term.toLowerCase())),
          )
          .map(([key, folder]) => (
            <div key={key} className="mb-8 flex flex-col gap-2">
              <div className="mb-1 border-b border-gray-300 pb-1">
                <h3 className="text-sm font-bold">{folder[0].parentName}</h3>
              </div>
              <div className="flex flex-col">
                {folder
                  .filter((f) => f.folderName.toLowerCase().includes(term.toLowerCase()))
                  .map((f) => (
                    <Link
                      href={`/admin/pastas/${f.id}`}
                      key={f.id}
                      className="flex aspect-square items-center"
                    >
                      <Image src={f.thumbId} alt={f.folderName} width={100} height={100} />
                      <h5 className="absolute bottom-0 left-0 bg-black/50 p-2 text-sm font-bold text-white">
                        {f.folderName}
                      </h5>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
