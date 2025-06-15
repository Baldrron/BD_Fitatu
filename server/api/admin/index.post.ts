import { PrismaClient } from "@prisma/client";
import { uzytkownik } from "@prisma/client";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  const user = await prisma.uzytkownik.findUnique({
    where: { email: body.email },
  });

  const stan = user?.stanowisko
  await prisma.$disconnect();

  return stan
});
