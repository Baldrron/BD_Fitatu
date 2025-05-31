import { PrismaClient, uzytkownik } from "@prisma/client";
import { Validator } from "node-input-validator";
import bcrypt from "bcrypt";

export default defineEventHandler(async (event) => {
  const body = await readBody<uzytkownik>(event);
  const prisma = new PrismaClient();

  const v = new Validator(body, {
    email: "required|email",
    haslo: "required|minLength:3",
  });

  const matched = await v.check();
  if (!matched) {
    return { result: false, message: "Requirements not met" };
  }

  if (body.email == null) {
    prisma.$disconnect();
    return { result: false, message: "No email given" };
  }
  const searched = await prisma.uzytkownik.findFirst({
    where: {
      email: body.email,
    },
  });
  if (searched == null) {
    return { result: false, message: "USER NOT FOUND" };
  }
  try {
    var match = await bcrypt.compare(body.haslo, searched.haslo);
  } catch (error) {
    prisma.$disconnect();
    return { result: false, message: "No password given" };
  }
  prisma.$disconnect();
  if (match) {
    return { result: true, message: "Logged in" };
  } else {
    return {
      result: false,
      message: "Password incorrect",
    };
  }
});