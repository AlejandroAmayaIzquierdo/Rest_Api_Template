﻿import { Request } from 'express';
import {
  createSession,
  createUser,
  getUser,
} from '../services/userServices.js';
import { createKeyId } from 'lucia';
import { AuthManager } from '../database/AuthManager.js';
import { OAuth2Client } from 'google-auth-library';
import {
  SECRET_CLIENT_ID,
  SECRET_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET,
} from '../index.js';
import { Db } from '../database/dbConnection.js';
import { GitHub, Twitch } from 'arctic';

export const signupController = async (
  req: Request,
): Promise<Lucia.Session> => {
  try {
    const { userName, password } = req.body as unknown as Api.RegisterUserBody;

    console.log(userName, password);

    if (
      typeof userName !== 'string' ||
      userName.length < 4 ||
      userName.length > 31
    )
      throw { message: 'Invalid username', code: 400 };
    if (
      typeof password !== 'string' ||
      password.length < 6 ||
      password.length > 255
    )
      throw { message: 'Invalid password', code: 400 };

    const user = await createUser('id', userName, password);
    console.log(user);
    const session = await createSession(user.userId);
    if (!session)
      throw { message: 'Error while creating the session', code: 402 };
    return session;
  } catch (error) {
    console.log(error);
    throw { message: error, code: 500 };
  }
};

export const logInController = async (req: Request): Promise<Lucia.Session> => {
  try {
    const { userName, password } = req.body as Api.RegisterUserBody;

    const user = await getUser('id', userName, password);
    const session = await createSession(user.userId);

    if (!session) throw { message: 'Error while LogIn the session', code: 402 };

    return session;
  } catch (error) {
    throw { message: error, code: 500 };
  }
};

export const oauthTwitchController = async (req: Request) => {
  try {
    const auth = AuthManager.getInstance().getAuth();
    const code = req.body.code as string;
    const state = req.body.state as string;

    console.log(JSON.stringify(req.body));

    if (!code || !state) {
      throw { message: 'Error while getting the code', code: 402 };
    }
    const redirecrUrl = 'http://localhost:5173/oauthTwitch';

    const twitch = new Twitch(
      TWITCH_CLIENT_ID ?? '',
      TWITCH_CLIENT_SECRET ?? '',
      redirecrUrl,
    );

    const tokens = await twitch.validateAuthorizationCode(code);
    console.log(JSON.stringify(tokens));
    const userInfoResponse = await fetch('https://api.twitch.tv/helix/users', {
      headers: {
        'Client-ID': TWITCH_CLIENT_ID ?? '',
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw {
        message: 'Error while fetching user information from Twitch API',
        code: userInfoResponse.status,
      };
    }

    const { data } = (await userInfoResponse.json()) as Api.TwitchUserData;
    const userInfo = data[0];
    console.log(JSON.stringify(userInfo));

    const existingUser = (await Db.getInstance().query(
      `SELECT user_key.id AS user_key_id,user_id, twitch_id
            FROM user_key
            WHERE twitch_id = '${userInfo.id}'`,
    )) as { user_key_id: string; user_id: string; twitch_id: string }[];

    if (existingUser && existingUser.length > 0) {
      const session = await createSession(existingUser[0].user_id);
      console.log(session);
      return session;
    }

    const user: Lucia.User = await auth?.createUser({
      key: {
        providerId: 'github',
        providerUserId: userInfo.login.toLowerCase(),
        password: 'github', // hashed by Lucia
      },
      attributes: {
        userName: userInfo.login,
        profilePic: userInfo.profile_image_url,
        profileName: userInfo.display_name,
      },
    });

    const resp = await Db.getInstance().query(
      `UPDATE user_key SET twitch_auth = '${JSON.stringify(tokens)}', twitch_id = '${userInfo.id}' WHERE user_id = '${user.userId}'`,
    );
    console.log(resp);
    const session = await createSession(user.userId);
    return session;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const oauthGitController = async (req: Request) => {
  const auth = AuthManager.getInstance().getAuth();
  const code = req.body.code as string;
  const state = req.body.state as string;

  if (!code || !state) {
    throw { message: 'Error while getting the code', code: 402 };
  }

  const github = new GitHub(GITHUB_CLIENT_ID ?? '', GITHUB_CLIENT_SECRET ?? '');

  const tokens = await github.validateAuthorizationCode(code);
  const githubUserResponse = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });
  const githubUser: Api.GitHubUser = await githubUserResponse.json();

  console.log(JSON.stringify(githubUser));

  const existingUser = (await Db.getInstance().query(
    `SELECT user_key.id AS user_key_id,user_id, github_id
        FROM user_key
        WHERE github_id = '${githubUser.id}'`,
  )) as { user_key_id: string; user_id: string; github_id: string }[];

  console.log(existingUser);

  if (existingUser && existingUser.length > 0) {
    const session = await createSession(existingUser[0].user_id);
    console.log(session);
    return session;
  }

  const user: Lucia.User = await auth?.createUser({
    key: {
      providerId: 'github',
      providerUserId: githubUser.login.toLowerCase(),
      password: 'github', // hashed by Lucia
    },
    attributes: {
      userName: githubUser.login,
      profilePic: githubUser.avatar_url,
      profileName: githubUser.name,
    },
  });
  // const userKey = createKeyId("google",githubUser.login.toLowerCase());
  // console.log(userKey);
  // console.log(await Db.getInstance().query(`SELECT * FROM user_key`));
  console.log('User id', user.userId);
  const resp = await Db.getInstance().query(
    `UPDATE user_key SET github_auth = '${JSON.stringify(githubUser)}', github_id = '${githubUser.id}' WHERE user_id = '${user.userId}'`,
  );
  console.log(resp);
  const session = await createSession(user.userId);

  console.log(session);
  return session;
};

export const oauthController = async (req: Request) => {
  const auth = AuthManager.getInstance().getAuth();
  const oauthCredentials = req.body as Api.OAuth2Google;
  const redirecrUrl = 'http://localhost:5173/oauth';

  // const auth = AuthManager.getInstance().getAuth();

  const oAuth2Client = new OAuth2Client({
    clientId: SECRET_CLIENT_ID,
    clientSecret: SECRET_CLIENT_SECRET,
    redirectUri: redirecrUrl,
  });

  // const { tokens } = await oAuth2Client.getToken(oauthCredentials.refresh_token);

  oAuth2Client.setCredentials(oauthCredentials);

  const userInfo = await oAuth2Client.verifyIdToken({
    idToken: oauthCredentials.id_token,
    audience: SECRET_CLIENT_ID,
  });

  const email = userInfo.getPayload()?.email;

  console.log(email);

  if (!email) throw { message: 'Error while getting the email', code: 402 };
  const userKey = createKeyId('google', email.toLowerCase());

  console.log(userKey);

  const existingUser = (await Db.getInstance().query(`
        SELECT user_key.id AS user_key_id, users.id AS user_id
        FROM user_key
        INNER JOIN users ON user_key.user_id = users.id
        WHERE user_key.id = '${userKey}'`)) as {
    user_key_id: string;
    user_id: string;
  }[];

  if (existingUser && existingUser.length > 0) {
    //TODO should validate if the user is already have a session.
    const session = await createSession(existingUser[0].user_id);
    console.log(userInfo.getPayload()?.picture);
    console.log(session);
    return session;
  }

  const profilePic = userInfo.getPayload()?.picture;
  const profileName = userInfo.getPayload()?.name;

  console.log(profilePic, profileName);

  const user: Lucia.User = await auth?.createUser({
    key: {
      providerId: 'google',
      providerUserId: email.toLowerCase(),
      password: 'google', // hashed by Lucia
    },
    attributes: {
      userName: email,
      profilePic,
      profileName,
    },
  });
  await Db.getInstance().query(
    `UPDATE user_key SET google_auth = '${JSON.stringify(oauthCredentials)}' WHERE id = '${userKey}'`,
  );

  const session = await createSession(user.userId);

  console.log(session);
  return session;
};
