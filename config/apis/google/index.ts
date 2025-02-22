import { drive_v3, google } from 'googleapis';

export async function GoogleAuthApi () {
  const googleKey = process.env.GOOGLE_KEY_BASE64 as string;
  const credentials = JSON.parse(Buffer.from(googleKey, 'base64').toString());

  // console.log("googleAuth", credentials)

  const googleAuth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: [
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/drive.file"
    ],
  });
  // console.log("googleAuth", googleAuth)

  return googleAuth;
}

export const googleApi = google;

export async function driveWithAuth() {
  const auth = await GoogleAuthApi();
  const drive = googleApi.drive({ version: "v3", auth });
  
  return drive;
};

export async function getFoldersByIdOrQuery ({ folderId, query, fields = "files(id, name)", resParams }:{ folderId?: string, query?: string, fields?: string, resParams?: drive_v3.Params$Resource$Files$List}) { 
  if(!folderId && !query) {
    throw new Error(`Need at least one param`)
  }

  const drive = await driveWithAuth();

  if (!drive) {
    console.error(`Drive not found`)
  }

  const queryString = query ?? `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;

  const files = await drive.files.list({
    q: queryString,
    fields: fields,
    ...resParams
  }).then((res) => {

    if (!res) {
      throw {
        message: 'Didn\'t find any result',
        status: 404
      }
    }

    if (!res.data.files || res.data.files?.length === 0) {
      throw {
        message: `Didn't find many folders in '${folderId}'`,
        status: 404
      }
    }

    return res.data.files;
  }).catch(err => {
    throw {
      message: err,
      code: 500
    }
  });

  return files;
}