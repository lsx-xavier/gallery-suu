import { drive_v3, google } from 'googleapis';

export async function GoogleAuthApi () {
  const googleKey = process.env.GOOGLE_KEY as string;
    
    return new google.auth.GoogleAuth({
      credentials: JSON.parse(googleKey),
      scopes: ["https://www.googleapis.com/auth/drive.readonly",'https://www.googleapis.com/auth/drive.file'],
    });
}

export const googleApi = google;

export async function driveWithAuth() {
  const auth = await GoogleAuthApi()
  
  return googleApi.drive({ version: "v3", auth });
};

export async function getFoldersByIdOrQuery ({ folderId, query, fields = "files(id, name)", resParams }:{ folderId?: string, query?: string, fields?: string, resParams?: drive_v3.Params$Resource$Files$List}) { 
  if(!folderId && !query) {
    throw new Error(`Need at least one param`)
  }

  const drive = await driveWithAuth();
  
  return drive.files.list({
    q: query ?? `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: fields,
    ...resParams
  }).then((res) => {
    if (!res) {
      throw new Error(`Didn't find any result`)
    }
    
    if(!res.data.files || res.data.files?.length === 0) {
      throw new Error(`Didn't find many folders in '${folderId}'`)
    }

    return res.data.files
  })
}