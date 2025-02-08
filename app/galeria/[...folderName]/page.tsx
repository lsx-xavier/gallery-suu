'use client'
import React, { FormEvent, useCallback, useState } from "react"
import FormCreateUserPage from "./components/FormCreateUser"
import GaleriaPage from "./components/GaleriaPage"

type FolderNameProps = {
  params: Promise<{folderName: string[]}>
}

export default function Page({params}: FolderNameProps) {
  const {folderName} = React.use(params)

  const [user, setUser] = useState<string>()
  const [pass, setPass] = useState<string>()
  const [show, setShow] = useState<boolean>(false)

  const handleAuth = useCallback(async (event: FormEvent<HTMLFormElement>) => {
      if (!folderName || folderName[folderName.length - 1] === "create") return;
      event.preventDefault();

      setShow(false);

      try {
      const account = await fetch(`/api/get-user-of-folder?folderName=${folderName?.[0]}`, {
        cache: "force-cache"
      }).then(resp => resp.json());
      
      if(!account) {
        throw new Error("With out permission")
      }

      console.log({account})
      console.log({pass,user})


      if(account.user === user && account.pass === pass) {
        setShow(true);

        return;
      }

      throw new Error("Wrong account")


    } catch (error) {
      window.alert(error.message)
    }
    }, [folderName, pass, user]);


  if(folderName[folderName.length - 1] === "create") {
    return <FormCreateUserPage params={params} />
  }

  return (
    <div className="relative h-screen">
      {
        !show && <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-500/55 w-screen h-screen" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-500 p-8 flex flex-col gap-2">
            <p>Digite a conta para ver as fotos</p>
            <form onSubmit={handleAuth} className="flex flex-col gap-2">
            <input className="bg-white text-black" placeholder='Usuário' type='text' name="user"  onChange={(e) => setUser(e.target.value)} />
            <input className="bg-white text-black" placeholder='Senha' type='password' name='pass'  onChange={(e) => setPass(e.target.value)} />
    
              <button className="bg-white text-black border-solid border-2" type="submit">Ver as fotos</button>
            </form>
          </div>
        </>
      }

      {show && <GaleriaPage params={params} />}
    </div>
  )
}
