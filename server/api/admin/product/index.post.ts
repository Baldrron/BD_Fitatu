import { PrismaClient } from "@prisma/client";
import { Validator } from "node-input-validator";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  const v = new Validator(body, {
    nazwa: "required|minLength:2",
    kalorie: "required|integer",
    bialko: "required|numeric",
    tluszcze: "required|numeric",
    weglowodany: "required|numeric",
  });

  const matched = await v.check();
  if (!matched) {
    return { result: false, error: v.errors };
  }

  const existing = await prisma.produkt.findFirst({
    where: { nazwa: body.nazwa },
  });

  if (existing) {
    await prisma.$disconnect();
    return { result: false, error: "Produkt o tej nazwie już istnieje" };
  }

  try {
    const produkt = await prisma.produkt.create({
      data: {
        nazwa: body.nazwa,
        kalorie: parseInt(body.kalorie),
        bialko: parseFloat(body.bialko),
        tluszcze: parseFloat(body.tluszcze),
        weglowodany: parseFloat(body.weglowodany),
      },
    });

    await prisma.$disconnect();
    return { result: true, produkt };
  } catch (err) {
    await prisma.$disconnect();
    return { result: false, error: err };
  }
});