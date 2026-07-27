-- src/main/resources/db/migration/V1.2.0__fix_audio_asset_dialect.sql
--
-- V1.1.0 created audio_assets.dialect as a PostgreSQL enum with the values
-- ('standard', 'variant', 'slang'), but every code path writes and reads a
-- Dialect enum constant lowercased ('delta_igbo', 'central_igbo'). Two
-- separate failures follow from that:
--
--   1. No row can ever match: 'delta_igbo' is not a member of the enum type.
--   2. NamedParameterJdbcTemplate binds the value as a varchar, and
--      PostgreSQL has no varchar = dialect operator, so the query errors out
--      before it even gets to compare anything.
--
-- The enum bought no safety here (its values never described dialects), so
-- the column becomes text with a CHECK constraint listing the dialect slugs
-- the application actually uses. That keeps the values validated, removes the
-- JDBC cast requirement, and means adding a dialect is a one-line migration
-- rather than an ALTER TYPE.

alter table audio_assets
    alter column dialect type text using dialect::text;

-- Existing rows, if any, carry the meaningless V1.1.0 values; there is no
-- sensible mapping to a real dialect, so drop them rather than guess.
delete from audio_assets where dialect not in ('delta_igbo', 'central_igbo');

alter table audio_assets
    add constraint audio_assets_dialect_check
        check (dialect in ('delta_igbo', 'central_igbo'));

drop type if exists dialect;
