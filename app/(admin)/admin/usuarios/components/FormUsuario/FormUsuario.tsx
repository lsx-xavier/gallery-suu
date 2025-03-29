'use client'
import { Users } from "@prisma/client";
import { useState } from "react";

type FormUsuarioProps = {
    usuario?: Users
}

export function FormUsuario({ usuario }: FormUsuarioProps) {
    const [email, setEmail] = useState("");
    const [userName, setUserName] = useState(usuario?.userName);
    const [password, setPassword] = useState(usuario?.password);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(email, userName, password);
    }
    
    return (
        <form
            className="flex flex-col gap-2"
            onSubmit={handleSubmit}
        >
            <div>
                <label htmlFor="email">email</label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="name">usuario</label>
                <input
                    id="userName"
                    type="text"
                    name="userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="password">senha</label>
                <input
                    id="password"
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <button type="submit">Salvar</button>
        </form>
    );
}