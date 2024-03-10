CREATE TABLE `rooms` (
	`id` VARCHAR(200) NOT NULL COLLATE 'latin1_swedish_ci',
	`users` VARCHAR(200) NOT NULL COLLATE 'latin1_swedish_ci',
	`maxUsers` INT(11) NOT NULL DEFAULT '2',
	`isActive` BIT(1) NOT NULL,
	`isEnded` BIT(1) NOT NULL,
	`isPrivate` INT(11) NOT NULL DEFAULT '0',
	`createdAt` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`startedAt` VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`endedAt` VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`gameData` TEXT NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`winnerUser` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='latin1_swedish_ci'
ENGINE=MyISAM
;
