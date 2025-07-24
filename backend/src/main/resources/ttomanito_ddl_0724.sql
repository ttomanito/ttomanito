CREATE DATABASE IF NOT EXISTS `ttomanito`
  CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
USE `ttomanito`;

CREATE TABLE `mission_status` (
                                  `mission_status_id`	BIGINT	NOT NULL,
                                  `daily_mission_id`	BIGINT	NOT NULL,
                                  `completed`	BOOLEAN	NOT NULL,
                                  `completed_at`	DATETIME	NULL
);

CREATE TABLE `user` (
                        `user_id`	BIGINT	NOT NULL,
                        `name`	VARCHAR(50)	NOT NULL,
                        `joined_at`	DATETIME	NOT NULL,
                        `status`	VARCHAR(50)	NOT NULL	COMMENT 'ENUM(`ACTIVE`, `WITHDRAWN`)'
);

CREATE TABLE `mission` (
                           `mission_id`	BIGINT	NOT NULL,
                           `title`	VARCHAR(100)	NOT NULL,
                           `description`	VARCHAR(255)	NULL,
                           `difficulty`	VARCHAR(50)	NOT NULL	COMMENT 'ENUM(`EASY`, `NORMAL`, `HARD`, `VERY_HARD`)',
                           `channels`	VARCHAR(50)	NOT NULL	COMMENT 'ENUM(`MEET`, `CHAT`, `CALL`)'
);

CREATE TABLE `room` (
                        `room_id`	BIGINT	NOT NULL,
                        `creator_id`	BIGINT	NOT NULL,
                        `name`	VARCHAR(100)	NULL,
                        `status`	VARCHAR(50)	NULL	COMMENT 'ENUM(`NOT_STARTED`, `IN_PROGRESS`, `FINISHED`)',
                        `start_date`	DATE	NULL,
                        `end_date`	DATE	NULL
);

CREATE TABLE `room_user` (
                             `room_user_id`	BIGINT	NOT NULL,
                             `user_id`	BIGINT	NOT NULL,
                             `room_id`	BIGINT	NOT NULL,
                             `status_message`	VARCHAR(255)	NULL
);

CREATE TABLE `mission_day` (
                               `mission_day_id`	BIGINT	NOT NULL,
                               `room_id`	BIGINT	NOT NULL,
                               `day`	VARCHAR(50)	NOT NULL	COMMENT 'ENUM(`MON`, `TUE`, `WED`, `THU`, `FRI`, `SAT`, `SUN`)'
);

CREATE TABLE `chatting_room` (
                                 `chatting_room_id`	BIGINT	NOT NULL,
                                 `manito_assignment_id`	BIGINT	NOT NULL,
                                 `last_message`	VARCHAR(255)	NULL,
                                 `last_message_time`	DATETIME	NULL
);

CREATE TABLE `daily_mission` (
                                 `daily_mission_id`	BIGINT	NOT NULL,
                                 `manito_id`	BIGINT	NOT NULL,
                                 `mission_id`	BIGINT	NOT NULL,
                                 `mission_date`	DATE	NOT NULL
);

CREATE TABLE `manito_assignment` (
                                     `manito_assignment_id`	BIGINT	NOT NULL,
                                     `manito_id`	BIGINT	NOT NULL,
                                     `manitee_id`	BIGINT	NOT NULL,
                                     `room_id`	BIGINT	NOT NULL
);

CREATE TABLE `oauth_identity` (
                                  `oauth_identity_id`	BIGINT	NOT NULL,
                                  `user_id`	BIGINT	NOT NULL,
                                  `provider`	VARCHAR(50)	NOT NULL	COMMENT 'ENUM(`KAKAO`, `NAVER`, `GOOGLE`)',
                                  `provider_id`	VARCHAR(255)	NOT NULL
);

CREATE TABLE `manito_activity` (
                                   `room_user_id`	BIGINT	NOT NULL,
                                   `chat_count`	INT	NULL,
                                   `call_time`	INT	NULL,
                                   `mission_success_count`	INT	NULL,
                                   `poke_count`	INT	NULL
);

CREATE TABLE `voice_chat` (
                              `chatting_room_id`	BIGINT	NOT NULL,
                              `room_user_id`	BIGINT	NOT NULL,
                              `started_at`	DATETIME	NULL,
                              `ended_at`	DATETIME	NULL,
                              `duration_sec`	INT	NULL
);

CREATE TABLE `manito_guess` (
                                `manito_guess`	BIGINT	NOT NULL,
                                `guess_user_id`	BIGINT	NOT NULL,
                                `guessed_user_id`	BIGINT	NOT NULL,
                                `guessed_date`	DATE	NOT NULL,
                                `is_correct`	BOOLEAN	NULL
);

CREATE TABLE `notification` (
                                `notification_id`	BIGINT	NOT NULL,
                                `user_id`	BIGINT	NOT NULL,
                                `content`	VARCHAR(500)	NULL,
                                `type`	VARCHAR(50)	NULL	COMMENT 'ENUM(`MISSION`, `GUESS`, `POKE`, `FINISHED`, `SYSTEM`)'
);

CREATE TABLE `chatting_user` (
                                 `chatting_room_id`	BIGINT	NOT NULL,
                                 `room_user_id`	BIGINT	NOT NULL,
                                 `unread_count`	INT	NULL,
                                 `last_read_time`	DATETIME	NULL
);

ALTER TABLE `mission_status` ADD CONSTRAINT `PK_MISSION_STATUS` PRIMARY KEY (
                                                                             `mission_status_id`
    );

ALTER TABLE `user` ADD CONSTRAINT `PK_USER` PRIMARY KEY (
                                                         `user_id`
    );

ALTER TABLE `mission` ADD CONSTRAINT `PK_MISSION` PRIMARY KEY (
                                                               `mission_id`
    );

ALTER TABLE `room` ADD CONSTRAINT `PK_ROOM` PRIMARY KEY (
                                                         `room_id`
    );

ALTER TABLE `room_user` ADD CONSTRAINT `PK_ROOM_USER` PRIMARY KEY (
                                                                   `room_user_id`
    );

ALTER TABLE `mission_day` ADD CONSTRAINT `PK_MISSION_DAY` PRIMARY KEY (
                                                                       `mission_day_id`
    );

ALTER TABLE `chatting_room` ADD CONSTRAINT `PK_CHATTING_ROOM` PRIMARY KEY (
                                                                           `chatting_room_id`
    );

ALTER TABLE `daily_mission` ADD CONSTRAINT `PK_DAILY_MISSION` PRIMARY KEY (
                                                                           `daily_mission_id`
    );

ALTER TABLE `manito_assignment` ADD CONSTRAINT `PK_MANITO_ASSIGNMENT` PRIMARY KEY (
                                                                                   `manito_assignment_id`
    );

ALTER TABLE `oauth_identity` ADD CONSTRAINT `PK_OAUTH_IDENTITY` PRIMARY KEY (
                                                                             `oauth_identity_id`
    );

ALTER TABLE `manito_activity` ADD CONSTRAINT `PK_MANITO_ACTIVITY` PRIMARY KEY (
                                                                               `room_user_id`
    );

ALTER TABLE `voice_chat` ADD CONSTRAINT `PK_VOICE_CHAT` PRIMARY KEY (
                                                                     `chatting_room_id`,
                                                                     `room_user_id`
    );

ALTER TABLE `manito_guess` ADD CONSTRAINT `PK_MANITO_GUESS` PRIMARY KEY (
                                                                         `manito_guess`
    );

ALTER TABLE `notification` ADD CONSTRAINT `PK_NOTIFICATION` PRIMARY KEY (
                                                                         `notification_id`
    );

ALTER TABLE `chatting_user` ADD CONSTRAINT `PK_CHATTING_USER` PRIMARY KEY (
                                                                           `chatting_room_id`,
                                                                           `room_user_id`
    );

ALTER TABLE `manito_activity` ADD CONSTRAINT `FK_room_user_TO_manito_activity_1` FOREIGN KEY (
                                                                                              `room_user_id`
    )
    REFERENCES `room_user` (
                            `room_user_id`
        );

ALTER TABLE `voice_chat` ADD CONSTRAINT `FK_chatting_room_TO_voice_chat_1` FOREIGN KEY (
                                                                                        `chatting_room_id`
    )
    REFERENCES `chatting_room` (
                                `chatting_room_id`
        );

ALTER TABLE `voice_chat` ADD CONSTRAINT `FK_room_user_TO_voice_chat_1` FOREIGN KEY (
                                                                                    `room_user_id`
    )
    REFERENCES `room_user` (
                            `room_user_id`
        );

ALTER TABLE `chatting_user` ADD CONSTRAINT `FK_chatting_room_TO_chatting_user_1` FOREIGN KEY (
                                                                                              `chatting_room_id`
    )
    REFERENCES `chatting_room` (
                                `chatting_room_id`
        );

ALTER TABLE `chatting_user` ADD CONSTRAINT `FK_room_user_TO_chatting_user_1` FOREIGN KEY (
                                                                                          `room_user_id`
    )
    REFERENCES `room_user` (
                            `room_user_id`
        );

