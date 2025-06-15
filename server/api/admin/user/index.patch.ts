import { PrismaClient, uzytkownik } from "@prisma/client";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody<Partial<uzytkownik>>(event);

  if (!body.id_uzytkownika || typeof body.id_uzytkownika !== "number") {
    await prisma.$disconnect();
    return { result: false, error: "Brak ID użytkownika" };
  }

  const existing = await prisma.uzytkownik.findUnique({
    where: { id_uzytkownika: body.id_uzytkownika },
  });

  if (!existing) {
    await prisma.$disconnect();
    return { result: false, error: "Użytkownik nie istnieje" };
  }

  const updateData: Partial<uzytkownik> = {};

  if (body.login && body.login.trim() !== "") updateData.login = body.login;
  if (body.email && body.email.trim() !== "") updateData.email = body.email;
  if (body.haslo && body.haslo.trim() !== "") updateData.haslo = body.haslo;
  if (typeof body.cel_kaloryczny === "number") updateData.cel_kaloryczny = body.cel_kaloryczny;

  try {
    const updated = await prisma.uzytkownik.update({
      where: { id_uzytkownika: body.id_uzytkownika },
      data: updateData,
    });

    await prisma.$disconnect();
    return { result: true, uzytkownik: updated };
  } catch (err: any) {
    await prisma.$disconnect();
    return { result: false, error: err.message || "Błąd przy aktualizacji" };
  }
});
