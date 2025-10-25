-- src/main/resources/db/migration/V1.0.0__verbs_by_dialect.sql

-- Delta Igbo verbs
create table verbs_delta_igbo (
                                  id           bigserial primary key,
                                  igbo         text not null,            -- lemma: e.g. "idu"
                                  english      text not null,            -- gloss: "to be"
                                  freq_rank    int,
                                  is_irregular boolean not null default false,
                                  note         text
);
create unique index on verbs_delta_igbo (igbo);

-- Central Igbo verbs (example second dialect)
create table verbs_central_igbo (
                                    id           bigserial primary key,
                                    igbo         text not null,
                                    english      text not null,
                                    freq_rank    int,
                                    is_irregular boolean not null default false,
                                    note         text
);
create unique index on verbs_central_igbo (igbo);
