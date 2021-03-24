import { Application, Router } from './deps.ts'
import { createRemote } from './deps.ts'
// import router from './routes.ts'
const port = Deno.env.get("PORT") || 5050
console.log(Deno.env.get("PORT"));


const app = new Application()
const router = new Router()

app.use(router.routes())
app.use(router.allowedMethods())

router.get('/api/v1/add-user', async ({ request, response }: { request: any, response: any }) => {
  const remote = createRemote("0.0.0.0:3000");

  try {
    if (!request.hasBody) {
      response.status = 404,
      response.body = { message: 'missing params' }
    } else {
      const result = request.body(); // content type automatically detected
      const { username, password } = await result.value; // an object of parsed JSON
      
      if (!username) {
        response.status = 404,
        response.body = { message: 'missing username' }
      } else if (!password) {
        response.status = 404,
        response.body = { message: 'missing password' }
      } else {
        const {success, user} = await remote.createUser({username, password})
        console.log(success, user);
        
        response.status = 200,
        response.body = {
          success, user
        }
      }
    }
  } catch (error) {
    console.log(error);
    
  } 
})

console.log(`Server running on port ${port}`)

await app.listen({ port: +port })