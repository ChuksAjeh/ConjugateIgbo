-- src/main/resources/db/migration/V1.1.0__audio_assets.sql

DO
$$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dialect') THEN
            CREATE TYPE dialect AS ENUM ('standard', 'variant', 'slang');
        END IF;
    END
$$;


create table audio_assets
(
    id              bigserial primary key,
    dialect         dialect   not null,
    verb_id         bigint    not null, -- id in the dialect table
    object_key      text      not null, -- e.g. "audio/idu/idu_en_v1.mp3"
    content_type    text      not null default 'audio/mpeg',
    bytes           bigint,
    duration_ms     int,
    checksum_sha256 text,
    created_at      timestamp not null default now(),
    unique (dialect, verb_id, object_key)
);
