CREATE TABLE user_connection (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    followed_user_id INTEGER
        REFERENCES user_information(id) ON DELETE CASCADE NOT NULL,
    date_created TIMESTAMPTZ DEFAULT now() NOT NULL,
    notification_received BOOLEAN DEFAULT false NOT NULL,
    user_id INTEGER
        REFERENCES user_information(id) ON DELETE CASCADE NOT NULL
);