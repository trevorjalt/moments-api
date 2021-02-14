CREATE TYPE PRIVACY_PREFERENCE AS ENUM (
    'Public',
    'Private'
);

ALTER TABLE user_information
    ADD COLUMN
        privacy PRIVACY_PREFERENCE NOT NULL