import express from 'express';
import {
  logInController,
  oauthController,
  oauthGitController,
  oauthTwitchController,
  signupController,
} from '@controllers/userController.js';
import { AuthManager } from '@DB/AuthManager.js';
import { Db } from '@DB/dbConnection.js';

const userRoute = express.Router();

userRoute.post('/signup', async (req, res) => {
  try {
    const session = await signupController(req);
    const response: Api.Response = {
      status: 1,
      result: session,
    };
    return res.status(202).send(response);
  } catch (e) {
    const error = e as Api.Error;
    return res.status(error.code).send({ status: 0, error: error.message });
  }
});

userRoute.post('/oauth', async (req, res) => {
  try {
    const session = await oauthController(req);
    const response: Api.Response = {
      status: 1,
      result: session,
    };
    return res.status(202).send(response);
  } catch (err) {
    // const error = err as Api.Error;
    return res.status(500).send({ status: 0, error: `${err}` });
  }
});

userRoute.post('/oauthGit', async (req, res) => {
  try {
    const session = await oauthGitController(req);
    const response: Api.Response = {
      status: 1,
      result: session,
    };
    return res.status(202).send(response);
  } catch (err) {
    console.log(err);
    // const error = err as Api.Error;
    return res.status(500).send({ status: 0, error: `${err}` });
  }
});

userRoute.post('/oauthTwitch', async (req, res) => {
  try {
    const session = await oauthTwitchController(req);
    const response: Api.Response = {
      status: 1,
      result: session,
    };
    return res.status(202).send(response);
  } catch (err) {
    // const error = err as Api.Error;
    return res.status(500).send({ status: 0, error: `${err}` });
  }
});

userRoute.post('/login', async (req, res) => {
  try {
    const session = await logInController(req);
    const response: Api.Response = {
      status: 1,
      result: session,
    };
    return res.status(202).send(response);
  } catch (e) {
    const error = e as Api.Error;
    return res.status(error.code).send({ status: 0, error: error.message });
  }
});

userRoute.put('/logout', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth)
      return res.status(500).send({ status: 0, error: 'No auth to close' });

    await Db.getInstance().query(
      `DELETE FROM user_session WHERE id = '${auth}'`,
    );

    return res.status(200).send({ status: 1, result: 'Logged Out' });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ status: 0, error: err });
  }
});

userRoute.get('/currentUser', async (req, res) => {
  //TODO fix this
  try {
    const auth = req.headers.authorization;
    if (!auth)
      return res.status(500).send({ status: 0, error: 'Unauthorized User' });

    const session = (await AuthManager.getInstance()
      .getAuth()
      ?.validateSession(auth)) as Lucia.Session;
    if (!session)
      return res.status(500).send({ status: 0, error: 'Unauthorized User' });

    const u = (await AuthManager.getInstance()
      .getAuth()
      ?.getAllUserKeys(session.user.userId)) as Lucia.User[];
    if (!u || u.length === 0)
      return res
        .status(500)
        .send({ status: 0, error: 'Internal Server Error' });

    //TODO reload access tokens of providers. To update user info like profilePic, profileName

    const userData = (await Db.getInstance().query(
      `SELECT id as userId,userName,profilePic,profileName FROM users WHERE id = '${session.user.userId}'`,
    )) as Api.User[];
    const user = userData.length > 0 ? userData[0] : session.user;
    return res.status(200).send({ status: 1, result: user });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ status: 0, error: err });
  }
});

export default userRoute;
