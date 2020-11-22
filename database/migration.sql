/* 
    This Database is used during testing only
    You need to create 12 tables each year
    to represent each month of the up coming year
 */
DROP TABLE IF EXISTS `logs`;
CREATE TABLE `logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `messageId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sourceArn` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sendingAccountId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timestamp` datetime NOT NULL,
  `published` boolean NOT NULL,
  `content` json NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `messageId` (`messageId`),
  KEY `logs_sourcearn_index` (`sourceArn`),
  KEY `logs_source_index` (`source`),
  KEY `logs_sendingaccountid_index` (`sendingAccountId`),
  KEY `logs_timestamp_index` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


/* 
  Table that holdes the names of your clients
*/
DROP TABLE IF EXISTS `clients`;
CREATE TABLE `clients` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `client_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `client_name` (`client_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* 
  Table that holdes the urls each Arn should forward its events to
*/
DROP TABLE IF EXISTS `forwarder`;
CREATE TABLE `forwarder` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `client_id` int unsigned,
  `arn` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `from_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `arn` (`arn`),
  UNIQUE KEY `from_email` (`from_email`),
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



INSERT INTO `clients` 
(`client_name`) 
VALUES 
('test client');

INSERT INTO `forwarder`
(`client_id`, `arn`, `from_email`, `url`)
VALUES
(1,'arn:aws:ses:us-east-1:123456789012:identity/sender@example.com','sender@example.com', 'https://test.domain/mailer/amazon/callback');
