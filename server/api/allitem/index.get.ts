import { PrismaClient, produkt } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async () => {
  try{
    const items = await prisma.produkt.findMany({
    select: {
      id_produktu: true,
      nazwa: true,
      kalorie: true,
      bialko: true,
      tluszcze: true,
      weglowodany: true
    },
  });

  return items;
  }catch(e){
    console.log(e);
    throw e
  }
  
});