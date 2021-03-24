import { users } from "./mongodb.ts"

export const rpcMethods = {
  createUser: async ({ username, password }: { username:string, password:string }) => {
    console.log(username, password );
    
    if (!username || !password) {
      return {
        success: false,
        user: null
      }
    } else {
      const _id = await users.insertOne({ username, password })
      return {
        success: true,
        user: await users.findOne({ _id })
      }
    }
  },
};