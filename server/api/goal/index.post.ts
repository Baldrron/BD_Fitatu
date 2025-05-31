import { PrismaClient, uzytkownik } from '@prisma/client';



export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);
  const user = await prisma.uzytkownik.findFirst({
     where: {
      email: body.email,
    },
  });
  if(user !== null){
  if(user.cel_kaloryczny===null){
    return {ok: false, cal: null}
  }else{
    return {ok: true, cal: user.cel_kaloryczny}
  }
  }
  return {ok: false, cal: null}
});