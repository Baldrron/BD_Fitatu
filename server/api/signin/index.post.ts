import { PrismaClient, uzytkownik } from "@prisma/client";
import bcrypt from "bcrypt";

const saltRounds = 10;

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody<uzytkownik>(event);
  const searched = await prisma.uzytkownik.findFirst({
    where: {
      email: body.email,
    },
  });

  if (searched != null) {
    prisma.$disconnect();
    return { result: false, message: "ERROR. USER ALREADY EXISTS" };
  }

  const hasshing = await bcrypt.hash(body.haslo, saltRounds);
  body.haslo = hasshing;

  //const newe = await prisma.user.create({ data: body });
  try {
    const newUser = await prisma.uzytkownik.create({ data: body });
  } catch (error) {
    await prisma.$disconnect();
    return { result: false, message: "Incomplete data!" };
  }

  await prisma.$disconnect();
  return { result: true };
});