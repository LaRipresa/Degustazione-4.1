import { createClient } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL  || "";
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Client Supabase (null si variables non configurées → fallback localStorage)
export const supabase = URL && KEY ? createClient(URL, KEY) : null;

// Fallback localStorage pour dev sans Supabase
const ls = {
  get:  k => { try { const v = localStorage.getItem(`sb:${k}`); return v ? JSON.parse(v) : null; } catch { return null; } },
  set:  (k, v) => { try { localStorage.setItem(`sb:${k}`, JSON.stringify(v)); } catch {} },
  del:  k => { try { localStorage.removeItem(`sb:${k}`); } catch {} },
};

// ─── OPÉRATIONS BDD ───────────────────────────────────────────────────────────
export const db = {

  // CONFIG DÉGUSTATION
  async getConfig() {
    if (!supabase) return ls.get("tasting_config");
    const { data } = await supabase.from("tasting_config").select("data").eq("id", "main").maybeSingle();
    return data?.data || null;
  },
  async setConfig(cfg) {
    if (!supabase) { ls.set("tasting_config", cfg); return; }
    await supabase.from("tasting_config").upsert({ id: "main", data: cfg, updated_at: new Date().toISOString() });
  },

  // VINS
  async getWines() {
    if (!supabase) return ls.get("wines_data");
    const { data } = await supabase.from("wines_data").select("data").eq("id", "main").maybeSingle();
    return data?.data || null;
  },
  async setWines(wines) {
    if (!supabase) { ls.set("wines_data", wines); return; }
    await supabase.from("wines_data").upsert({ id: "main", data: wines, updated_at: new Date().toISOString() });
  },

  // PARTICIPANTS
  async getParticipants() {
    if (!supabase) return ls.get("participants") || {};
    const { data } = await supabase.from("participants").select("*");
    if (!data?.length) return {};
    return Object.fromEntries(data.map(p => [p.key, { key: p.key, name: p.name, email: p.email, joinedAt: p.joined_at }]));
  },
  async addParticipant(p) {
    if (!supabase) {
      const ex = ls.get("participants") || {};
      ex[p.key] = p; ls.set("participants", ex); return;
    }
    await supabase.from("participants").upsert({ key: p.key, name: p.name, email: p.email, joined_at: p.joinedAt });
  },

  // RÉSULTATS PAR PARTICIPANT
  async getResultsFor(pKey) {
    if (!supabase) return ls.get(`results_${pKey}`) || {};
    const { data } = await supabase.from("results").select("wine_id, rating").eq("participant_key", pKey);
    if (!data?.length) return {};
    return Object.fromEntries(data.map(r => [r.wine_id, r.rating]));
  },
  async saveResult(pKey, wineId, rating) {
    if (!supabase) {
      const ex = ls.get(`results_${pKey}`) || {};
      ex[wineId] = rating; ls.set(`results_${pKey}`, ex); return;
    }
    await supabase.from("results").upsert({ participant_key: pKey, wine_id: wineId, rating });
  },

  // CLASSEMENTS PAR PARTICIPANT
  async getRankingsFor(pKey) {
    if (!supabase) return ls.get(`rankings_${pKey}`) || {};
    const { data } = await supabase.from("rankings").select("series_id, wine_order").eq("participant_key", pKey);
    if (!data?.length) return {};
    return Object.fromEntries(data.map(r => [r.series_id, r.wine_order]));
  },
  async saveRanking(pKey, seriesId, order) {
    if (!supabase) {
      const ex = ls.get(`rankings_${pKey}`) || {};
      ex[seriesId] = order; ls.set(`rankings_${pKey}`, ex); return;
    }
    await supabase.from("rankings").upsert({ participant_key: pKey, series_id: seriesId, wine_order: order });
  },

  // REALTIME — abonnement aux nouveaux participants
  subscribeParticipants(onUpdate) {
    if (!supabase) return null;
    return supabase
      .channel("participants-watch")
      .on("postgres_changes", { event: "*", schema: "public", table: "participants" }, onUpdate)
      .subscribe();
  },
  unsubscribe(channel) {
    if (channel) supabase?.removeChannel(channel);
  },
};

// Sessions locales (spécifiques à l'appareil — jamais en BDD)
export const session = {
  getAdmin:    ()    => { try { return JSON.parse(localStorage.getItem("adm-session")); } catch { return null; } },
  setAdmin:    (v)   => localStorage.setItem("adm-session", JSON.stringify(v)),
  clearAdmin:  ()    => localStorage.removeItem("adm-session"),
  getPart:     ()    => { try { return JSON.parse(localStorage.getItem("prt-session")); } catch { return null; } },
  setPart:     (v)   => localStorage.setItem("prt-session", JSON.stringify(v)),
  clearPart:   ()    => localStorage.removeItem("prt-session"),
};
