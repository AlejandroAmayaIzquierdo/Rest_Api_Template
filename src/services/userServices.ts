import { AuthManager } from '../database/AuthManager.js';

export const createUser = async (
  provider: Lucia.Providers,
  providerUserId: string,
  password: string,
): Promise<Lucia.User> => {
  const auth = AuthManager.getInstance().getAuth();
  if (!auth) throw { message: 'Internal server error', code: 500 };

  const user: Lucia.User = await auth.createUser({
    key: {
      providerId: provider, // auth method
      providerUserId: providerUserId.toLowerCase(), // unique id when using "username" auth method
      password, // hashed by Lucia
    },
    attributes: {
      userName: providerUserId,
    },
  });
  return user;
};

export const createSession = async (userID: string): Promise<Lucia.Session> => {
  const auth = AuthManager.getInstance().getAuth();
  if (!auth) throw { message: 'Internal server error', code: 500 };

  const session: Lucia.Session = await auth.createSession({
    userId: userID,
    attributes: {},
  });
  return session;
};

export const getUser = async (
  provider: Lucia.Providers,
  providerUserId: string,
  password: string,
): Promise<Lucia.User> => {
  const auth = AuthManager.getInstance().getAuth();
  if (!auth) throw { message: 'Internal server error', code: 500 };

  const user = await auth.useKey(
    provider,
    providerUserId.toLocaleLowerCase(),
    password,
  );
  return user;
};
