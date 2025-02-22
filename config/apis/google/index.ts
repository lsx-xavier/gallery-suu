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

export type GetFoldersByIdOrQueryProps = { folderId?: string, query?: string, fields?: string, resParams?: drive_v3.Params$Resource$Files$List }

export async function getFoldersByIdOrQuery(
  {
    folderId,
    query,
    fields = "files(id, name)",
    resParams
  }: GetFoldersByIdOrQueryProps) {
  console.log('[getFoldersByIdOrQuery] start', folderId, query);

  if (!query) {
    if (!folderId) {
      throw {
        message: `Need to past the FolderId, if you didn't pass the query`,
        status: 500
      }
    };
  } 

  const drive = await driveWithAuth();

  if (!drive) {
    throw {
      message: `Get some error with the drive`,
      status: 500
    }
  }

  const queryString = query ?? `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  console.log('[getFoldersByIdOrQuery] queryString', queryString);

  const files = await drive.files.list({
    q: queryString,
    fields: fields,
    ...resParams
  }).then((res) => {

    if (!res) {
      console.error('Didn\'t get response from the drive list');
      return [];
    }

    if (!res.data.files || res.data.files?.length === 0) {
      console.error(`Didn't find any folders in '${folderId || query}'`);
      return [];
    }

    return res.data.files;
  }).catch(err => {
    throw err
  });

  return files;
}