DROP DATABASE IF EXISTS ttomanito;

CREATE DATABASE ttomanito
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_general_ci;

USE ttomanito;

CREATE TABLE `user` (
                        `user_id`   BIGINT NOT NULL AUTO_INCREMENT,
                        `name`      VARCHAR(50) NOT NULL,
                        `joined_at` DATETIME NOT NULL,
                        `status`    VARCHAR(50) NOT NULL COMMENT 'ENUM(`ACTIVE`, `WITHDRAWN`)',
                        PRIMARY KEY (`user_id`)
);

CREATE TABLE `oauth_identity` (
                                  `oauth_identity_id` BIGINT NOT NULL AUTO_INCREMENT,
                                  `user_id` BIGINT NOT NULL,
                                  `provider`   VARCHAR(50) NOT NULL COMMENT 'ENUM(`KAKAO`, `NAVER`, `GOOGLE`)',
                                  `provider_id` VARCHAR(255) NOT NULL,
                                  PRIMARY KEY (`oauth_identity_id`),
                                  KEY `IX_oid_user` (`user_id`),
                                  CONSTRAINT `FK_oid_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`)
);

CREATE TABLE `room` (
                        `room_id`    BIGINT NOT NULL AUTO_INCREMENT,
                        `creator_id` BIGINT NOT NULL,
                        `name`       VARCHAR(100) NULL,
                        `status`     VARCHAR(20) NULL COMMENT 'ENUM(`NONE`, `NOT_STARTED`, `IN_PROGRESS`, `FINISHED`)',
                        `start_date` DATE NULL,
                        `end_date`   DATE NULL,
                        PRIMARY KEY (`room_id`),
                        KEY `IX_room_creator` (`creator_id`),
                        CONSTRAINT `FK_room_creator` FOREIGN KEY (`creator_id`) REFERENCES `user`(`user_id`)
);

CREATE TABLE `room_user` (
                             `room_user_id`  BIGINT NOT NULL AUTO_INCREMENT,
                             `user_id`       BIGINT NOT NULL,
                             `room_id`       BIGINT NOT NULL,
                             `status_message` VARCHAR(255) NULL,
                             PRIMARY KEY (`room_user_id`),
                             UNIQUE KEY `UK_room_user_room_user` (`room_id`, `user_id`),
                             KEY `IX_room_user_user` (`user_id`),
                             CONSTRAINT `FK_ru_room` FOREIGN KEY (`room_id`) REFERENCES `room`(`room_id`),
                             CONSTRAINT `FK_ru_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`)
);

CREATE TABLE `mission_day` (
                               `mission_day_id` BIGINT NOT NULL AUTO_INCREMENT,
                               `room_id`        BIGINT NOT NULL,
                               `day`            VARCHAR(10) NOT NULL COMMENT 'ENUM(`MON`, `TUE`, `WED`, `THU`, `FRI`, `SAT`, `SUN`)',
                               PRIMARY KEY (`mission_day_id`),
                               KEY `IX_md_room` (`room_id`),
                               CONSTRAINT `FK_md_room` FOREIGN KEY (`room_id`) REFERENCES `room`(`room_id`)
);

CREATE TABLE `mission` (
                           `mission_id`  BIGINT NOT NULL AUTO_INCREMENT,
                           `title`       VARCHAR(255) NOT NULL,
                           `description` VARCHAR(255) NULL,
                           `difficulty`  VARCHAR(50) NOT NULL,
                           `channel`     VARCHAR(50) NOT NULL COMMENT 'ENUM(`MEET`, `CHAT`, `CALL`)',
                           `type`        VARCHAR(50) NOT NULL COMMENT 'ENUM(`GIFTS`, `COMMUNICATION`, `PERFORMANCE`, `NOTES`, `OBSERVATION`)',
                           `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           `updated_at`  DATETIME NULL  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                           PRIMARY KEY (`mission_id`)
);

CREATE TABLE `daily_mission` (
                                 `daily_mission_id` BIGINT NOT NULL AUTO_INCREMENT,
                                 `manito_id`  BIGINT NOT NULL,
                                 `mission_id` BIGINT NOT NULL,
                                 `room_id`    BIGINT NOT NULL,
                                 `mission_date` DATE NOT NULL,
                                 `created_at`  DATETIME NULL,
                                 `updated_at`  DATETIME NULL,
                                 PRIMARY KEY (`daily_mission_id`),
                                 KEY `IX_dm_manito` (`manito_id`),
                                 KEY `IX_dm_mission` (`mission_id`),
                                 KEY `IX_dm_room` (`room_id`),
                                 CONSTRAINT `FK_dm_manito_user` FOREIGN KEY (`manito_id`)  REFERENCES `user`(`user_id`),
                                 CONSTRAINT `FK_dm_mission`     FOREIGN KEY (`mission_id`) REFERENCES `mission`(`mission_id`),
                                 CONSTRAINT `FK_dm_room`        FOREIGN KEY (`room_id`)    REFERENCES `room`(`room_id`)
);

CREATE TABLE `mission_status` (
                                  `mission_status_id` BIGINT NOT NULL AUTO_INCREMENT,
                                  `user_id`           BIGINT NOT NULL,
                                  `daily_mission_id`  BIGINT NOT NULL,
                                  `room_user_id`      BIGINT NOT NULL,
                                  `completed`         BOOLEAN NOT NULL,
                                  `completed_at`      DATETIME NULL,
                                  `created_at`         DATETIME NULL,
                                  `updated_at`         DATETIME NULL,
                                  PRIMARY KEY (`mission_status_id`),
                                  KEY `IX_ms_user` (`user_id`),
                                  KEY `IX_ms_daily` (`daily_mission_id`),
                                  KEY `IX_ms_room_user` (`room_user_id`),
                                  CONSTRAINT `FK_ms_user`        FOREIGN KEY (`user_id`)          REFERENCES `user`(`user_id`),
                                  CONSTRAINT `FK_ms_daily`       FOREIGN KEY (`daily_mission_id`) REFERENCES `daily_mission`(`daily_mission_id`),
                                  CONSTRAINT `FK_ms_room_user`   FOREIGN KEY (`room_user_id`)     REFERENCES `room_user`(`room_user_id`)
);

CREATE TABLE `manito_guess` (
                                `manito_guess_id` BIGINT NOT NULL AUTO_INCREMENT,
                                `guess_user_id`   BIGINT NOT NULL,
                                `guessed_user_id` BIGINT NOT NULL,
                                `guessed_date`    DATE NOT NULL,
                                `is_correct`      BOOLEAN NULL,
                                PRIMARY KEY (`manito_guess_id`)
);

CREATE TABLE `manito_assignment` (
                                     `manito_assignment_id` BIGINT NOT NULL AUTO_INCREMENT,
                                     `manito_id`  BIGINT NOT NULL,
                                     `manitee_id` BIGINT NOT NULL,
                                     `room_id`    BIGINT NOT NULL,
                                     PRIMARY KEY (`manito_assignment_id`),
                                     KEY `IX_ma_manito` (`manito_id`),
                                     KEY `IX_ma_manitee` (`manitee_id`),
                                     KEY `IX_ma_room` (`room_id`),
                                     CONSTRAINT `FK_ma_manito`  FOREIGN KEY (`manito_id`)  REFERENCES `room_user`(`room_user_id`),
                                     CONSTRAINT `FK_ma_manitee` FOREIGN KEY (`manitee_id`) REFERENCES `room_user`(`room_user_id`),
                                     CONSTRAINT `FK_ma_room`    FOREIGN KEY (`room_id`)    REFERENCES `room`(`room_id`)
);

CREATE TABLE `notification` (
                                `notification_id` BIGINT NOT NULL AUTO_INCREMENT,
                                `user_id` BIGINT NOT NULL,
                                `type`    VARCHAR(50) NOT NULL COMMENT 'ENUM(`MISSION`, `GUESS`, `POKE`, `FINISHED`, `SYSTEM`)',
                                `check`   BOOLEAN NOT NULL,
                                PRIMARY KEY (`notification_id`),
                                KEY `IX_notice_user` (`user_id`),
                                CONSTRAINT `FK_notice_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`)
);

CREATE TABLE `manito_activity` (
                                   `room_user_id` BIGINT NOT NULL,
                                   `chat_count` INT NOT NULL,
                                   `call_time` INT NOT NULL,
                                   `mission_success_count` INT NOT NULL,
                                   `poke_count` INT NOT NULL,
                                   `version` INT NULL,
                                   PRIMARY KEY (`room_user_id`),
                                   CONSTRAINT `FK_ma_room_user` FOREIGN KEY (`room_user_id`) REFERENCES `room_user`(`room_user_id`)
);

CREATE TABLE `chatting_room` (
                                 `chatting_room_id` BIGINT NOT NULL AUTO_INCREMENT,
                                 `manito_assignment_id` BIGINT NOT NULL,
                                 `last_message`     VARCHAR(255) NULL,
                                 `last_message_time` DATETIME NULL,
                                 PRIMARY KEY (`chatting_room_id`),
                                 KEY `IX_cr_assignment` (`manito_assignment_id`),
                                 CONSTRAINT `FK_cr_assignment` FOREIGN KEY (`manito_assignment_id`) REFERENCES `manito_assignment`(`manito_assignment_id`)
);

CREATE TABLE `chatting_user` (
                                 `chatting_room_id` BIGINT NOT NULL,
                                 `room_user_id`     BIGINT NOT NULL,
                                 `unread_count`     INT NULL,
                                 `last_read_time`   DATETIME NULL,
                                 PRIMARY KEY (`chatting_room_id`, `room_user_id`),
                                 KEY `IX_cu_room_user` (`room_user_id`),
                                 CONSTRAINT `FK_cu_room` FOREIGN KEY (`chatting_room_id`) REFERENCES `chatting_room`(`chatting_room_id`),
                                 CONSTRAINT `FK_cu_room_user` FOREIGN KEY (`room_user_id`) REFERENCES `room_user`(`room_user_id`)
);

CREATE TABLE `voice_chat` (
                              `chatting_room_id` BIGINT NOT NULL,
                              `room_user_id`     BIGINT NOT NULL,
                              `started_at`       DATETIME NULL,
                              `ended_at`         DATETIME NULL,
                              `duration_sec`     INT NULL,
                              `is_active`        BOOLEAN NOT NULL,
                              PRIMARY KEY (`chatting_room_id`, `room_user_id`),
                              CONSTRAINT `FK_voice_chat_chatting_room` FOREIGN KEY (`chatting_room_id`) REFERENCES `chatting_room` (`chatting_room_id`),
                              CONSTRAINT `FK_voice_chat_room_user` FOREIGN KEY (`room_user_id`) REFERENCES `room_user` (`room_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `poke_log` (
                            `poke_id` BIGINT NOT NULL AUTO_INCREMENT,
                            `manito_id`  BIGINT NOT NULL,
                            `manitee_id` BIGINT NOT NULL,
                            `manito_assignment_id` BIGINT NOT NULL,
                            `room_user_id` BIGINT NOT NULL,
                            `created_at`  DATETIME NOT NULL,
                            PRIMARY KEY (`poke_id`),
                            KEY `IX_pl_manito` (`manito_id`),
                            KEY `IX_pl_manitee` (`manitee_id`),
                            KEY `IX_pl_assignment` (`manito_assignment_id`),
                            KEY `IX_pl_room_user` (`room_user_id`),
                            CONSTRAINT `FK_pl_manito_user`  FOREIGN KEY (`manito_id`)  REFERENCES `user`(`user_id`),
                            CONSTRAINT `FK_pl_manitee_user` FOREIGN KEY (`manitee_id`) REFERENCES `user`(`user_id`),
                            CONSTRAINT `FK_pl_assignment`   FOREIGN KEY (`manito_assignment_id`) REFERENCES `manito_assignment`(`manito_assignment_id`),
                            CONSTRAINT `FK_pl_room_user`    FOREIGN KEY (`room_user_id`) REFERENCES `room_user`(`room_user_id`)
);

CREATE TABLE `push_token` (
                              `push_token_id`         BIGINT NOT NULL AUTO_INCREMENT,
                              `user_id`    BIGINT NOT NULL,
                              `token`      VARCHAR(500) NOT NULL,
                              `enabled`    BOOLEAN NOT NULL,
                              `updated_at` DATETIME NOT NULL,
                              PRIMARY KEY (`push_token_id`),
                              UNIQUE KEY `UK_push_token_token` (`token`),
                              KEY `IX_pt_user` (`user_id`),
                              CONSTRAINT `FK_pt_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;