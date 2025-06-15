#Baza Danych

Program jest to prosta wersja aplikacji takiej jak fitatu. Zawiera stronę główną, system logowania, dodawanie przedmiotów do posiłków jak i admin panel.

Szybka piłka, przynudzać nie będę. Narpiew trzeba wygenerować bazę danych

```bash
# npm
npx prisma generate
npx prisma db push
npm install ts-node typescript @types/node --save-dev
npx prisma migrate dev --name init
npx prisma db seed
```
Jeżeli baza odmawia przyjęcia seeda to zamieściłem kwerendę którą ręcznie trzeba załadować do bazy (szczerze nie wiem od czego to jest zależne)

#Startowanie projektu

Potrzebyn XAMPP Apache i phpMyAdmin i nowej wersji Node.js

Start developerski
```bash
# npm
npm install
npm run dev
```
#Dostęp do funkcji administratora

Niestety trzeba to zrobić ręcznie. Po stworzeniu kąta na stronie w bazie trzeba zmienić stanowisko użytkownika na TRUE (1)
Nastepnie na stronie użytkownika powinny pojawić się dodatkowe funkcjie
