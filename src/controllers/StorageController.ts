import { Request } from 'express';
import { UploadedFile } from 'express-fileupload';
import { registerFile, saveFile } from '../services/StorageServices.js';

export const storagePostController = async (req: Request) => {
  const file = req.files?.file as UploadedFile;

  if (!file) throw { message: 'No file found', code: 400 };

  console.log(file);

  const saveFileData = await saveFile(file);

  if (!saveFileData)
    throw { message: 'Error while saving the file', code: 500 };

  const isFileRegistered = await registerFile(
    saveFileData.name,
    saveFileData.type,
    saveFileData.path,
    saveFileData.hash,
  );

  if (!isFileRegistered)
    throw { message: 'Error while registering the file', code: 500 };
  return saveFileData;
};
