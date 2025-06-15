import { PrismaClient } from "@prisma/client";
import { produkt } from "@prisma/client";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody<Partial<produkt>>(event);

  if (!body.id_produktu || typeof body.id_produktu !== "number") {
    await prisma.$disconnect();
    return { result: false, error: "Brak ID produktu" };
  }

  const produkt = await prisma.produkt.findUnique({
    where: { id_produktu: body.id_produktu },
  });

  if (!produkt) {
    await prisma.$disconnect();
    return { result: false, error: "Produkt nie istnieje" };
  }

  const updateData: Partial<produkt> = {};
  if (body.nazwa && body.nazwa !== "") updateData.nazwa = body.nazwa;
  if (typeof body.kalorie === "number") updateData.kalorie = body.kalorie;
  if (typeof body.bialko === "number") updateData.bialko = body.bialko;
  if (typeof body.tluszcze === "number") updateData.tluszcze = body.tluszcze;
  if (typeof body.weglowodany === "number") updateData.weglowodany = body.weglowodany;

  const updated = await prisma.produkt.update({
    where: { id_produktu: body.id_produktu },
    data: updateData,
  });

  await prisma.$disconnect();
  return { result: true, produkt: updated };
});
