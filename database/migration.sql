/* 
    This Database is used during testing only
    You need to create 12 tables each year
    to represent each month of the up coming year
 */;
DROP TABLE IF EXISTS `logs`;
CREATE TABLE `logs` (
  `messageId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sourceArn` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sendingAccountId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timestamp` datetime NOT NULL,
  `content` json NOT NULL,
  PRIMARY KEY (`messageId`),
  KEY `logs_sourcearn_index` (`sourceArn`),
  KEY `logs_source_index` (`source`),
  KEY `logs_sendingaccountid_index` (`sendingAccountId`),
  KEY `logs_timestamp_index` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
