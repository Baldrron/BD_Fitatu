import { PrismaClient } from "@prisma/client";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  if (body.id == null || typeof body.id !== "number") {
    await prisma.$disconnect();
    return { result: false, error: "Brak ID produktu" };
  }

  const existing = await prisma.produkt.findUnique({
    where: { id_produktu: body.id },
  });

  if (!existing) {
    await prisma.$disconnect();
    return { result: false, error: "Produkt nie istnieje" };
  }

  const deleted = await prisma.produkt.delete({
    where: { id_produktu: body.id },
  });

  await prisma.$disconnect();
  return { result: true, produkt: deleted };
});
