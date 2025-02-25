import { redis } from "@/config/redis";
import { createSlug } from "@/utils/create-slug";
import { hashPassword } from "@/utils/encrypt-decrypt";
import { checkIfFolderExists } from "./helpers";

export default async function createUserToFolder(folderName: string, user: string, pass: string) {
  try {
    const currentFolderSlug = createSlug(folderName);

    const folderData = await checkIfFolderExists(currentFolderSlug, folderName);

    if (!folderData) {
      console.log('[create-user-to-folder] Folder not found');
      throw {
        message: "Folder not found",
        status: 404
      }
    }

    const encryptPass = await hashPassword(pass);
    const acccountJson = { user: user, pass: encryptPass };

    const redisAuthKey = `auth:${currentFolderSlug}`;
    await redis.hset(redisAuthKey, acccountJson);

    await redis.hset('auth:status', {
      lastFolder: redisAuthKey,
      timestamp: new Date().toISOString()
    });

    return "Conta criada, pode passar para o cliente!";
    // const drive = googleApi.drive({ version: "v3", auth: googleAuth });

    // const queryToFolders = `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName.replaceAll("-", " ")}'`;
    // const maybeFolderId = await drive.files.list({
    //   q: queryToFolders,
    //   fields: "files(id, name)",
    // }).then(async (resp) => {
    //   if(!resp) {
    //     throw new Error("Nada foi encontrado.");
    //   }

    //   if( !resp.data.files || resp.data.files.length === 0) {
    //     throw new Error("Nenhuma pasta encontrada.");
    //   }

    //   return resp.data.files?.[0] || undefined;
    // });


    // if(!maybeFolderId) {
    //   throw new Error("Didn't find the folder");
    // }

    // const fileName = "account.gz";

    // const queryToCheckFile = `'${maybeFolderId.id}' in parents and mimeType = 'application/gzip'`;
    // const maybeFileExist = await drive.files.list({
    //   q: queryToCheckFile,
    //   fields: "files(id, name)",
    // }).then(async (resp) => {
    //   if(!resp) {
    //     throw new Error("Nada foi encontrado.");
    //   }

    //   if( !resp.data.files || resp.data.files.length === 0) {
    //     throw new Error("Nenhuma pasta encontrada.");
    //   }

    //   return resp.data.files?.[0] || undefined;
    // }).catch(() => {
    //   console.error("Any account in the folder")

    //   return undefined
    // });

    // const encryptPass = await hashPassword(pass)

    // const acccountJson = JSON.stringify({ user: user, pass: encryptPass });
    // const gzipFile = zlib.gzipSync(acccountJson);
    // const bufferStream = Readable.from(gzipFile);

    // let respFile: string | null | undefined;

    // if(maybeFileExist && maybeFileExist.id) {

    //   respFile = await drive.files.update({
    //     fileId: maybeFileExist.id,
    //     media: {
    //       mimeType: 'application/gzip',
    //       body: bufferStream,
    //     },
    //   }).then(resp => resp.data.id);
    // }else {
    //   respFile = await drive.files.create({
    //     requestBody: {
    //       name: fileName,
    //       mimeType: "application/gzip",
    //       parents: [maybeFolderId.id || ""],
    //     },
    //     media: {
    //       mimeType: "application/gzip",
    //       body: bufferStream,
    //     },
    //   }).then(resp => resp.data.id);
    // }

    // return respFile
  } catch (error) {
    throw {
      message: `Can't create the account: ${error}`,
      status: 500
    }
  }
}