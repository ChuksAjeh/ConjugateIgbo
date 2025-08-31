-- src/main/resources/db/migration/V2__audio_assets.sql

create type dialect as enum ('delta_igbo','central_igbo'); -- extend as needed

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
