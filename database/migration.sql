/*  
    This Database is used during testing only 
    You need to create 12 tables each year 
    to represent each month of the up coming year 
 */ 
DROP TABLE IF EXISTS `logs`; 

CREATE TABLE `logs` 
  ( 
     `id`               BIGINT UNSIGNED NOT NULL auto_increment, 
     `messageid`        VARCHAR(255) CHARACTER SET utf8mb4 COLLATE 
     utf8mb4_unicode_ci NOT 
     NULL, 
     `sourcearn`        VARCHAR(255) CHARACTER SET utf8mb4 COLLATE 
     utf8mb4_unicode_ci 
     DEFAULT NULL, 
     `source`           VARCHAR(255) CHARACTER SET utf8mb4 COLLATE 
     utf8mb4_unicode_ci NOT NULL, 
     `sendingaccountid` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE 
     utf8mb4_unicode_ci 
     DEFAULT NULL, 
     `subject`          VARCHAR(255) CHARACTER SET utf8mb4 COLLATE 
     utf8mb4_unicode_ci DEFAULT 
     NULL, 
     `timestamp`        DATETIME NOT NULL, 
     `published`        BOOLEAN NOT NULL, 
     `content`          JSON NOT NULL, 
     PRIMARY KEY (`id`), 
     UNIQUE KEY `id` (`id`), 
     KEY `messageid` (`messageid`), 
     KEY `logs_sourcearn_index` (`sourcearn`), 
     KEY `logs_source_index` (`source`), 
     KEY `logs_sendingaccountid_index` (`sendingaccountid`), 
     KEY `logs_timestamp_index` (`timestamp`) 
  ) 
engine=innodb 
DEFAULT charset=utf8mb4 
COLLATE=utf8mb4_unicode_ci; 

/*  
  Table that holdes the names of your clients 
*/ 
DROP TABLE IF EXISTS `clients`; 

CREATE TABLE `clients` 
  ( 
     `id`          INT UNSIGNED NOT NULL auto_increment, 
     `client_name` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci 
     NOT 
     NULL, 
     PRIMARY KEY (`id`), 
     UNIQUE KEY `client_name` (`client_name`) 
  ) 
engine=innodb 
DEFAULT charset=utf8mb4 
COLLATE=utf8mb4_unicode_ci; 

/*  
  Table that holdes the urls each Arn should forward its events to 
*/ 
DROP TABLE IF EXISTS `forwarder`; 

CREATE TABLE `forwarder` 
  ( 
     `id`         INT UNSIGNED NOT NULL auto_increment, 
     `client_id`  INT UNSIGNED, 
     `arn`        VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci 
     DEFAULT NULL, 
     `from_email` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci 
     DEFAULT NULL, 
     `url`        VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci 
     NOT NULL, 
     PRIMARY KEY (`id`), 
     UNIQUE KEY `arn` (`arn`), 
     UNIQUE KEY `from_email` (`from_email`), 
     FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) 
  ) 
engine=innodb 
DEFAULT charset=utf8mb4 
COLLATE=utf8mb4_unicode_ci; 

INSERT INTO `clients` 
            (`client_name`) 
VALUES      ('test client'); 

INSERT INTO `forwarder` 
            (`client_id`, 
             `arn`, 
             `from_email`, 
             `url`) 
VALUES      (1, 
             'arn:aws:ses:us-east-1:123456789012:identity/sender@example.com', 
             'sender@example.com', 
             'https://test.domain/mailer/amazon/callback'); 