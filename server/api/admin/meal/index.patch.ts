import { PrismaClient, posilek } from "@prisma/client";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody<Partial<posilek>>(event);

  if (!body.id_posilku || typeof body.id_posilku !== "number") {
    await prisma.$disconnect();
    return { result: false, error: "Brak ID posiłku" };
  }

  const existing = await prisma.posilek.findUnique({
    where: { id_posilku: body.id_posilku },
  });

  if (!existing) {
    await prisma.$disconnect();
    return { result: false, error: "Posiłek nie istnieje" };
  }

  const updateData: Partial<posilek> = {};

  if (body.nazwa && body.nazwa.trim() !== "") updateData.nazwa = body.nazwa;
  if (typeof body.kalorie === "number") updateData.kalorie = body.kalorie;
  if (typeof body.bialko === "number") updateData.bialko = body.bialko;
  if (typeof body.tluszcze === "number") updateData.tluszcze = body.tluszcze;
  if (typeof body.weglowodany === "number") updateData.weglowodany = body.weglowodany;
  if (body.data) updateData.data = new Date(body.data);
  if (typeof body.id_uzytkownika === "number") updateData.id_uzytkownika = body.id_uzytkownika;

  const updated = await prisma.posilek.update({
    where: { id_posilku: body.id_posilku },
    data: updateData,
  });

  await prisma.$disconnect();
  return { result: true, posilek: updated };
});
