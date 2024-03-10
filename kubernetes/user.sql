CREATE TABLE `users` (
	`id` VARCHAR(60) NOT NULL COLLATE 'latin1_swedish_ci',
	`userName` VARCHAR(60) NOT NULL DEFAULT '' COLLATE 'latin1_swedish_ci',
	`profilePic` VARCHAR(200) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`profileName` VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `UC_userName` (`userName`) USING BTREE
)
COLLATE='latin1_swedish_ci'
ENGINE=MyISAM
;


CREATE TABLE `user_key` (
	`id` VARCHAR(255) NOT NULL COLLATE 'latin1_swedish_ci',
	`user_id` VARCHAR(60) NOT NULL COLLATE 'latin1_swedish_ci',
	`hashed_password` VARCHAR(255) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`google_auth` TEXT NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`github_id` TEXT NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`github_auth` TEXT NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`twitch_auth` TEXT NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`twitch_id` TEXT NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `user_id` (`user_id`) USING BTREE
)
COLLATE='latin1_swedish_ci'
ENGINE=MyISAM
;



CREATE TABLE `user_session` (
	`id` VARCHAR(127) NOT NULL COLLATE 'latin1_swedish_ci',
	`user_id` VARCHAR(15) NOT NULL COLLATE 'latin1_swedish_ci',
	`active_expires` BIGINT(20) UNSIGNED NOT NULL,
	`idle_expires` BIGINT(20) UNSIGNED NOT NULL,
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `user_id` (`user_id`) USING BTREE
)
COLLATE='latin1_swedish_ci'
ENGINE=MyISAM
;

