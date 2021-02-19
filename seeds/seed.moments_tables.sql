BEGIN;

TRUNCATE
    user_information
    RESTART IDENTITY CASCADE;

INSERT INTO user_information (
    fullname, 
    username, 
    user_password, 
    email, 
    about_user, 
    privacy
) VALUES 
    (
        'Goku',
        'kakarot',
        '$2a$12$YXiy.FjV9l2HiOiX37yIduss3LG9nwfNfmKBc8g.StK71DL0s0HIS',
        'goku@goku.com',
        'I am the answer to all living things that cry out for peace. I am protector of the innocent. I am the light in the darkness. I am truth. Ally to good. Nightmare to you.',
        'Public'
    ),
    (
        'Vegeta',
        'princeofallsaiyans',
        '$2a$12$hmDE.7v.aUGak1OtF1Y3euTYLjk/sLcXHcvKIBqJVgeGYC688RIFS',
        'vegeta@vegeta.com',
        'Push through the pain, giving up hurts more.',
        'Public'
    ),
    (
        'Gogeta',
        'betterthanvegito',
        '$2a$12$GkvU8TwNdobYQD1a9FjSw.2LGjLs3caVjy08WMw9wD.ZUdYvSuyjC',
        'gogeta@gogeta.com',
        'I''ll deal with you later',
        'Public'
    ),
    (
        'Trunks',
        'futuretrunks',
        '$2a$12$JTU.59z5TdQPeOghEUBq3e420psKXV8T7IBxhh/GhUXbML3t1b0xC',
        'trunks@trunks.com',
        'You''re about to find out what its like to fight a real Super Saiyan...and I''m not talking about Goku.',
        'Public'
    ),
    (
        'Gohan',
        'mysticgohan',
        '$2a$12$ddBfzSsa2pz1JfaL.PEjEeJ3OC4gYhMpoVPb3YO1UEFdJiABnV8h2',
        'gohan@gohan.com',
        'One thing I learned from my father is to never give up, even when odds are stacked against you.',
        'Private'
    ),
    (
        'Piccolo',
        'gohansteacher',
        '$2a$12$TajGqNeNSMu9vps2dbBC4ePaLgMrdsh7mZWFcMpAfdwl0lzZTonxK',
        'piccolo@piccolo.com',
        'Sometimes we have to look beyond what we want and do what''s best.',
        'Private'
    ),
    (
        'Android 17',
        'seventeen',
        '$2a$12$dZFkEWzfQ9IBKidYuBYxDusIOkTJXD5nWAYOWgUO3H5F/UgTQGqgW',
        'android17@android17.com',
        'I learned from how you fight. Quite a lot actually.',
        'Public'
    ),
    (
        'Android 18',
        'eighteen',
        '$2a$12$7gOAlw1Qt70.V1zJ59sxUO8FGvBPdEPWPxkUEkFel9id69sNYeJRa',
        'android18@android18.com',
        'Fine, I''ll take care of this.',
        'Public'
    ),
    (
        'Krillin',
        'turillin',
        '$2a$12$getxtynbuP/gXMWnjrQmeepOP42xAEtbsniCzXBj82tV9olfUQGYq',
        'krillin@krillin.com',
        'I thought this was already decided...',
        'Public'
    );

    INSERT INTO user_connection (
        followed_user_id,
        user_id
    ) VALUES
        (2, 1),
        (3, 1),
        (4, 1),
        (5, 1),
        (7, 1),
        (1, 2),
        (1, 3),
        (1, 4),
        (1, 5),
        (1, 6),
        (1, 7),
        (1, 8),
        (1, 9),
        (9, 2),
        (6, 1),
        (7, 8),
        (2, 3),
        (2, 4),
        (2, 5),
        (2, 6),
        (3, 2),
        (3, 4),
        (3, 5),
        (3, 6),
        (3, 7),
        (3, 8),
        (3, 9);

COMMIT;