# Project Starter

Projekt praktycznie całkowicie backendowy, brak frontendu.

## Setup

Program działa na wersji 24.0.0 Node.js
Wymagany jest XAMPP
Komendy opisane później używają bash

## Inicjalizacja bazy danych

Komendy poniżej powinny utworzyć bazę danych z danymi produktów.

```bash
npx prisma migrate dev --name setup
npx prisma db seed
```
## Development Server

Uruchomić serwer `http://localhost:3000`:

```bash
# npm
npm run dev
```

## Informacje o projekcie

Projekt posiada podstawową funkcjonalność -
system logowania,
middleware (zabezpieczenie przed niezalogowanymi użytkownikami),
działający pasek postępu (update w czasie rzeczywistym),
system ustawiania celów,
automatyczne dodawanie danych o północy (z powodu, że serwer ten jest startowany lokalnie ta funkcja nie działa. Jeżeli projekt znajdowałby się na zwykłym serwerze skrypt powinien działać),
kompletną bazę danych (struktóra znajduje się w pliku schema.prisma),
endpointy obsługujące zapytania do bazy danych.
