/* eslint-disable @typescript-eslint/no-explicit-any */
import { authToken } from "@/config/AuthToken";
import { mongodb } from "@/config/mongoDB";
import { comparePassword } from "@/utils/encrypt-decrypt";
import { NextRequest } from "next/server";


export default async function auth(req: NextRequest) {
  try {
    console.log('[auth-SERVICE] start')
    const { folders, user, pass } = await req.json();

    const getCollection =  mongodb().collection("users");
    const getUser = await getCollection.findOne({ userName: user });

    if (!getUser) {
      throw { message: "User not found.", code: 404 };
    }

    const isCorrectPass = comparePassword(pass, getUser.password);
    if (!isCorrectPass) {
      throw { message: "User or password is incorrect.", code: 401 };
    }

    if(getUser.role !== 'ADMIN') {
      const getFoldersCollection = mongodb().collection("folders");
      const getFolders = await getFoldersCollection.findOne({
        usersIds: { $in: [getUser._id] },
        slugFolder:  folders[folders.length - 1],
        slugParent:  folders[0]
      });

      if(!getFolders) {
        throw { message: "The folder is not authorized.", code: 401 };
      }
    }

    console.log('[auth-SERVICE] Finished')

    return {
      message: {
        folders,
        authToken: authToken.generateToken({ auth: `${folders.join(':')}|${getUser.userName}` }),
        isAdmin: getUser.role === 'ADMIN'
      },
      code: 200
    }
  } catch (error: any) {
    console.log('[auth-SERVICE] Error', error)
    throw error;
  }
}