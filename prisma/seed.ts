import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleProducts = [
  { nazwa: 'Pierś z kurczaka', kalorie: 165, bialko: 31, tluszcze: 3.6, weglowodany: 0 },
  { nazwa: 'Jajko', kalorie: 155, bialko: 13, tluszcze: 11, weglowodany: 1.1 },
  { nazwa: 'Ryż biały', kalorie: 130, bialko: 2.7, tluszcze: 0.3, weglowodany: 28 },
  { nazwa: 'Makaron pełnoziarnisty', kalorie: 124, bialko: 5, tluszcze: 0.9, weglowodany: 27 },
  { nazwa: 'Tuńczyk w puszce', kalorie: 116, bialko: 25, tluszcze: 1, weglowodany: 0 },
  { nazwa: 'Brokuł', kalorie: 34, bialko: 2.8, tluszcze: 0.4, weglowodany: 7 },
  { nazwa: 'Jogurt naturalny', kalorie: 61, bialko: 3.5, tluszcze: 3.3, weglowodany: 4.7 },
  { nazwa: 'Płatki owsiane', kalorie: 389, bialko: 16.9, tluszcze: 6.9, weglowodany: 66.3 },
  { nazwa: 'Banan', kalorie: 89, bialko: 1.1, tluszcze: 0.3, weglowodany: 23 },
  { nazwa: 'Masło orzechowe', kalorie: 588, bialko: 25, tluszcze: 50, weglowodany: 20 },
  { nazwa: 'Pomidor', kalorie: 18, bialko: 0.9, tluszcze: 0.2, weglowodany: 3.9 },
  { nazwa: 'Ogórek', kalorie: 16, bialko: 0.7, tluszcze: 0.1, weglowodany: 3.6 },
  { nazwa: 'Ziemniaki', kalorie: 77, bialko: 2, tluszcze: 0.1, weglowodany: 17 },
  { nazwa: 'Ser żółty', kalorie: 402, bialko: 25, tluszcze: 33, weglowodany: 1.3 },
  { nazwa: 'Chleb żytni', kalorie: 259, bialko: 8.5, tluszcze: 3.3, weglowodany: 48.3 },
  { nazwa: 'Mleko 2%', kalorie: 50, bialko: 3.4, tluszcze: 2, weglowodany: 5 },
  { nazwa: 'Sok pomarańczowy', kalorie: 45, bialko: 0.7, tluszcze: 0.2, weglowodany: 10.4 },
  { nazwa: 'Jabłko', kalorie: 52, bialko: 0.3, tluszcze: 0.2, weglowodany: 14 },
  { nazwa: 'Gruszka', kalorie: 57, bialko: 0.4, tluszcze: 0.1, weglowodany: 15 },
  { nazwa: 'Winogrona', kalorie: 69, bialko: 0.6, tluszcze: 0.2, weglowodany: 18 },
  { nazwa: 'Truskawki', kalorie: 32, bialko: 0.7, tluszcze: 0.3, weglowodany: 7.7 },
  { nazwa: 'Łosoś', kalorie: 208, bialko: 20, tluszcze: 13, weglowodany: 0 },
  { nazwa: 'Wołowina chuda', kalorie: 250, bialko: 26, tluszcze: 15, weglowodany: 0 },
  { nazwa: 'Indyk mielony', kalorie: 170, bialko: 22, tluszcze: 8, weglowodany: 0 },
  { nazwa: 'Ser twarogowy', kalorie: 98, bialko: 11, tluszcze: 4.3, weglowodany: 3.4 },
  { nazwa: 'Kasza gryczana', kalorie: 343, bialko: 13.3, tluszcze: 3.4, weglowodany: 71.5 },
  { nazwa: 'Kasza jaglana', kalorie: 378, bialko: 11, tluszcze: 4.2, weglowodany: 73 },
  { nazwa: 'Ciecierzyca', kalorie: 164, bialko: 9, tluszcze: 2.6, weglowodany: 27 },
  { nazwa: 'Soczewica', kalorie: 116, bialko: 9, tluszcze: 0.4, weglowodany: 20 },
  { nazwa: 'Fasola biała', kalorie: 337, bialko: 21, tluszcze: 1.5, weglowodany: 61 },
  { nazwa: 'Szpinak', kalorie: 23, bialko: 2.9, tluszcze: 0.4, weglowodany: 3.6 },
  { nazwa: 'Cukinia', kalorie: 17, bialko: 1.2, tluszcze: 0.3, weglowodany: 3.1 },
  { nazwa: 'Marchew', kalorie: 41, bialko: 0.9, tluszcze: 0.2, weglowodany: 10 },
  { nazwa: 'Kalafior', kalorie: 25, bialko: 1.9, tluszcze: 0.3, weglowodany: 5 },
  { nazwa: 'Papryka czerwona', kalorie: 31, bialko: 1, tluszcze: 0.3, weglowodany: 6 },
  { nazwa: 'Serek wiejski', kalorie: 98, bialko: 11, tluszcze: 4.3, weglowodany: 3.4 },
  { nazwa: 'Tuńczyk w oleju', kalorie: 198, bialko: 23, tluszcze: 11, weglowodany: 0 },
  { nazwa: 'Woda mineralna', kalorie: 0, bialko: 0, tluszcze: 0, weglowodany: 0 },
  { nazwa: 'Kawa czarna', kalorie: 2, bialko: 0.3, tluszcze: 0, weglowodany: 0 },
  { nazwa: 'Herbata zielona', kalorie: 0, bialko: 0, tluszcze: 0, weglowodany: 0 },
  { nazwa: 'Cola zero', kalorie: 1, bialko: 0, tluszcze: 0, weglowodany: 0 },
  { nazwa: 'Serek homogenizowany', kalorie: 135, bialko: 6, tluszcze: 4, weglowodany: 18 },
  { nazwa: 'Kefir', kalorie: 40, bialko: 3, tluszcze: 1, weglowodany: 4 },
  { nazwa: 'Migdały', kalorie: 579, bialko: 21, tluszcze: 50, weglowodany: 22 },
  { nazwa: 'Orzechy włoskie', kalorie: 654, bialko: 15, tluszcze: 65, weglowodany: 14 },
  { nazwa: 'Orzechy laskowe', kalorie: 628, bialko: 15, tluszcze: 61, weglowodany: 17 },
  { nazwa: 'Rodzynki', kalorie: 299, bialko: 3.1, tluszcze: 0.5, weglowodany: 79 },
  { nazwa: 'Dżem truskawkowy', kalorie: 250, bialko: 0.4, tluszcze: 0.2, weglowodany: 65 },
]

for (let i = sampleProducts.length + 1; i <= 100; i++) {
  sampleProducts.push({
    nazwa: `Produkt ${i}`,
    kalorie: 50 + (i % 100),
    bialko: (i % 10) + 1,
    tluszcze: (i % 5) + 0.5,
    weglowodany: (i % 20) + 1,
  })
}

async function main() {
  await prisma.produkt.createMany({
    data: sampleProducts,
  })
  console.log('IS DONE HURRAY')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())