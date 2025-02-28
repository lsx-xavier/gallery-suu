/* eslint-disable @typescript-eslint/no-explicit-any */
import { authToken } from "@/config/AuthToken";
import { redis } from "@/config/redis";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";


export default async function auth(req: NextRequest) {
  try {
    console.log('[auth-SERVICE] start')
    const { folders, user, pass } = await req.json();

    const redisAuthKey = `auth:${folders.join(':')}`;
    const authData = await redis.hgetall(redisAuthKey);

    if (!authData) {
      throw { message: "Didn't find the auth data.", code: 404 };
    }

    const { user: authUser, pass: authPass } = authData;

    if (user !== authUser || bcrypt.compareSync(authPass as string, pass)) {
      throw { message: "User or password is incorrect.", code: 401 };
    }

    console.log('[auth-SERVICE] Finished')

    return {
      message: {
        folders,
        authToken: authToken.generateToken({ user })
      },
      code: 200
    }

    // const googleAuth = await GoogleAuthApi();
    // const drive = googleApi.drive({ version: "v3", auth: googleAuth });

    // const findedFolder = await findFolderAndCheckWeb({ targetName: body.folderName })

    // if(!findedFolder) {
    //   throw { body: "Didn't find the folder.", code: 404 };
    // }

    // const queryToJson = `'${findedFolder.id}' in parents and mimeType = 'application/gzip'`;
    // const response = await drive.files.list({
    //   q: queryToJson,
    //   fields: "files(id, name)",
    // }).then(async (resp) => {
    //   if(!resp) {
    //     throw { body: "Something wrong.", code: 404 };
    //   }

    //   if( !resp.data.files || resp.data.files.length === 0) {
    //     throw { body: "Didn't find anything.", code: 404 };
    //   }

    //   if(!resp.data.files?.[0].id) {
    //     throw { body: "Didn't find the json.", code: 404 };
    //   }

    //   const jsonFile = await drive.files.get({
    //     fileId: resp.data.files?.[0].id || "",
    //     alt: 'media', // Necessário para obter o arquivo de mídia
    //   }, {
    //     responseType: 'arraybuffer',
    //   })

    //   const unzip = gunzipSync(jsonFile.data as Buffer).toString('utf-8');
    //   const { user, pass }  = JSON.parse(unzip) as { user: string, pass: string};

    //   if(user !== body.user) {
    //     throw { body: 'Usuário ou senha errada, tente novamente!', code: 401 };
    //   }

    //   const isCorrectPass = await bcrypt.compare(body.pass, pass);
    //   if (!isCorrectPass) {
    //     throw { body: 'Usuário ou senha errada, tente novamente!', code: 401 };
    //   }

    //   return generateToken({
    //     user
    //   })
    // });

    // return response
  } catch (error: any) {
    console.log('[auth-SERVICE] Error', error)
    throw error;
  }
}