import { PrismaClient } from "@prisma/client";
import { Validator } from "node-input-validator";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  const v = new Validator(body, {
    id_uzytkownika: "required|integer",
    nazwa: "required|minLength:2",
    kalorie: "required|integer",
    bialko: "required|numeric",
    tluszcze: "required|numeric",
    weglowodany: "required|numeric",
    data: "required|date",
  });

  const matched = await v.check();
  if (!matched) {
    return { result: false, error: v.errors };
  }

  const user = await prisma.uzytkownik.findUnique({
    where: { id_uzytkownika: body.id_uzytkownika },
  });

  if (!user) {
    await prisma.$disconnect();
    return { result: false, error: "Użytkownik nie istnieje" };
  }

  const produkty = await prisma.produkt.findMany({
    where: {
      id_produktu: { in: body.produkty_ids },
    },
  });

  if (produkty.length !== body.produkty_ids.length) {
    await prisma.$disconnect();
    return { result: false, error: "Niektóre produkty nie istnieją" };
  }

  try {
    const posilek = await prisma.posilek.create({
      data: {
        nazwa: body.nazwa,
        kalorie: parseInt(body.kalorie),
        bialko: parseFloat(body.bialko),
        tluszcze: parseFloat(body.tluszcze),
        weglowodany: parseFloat(body.weglowodany),
        data: new Date(body.data),
        id_uzytkownika: body.id_uzytkownika,
      },
      include: {
        produkty: true,
      },
    });

    await prisma.$disconnect();
    return { result: true, posilek };
  } catch (err) {
    await prisma.$disconnect();
    return { result: false, error: err };
  }
});