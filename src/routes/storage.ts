import express, { Response, Request } from 'express';
import { Stream } from 'stream';
import { getFile } from '@services/StorageServices.js';
import { AuthManager } from '../database/AuthManager.js';
import { storagePostController } from '@controllers/StorageController.js';

const storageRoute = express.Router();

storageRoute.get('/:fileID', async (req: Request, res: Response) => {
  try {
    const fileID = req.params.fileID;

    const acceptHeader = req.headers.accept;

    const fileData = await getFile(fileID);
    const fileContents = Buffer.from(fileData, 'base64');
    const readStream = new Stream.PassThrough();
    readStream.end(fileContents);
    res.set('Content-disposition', 'attachment; filename=' + fileID);
    res.set('Content-Type', acceptHeader);
    return readStream.pipe(res);
  } catch (err) {
    console.error(err);
    const error = err as Api.Error;
    return res
      .status(error.code)
      .send({ status: 0, error: `${error.message}` });
  }
});

storageRoute.post('/', async (req: Request, res: Response) => {
  try {
    const auth = req.headers.authorization;
    if (!auth)
      return res.status(500).send({ status: 0, error: 'Unauthorized User' });

    const session = (await AuthManager.getInstance()
      .getAuth()
      ?.validateSession(auth)) as Lucia.Session;
    if (!session)
      return res.status(500).send({ status: 0, error: 'Unauthorized User' });

    const uploadData = await storagePostController(req);

    const response: Api.Response = {
      status: 1,
      result: uploadData,
    };
    return res.status(202).send(response);
  } catch (err) {
    console.error(err);
    const error = err as Api.Error;
    return res
      .status(error.code)
      .send({ status: 0, error: `${error.message}` });
  }
});

export default storageRoute;
