import { PrismaClient } from "@prisma/client";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event)
  const { email, newGoal } = body
  if (!email || typeof newGoal !== 'number') {
  throw createError({ statusCode: 400, message: 'Missing or invalid email or goal' });
}

  const updatedUser = await prisma.uzytkownik.update({
    where: { email: email }, // Type-safe now
    data: { cel_kaloryczny: newGoal },
  })

  return { success: true, updatedUser }
})