import fs from "fs";
import { google } from 'googleapis';
import path from "path";

export async function GoogleAuthApi () {
  const keyPath = path.join(process.cwd(), "public/suu-fotos.key.json");
    const credentials = JSON.parse(fs.readFileSync(keyPath, "utf-8"));
    
    return new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive.readonly",'https://www.googleapis.com/auth/drive.file'],
    });
}

export const googleApi = google;