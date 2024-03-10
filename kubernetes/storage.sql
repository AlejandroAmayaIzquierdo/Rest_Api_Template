CREATE TABLE `storage` (
	`storageId` INT(11) NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(200) NOT NULL COLLATE 'latin1_swedish_ci',
	`type` VARCHAR(50) NOT NULL COLLATE 'latin1_swedish_ci',
	`path` MEDIUMTEXT NOT NULL COLLATE 'latin1_swedish_ci',
	`hash` VARCHAR(300) NOT NULL COLLATE 'latin1_swedish_ci',
	PRIMARY KEY (`storageId`) USING BTREE
)
COLLATE='latin1_swedish_ci'
ENGINE=MyISAM
;
