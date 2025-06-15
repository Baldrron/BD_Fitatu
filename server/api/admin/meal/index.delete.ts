import { PrismaClient } from "@prisma/client";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  if (body.id == null || typeof body.id !== "number") {
    await prisma.$disconnect();
    return { result: false, error: "Brak ID posiłku" };
  }

  const existing = await prisma.posilek.findUnique({
    where: { id_posilku: body.id },
  });

  if (!existing) {
    await prisma.$disconnect();
    return { result: false, error: "Posiłek nie istnieje" };
  }

  const deleted = await prisma.posilek.delete({
    where: { id_posilku: body.id },
  });

  await prisma.$disconnect();
  return { result: true, posilek: deleted };
});
