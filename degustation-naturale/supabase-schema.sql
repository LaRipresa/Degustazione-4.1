-- ═══════════════════════════════════════════════════════════════════════════
--  DÉGUSTATION NATURALE — Schéma Supabase
--  Coller et exécuter dans : Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════

-- Configuration de la dégustation
CREATE TABLE IF NOT EXISTS tasting_config (
  id         TEXT PRIMARY KEY DEFAULT 'main',
  data       JSONB        NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ  DEFAULT NOW()
);

-- Liste des vins (sérialisée en JSON pour flexibilité)
CREATE TABLE IF NOT EXISTS wines_data (
  id         TEXT PRIMARY KEY DEFAULT 'main',
  data       JSONB        NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ  DEFAULT NOW()
);

-- Participants inscrits
CREATE TABLE IF NOT EXISTS participants (
  key        TEXT PRIMARY KEY,
  name       TEXT         NOT NULL,
  email      TEXT         NOT NULL,
  joined_at  BIGINT       NOT NULL
);

-- Résultats de dégustation par participant + vin
CREATE TABLE IF NOT EXISTS results (
  participant_key TEXT    NOT NULL,
  wine_id         TEXT    NOT NULL,
  rating          JSONB   NOT NULL DEFAULT '{}',
  PRIMARY KEY (participant_key, wine_id)
);

-- Classements par participant + série
CREATE TABLE IF NOT EXISTS rankings (
  participant_key TEXT    NOT NULL,
  series_id       TEXT    NOT NULL,
  wine_order      JSONB   NOT NULL DEFAULT '[]',
  PRIMARY KEY (participant_key, series_id)
);

-- ─── SÉCURITÉ (RLS) ─────────────────────────────────────────────────────────
-- L'authentification est gérée par l'application elle-même (code admin/participant).
-- La RLS est désactivée — usage interne sécurisé par les codes d'accès.

ALTER TABLE tasting_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE wines_data     DISABLE ROW LEVEL SECURITY;
ALTER TABLE participants   DISABLE ROW LEVEL SECURITY;
ALTER TABLE results        DISABLE ROW LEVEL SECURITY;
ALTER TABLE rankings       DISABLE ROW LEVEL SECURITY;

GRANT ALL ON tasting_config TO anon;
GRANT ALL ON wines_data     TO anon;
GRANT ALL ON participants   TO anon;
GRANT ALL ON results        TO anon;
GRANT ALL ON rankings       TO anon;

-- ─── REALTIME ────────────────────────────────────────────────────────────────
-- Active les mises à jour en temps réel pour la liste des participants
-- (l'admin voit les nouvelles inscriptions sans recharger)
ALTER PUBLICATION supabase_realtime ADD TABLE participants;

-- ─── OPTIONNEL : Reset complet entre deux dégustations ───────────────────────
-- TRUNCATE tasting_config, wines_data, participants, results, rankings RESTART IDENTITY;
