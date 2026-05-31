const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// ─── EMAIL HTML ───────────────────────────────────────────────────────────────
function buildHTML(participant, pResults, pRankings, series, config, top4) {
  const dateStr = config.tastingDate
    ? new Date(config.tastingDate + "T12:00:00").toLocaleDateString("fr-FR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : "";

  // Score composite par vin (même logique que l'app)
  const scores = {};
  series.forEach(s => {
    s.wines.forEach(w => {
      const r = pResults[w.id];
      if (!r) return;
      const avgScore = ((r.couleurNote || 0) + (r.nezNote || 0) + (r.boucheNote || 0)) / 3;
      const rank = pRankings[s.id] ? pRankings[s.id].indexOf(w.id) : -1;
      const rankScore = rank >= 0 ? (s.wines.length - rank) / s.wines.length : 0;
      scores[w.id] = {
        wine: w, series: s,
        score: (avgScore / 4) * 0.6 + rankScore * 0.4,
        avgScore, r,
      };
    });
  });
  const sorted = Object.values(scores).sort((a, b) => b.score - a.score);

  const SERIES_COLORS = { S1: "#B8963E", S2: "#5C8A48", S3: "#A85C30", S4: "#7A1828" };

  const top4Rows = top4.slice(0, 4).map((item, i) => {
    const medal = ["🥇", "🥈", "🥉", "⭐"][i];
    const c = item.series.color;
    return `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #F0EBE4;vertical-align:top;width:32px;font-size:20px">${medal}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #F0EBE4;vertical-align:top">
          <div style="font-size:9px;font-family:monospace;color:${c};letter-spacing:.1em;margin-bottom:3px">${item.series.name} · ${item.series.subtitle}</div>
          <div style="font-size:14px;color:#1A1714">${item.wine.name}</div>
          <div style="font-size:11px;font-family:monospace;color:#9A9282;margin-top:2px">${item.wine.appellation} · ${item.wine.prix}</div>
        </td>
        <td style="padding:12px 0 12px 8px;border-bottom:1px solid #F0EBE4;text-align:right;vertical-align:top;white-space:nowrap">
          <span style="font-size:18px;font-weight:600;color:${c}">${(item.score * 10).toFixed(1)}</span>
          <span style="font-size:11px;font-family:monospace;color:#9A9282">/10</span>
        </td>
      </tr>`;
  }).join("");

  const myRankingRows = sorted.slice(0, 8).map((item, i) => {
    const c = item.series.color;
    const avgN = item.r ? ((item.r.couleurNote || 0) + (item.r.nezNote || 0) + (item.r.boucheNote || 0)) / 3 : 0;
    return `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #F6F2EC;width:28px;font-size:12px;font-family:monospace;color:#9A9282">${i + 1}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #F6F2EC">
          <div style="font-size:13px;color:#1A1714">${item.wine.name}</div>
          <div style="font-size:10px;font-family:monospace;color:#9A9282">${item.series.subtitle}</div>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #F6F2EC;text-align:right;white-space:nowrap">
          <span style="font-size:14px;font-weight:600;color:${c}">${(item.score * 10).toFixed(1)}</span>
          <span style="font-size:10px;font-family:monospace;color:#9A9282">/10</span>
        </td>
      </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAFAF8;font-family:Georgia,serif;color:#1A1714">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8">
<tr><td align="center" style="padding:32px 16px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid #E8E0D4;border-radius:12px;overflow:hidden">

  <!-- En-tête -->
  <tr><td style="padding:36px 40px 28px;text-align:center;border-bottom:1px solid #E8E0D4">
    <div style="font-size:9px;font-family:monospace;letter-spacing:.16em;color:#9A9282;margin-bottom:16px">
      TENUTA DI CASTELLARO &nbsp;·&nbsp; TENUTA MASSIMO LENTSCH
    </div>
    <h1 style="margin:0 0 6px;font-size:26px;font-weight:300;letter-spacing:.03em;color:#1A1714">${config.tastingName}</h1>
    <div style="font-size:11px;font-family:monospace;color:#9A9282;letter-spacing:.08em">${dateStr}</div>
  </td></tr>

  <!-- Salutation -->
  <tr><td style="padding:28px 40px 20px">
    <p style="margin:0 0 12px;font-size:16px">Bonjour <strong>${participant.name}</strong>,</p>
    <p style="margin:0;font-size:14px;color:#3A3530;line-height:1.65;font-style:italic">
      Retrouvez ci-dessous les résultats de la dégustation à l'aveugle — Vins Naturels, Collection ${new Date().getFullYear()}.
    </p>
  </td></tr>

  <!-- Sélection finale groupe -->
  <tr><td style="padding:0 40px 24px">
    <div style="font-size:9px;font-family:monospace;letter-spacing:.12em;color:#9A9282;margin-bottom:14px">SÉLECTION FINALE DU GROUPE</div>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tbody>${top4Rows}</tbody>
    </table>
  </td></tr>

  ${sorted.length > 0 ? `
  <!-- Votre classement personnel -->
  <tr><td style="padding:0 40px 28px">
    <div style="height:1px;background:#E8E0D4;margin-bottom:24px"></div>
    <div style="font-size:9px;font-family:monospace;letter-spacing:.12em;color:#9A9282;margin-bottom:14px">VOTRE CLASSEMENT PERSONNEL</div>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tbody>${myRankingRows}</tbody>
    </table>
  </td></tr>` : ""}

  <!-- Détails des vins -->
  <tr><td style="padding:0 40px 28px">
    <div style="height:1px;background:#E8E0D4;margin-bottom:24px"></div>
    <div style="font-size:9px;font-family:monospace;letter-spacing:.12em;color:#9A9282;margin-bottom:16px">FICHE COMPLÈTE DES VINS</div>
    ${series.map(s => `
      <div style="margin-bottom:18px">
        <div style="font-size:10px;font-family:monospace;color:${s.color};letter-spacing:.1em;margin-bottom:10px">${s.name.toUpperCase()} · ${s.subtitle.toUpperCase()}</div>
        ${s.wines.map(w => `
          <div style="padding:10px 14px;border-radius:8px;border:1px solid #F0EBE4;margin-bottom:6px">
            <div style="font-size:13px;font-weight:600;color:#1A1714;margin-bottom:4px">${w.name}</div>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:11px;color:#6A6060;font-family:monospace">
              <tr><td width="80" style="color:#9A9282">Terroir</td><td>${w.terroir}</td></tr>
              <tr><td style="color:#9A9282">Cépage</td><td>${w.cepages}</td></tr>
              <tr><td style="color:#9A9282">Vinif.</td><td>${w.vinif}</td></tr>
              <tr><td style="color:#9A9282">Élevage</td><td>${w.elevage}</td></tr>
              <tr><td style="color:#9A9282">Prix</td><td style="color:${s.color};font-weight:600">${w.prix}</td></tr>
            </table>
          </div>`).join("")}
      </div>`).join("")}
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:20px 40px;background:#F6F2EC;border-top:1px solid #E8E0D4;text-align:center">
    <div style="font-size:9px;font-family:monospace;letter-spacing:.1em;color:#9A9282">
      COLLECTION NATURALE · ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
    </div>
    <div style="font-size:9px;font-family:monospace;letter-spacing:.06em;color:#C0B8B0;margin-top:4px">
      Tenuta di Castellaro · Lipari &nbsp;|&nbsp; Tenuta Massimo Lentsch · Etna
    </div>
  </td></tr>

</table>
</td></tr></table>
</body></html>`;
}

// ─── HANDLER ──────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { participants, allResults, allRankings, series, config, top4 } = req.body;

    if (!participants?.length) {
      return res.status(400).json({ error: "Aucun participant" });
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || "Dégustation Naturale <onboarding@resend.dev>";

    const sends = participants.map(p =>
      resend.emails.send({
        from: fromEmail,
        to:   p.email,
        subject: `Résultats · ${config.tastingName}`,
        html: buildHTML(p, allResults[p.key] || {}, allRankings[p.key] || {}, series, config, top4),
      })
    );

    const results = await Promise.allSettled(sends);
    const ok      = results.filter(r => r.status === "fulfilled").length;
    const failed  = results.filter(r => r.status === "rejected").length;

    return res.status(200).json({ success: true, sent: ok, failed });
  } catch (err) {
    console.error("send-results error:", err);
    return res.status(500).json({ error: err.message });
  }
};
