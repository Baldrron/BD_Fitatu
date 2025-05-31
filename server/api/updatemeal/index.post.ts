import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, date, data } = body
    console.log('API /updatemeal called with:', body)
  if (!email || !date || !data) {
    return { error: 'Missing data', ok: false }
  }

  try {
    // Znaleźienie Usera
    const user = await prisma.uzytkownik.findUnique({
      where: { email }
    })

    if (!user) {
      return { error: 'User not found', ok: false }
    }
    //sprawdzanie istnienia posiłku
    const existing = await prisma.posilek.findFirst({
      where: {
        id_uzytkownika: user.id_uzytkownika,
        data: new Date(date),
        nazwa: data.nazwa
      }
    })

    if (existing) {
      // Update
      await prisma.posilek.update({
        where: { id_posilku: existing.id_posilku },
        data: {
          kalorie: data.kalorie,
          bialko: data.bialko,
          tluszcze: data.tluszcze,
          weglowodany: data.weglowodany,
        },
      })
    } else {
      // Nowy obiekt
      await prisma.posilek.create({
        data: {
          id_uzytkownika: user.id_uzytkownika,
          nazwa: data.nazwa,
          data: new Date(date),
          kalorie: data.kalorie,
          bialko: data.bialko,
          tluszcze: data.tluszcze,
          weglowodany: data.weglowodany,
        }
      })
    }

    return { ok: true }
  } catch (err) {
    console.error(err)
    return { error: 'Server error', ok: false }
  }
})