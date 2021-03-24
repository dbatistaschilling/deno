import { users } from "./models/User.ts";

export const rpcMethods = {
  createUser: async (
    { username, password }: { username: string; password: string },
  ) => {
    if (!username || !password) {
      return {
        success: false,
        user: null,
      };
    } else {
      const _id = await users.insertOne({ username, password });
      return {
        success: true,
        user: await users.findOne({ _id }),
      };
    }
  },
  getUsers: async () => {
    return {
      success: true,
      users: await users.find({}),
    };
  },
};
