import { CronJob } from 'cron'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createDailyMeals() {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // reset time part

  const users = await prisma.uzytkownik.findMany()

  const mealNames = ['Śniadanie', 'Obiad', 'Kolacja']

  for (const user of users) {
    for (const name of mealNames) {
      // Check if the meal already exists for today
      const exists = await prisma.posilek.findFirst({
        where: {
          id_uzytkownika: user.id_uzytkownika,
          nazwa: name,
          data: today,
        },
      })

      if (!exists) {
        await prisma.posilek.create({
          data: {
            id_uzytkownika: user.id_uzytkownika,
            nazwa: name,
            data: today,
            kalorie: 0,
            tluszcze: 0,
            weglowodany: 0,
            bialko: 0
          },
        })
      }
    }
  }

  console.log('Daily meals created')
}

// CronJob running every day at midnight (00:00)
const job = new CronJob(
  '0 0 0 * * *', // second, minute, hour, day of month, month, day of week
  () => {
    console.log('Running daily meal creation job...')
    createDailyMeals().catch((err) => {
      console.error('Error creating daily meals:', err)
    })
  },
  null,
  true, // start the job immediately
  'Europe/Warsaw' // timezone (change if needed)
)

// Export job if you want to control it from outside
export default job