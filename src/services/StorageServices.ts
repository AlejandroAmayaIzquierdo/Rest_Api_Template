import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Db } from '../database/dbConnection.js';
import { UploadedFile } from 'express-fileupload';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_PATH = path.join(__dirname, '..', '..', 'storage'); //TODO move this to .env

export const getFile = async (id: string): Promise<string> => {
  const dbFileData = await getFileById(id);
  if (!dbFileData) throw { message: 'File not found', code: 404 };
  const file_path = path.join(STORAGE_PATH, dbFileData.hash);
  const fileData = fs.readFileSync(file_path, { encoding: 'base64' });
  return fileData;
};

export const saveFile = async (
  file: UploadedFile,
): Promise<App.FileSaveData | null> => {
  try {
    const hash = crypto.createHash('sha256').update(file.data).digest('hex');
    console.log(hash);
    const file_path = path.join(STORAGE_PATH, hash);
    file.mv(file_path);

    return {
      name: file.name,
      type: file.mimetype,
      path: file_path,
      hash,
    };
  } catch (err) {
    return null;
  }
};

export const registerFile = async (
  name: string,
  type: string,
  path: string,
  hash: string,
): Promise<boolean> => {
  try {
    const isFileRegistered = await getFileByHash(hash);
    if (isFileRegistered) return true;
    const resp = Db.getInstance().query(`
            INSERT INTO storage (name,type,path,hash) 
            VALUES ('${name}','${type}','${path}','${hash}')`);
    return resp !== null;
  } catch (err) {
    return false;
  }
};

export const getFileByHash = async (
  hash: string,
): Promise<App.FileSaveData | null> => {
  try {
    const queryResult = (await Db.getInstance().query(`
            SELECT * FROM storage WHERE hash = '${hash}'
        `)) as App.FileSaveData[];
    if (queryResult && queryResult.length > 0) {
      const { name, type, path, hash } = queryResult[0] as App.FileSaveData;
      return { name, type, path, hash };
    }
    return null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getFileById = async (
  id: string,
): Promise<App.FileSaveData | null> => {
  try {
    const queryResult = (await Db.getInstance().query(`
            SELECT * FROM storage WHERE storageId = ${id}
        `)) as App.FileSaveData[];
    if (queryResult && queryResult.length > 0) {
      const { name, type, path, hash } = queryResult[0] as App.FileSaveData;
      return { name, type, path, hash };
    }
    return null;
  } catch (err) {
    console.error(err);
    return null;
  }
};
