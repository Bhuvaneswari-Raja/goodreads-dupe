-- CreateTable
CREATE TABLE `Book` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `pages` INTEGER NOT NULL DEFAULT 0,
    `year` VARCHAR(191) NULL,
    `cover` VARCHAR(191) NULL,
    `current` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'unread',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReadingSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookId` INTEGER NOT NULL,
    `page` INTEGER NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Movie` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tmdbId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `year` VARCHAR(191) NULL,
    `cover` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'want',
    `runtime` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Movie_tmdbId_key`(`tmdbId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TvShow` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tmdbId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `year` VARCHAR(191) NULL,
    `cover` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'want',
    `totalEps` INTEGER NOT NULL DEFAULT 0,
    `currentEp` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `TvShow_tmdbId_key`(`tmdbId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ReadingSession` ADD CONSTRAINT `ReadingSession_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `Book`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
