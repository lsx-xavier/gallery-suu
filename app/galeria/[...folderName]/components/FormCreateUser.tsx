import React, { FormEvent, useCallback, useState } from 'react';

type FormCreateUserPageProps = {
  params: Promise<{
    folderName: string[]
  }>
}


export default function FormCreateUserPage({params}: FormCreateUserPageProps) {
  const {folderName} = React.use(params);

  const [user,setUser] = useState<string>()
  const [pass,setPass] = useState<string>()
  const [admin,setAdmin] = useState<string>()

  console.log(folderName)

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if(!admin || admin !== "123") {
      window.alert("Senha de amdin errada");
      return;
    }

    console.log(name, pass)
    const data = await fetch(`/api/create-user-to-folder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        folderName: folderName?.[0],
        user,
        pass
      }),
    });

    console.log(data)

  },[admin, user, pass, folderName])

  return (
    <div>
      <p>Criar Usuário</p>

      <form onSubmit={handleSubmit}>
        <input placeholder='Usuário' type='text' name="user"  onChange={(e) => setUser(e.target.value)} />
        <input placeholder='Senha' type='password' name='pass'  onChange={(e) => setPass(e.target.value)} />
        <input placeholder='Senha Admin' type='password' name='adminPass' onChange={(e) => setAdmin(e.target.value)} />

        <button type='submit'>Enviar</button>
      </form>
    </div>
  )
}
