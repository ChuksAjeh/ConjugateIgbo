-- src/main/resources/db/migration/V1.3.0__verb_provenance_and_sense_uniqueness.sql
--
-- Prepares the verb tables for the Notion ingestion pipeline.
--
-- 1. Uniqueness moves from (igbo) to (igbo, english).
--
--    Igbo is heavily polysemous — the Notion "Polysemous Verbs" page gives
--    ipu -> to leave / to depart / to take off. The pipeline splits those into
--    one row per sense, which a unique index on (igbo) alone makes impossible:
--    only the first sense would ever be stored and the rest would be silently
--    dropped by ON CONFLICT DO NOTHING. Uniqueness on the (form, sense) pair
--    still prevents genuine duplicates while allowing distinct senses.
--
-- 2. Provenance columns.
--
--    Ingestion is re-runnable and partly heuristic (dual-meaning splitting),
--    so each row records where it came from and how it was derived. That makes
--    an auto-split sense auditable, and lets a bad import be identified and
--    rolled back by source rather than by guesswork.

alter table verbs_delta_igbo
    add column if not exists source      text,
    add column if not exists source_ref  text,
    add column if not exists imported_at timestamptz;

alter table verbs_central_igbo
    add column if not exists source      text,
    add column if not exists source_ref  text,
    add column if not exists imported_at timestamptz;

comment on column verbs_delta_igbo.source is
    'Origin of the row, e.g. ''notion'' or ''excel''. Null for rows predating provenance tracking.';
comment on column verbs_delta_igbo.source_ref is
    'Identifier within the source, e.g. the Notion page id the verb was read from.';
comment on column verbs_delta_igbo.note is
    'Free-text provenance, including the original gloss when a dual-meaning entry was split.';

-- Replace the single-column unique index with the (form, sense) pair. The
-- V1.0.0 index was created without an explicit name, so look it up rather than
-- assuming PostgreSQL's generated identifier.
do
$$
    declare
        idx text;
    begin
        for idx in
            select i.relname
            from pg_index x
                     join pg_class i on i.oid = x.indexrelid
                     join pg_class t on t.oid = x.indrelid
                     join pg_attribute a on a.attrelid = t.oid and a.attnum = x.indkey[0]
            where t.relname in ('verbs_delta_igbo', 'verbs_central_igbo')
              and x.indisunique
              and x.indnatts = 1
              and a.attname = 'igbo'
            loop
                execute format('drop index %I', idx);
            end loop;
    end
$$;

-- Existing rows may already violate (igbo, english) if the same pair was
-- inserted twice under different casing; collapse them before adding the index.
delete from verbs_delta_igbo a
using verbs_delta_igbo b
where a.id > b.id
  and lower(a.igbo) = lower(b.igbo)
  and lower(a.english) = lower(b.english);

delete from verbs_central_igbo a
using verbs_central_igbo b
where a.id > b.id
  and lower(a.igbo) = lower(b.igbo)
  and lower(a.english) = lower(b.english);

create unique index if not exists verbs_delta_igbo_form_sense_uk
    on verbs_delta_igbo (lower(igbo), lower(english));

create unique index if not exists verbs_central_igbo_form_sense_uk
    on verbs_central_igbo (lower(igbo), lower(english));
