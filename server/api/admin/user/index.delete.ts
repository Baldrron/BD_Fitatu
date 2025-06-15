import { PrismaClient } from "@prisma/client";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  if (body.id == null || typeof body.id !== "number") {
    await prisma.$disconnect();
    return { result: false, error: "Brak ID użytkownika" };
  }

  const existing = await prisma.uzytkownik.findUnique({
    where: { id_uzytkownika: body.id },
  });

  if (!existing) {
    await prisma.$disconnect();
    return { result: false, error: "Użytkownik nie istnieje" };
  }

  const deleted = await prisma.uzytkownik.delete({
    where: { id_uzytkownika: body.id },
  });

  await prisma.$disconnect();
  return { result: true, uzytkownik: deleted };
});
