-- CreateTable
CREATE TABLE `posilek` (
    `id_posilku` INTEGER NOT NULL AUTO_INCREMENT,
    `id_uzytkownika` INTEGER NOT NULL,
    `nazwa` VARCHAR(191) NOT NULL,
    `kalorie` INTEGER NOT NULL,
    `bialko` DOUBLE NOT NULL,
    `tluszcze` DOUBLE NOT NULL,
    `weglowodany` DOUBLE NOT NULL,
    `data` DATETIME(3) NOT NULL,

    INDEX `posilek_id_uzytkownika_idx`(`id_uzytkownika`),
    PRIMARY KEY (`id_posilku`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produkt` (
    `id_produktu` INTEGER NOT NULL AUTO_INCREMENT,
    `nazwa` VARCHAR(191) NOT NULL,
    `kalorie` INTEGER NOT NULL,
    `bialko` DOUBLE NOT NULL,
    `tluszcze` DOUBLE NOT NULL,
    `weglowodany` DOUBLE NOT NULL,

    PRIMARY KEY (`id_produktu`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `uzytkownik` (
    `id_uzytkownika` INTEGER NOT NULL AUTO_INCREMENT,
    `login` VARCHAR(191) NOT NULL,
    `haslo` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `cel_kaloryczny` INTEGER NULL,

    UNIQUE INDEX `uzytkownik_email_key`(`email`),
    PRIMARY KEY (`id_uzytkownika`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PosilekProdukty` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PosilekProdukty_AB_unique`(`A`, `B`),
    INDEX `_PosilekProdukty_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `posilek` ADD CONSTRAINT `posilek_id_uzytkownika_fkey` FOREIGN KEY (`id_uzytkownika`) REFERENCES `uzytkownik`(`id_uzytkownika`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PosilekProdukty` ADD CONSTRAINT `_PosilekProdukty_A_fkey` FOREIGN KEY (`A`) REFERENCES `posilek`(`id_posilku`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PosilekProdukty` ADD CONSTRAINT `_PosilekProdukty_B_fkey` FOREIGN KEY (`B`) REFERENCES `produkt`(`id_produktu`) ON DELETE CASCADE ON UPDATE CASCADE;
