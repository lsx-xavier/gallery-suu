/* eslint-disable @typescript-eslint/no-explicit-any */
import { googleApi, GoogleAuthApi } from "@/config/apis/google";
import { generateToken } from "@/config/AuthToken";
import { findFolderAndCheckWeb } from "@/utils/findTheFolderOfImage";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { gunzipSync } from "zlib";

export default async function auth(req: NextRequest) {
  try {
    const body = await req.json();
    
    const googleAuth = await GoogleAuthApi();
    const drive = googleApi.drive({ version: "v3", auth: googleAuth });

    const findedFolder = await findFolderAndCheckWeb({ targetName: body.folderName })
    
    if(!findedFolder) {
      throw { body: "Didn't find the folder.", code: 404 };
    }

    const queryToJson = `'${findedFolder.id}' in parents and mimeType = 'application/gzip'`;
    const response = await drive.files.list({
      q: queryToJson,
      fields: "files(id, name)",
    }).then(async (resp) => {
      if(!resp) {
        throw { body: "Something wrong.", code: 404 };
      }
      
      if( !resp.data.files || resp.data.files.length === 0) {
        throw { body: "Didn't find anything.", code: 404 };
      }
      
      if(!resp.data.files?.[0].id) {
        throw { body: "Didn't find the json.", code: 404 };
      }
      
      const jsonFile = await drive.files.get({
        fileId: resp.data.files?.[0].id || "",
        alt: 'media', // Necessário para obter o arquivo de mídia
      }, {
        responseType: 'arraybuffer',
      })
      
      const unzip = gunzipSync(jsonFile.data as Buffer).toString('utf-8');
      const { user, pass }  = JSON.parse(unzip) as { user: string, pass: string};

      if(user !== body.user) {
        throw { body: 'Usuário ou senha errada, tente novamente!', code: 401 };
      }

      const isCorrectPass = await bcrypt.compare(body.pass, pass);
      if (!isCorrectPass) {
        throw { body: 'Usuário ou senha errada, tente novamente!', code: 401 };
      }
      
      return generateToken({
        user
      })
    });

    return response
  } catch (error: any) {
    throw error;
  }
}