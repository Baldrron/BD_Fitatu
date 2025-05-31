import { PrismaClient, posilek } from '@prisma/client';
import { toDisplayString } from 'vue';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    var today = new Date();
    const body = await readBody(event);
    const localDateOnly = today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0')
    
    const searched = await prisma.uzytkownik.findFirst({
    where: {
      email: body.email,
    },
  });
    try{
    const items = await prisma.posilek.findMany({
    select: {
      id_posilku: true,
      nazwa: true,
      kalorie: true,
      bialko: true,
      tluszcze: true,
      weglowodany: true,
      data: true
    },
    where: {
        data: localDateOnly+"T00:00:00.000Z",
        id_uzytkownika: searched?.id_uzytkownika,
        nazwa: body.disha
    }
  });
  prisma.$disconnect
  return items;
  }
  catch(e){
    console.log(e);
    prisma.$disconnect
    throw e
  }
  
});