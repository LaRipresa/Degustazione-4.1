import { useState, useEffect, useRef } from "react";
import { db, session, supabase } from "./supabase.js";
import { LOGO_CASTELLARO, LOGO_LENTSCH } from "./logos.js";

// ─── GOOGLE FONTS ─────────────────────────────────────────────────────────────
const GFONTS = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,600;1,400&family=DM+Mono:wght@300;400&family=Inter:wght@300;400;500;600&display=swap";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg:"#FAFAF8", surf:"#FFFFFF", surfAlt:"#F6F2EC",
  border:"#E8E0D4", borderMd:"#D0C8BC",
  text:"#1A1714", textMd:"#3A3530", muted:"#9A9282",
  gold:"#B8963E", goldBg:"rgba(184,150,62,.09)", goldBdr:"rgba(184,150,62,.3)",
  err:"#C5473B", succ:"#4A8A60",
  S1:"#B8963E", S2:"#5C8A48", S3:"#A85C30", S4:"#7A1828",
};
const FD = "\'Playfair Display\', Georgia, serif";
const FM = "\'DM Mono\', monospace";
const FI = "\'Inter\', system-ui, sans-serif";

// ─── DEFAULT SERIES DATA ──────────────────────────────────────────────────────
const DEFAULT_SERIES = [
  { id:"S1", name:"Série I",   subtitle:"Vins Effervescents",   icon:"✦", color:"#B8963E", timerMinutes:10,
    intro:"Trois bulles naturelles — méthode traditionnelle, ancestrale, pétillant naturel.",
    wines:[
      { id:"w01", blind:"A", name:"Serer · Vouvray Méthode Traditionnelle 2023",      producer:"Domaine Serer",    appellation:"Vouvray AOC – Loire",                terroir:"Tuffeau et argiles · Val de Loire",        cepages:"Chenin Blanc 100%",    vinif:"Méthode traditionnelle · fermentation spontanée · sans soufre",  elevage:"12 mois sur lattes · dégorgement tardif", prix:"18 – 22 €" },
      { id:"w02", blind:"B", name:"Bongiraud · Brut R 2021",                          producer:"Bongiraud",        appellation:"Vin de France – Jura",               terroir:"Marnes et argiles jurassiques",           cepages:"À compléter",          vinif:"Méthode ancestrale · refermentation naturelle en bouteille",      elevage:"Sur lattes · non dégorgé",                prix:"24 – 30 €" },
      { id:"w03", blind:"C", name:"Delaunay · Super Tusky Pét-Nat",                   producer:"Delaunay",         appellation:"Vin de France – Loire",              terroir:"Argilo-siliceux · bords de Loire",        cepages:"À compléter",          vinif:"Pétillant naturel · sans soufre ajouté · non filtré",            elevage:"Sur lies fines en bouteille",              prix:"17 – 21 €" },
    ]},
  { id:"S2", name:"Série II",  subtitle:"Blancs Secs",           icon:"◈", color:"#5C8A48", timerMinutes:15,
    intro:"Quatre blancs naturels — minéralité, tension, précision.",
    wines:[
      { id:"w04", blind:"A", name:"Les Maou · Plan B 2024",                           producer:"Les Maou",         appellation:"Vin de France – Sud-Ouest",          terroir:"Argilo-calcaire",                         cepages:"À compléter",          vinif:"Levures indigènes · aucun intrant · non collé non filtré",        elevage:"Cuve inox sur lies fines",                prix:"13 – 17 €" },
      { id:"w05", blind:"B", name:"La Bancale · Chair Blanche 2024",                  producer:"La Bancale",       appellation:"Vin de France",                      terroir:"À compléter",                             cepages:"À compléter",          vinif:"Fermentation spontanée · sans soufre ajouté",                    elevage:"À compléter",                             prix:"16 – 20 €" },
      { id:"w06", blind:"C", name:"Seignovert · Un Hiver sur la Lune 2024",           producer:"Seignovert",       appellation:"Vin de France – Languedoc",          terroir:"À compléter",                             cepages:"À compléter",          vinif:"Sans intrants · levures naturelles",                              elevage:"Cuve béton",                              prix:"22 – 28 €" },
      { id:"w07", blind:"D", name:"Blanc Plume · Sporange 2024",                      producer:"Blanc Plume",      appellation:"Alsace",                             terroir:"Grès des Vosges et granite",              cepages:"À compléter",          vinif:"Levures indigènes · sans soufre ajouté",                         elevage:"Amphore et barrique ancienne",             prix:"14 – 18 €" },
    ]},
  { id:"S3", name:"Série III", subtitle:"Macérés & Oranges",     icon:"◉", color:"#A85C30", timerMinutes:15,
    intro:"Tanins pelliculaires · ambre vivant · la frontière entre blanc et rouge.",
    wines:[
      { id:"w08", blind:"A", name:"Signora Luna · Pino il Grigio 2023",               producer:"Signora Luna",     appellation:"Italie / Vin de France",             terroir:"À compléter",                             cepages:"Pinot Grigio 100%",    vinif:"Macération pelliculaire longue",                                  elevage:"Amphore / cuve inox",                     prix:"12 – 16 €" },
      { id:"w09", blind:"B", name:"Aillaud · Entre Deux Eaux Orange",                 producer:"Aillaud",          appellation:"Vin de France – Provence",           terroir:"Argilo-calcaire · galets roulés",         cepages:"À compléter",          vinif:"Macération longue sur peaux",                                     elevage:"Cuve béton",                              prix:"20 – 25 €" },
      { id:"w10", blind:"C", name:"Château Brandeau · Tendax 2024",                   producer:"Château Brandeau", appellation:"Castillon Côtes de Bordeaux",        terroir:"Argilo-calcaire",                         cepages:"À compléter",          vinif:"Macération pelliculaire",                                         elevage:"Amphore",                                 prix:"16 – 20 €" },
    ]},
  { id:"S4", name:"Série IV",  subtitle:"Vins Rouges",            icon:"◆", color:"#7A1828", timerMinutes:20,
    intro:"Cinq rouges naturels — fruit sauvage, profondeur, texture, vie.",
    wines:[
      { id:"w11", blind:"A", name:"Blanc Plume · Rosé Béton 2023",                    producer:"Blanc Plume",      appellation:"Alsace – Rosé nature",               terroir:"Granite · Alsace",                        cepages:"Pinot Noir 100%",      vinif:"Saignée courte · levures indigènes",                             elevage:"Cuve béton",                              prix:"13 – 17 €" },
      { id:"w12", blind:"B", name:"Bongiraud · Zelja 2021",                           producer:"Bongiraud",        appellation:"Vin de France – Jura",               terroir:"Marnes jurassiques",                      cepages:"À compléter",          vinif:"Vinification naturelle sans soufre",                              elevage:"Barrique ancienne",                       prix:"22 – 28 €" },
      { id:"w13", blind:"C", name:"Vignereuse · À la Santé des Mécréants 2019",       producer:"Vignereuse",       appellation:"Loire",                              terroir:"Tuffeau · Val de Loire",                  cepages:"Cabernet Franc 100%",  vinif:"Égrappé total · fermentation longue sans intrant",               elevage:"Barrique ancienne 24 mois",               prix:"14 – 18 €" },
      { id:"w14", blind:"D", name:"Delaunay · Éloïse 2023",                           producer:"Delaunay",         appellation:"Loire – Vin de France",              terroir:"Argilo-siliceux",                         cepages:"À compléter",          vinif:"Levures indigènes · sans soufre ajouté",                         elevage:"Cuve inox",                               prix:"12 – 15 €" },
      { id:"w15", blind:"E", name:"Nautile · Odyssée 2020",                           producer:"Nautile",          appellation:"Vin de France",                      terroir:"À compléter",                             cepages:"À compléter",          vinif:"Élevage long · sans soufre ajouté",                               elevage:"Barrique ancienne (long élevage)",         prix:"20 – 25 €" },
    ]},
];

const WINE_BLANK = { id:"", blind:"", name:"", producer:"", appellation:"", terroir:"", cepages:"", vinif:"", elevage:"", prix:"" };
const KW = {
  couleur:["Pâle","Doré","Ambré","Orangé","Rosé","Rubis","Grenat","Pourpre","Brillant","Trouble","Limpide","Dense"],
  nez:    ["Floral","Fruité","Agrumes","Minéral","Pierre à fusil","Herbacé","Épicé","Terreux","Levuré","Oxydatif","Animal","Fumé","Réduit","Complexe"],
  bouche: ["Vif","Acide","Ample","Tendu","Salin","Tannique","Soyeux","Fruité","Long","Court","Amer","Perlant","Doux","Astringent","Persistant"],
};
const NAT_LBL = ["Très\nconventionnel","Plutôt\nconventionnel","Naturel","Très\nnaturel","Super\nnaturel"];
const R0 = { couleurNote:0, couleurMots:[], nezNote:0, nezMots:[], boucheNote:0, boucheMots:[], natural:3, prix:"" };

// ─── UTILITIES ────────────────────────────────────────────────────────────────
const hashStr = s => { let h=5381; for(const c of s) h=((h<<5)+h+c.charCodeAt(0))&0xffffffff; return Math.abs(h).toString(16); };
const genId   = () => Date.now().toString(36) + Math.random().toString(36).slice(2,5);
const mean    = arr => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
const fmtTime = s => { const a=Math.abs(s); return `${s<0?"−":""}${String(Math.floor(a/60)).padStart(2,"0")}:${String(a%60).padStart(2,"0")}`; };

const computeTop4 = (series, allResults, allRankings) => {
  const scores = {};
  series.forEach(s => {
    s.wines.forEach(w => {
      const wr = Object.values(allResults).map(p=>p[w.id]).filter(Boolean);
      if(!wr.length) return;
      const avgS = mean(wr.map(r=>(r.couleurNote+r.nezNote+r.boucheNote)/3));
      const rps = Object.values(allRankings).flatMap(sr=>{
        const arr=sr[s.id]||[]; const pos=arr.indexOf(w.id);
        return pos>=0?[(s.wines.length-pos)/s.wines.length]:[];
      });
      scores[w.id] = { wine:w, series:s, score:(avgS/4)*.6+mean(rps)*.4 };
    });
  });
  return Object.values(scores).sort((a,b)=>b.score-a.score);
};

// ─── STYLE HELPERS ────────────────────────────────────────────────────────────
const s = {
  d: (x={}) => ({ fontFamily:FD, ...x }),
  m: (x={}) => ({ fontFamily:FM, ...x }),
  i: (x={}) => ({ fontFamily:FI, ...x }),
};

// ─── LOGO BAR ─────────────────────────────────────────────────────────────────
function LogoBar({ compact=false }) {
  const h = compact ? 36 : 52;
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:compact?20:32 }}>
      <img src={LOGO_CASTELLARO} alt="Tenuta di Castellaro" style={{ height:h, objectFit:"contain" }}/>
      <div style={{ width:1, height:h*0.6, background:T.borderMd }} />
      <img src={LOGO_LENTSCH}    alt="Massimo Lentsch"       style={{ height:h*0.65, objectFit:"contain" }}/>
    </div>
  );
}

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
function Btn({ onClick, disabled, variant="primary", size="md", full, children, style={} }) {
  const sz = { sm:{p:"7px 14px",fs:10}, md:{p:"11px 22px",fs:11}, lg:{p:"15px 32px",fs:12} }[size];
  const vs = {
    primary: { background:disabled?"#E8E0D4":T.gold, color:disabled?T.muted:"#FEFBF5" },
    outline: { background:"transparent", border:`1px solid ${T.borderMd}`, color:disabled?T.muted:T.text },
    ghost:   { background:"transparent", color:disabled?T.muted:T.textMd },
    danger:  { background:disabled?"#E8E0D4":T.err, color:"#FFF" },
    dark:    { background:disabled?"#E8E0D4":"#1A1714", color:disabled?T.muted:"#FFF" },
    succ:    { background:disabled?"#E8E0D4":T.succ, color:disabled?T.muted:"#FFF" },
  }[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      borderRadius:10, border:"none", cursor:disabled?"not-allowed":"pointer",
      fontFamily:FM, letterSpacing:".08em", transition:"all .2s",
      padding:sz.p, fontSize:sz.fs, width:full?"100%":"auto",
      ...vs, ...style,
    }}>{children}</button>
  );
}

function Input({ label, value, onChange, type="text", placeholder, error, hint, disabled, readOnly }) {
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={s.m({ display:"block", fontSize:9, letterSpacing:".1em", color:T.muted, marginBottom:6 })}>{label}</label>}
      <input type={type} value={value} placeholder={placeholder} disabled={disabled} readOnly={readOnly}
        onChange={e=>onChange?.(e.target.value)}
        style={{
          width:"100%", padding:"11px 14px", borderRadius:10, boxSizing:"border-box",
          border:`1px solid ${error?T.err:T.border}`, background:disabled||readOnly?T.surfAlt:T.surf,
          fontFamily:FI, fontSize:14, color:T.text, outline:"none", transition:"border-color .2s",
        }}
      />
      {error && <div style={s.m({ fontSize:10, color:T.err, marginTop:4 })}>{error}</div>}
      {hint  && <div style={s.m({ fontSize:10, color:T.muted, marginTop:4 })}>{hint}</div>}
    </div>
  );
}

function Textarea({ label, value, onChange, rows=3, placeholder }) {
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={s.m({ display:"block", fontSize:9, letterSpacing:".1em", color:T.muted, marginBottom:6 })}>{label}</label>}
      <textarea value={value} rows={rows} placeholder={placeholder} onChange={e=>onChange?.(e.target.value)}
        style={{ width:"100%", padding:"11px 14px", borderRadius:10, boxSizing:"border-box",
          border:`1px solid ${T.border}`, background:T.surf, fontFamily:FI, fontSize:13, color:T.text, outline:"none", resize:"vertical" }}
      />
    </div>
  );
}

function Card({ children, style={}, pad=true }) {
  return <div style={{ background:T.surf, border:`1px solid ${T.border}`, borderRadius:14, padding:pad?"20px 22px":"0", ...style }}>{children}</div>;
}

function Divider({ my=20 }) { return <div style={{ height:1, background:T.border, margin:`${my}px 0` }} />; }

function Tag({ children, color }) {
  const c = color || T.gold;
  return <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, background:`${c}14`, border:`1px solid ${c}28`, fontFamily:FM, fontSize:9, color:c, letterSpacing:".06em" }}>{children}</span>;
}

function Avatar({ name, size=32 }) {
  return <div style={{ width:size, height:size, borderRadius:"50%", flexShrink:0, background:T.gold, color:"#FFF", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:FD, fontSize:size*0.42 }}>{name?.[0]?.toUpperCase()||"?"}</div>;
}

function Modal({ title, onClose, children, width=520 }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(26,23,20,.45)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:T.surf, borderRadius:18, width:"100%", maxWidth:width, maxHeight:"90vh", overflow:"auto", padding:"26px 24px 32px", boxShadow:"0 20px 60px rgba(0,0,0,.15)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <span style={s.d({ fontSize:18, color:T.text })}>{title}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:T.muted, fontSize:22, lineHeight:1, fontFamily:FI }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Dots({ val, set, n=4, color }) {
  return (
    <div style={{ display:"flex", gap:8 }}>
      {[...Array(n)].map((_,i) => (
        <button key={i} onClick={()=>set(val===i+1?0:i+1)} style={{
          width:32, height:32, borderRadius:"50%", border:"none", cursor:"pointer", outline:"none",
          background:i<val?color:"rgba(0,0,0,.07)",
          boxShadow:i<val?`0 0 10px ${color}50`:"none", transition:"all .2s",
        }}/>
      ))}
    </div>
  );
}

function Chips({ opts, sel, toggle }) {
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
      {opts.map(o => {
        const on=sel.includes(o);
        return <button key={o} onClick={()=>toggle(o)} style={{ padding:"4px 10px", borderRadius:20, cursor:"pointer", transition:"all .15s", fontFamily:FM, fontSize:10, border:on?`1px solid ${T.gold}`:`1px solid ${T.border}`, background:on?T.goldBg:"transparent", color:on?T.gold:T.muted }}>{o}</button>;
      })}
    </div>
  );
}

function NatScale({ val, set }) {
  return (
    <div style={{ display:"flex", gap:4 }}>
      {NAT_LBL.map((l,i) => {
        const on=val===i+1;
        return <button key={i} onClick={()=>set(i+1)} style={{ flex:1, padding:"9px 3px", borderRadius:8, whiteSpace:"pre-line", border:`1px solid ${on?T.gold:T.border}`, background:on?T.goldBg:"transparent", color:on?T.gold:T.muted, cursor:"pointer", fontFamily:FM, fontSize:9, textAlign:"center", lineHeight:1.3, transition:"all .15s" }}>{l}</button>;
      })}
    </div>
  );
}

function Section({ icon, title, color, children }) {
  return (
    <div style={{ marginBottom:12, padding:"14px 16px", borderRadius:12, border:`1px solid ${T.border}`, background:T.surfAlt }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:12 }}>
        <span style={{ color:color||T.gold, fontSize:9 }}>{icon}</span>
        <span style={s.m({ fontSize:9, letterSpacing:".14em", color:T.muted })}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function Lbl({ children, mt, mb }) { return <div style={s.m({ fontSize:10, color:T.muted, marginTop:mt?10:0, marginBottom:mb?8:4 })}>{children}</div>; }

function FixedBtn({ onClick, disabled, color, children }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      position:"fixed", bottom:16, left:"50%", transform:"translateX(-50%)",
      width:"calc(100% - 36px)", maxWidth:500,
      padding:"15px", borderRadius:11, border:"none",
      cursor:disabled?"not-allowed":"pointer",
      background:disabled?T.border:`linear-gradient(135deg,${color},${color}AA)`,
      color:disabled?T.muted:"#FFF",
      fontFamily:FM, fontSize:11, letterSpacing:".1em",
      boxShadow:disabled?"none":`0 6px 28px ${color}50`, transition:"all .3s",
    }}>{children}</button>
  );
}

// ─── SCREEN: SETUP ────────────────────────────────────────────────────────────
function SetupScreen({ onComplete }) {
  const [step,setStep]=useState(0);
  const [form,setForm]=useState({ tastingName:"Dégustation Naturale", tastingDate:"", adminEmail:"", adminCode:"", adminCode2:"", joinCode:"" });
  const [err,setErr]=useState({});
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));

  const v0=()=>{const e={};if(!form.tastingName.trim())e.tastingName="Requis";if(!form.tastingDate)e.tastingDate="Requis";if(!form.adminEmail.includes("@"))e.adminEmail="Email invalide";if(Object.keys(e).length){setErr(e);return false;}setErr({});return true;};
  const v1=()=>{const e={};if(form.adminCode.length<4)e.adminCode="4 caractères minimum";if(form.adminCode!==form.adminCode2)e.adminCode2="Les codes ne correspondent pas";if(!form.joinCode.trim())e.joinCode="Requis";if(Object.keys(e).length){setErr(e);return false;}setErr({});return true;};

  const finish=async()=>{
    if(!v1()) return;
    const cfg={ tastingName:form.tastingName, tastingDate:form.tastingDate, adminEmail:form.adminEmail.toLowerCase(), adminCodeHash:hashStr(form.adminCode), joinCode:form.joinCode.toUpperCase(), joinCodeHash:hashStr(form.joinCode.toUpperCase()), createdAt:Date.now() };
    await db.setConfig(cfg);
    await db.setWines({ series:DEFAULT_SERIES });
    session.setAdmin({ token:genId(), expiry:Date.now()+86400000 });
    onComplete(cfg);
  };

  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:480 }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <LogoBar />
          <div style={s.d({ fontSize:24, fontWeight:300, color:T.text, marginTop:28, marginBottom:6 })}>Configuration initiale</div>
          <div style={s.m({ fontSize:10, color:T.muted, letterSpacing:".08em" })}>PREMIÈRE UTILISATION</div>
        </div>
        <div style={{ display:"flex", gap:0, marginBottom:28 }}>
          {["Dégustation","Accès"].map((l,i)=>(
            <div key={i} style={{ flex:1, textAlign:"center" }}>
              <div style={{ width:28, height:28, borderRadius:"50%", margin:"0 auto 6px", background:step>=i?T.gold:T.border, color:step>=i?"#FFF":T.muted, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:FM, fontSize:11 }}>{i+1}</div>
              <div style={s.m({ fontSize:9, color:step>=i?T.gold:T.muted })}>{l}</div>
            </div>
          ))}
        </div>
        <Card>
          {step===0&&<><Input label="NOM DE LA DÉGUSTATION" value={form.tastingName} onChange={v=>f("tastingName",v)} error={err.tastingName} /><Input label="DATE" type="date" value={form.tastingDate} onChange={v=>f("tastingDate",v)} error={err.tastingDate} /><Input label="EMAIL ADMINISTRATEUR" type="email" value={form.adminEmail} onChange={v=>f("adminEmail",v)} error={err.adminEmail} /><Btn onClick={()=>v0()&&setStep(1)} full size="lg">SUIVANT →</Btn></>}
          {step===1&&<><Input label="CODE ADMINISTRATEUR" type="password" placeholder="Min. 4 caractères" value={form.adminCode} onChange={v=>f("adminCode",v)} error={err.adminCode} hint="Ce code vous permettra de vous connecter" /><Input label="CONFIRMER LE CODE" type="password" value={form.adminCode2} onChange={v=>f("adminCode2",v)} error={err.adminCode2} /><Divider /><Input label="CODE DE PARTICIPATION" placeholder="Ex: ETNA26" value={form.joinCode} onChange={v=>f("joinCode",v.toUpperCase())} error={err.joinCode} hint="Code communiqué aux participants" /><Btn onClick={finish} full size="lg">CRÉER LA DÉGUSTATION →</Btn><div style={{ marginTop:10 }}><Btn variant="ghost" onClick={()=>setStep(0)} full size="sm">← Retour</Btn></div></>}
        </Card>
      </div>
    </div>
  );
}

// ─── SCREEN: LANDING ──────────────────────────────────────────────────────────
function LandingScreen({ config, onAdmin, onParticipant }) {
  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:440 }}>
        <div style={{ textAlign:"center", marginBottom:44 }}>
          <LogoBar />
          <div style={s.d({ fontSize:26, fontWeight:300, color:T.text, marginTop:32, marginBottom:4 })}>{config.tastingName}</div>
          <div style={s.m({ fontSize:10, color:T.muted })}>{config.tastingDate}</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <button onClick={onParticipant} style={{ padding:"18px 24px", borderRadius:14, border:`1px solid ${T.border}`, background:T.surf, cursor:"pointer", textAlign:"left", transition:"all .2s" }}>
            <div style={s.d({ fontSize:17, color:T.text, marginBottom:4 })}>Rejoindre la dégustation</div>
            <div style={s.m({ fontSize:10, color:T.muted })}>PARTICIPANT · CODE REQUIS</div>
          </button>
          <button onClick={onAdmin} style={{ padding:"18px 24px", borderRadius:14, border:`1px solid ${T.border}`, background:T.surfAlt, cursor:"pointer", textAlign:"left", transition:"all .2s" }}>
            <div style={s.d({ fontSize:17, color:T.text, marginBottom:4 })}>Administration</div>
            <div style={s.m({ fontSize:10, color:T.muted })}>OENOLOGUE · ACCÈS RESTREINT</div>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: ADMIN LOGIN ──────────────────────────────────────────────────────
function AdminLoginScreen({ config, onLogin, onBack }) {
  const [email,setEmail]=useState("");
  const [code,setCode]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);

  const login=async()=>{
    setLoading(true); setErr("");
    if(email.toLowerCase()!==config.adminEmail){setErr("Email incorrect");setLoading(false);return;}
    if(hashStr(code)!==config.adminCodeHash){setErr("Code incorrect");setLoading(false);return;}
    session.setAdmin({ token:genId(), expiry:Date.now()+86400000 });
    setLoading(false); onLogin();
  };

  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:420 }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <LogoBar compact />
          <div style={s.d({ fontSize:22, fontWeight:300, color:T.text, marginTop:24, marginBottom:4 })}>Administration</div>
          <div style={s.m({ fontSize:10, color:T.muted, letterSpacing:".08em" })}>ACCÈS RESTREINT</div>
        </div>
        <Card>
          <Input label="EMAIL" type="email" value={email} onChange={setEmail} placeholder={config.adminEmail.replace(/(.{2}).+@/,"$1***@")} />
          <Input label="CODE" type="password" value={code} onChange={setCode} placeholder="••••" />
          {err&&<div style={s.m({ fontSize:11, color:T.err, marginBottom:12, textAlign:"center" })}>{err}</div>}
          <Btn onClick={login} disabled={loading} full size="lg">CONNEXION →</Btn>
          <div style={{ marginTop:10 }}><Btn variant="ghost" onClick={onBack} full size="sm">← Retour</Btn></div>
        </Card>
      </div>
    </div>
  );
}

// ─── WINE EDITOR MODAL ────────────────────────────────────────────────────────
function WineEditorModal({ wine, seriesId, seriesList, onSave, onClose }) {
  const [form,setForm]=useState({ ...WINE_BLANK, seriesId:seriesId||"S1", ...wine });
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const save=()=>{if(!form.name.trim())return;onSave({...form,id:form.id||genId(),blind:form.blind||"?"},form.seriesId);};
  const fields=[["PRODUCTEUR","producer"],["APPELLATION","appellation"],["TERROIR","terroir"],["CÉPAGE(S)","cepages"],["VINIFICATION","vinif"],["ÉLEVAGE","elevage"],["PRIX","prix"]];
  return (
    <Modal title={form.id?"Modifier le vin":"Ajouter un vin"} onClose={onClose} width={560}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 80px", gap:10 }}>
        <Input label="NOM DU VIN" value={form.name} onChange={v=>f("name",v)} />
        <Input label="LETTRE" value={form.blind} onChange={v=>f("blind",v.toUpperCase())} />
      </div>
      <div style={{ marginBottom:14 }}>
        <label style={s.m({ display:"block", fontSize:9, letterSpacing:".1em", color:T.muted, marginBottom:6 })}>SÉRIE</label>
        <select value={form.seriesId} onChange={e=>f("seriesId",e.target.value)} style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1px solid ${T.border}`, background:T.surf, fontFamily:FI, fontSize:14, color:T.text, outline:"none" }}>
          {seriesList.map(s=><option key={s.id} value={s.id}>{s.name} – {s.subtitle}</option>)}
        </select>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {fields.map(([l,k])=><div key={k} style={{ gridColumn:k==="vinif"||k==="elevage"?"1/-1":"auto" }}><Input label={l} value={form[k]} onChange={v=>f(k,v)} /></div>)}
      </div>
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:8 }}>
        <Btn variant="outline" onClick={onClose}>Annuler</Btn>
        <Btn onClick={save}>Enregistrer</Btn>
      </div>
    </Modal>
  );
}

// ─── ADMIN: WINE MANAGER ──────────────────────────────────────────────────────
function WineManagerTab({ series, onUpdate }) {
  const [showEditor,setShowEditor]=useState(false);
  const [editingWine,setEditingWine]=useState(null);
  const [editSeries,setEditSeries]=useState(null);
  const [expanded,setExpanded]=useState({});
  const toggle=id=>setExpanded(p=>({...p,[id]:!p[id]}));

  const handleSave=async(wine,targetSeriesId)=>{
    const newSeries=series.map(s=>{
      const filtered=s.wines.filter(w=>w.id!==wine.id);
      if(s.id===targetSeriesId){
        const existing=s.wines.findIndex(w=>w.id===wine.id);
        const wines=existing>=0?s.wines.map(w=>w.id===wine.id?wine:w):[...s.wines,wine];
        return{...s,wines};
      }
      return{...s,wines:filtered};
    });
    onUpdate(newSeries); setShowEditor(false); setEditingWine(null);
  };
  const deleteWine=async(seriesId,wineId)=>{
    if(!window.confirm("Supprimer ce vin ?")) return;
    onUpdate(series.map(s=>s.id===seriesId?{...s,wines:s.wines.filter(w=>w.id!==wineId)}:s));
  };
  const moveWine=async(seriesId,wineIdx,dir)=>{
    onUpdate(series.map(s=>{
      if(s.id!==seriesId) return s;
      const wines=[...s.wines]; const to=wineIdx+dir;
      if(to<0||to>=wines.length) return s;
      [wines[wineIdx],wines[to]]=[wines[to],wines[wineIdx]];
      return{...s,wines};
    }));
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={s.d({ fontSize:20, color:T.text })}>Gestion des vins</div>
        <Btn size="sm" onClick={()=>{setEditingWine(null);setEditSeries(series[0]?.id);setShowEditor(true);}}>+ Ajouter un vin</Btn>
      </div>
      {series.map(ser=>(
        <Card key={ser.id} style={{ marginBottom:10, padding:0 }}>
          <div onClick={()=>toggle(ser.id)} style={{ padding:"14px 18px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:expanded[ser.id]?`1px solid ${T.border}`:"none" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ color:ser.color, fontSize:14 }}>{ser.icon}</span>
              <div><span style={s.m({ fontSize:11, color:ser.color })}>{ser.name}</span><span style={s.m({ fontSize:10, color:T.muted, marginLeft:8 })}>{ser.subtitle}</span></div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              {/* Timer duration inline edit */}
              <div onClick={e=>e.stopPropagation()} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <input type="number" min="1" max="120"
                  value={ser.timerMinutes||10}
                  onChange={e=>onUpdate(series.map(sx=>sx.id===ser.id?{...sx,timerMinutes:parseInt(e.target.value)||10}:sx))}
                  style={{ width:44, padding:"4px 6px", borderRadius:6, border:`1px solid ${T.border}`, background:T.surfAlt, fontFamily:FM, fontSize:11, color:T.text, outline:"none", textAlign:"center" }}
                />
                <span style={s.m({ fontSize:10, color:T.muted })}>min</span>
              </div>
              <Tag color={ser.color}>{ser.wines.length} vins</Tag>
              <span style={{ color:T.muted, fontSize:12 }}>{expanded[ser.id]?"▲":"▼"}</span>
            </div>
          </div>
          {expanded[ser.id]&&(
            <div style={{ padding:"8px 18px 14px" }}>
              {ser.wines.map((w,i)=>(
                <div key={w.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:i<ser.wines.length-1?`1px solid ${T.border}`:"none" }}>
                  <div style={{ width:26, height:26, borderRadius:"50%", flexShrink:0, background:`${ser.color}18`, border:`1px solid ${ser.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:FD, fontSize:11, color:ser.color }}>{w.blind}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={s.i({ fontSize:13, color:T.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" })}>{w.name}</div>
                    <div style={s.m({ fontSize:9, color:T.muted })}>{w.appellation} · {w.prix}</div>
                  </div>
                  <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                    <button onClick={()=>moveWine(ser.id,i,-1)} disabled={i===0} style={{ background:"none", border:`1px solid ${T.border}`, borderRadius:6, width:26, height:26, cursor:i===0?"not-allowed":"pointer", color:i===0?T.border:T.muted, fontSize:11 }}>↑</button>
                    <button onClick={()=>moveWine(ser.id,i,1)} disabled={i===ser.wines.length-1} style={{ background:"none", border:`1px solid ${T.border}`, borderRadius:6, width:26, height:26, cursor:i===ser.wines.length-1?"not-allowed":"pointer", color:i===ser.wines.length-1?T.border:T.muted, fontSize:11 }}>↓</button>
                    <Btn size="sm" variant="outline" onClick={()=>{setEditingWine(w);setEditSeries(ser.id);setShowEditor(true);}}>Modifier</Btn>
                    <Btn size="sm" variant="danger" onClick={()=>deleteWine(ser.id,w.id)}>✕</Btn>
                  </div>
                </div>
              ))}
              {ser.wines.length===0&&<div style={s.m({ fontSize:11, color:T.muted, padding:"10px 0", textAlign:"center" })}>Aucun vin dans cette série</div>}
            </div>
          )}
        </Card>
      ))}
      {showEditor&&<WineEditorModal wine={editingWine} seriesId={editSeries} seriesList={series} onSave={handleSave} onClose={()=>setShowEditor(false)}/>}
    </div>
  );
}

// ─── ADMIN: CONFIG TAB ────────────────────────────────────────────────────────
function ConfigTab({ config, onUpdate }) {
  const [form,setForm]=useState({ tastingName:config.tastingName, tastingDate:config.tastingDate, joinCode:config.joinCode, description:config.description||"" });
  const [saved,setSaved]=useState(false);
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const save=async()=>{
    const updated={...config,...form};
    await db.setConfig(updated); onUpdate(updated);
    setSaved(true); setTimeout(()=>setSaved(false),2000);
  };
  return (
    <div>
      <div style={s.d({ fontSize:20, color:T.text, marginBottom:20 })}>Configuration</div>
      <Card style={{ marginBottom:16 }}>
        <Input label="NOM DE LA DÉGUSTATION" value={form.tastingName} onChange={v=>f("tastingName",v)} />
        <Input label="DATE" type="date" value={form.tastingDate} onChange={v=>f("tastingDate",v)} />
        <Textarea label="DESCRIPTION / INTRODUCTION" value={form.description} onChange={v=>f("description",v)} placeholder="Texte affiché sur l'écran d'ouverture..." />
        <Divider />
        <Input label="CODE DE PARTICIPATION" value={form.joinCode} onChange={v=>f("joinCode",v.toUpperCase())} hint="Communiquez ce code aux participants" />
        <div style={{ display:"flex", justifyContent:"flex-end" }}>
          <Btn onClick={save} style={{ minWidth:160 }}>{saved?"✓ Enregistré":"Enregistrer"}</Btn>
        </div>
      </Card>
    </div>
  );
}

// ─── ADMIN: TIMER ─────────────────────────────────────────────────────────────
function TimerControl({ timerState, onUpdate, series }) {
  const { running, elapsed, target, activeSeriesIdx=0 } = timerState;
  const intervalRef=useRef(null);
  useEffect(()=>{
    if(running) intervalRef.current=setInterval(()=>onUpdate(p=>({...p,elapsed:p.elapsed+1})),1000);
    else clearInterval(intervalRef.current);
    return()=>clearInterval(intervalRef.current);
  },[running]);
  const remaining=target-elapsed; const pct=Math.min((elapsed/target)*100,100); const over=elapsed>target;
  const activeSer=series?.[activeSeriesIdx];
  const loadSeries=(i)=>{
    const mins=series[i]?.timerMinutes||10;
    onUpdate(p=>({...p, activeSeriesIdx:i, target:mins*60, elapsed:0, running:false }));
  };
  return (
    <Card style={{ marginBottom:16 }}>
      <div style={s.m({ fontSize:9, letterSpacing:".12em", color:T.muted, marginBottom:14 })}>MINUTERIE PAR SÉRIE</div>
      {series&&(
        <div style={{ display:"flex", gap:6, marginBottom:18, flexWrap:"wrap" }}>
          {series.map((sr,i)=>{
            const active=activeSeriesIdx===i;
            return (
              <button key={sr.id} onClick={()=>loadSeries(i)} style={{
                flex:1, minWidth:100, padding:"9px 10px", borderRadius:9, cursor:"pointer",
                border:`1px solid ${active?sr.color:T.border}`,
                background:active?`${sr.color}12`:"transparent",
                transition:"all .2s", textAlign:"center",
              }}>
                <div style={s.m({ fontSize:9, color:active?sr.color:T.muted })}>{sr.name}</div>
                <div style={s.d({ fontSize:11, color:active?sr.color:T.textMd, marginTop:2 })}>{sr.timerMinutes||10} min</div>
              </button>
            );
          })}
        </div>
      )}
      <div style={{ textAlign:"center", padding:"16px 0" }}>
        {activeSer&&<div style={s.m({ fontSize:9, color:activeSer.color, letterSpacing:".1em", marginBottom:8 })}>{activeSer.name} · {activeSer.subtitle}</div>}
        <div style={s.d({ fontSize:64, fontWeight:300, color:over?T.err:running?T.gold:T.text, lineHeight:1 })}>
          {over?`+${fmtTime(elapsed-target)}`:fmtTime(remaining)}
        </div>
        <div style={s.m({ fontSize:10, color:T.muted, marginTop:8 })}>{running?"EN COURS":over?"TEMPS ÉCOULÉ":"EN PAUSE"}</div>
      </div>
      <div style={{ height:4, background:T.border, borderRadius:2, overflow:"hidden", marginBottom:18 }}>
        <div style={{ width:`${pct}%`, height:"100%", background:over?T.err:(activeSer?.color||T.gold), transition:"width .5s ease", borderRadius:2 }}/>
      </div>
      <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
        <Btn onClick={()=>onUpdate(p=>({...p,running:!p.running}))} style={{ minWidth:120 }} variant={running?"outline":"primary"}>{running?"⏸ Pause":"▶ Démarrer"}</Btn>
        <Btn onClick={()=>onUpdate(p=>({...p,elapsed:0,running:false}))} variant="outline">↺ Reset</Btn>
      </div>
    </Card>
  );
}

// ─── ADMIN: PRESENTATION CONTROL TAB ─────────────────────────────────────────
function PresentationTab({ config, participants, series, onLaunch, timerState, onTimerUpdate }) {
  const baseUrl=typeof window!=="undefined"?window.location.origin+window.location.pathname:"";
  const joinPayload=btoa(JSON.stringify({ tastingName:config.tastingName, tastingDate:config.tastingDate, joinCode:config.joinCode }));
  const participantUrl=`${baseUrl}?j=${joinPayload}`;
  const qrUrl=`https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=1A1714&bgcolor=FAFAF8&data=${encodeURIComponent(participantUrl)}`;
  const pList=Object.values(participants);
  return (
    <div>
      <div style={s.d({ fontSize:20, color:T.text, marginBottom:20 })}>Présentation & Timer</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <Card>
          <div style={s.m({ fontSize:9, letterSpacing:".12em", color:T.muted, marginBottom:12 })}>CODE DE PARTICIPATION</div>
          <div style={s.d({ fontSize:36, fontWeight:600, color:T.gold, letterSpacing:".1em", marginBottom:4 })}>{config.joinCode}</div>
          <div style={s.m({ fontSize:10, color:T.muted })}>Communiquez ce code aux participants</div>
        </Card>
        <Card style={{ textAlign:"center" }}>
          <div style={s.m({ fontSize:9, letterSpacing:".12em", color:T.muted, marginBottom:10 })}>QR CODE PARTICIPANTS</div>
          <img src={qrUrl} alt="QR" style={{ width:80, height:80 }}/>
          <div style={s.m({ fontSize:9, color:T.muted, marginTop:6 })}>{pList.length} participant{pList.length!==1?"s":""} connecté{pList.length!==1?"s":""}</div>
        </Card>
      </div>
      <TimerControl timerState={timerState} onUpdate={onTimerUpdate} series={series} />
      <Card style={{ marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={s.m({ fontSize:9, letterSpacing:".12em", color:T.muted })}>PARTICIPANTS ({pList.length})</div>
        </div>
        {pList.length===0
          ?<div style={s.m({ fontSize:11, color:T.muted, textAlign:"center", padding:"10px 0" })}>En attente de participants…</div>
          :pList.map(p=>(
            <div key={p.key} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:`1px solid ${T.border}` }}>
              <Avatar name={p.name} size={30}/>
              <div><div style={s.i({ fontSize:13, color:T.text })}>{p.name}</div><div style={s.m({ fontSize:9, color:T.muted })}>{p.email}</div></div>
              <Tag color={T.succ} style={{ marginLeft:"auto" }}>Connecté</Tag>
            </div>
          ))
        }
      </Card>
      <Btn onClick={onLaunch} full size="lg" variant="dark">▶ LANCER LA PRÉSENTATION</Btn>
    </div>
  );
}

// ─── ADMIN: RESULTS TAB ───────────────────────────────────────────────────────
function ResultsTab({ series, allResults, allRankings, participants }) {
  const [sending,setSending]=useState(false);
  const [emailStatus,setEmailStatus]=useState(null);
  const pList=Object.values(participants);
  const top4=computeTop4(series,allResults,allRankings);
  const sorted=[...top4,...computeTop4(series,allResults,allRankings).slice(4)];

  const sendEmails=async()=>{
    setSending(true); setEmailStatus(null);
    try {
      const res=await fetch("/api/send-results",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ participants:pList, allResults, allRankings, series, config:{}, top4:top4.slice(0,4) }),
      });
      const data=await res.json();
      if(res.ok) setEmailStatus({ ok:true, msg:`✓ ${data.sent} email${data.sent>1?"s":""} envoyé${data.sent>1?"s":""}` });
      else setEmailStatus({ ok:false, msg:`Erreur : ${data.error}` });
    } catch(e) {
      setEmailStatus({ ok:false, msg:`Erreur réseau : ${e.message}` });
    }
    setSending(false);
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={s.d({ fontSize:20, color:T.text })}>Résultats agrégés</div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {emailStatus&&<span style={s.m({ fontSize:10, color:emailStatus.ok?T.succ:T.err })}>{emailStatus.msg}</span>}
          <Btn size="sm" variant="succ" onClick={sendEmails} disabled={sending||pList.length===0}>
            {sending?"Envoi…":"✉ Envoyer par email"}
          </Btn>
        </div>
      </div>
      {pList.length===0&&<Card><div style={s.m({ fontSize:12, color:T.muted, textAlign:"center", padding:"20px 0" })}>En attente de participants.</div></Card>}
      {sorted.length===0&&pList.length>0&&<Card><div style={s.m({ fontSize:12, color:T.muted, textAlign:"center", padding:"20px 0" })}>Aucun résultat. Les participants doivent compléter leur dégustation.</div></Card>}
      {sorted.length>0&&(
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {sorted.map((item,i)=>{
            const c=item.series.color;
            const wr=Object.values(allResults).map(p=>p[item.wine.id]).filter(Boolean);
            const avgC=mean(wr.map(r=>r.couleurNote)); const avgN=mean(wr.map(r=>r.nezNote)); const avgB=mean(wr.map(r=>r.boucheNote));
            return (
              <Card key={item.wine.id} style={{ padding:"14px 18px" }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
                  <div style={s.d({ fontSize:20, fontWeight:600, color:i<3?"#B8963E":T.muted, width:28, flexShrink:0 })}>{i+1}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}><Tag color={c}>{item.series.name}</Tag><span style={s.d({ fontSize:13, color:T.text })}>{item.wine.name}</span></div>
                    <div style={{ display:"flex", gap:12 }}>
                      {[["Couleur",avgC],["Nez",avgN],["Bouche",avgB]].map(([l,v])=>(
                        <div key={l} style={{ flex:1 }}>
                          <div style={s.m({ fontSize:9, color:T.muted, marginBottom:3 })}>{l}</div>
                          <div style={{ height:3, borderRadius:2, background:T.border, overflow:"hidden" }}><div style={{ width:`${(v/4)*100}%`, height:"100%", background:c }}/></div>
                          <div style={s.m({ fontSize:9, color:c, marginTop:2 })}>{v.toFixed(1)}/4</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={s.d({ fontSize:22, fontWeight:600, color:c })}>{(item.score*10).toFixed(1)}</div>
                    <div style={s.m({ fontSize:9, color:T.muted })}>/ 10</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function AdminDashboard({ config, series, participants, allResults, allRankings, onSeriesUpdate, onConfigUpdate, onLaunch, onLogout }) {
  const [tab,setTab]=useState("present");
  const [timerState,setTimerState]=useState({ running:false, elapsed:0, target:600 });
  const TABS=[{id:"config",label:"Configuration"},{id:"wines",label:"Vins"},{id:"present",label:"Présentation"},{id:"results",label:"Résultats"}];
  return (
    <div style={{ minHeight:"100vh", background:T.bg }}>
      <div style={{ background:T.surf, borderBottom:`1px solid ${T.border}`, padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <LogoBar compact />
        <div style={{ display:"flex", gap:6 }}>
          <Btn variant="outline" size="sm" onClick={onLaunch}>▶ Présenter</Btn>
          <Btn variant="ghost" size="sm" onClick={onLogout}>Déconnexion</Btn>
        </div>
      </div>
      <div style={{ background:T.surfAlt, borderBottom:`1px solid ${T.border}`, padding:"14px 24px" }}>
        <div style={s.d({ fontSize:20, color:T.text })}>{config.tastingName}</div>
        <div style={s.m({ fontSize:10, color:T.muted })}>{config.tastingDate}</div>
      </div>
      <div style={{ background:T.surf, borderBottom:`1px solid ${T.border}`, padding:"0 24px", display:"flex" }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"14px 18px", background:"none", border:"none", cursor:"pointer", fontFamily:FM, fontSize:10, letterSpacing:".08em", color:tab===t.id?T.gold:T.muted, borderBottom:`2px solid ${tab===t.id?T.gold:"transparent"}`, transition:"all .2s" }}>{t.label.toUpperCase()}</button>
        ))}
      </div>
      <div style={{ maxWidth:760, margin:"0 auto", padding:"28px 24px" }}>
        {tab==="config" &&<ConfigTab config={config} onUpdate={onConfigUpdate} />}
        {tab==="wines"  &&<WineManagerTab series={series} onUpdate={onSeriesUpdate} />}
        {tab==="present"&&<PresentationTab config={config} participants={participants} series={series} onLaunch={onLaunch} timerState={timerState} onTimerUpdate={setTimerState} />}
        {tab==="results"&&<ResultsTab series={series} allResults={allResults} allRankings={allRankings} participants={participants} />}
      </div>
    </div>
  );
}

// ─── PRESENTATION VIEW ────────────────────────────────────────────────────────
function PresentationView({ config, series, participants, allResults, allRankings, onExit }) {
  const [phase,setPhase]=useState("opening");
  const [revSerIdx,setRevSerIdx]=useState(0);
  const [revWineIdx,setRevWineIdx]=useState(0);
  const [emailStatus,setEmailStatus]=useState(null);
  const [emailSending,setEmailSending]=useState(false);
  const intervalRef=useRef(null);
  const top4=computeTop4(series,allResults,allRankings).slice(0,4);
  const pList=Object.values(participants);
  const baseUrl=typeof window!=="undefined"?window.location.origin+window.location.pathname:"";
  const joinPayload=btoa(JSON.stringify({ tastingName:config.tastingName, tastingDate:config.tastingDate, joinCode:config.joinCode }));
  const participantUrl=`${baseUrl}?j=${joinPayload}`;
  const qrUrl=`https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=1A1714&bgcolor=FFFFFF&data=${encodeURIComponent(participantUrl)}`;

  // Per-series timer state: { running, elapsed, target, activeSeriesIdx }
  const [timerState,setTimerState]=useState({ running:false, elapsed:0, target:(series[0]?.timerMinutes||10)*60, activeSeriesIdx:0 });

  useEffect(()=>{
    if(timerState.running) intervalRef.current=setInterval(()=>setTimerState(p=>({...p,elapsed:p.elapsed+1})),1000);
    else clearInterval(intervalRef.current);
    return()=>clearInterval(intervalRef.current);
  },[timerState.running]);

  const { running, elapsed, target, activeSeriesIdx=0 } = timerState;
  const activeSer=series[activeSeriesIdx];
  const remaining=target-elapsed; const over=elapsed>target; const pct=Math.min((elapsed/target)*100,100);
  const loadSeries=(i)=>setTimerState(p=>({...p, activeSeriesIdx:i, target:(series[i]?.timerMinutes||10)*60, elapsed:0, running:false }));

  const sendEmails=async()=>{
    setEmailSending(true); setEmailStatus(null);
    try {
      const res=await fetch("/api/send-results",{ method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ participants:pList, allResults, allRankings, series, config, top4 }) });
      const data=await res.json();
      setEmailStatus(res.ok?{ ok:true, msg:`✓ ${data.sent} email${data.sent>1?"s":""} envoyé${data.sent>1?"s":""}` }:{ ok:false, msg:`Erreur : ${data.error}` });
    } catch(e) { setEmailStatus({ ok:false, msg:`Erreur : ${e.message}` }); }
    setEmailSending(false);
  };

  const Controls=({children})=>(
    <div style={{ position:"fixed", bottom:20, left:"50%", transform:"translateX(-50%)", display:"flex", gap:8, zIndex:100, background:"rgba(255,255,255,.94)", backdropFilter:"blur(8px)", borderRadius:14, padding:"8px 12px", border:`1px solid ${T.border}`, boxShadow:"0 4px 20px rgba(0,0,0,.1)" }}>
      <Btn variant="ghost" size="sm" onClick={onExit}>✕ Quitter</Btn>
      <div style={{ width:1, background:T.border }}/>
      {children}
    </div>
  );

  // OPENING
  if(phase==="opening") return (
    <div style={{ minHeight:"100vh", background:"#FFFFFF", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 60px" }}>
      <LogoBar />
      <div style={{ textAlign:"center", margin:"44px 0 32px" }}>
        <div style={{ fontSize:52, fontWeight:300, color:T.text, marginBottom:8, fontFamily:FD }}>{config.tastingName}</div>
        {config.tastingDate&&<div style={s.m({ fontSize:14, color:T.muted, letterSpacing:".1em" })}>{new Date(config.tastingDate+"T12:00:00").toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>}
        {config.description&&<div style={{ fontStyle:"italic", fontSize:18, color:T.textMd, marginTop:20, maxWidth:600, lineHeight:1.6, fontFamily:FD }}>{config.description}</div>}
      </div>
      <div style={{ display:"flex", gap:60, alignItems:"flex-start" }}>
        <div style={{ textAlign:"center" }}>
          <img src={qrUrl} alt="QR" style={{ width:120, height:120, marginBottom:10 }}/>
          <div style={s.m({ fontSize:10, color:T.muted, letterSpacing:".1em" })}>REJOINDRE VIA QR</div>
          <div style={s.m({ fontSize:13, color:T.gold, letterSpacing:".1em", marginTop:4 })}>{config.joinCode}</div>
        </div>
        <div>
          <div style={s.m({ fontSize:10, color:T.muted, letterSpacing:".1em", marginBottom:12 })}>PARTICIPANTS ({pList.length})</div>
          {pList.map(p=><div key={p.key} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}><Avatar name={p.name} size={28}/><div style={{ fontSize:16, color:T.text, fontFamily:FD }}>{p.name}</div></div>)}
          {pList.length===0&&<div style={s.m({ fontSize:12, color:T.muted })}>En attente…</div>}
        </div>
      </div>
      <Controls>
        <Btn size="sm" onClick={()=>setPhase("timer")}>Timer →</Btn>
        <Btn size="sm" onClick={()=>setPhase("reveal")}>Révélation →</Btn>
        <Btn size="sm" onClick={()=>setPhase("closing")}>Clôture →</Btn>
      </Controls>
    </div>
  );

  // TIMER
  if(phase==="timer") return (
    <div style={{ minHeight:"100vh", background:"#FFFFFF", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 60px" }}>
      <LogoBar compact />
      {/* Series selector */}
      <div style={{ display:"flex", gap:8, margin:"28px 0 0", flexWrap:"wrap", justifyContent:"center" }}>
        {series.map((sr,i)=>{
          const active=activeSeriesIdx===i;
          return (
            <button key={sr.id} onClick={()=>loadSeries(i)} style={{
              padding:"10px 20px", borderRadius:10, cursor:"pointer", transition:"all .2s",
              border:`1px solid ${active?sr.color:T.borderMd}`,
              background:active?`${sr.color}10`:"transparent",
            }}>
              <div style={s.m({ fontSize:9, color:active?sr.color:T.muted, letterSpacing:".1em" })}>{sr.name}</div>
              <div style={s.d({ fontSize:13, color:active?sr.color:T.textMd, marginTop:2 })}>{sr.timerMinutes||10} min</div>
            </button>
          );
        })}
      </div>
      <div style={{ textAlign:"center", margin:"24px 0 16px" }}>
        {activeSer&&<div style={s.m({ fontSize:12, color:activeSer.color, letterSpacing:".14em", marginBottom:14 })}>{activeSer.name} · {activeSer.subtitle}</div>}
        <div style={{ fontSize:100, fontWeight:300, color:over?T.err:running?(activeSer?.color||T.gold):T.text, letterSpacing:".04em", fontFamily:FD, lineHeight:1 }}>
          {over?`+${fmtTime(elapsed-target)}`:fmtTime(remaining)}
        </div>
        <div style={s.m({ fontSize:13, color:T.muted, marginTop:12 })}>{running?"En cours…":over?"Temps écoulé":"En pause"}</div>
      </div>
      <div style={{ width:"min(400px,80%)", height:6, background:T.border, borderRadius:3, overflow:"hidden", marginBottom:32 }}>
        <div style={{ width:`${pct}%`, height:"100%", background:over?T.err:(activeSer?.color||T.gold), transition:"width 1s linear" }}/>
      </div>
      <Controls>
        <Btn size="sm" onClick={()=>setPhase("opening")}>← Ouverture</Btn>
        <Btn size="sm" variant={running?"outline":"primary"} onClick={()=>setTimerState(p=>({...p,running:!p.running}))}>{running?"⏸ Pause":"▶ Démarrer"}</Btn>
        <Btn size="sm" variant="outline" onClick={()=>setTimerState(p=>({...p,elapsed:0,running:false}))}>↺</Btn>
        <Btn size="sm" onClick={()=>setPhase("reveal")}>Révélation →</Btn>
      </Controls>
    </div>
  );

  // REVEAL
  const revSeries=series[revSerIdx]; const revWine=revSeries?.wines[revWineIdx];
  const top4sorted=computeTop4(series,allResults,allRankings);
  if(phase==="reveal"&&revWine) return (
    <div style={{ minHeight:"100vh", background:"#FFFFFF", display:"flex", flexDirection:"column", padding:"40px 80px 80px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:40 }}>
        <LogoBar compact />
        <div style={{ display:"flex", gap:6 }}>
          {series.map((sr,i)=>(
            <button key={sr.id} onClick={()=>{setRevSerIdx(i);setRevWineIdx(0);}} style={{ padding:"6px 14px", borderRadius:8, border:`1px solid ${i===revSerIdx?sr.color:T.border}`, background:i===revSerIdx?`${sr.color}14`:"transparent", cursor:"pointer", fontFamily:FM, fontSize:9, color:i===revSerIdx?sr.color:T.muted, letterSpacing:".06em" }}>{sr.name}</button>
          ))}
        </div>
      </div>
      <div style={{ flex:1, display:"flex", gap:60 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", gap:8, marginBottom:24 }}>
            {revSeries.wines.map((w,i)=>(
              <button key={w.id} onClick={()=>setRevWineIdx(i)} style={{ width:36, height:36, borderRadius:"50%", border:`2px solid ${i===revWineIdx?revSeries.color:T.border}`, background:i===revWineIdx?`${revSeries.color}18`:"transparent", cursor:"pointer", fontFamily:FD, fontSize:14, color:i===revWineIdx?revSeries.color:T.muted }}>{w.blind}</button>
            ))}
          </div>
          <div style={{ color:revSeries.color, fontFamily:FM, fontSize:10, letterSpacing:".12em", marginBottom:8 }}>{revSeries.name} · {revSeries.subtitle}</div>
          <div style={{ fontSize:32, fontWeight:300, color:T.text, marginBottom:28, lineHeight:1.35, fontFamily:FD }}>{revWine.name}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[["Producteur",revWine.producer],["Appellation",revWine.appellation],["Terroir",revWine.terroir],["Cépage(s)",revWine.cepages],["Vinification",revWine.vinif],["Élevage",revWine.elevage]].map(([l,v])=>(
              <div key={l} style={{ padding:"10px 14px", borderRadius:10, border:`1px solid ${T.border}`, background:T.bg }}>
                <div style={s.m({ fontSize:8, color:T.muted, letterSpacing:".1em", marginBottom:3 })}>{l.toUpperCase()}</div>
                <div style={s.i({ fontSize:13, color:T.text })}>{v||"—"}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:14, padding:"14px 18px", borderRadius:12, border:`1px solid ${revSeries.color}30`, background:`${revSeries.color}07`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={s.m({ fontSize:12, color:T.muted })}>Prix public moyen</span>
            <span style={{ fontFamily:FD, fontSize:26, fontWeight:600, color:revSeries.color }}>{revWine.prix}</span>
          </div>
        </div>
        {top4sorted.find(x=>x.wine.id===revWine.id)&&(()=>{
          const item=top4sorted.find(x=>x.wine.id===revWine.id);
          const wr=Object.values(allResults).map(p=>p[revWine.id]).filter(Boolean);
          const avgC=mean(wr.map(r=>r.couleurNote)); const avgN=mean(wr.map(r=>r.nezNote)); const avgB=mean(wr.map(r=>r.boucheNote));
          return (
            <div style={{ width:220, flexShrink:0 }}>
              <div style={s.m({ fontSize:9, color:T.muted, letterSpacing:".1em", marginBottom:16 })}>RÉSULTATS GROUPE</div>
              <div style={{ fontFamily:FD, fontSize:44, fontWeight:300, color:revSeries.color, textAlign:"center", marginBottom:4 }}>{(item.score*10).toFixed(1)}</div>
              <div style={s.m({ fontSize:10, color:T.muted, textAlign:"center", marginBottom:20 })}>/ 10</div>
              {[["Couleur",avgC],["Nez",avgN],["Bouche",avgB]].map(([l,v])=>(
                <div key={l} style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}><span style={s.m({ fontSize:10, color:T.muted })}>{l}</span><span style={s.m({ fontSize:10, color:revSeries.color })}>{v.toFixed(1)}/4</span></div>
                  <div style={{ height:4, borderRadius:2, background:T.border }}><div style={{ width:`${(v/4)*100}%`, height:"100%", background:revSeries.color, borderRadius:2 }}/></div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
      <Controls>
        <Btn size="sm" onClick={()=>setPhase("timer")}>← Timer</Btn>
        <Btn size="sm" variant="outline" disabled={revWineIdx===0} onClick={()=>setRevWineIdx(p=>p-1)}>← Préc.</Btn>
        <Btn size="sm" disabled={revWineIdx===revSeries.wines.length-1} onClick={()=>setRevWineIdx(p=>p+1)}>Suiv. →</Btn>
        <Btn size="sm" onClick={()=>setPhase("closing")}>Clôture →</Btn>
      </Controls>
    </div>
  );

  // CLOSING
  return (
    <div style={{ minHeight:"100vh", background:"#FFFFFF", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 80px", textAlign:"center" }}>
      <LogoBar />
      <div style={{ margin:"48px 0 32px" }}>
        <div style={{ fontFamily:FD, fontSize:44, fontWeight:300, color:T.text, marginBottom:12 }}>Merci pour votre participation</div>
        <div style={{ fontStyle:"italic", fontFamily:FD, fontSize:18, color:T.textMd }}>à notre dégustation de vins naturels</div>
      </div>
      {top4.length>0&&(
        <div style={{ marginBottom:44 }}>
          <div style={s.m({ fontSize:10, color:T.muted, letterSpacing:".12em", marginBottom:20 })}>SÉLECTION FINALE DU GROUPE</div>
          <div style={{ display:"flex", gap:16, justifyContent:"center" }}>
            {top4.map((item,i)=>(
              <div key={item.wine.id} style={{ width:160, padding:"16px 14px", borderRadius:12, border:`1px solid ${item.series.color}30`, background:`${item.series.color}07`, textAlign:"center" }}>
                <div style={{ fontSize:24, marginBottom:8 }}>{["🥇","🥈","🥉","⭐"][i]}</div>
                <div style={s.m({ fontSize:8, color:item.series.color, letterSpacing:".08em", marginBottom:6 })}>{item.series.name}</div>
                <div style={{ fontFamily:FD, fontSize:11, color:T.text, lineHeight:1.4 }}>{item.wine.name}</div>
                <div style={s.m({ fontSize:12, color:item.series.color, marginTop:8 })}>{(item.score*10).toFixed(1)}/10</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ marginBottom:28 }}>
        {emailStatus&&<div style={s.m({ fontSize:11, color:emailStatus.ok?T.succ:T.err, marginBottom:12 })}>{emailStatus.msg}</div>}
        <Btn variant="succ" size="lg" onClick={sendEmails} disabled={emailSending||pList.length===0}>
          {emailSending?"Envoi en cours…":"✉ Envoyer les résultats par email"}
        </Btn>
        {pList.length===0&&<div style={s.m({ fontSize:10, color:T.muted, marginTop:6 })}>Aucun participant connecté</div>}
      </div>
      <div style={s.m({ fontSize:10, color:T.muted, letterSpacing:".06em" })}>TENUTA DI CASTELLARO · TENUTA MASSIMO LENTSCH · COLLECTION NATURALE</div>
      <Controls>
        <Btn size="sm" onClick={()=>setPhase("reveal")}>← Révélation</Btn>
        <Btn size="sm" onClick={()=>setPhase("opening")}>↺ Début</Btn>
      </Controls>
    </div>
  );
}

// ─── PARTICIPANT: JOIN ────────────────────────────────────────────────────────
function ParticipantJoin({ config, onJoined }) {
  // Si la config vient du QR code (?j=…) → code déjà vérifié dans l'URL, pas besoin de le saisir
  const fromQR = typeof window!=="undefined" && new URLSearchParams(window.location.search).has("j");
  const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [code,setCode]=useState("");
  const [err,setErr]=useState({}); const [loading,setLoading]=useState(false);

  const join=async()=>{
    const e={};
    if(!name.trim()) e.name="Requis";
    if(!email.includes("@")) e.email="Email invalide";
    // Code requis uniquement si accès sans QR
    if(!fromQR && code.toUpperCase()!==config.joinCode) e.code="Code incorrect";
    if(Object.keys(e).length){setErr(e);return;}
    setLoading(true);
    const key=genId();
    const participant={ key, name:name.trim(), email:email.toLowerCase(), joinedAt:Date.now() };
    await db.addParticipant(participant);
    session.setPart({ key, name:name.trim(), email:email.toLowerCase() });
    setLoading(false); onJoined(participant);
  };

  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:420 }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <LogoBar compact />
          <div style={s.d({ fontSize:22, fontWeight:300, color:T.text, marginTop:24, marginBottom:4 })}>{config.tastingName}</div>
          {config.tastingDate && (
            <div style={s.m({ fontSize:10, color:T.muted, marginBottom:6 })}>
              {new Date(config.tastingDate+"T12:00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}
            </div>
          )}
          <div style={s.m({ fontSize:10, color:T.muted, letterSpacing:".08em" })}>REJOINDRE LA DÉGUSTATION</div>
        </div>
        <Card>
          <Input label="VOTRE NOM" value={name} onChange={setName} error={err.name} placeholder="Prénom Nom" />
          <Input label="EMAIL" type="email" value={email} onChange={setEmail} error={err.email} placeholder="prenom@exemple.com" />
          {/* Code seulement si accès direct sans QR code */}
          {!fromQR && (
            <Input label="CODE DE PARTICIPATION" value={code} onChange={v=>setCode(v.toUpperCase())} error={err.code} placeholder="CODE" hint="Communiqué par l'oenologue" />
          )}
          <Btn onClick={join} disabled={loading} full size="lg">{loading?"Inscription…":"REJOINDRE →"}</Btn>
        </Card>
        <div style={{ textAlign:"center", marginTop:28 }}>
          <a href="?admin" style={{ ...s.m({ fontSize:10 }), color:T.border, textDecoration:"none" }}>
            Administration
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── PARTICIPANT: TASTING ─────────────────────────────────────────────────────
function ParticipantTasting({ participant, series }) {
  const [sIdx,setSIdx]=useState(0); const [wIdx,setWIdx]=useState(0);
  const [pView,setPView]=useState("handoff");
  const [cur,setCur]=useState({...R0}); const [allR,setAllR]=useState({}); const [allRk,setAllRk]=useState({});
  const ser=series[sIdx]; const wine=ser?.wines[wIdx];
  const tg=(f,v)=>setCur(p=>({...p,[f]:p[f].includes(v)?p[f].filter(x=>x!==v):[...p[f],v]}));

  const saveRating=async()=>{
    const updated={...allR,[wine.id]:{...cur}};
    setAllR(updated);
    await db.saveResult(participant.key,wine.id,{...cur});
    if(wIdx<ser.wines.length-1){setWIdx(wIdx+1);setCur({...R0});}
    else setPView("ranking");
  };
  const saveRanking=async rank=>{
    const updated={...allRk,[ser.id]:rank};
    setAllRk(updated);
    await db.saveRanking(participant.key,ser.id,rank);
    if(sIdx<series.length-1){setSIdx(sIdx+1);setWIdx(0);setCur({...R0});setPView("handoff");}
    else setPView("done");
  };

  if(pView==="done") return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:24, textAlign:"center" }}>
      <div><LogoBar compact /><div style={s.d({ fontSize:28, fontWeight:300, color:T.text, margin:"32px 0 8px" })}>Dégustation complétée !</div><div style={s.m({ fontSize:11, color:T.muted })}>Vos résultats ont été enregistrés.<br/>Les résultats vous seront envoyés par email.</div></div>
    </div>
  );

  if(pView==="handoff") return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ textAlign:"center" }}>
        <LogoBar compact />
        <div style={s.m({ fontSize:10, color:T.muted, letterSpacing:".1em", marginTop:28, marginBottom:6 })}>{ser.name} — {ser.subtitle}</div>
        <div style={s.d({ fontSize:18, fontWeight:300, color:T.text, marginBottom:28, fontStyle:"italic" })}>{ser.intro||""}</div>
        <Btn onClick={()=>setPView("tasting")} size="lg">COMMENCER →</Btn>
      </div>
    </div>
  );

  if(pView==="ranking"){
    const rank=allRk[ser.id]||[];
    const tgRk=id=>setAllRk(p=>({...p,[ser.id]:(p[ser.id]||[]).includes(id)?(p[ser.id]||[]).filter(x=>x!==id):[...(p[ser.id]||[]),id]}));
    const done=rank.length===ser.wines.length;
    return (
      <div style={{ maxWidth:460, margin:"0 auto", padding:"28px 18px 90px" }}>
        <div style={{ marginBottom:24 }}>
          <div style={s.m({ fontSize:9, color:T.muted, letterSpacing:".1em", marginBottom:8 })}>{ser.name} · CLASSEMENT</div>
          <div style={s.d({ fontSize:22, color:T.text, marginBottom:6 })}>Classez vos préférences</div>
          <div style={s.i({ fontSize:13, color:T.textMd })}>Cliquez les vins dans l'ordre — du favori au moins aimé.</div>
        </div>
        <div style={{ display:"flex", gap:6, marginBottom:20 }}>
          {ser.wines.map((_,i)=>{const id=rank[i];const w=id?ser.wines.find(x=>x.id===id):null;return<div key={i} style={{ flex:1, height:52, borderRadius:9, border:`1px solid ${w?ser.color:T.border}`, background:w?`${ser.color}10`:"transparent", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}><div style={s.m({ fontSize:8, color:T.muted })}>#{i+1}</div>{w&&<div style={{ fontFamily:FD, fontSize:16, color:ser.color }}>{w.blind}</div>}</div>;})}
        </div>
        {ser.wines.map(w=>{const pos=rank.indexOf(w.id);const ranked=pos>=0;return<button key={w.id} onClick={()=>tgRk(w.id)} style={{ display:"flex", alignItems:"center", gap:12, width:"100%", padding:"12px 14px", borderRadius:10, marginBottom:6, border:`1px solid ${ranked?ser.color:T.border}`, background:ranked?`${ser.color}08`:T.surf, cursor:"pointer", textAlign:"left" }}><div style={{ width:28, height:28, borderRadius:"50%", background:ranked?ser.color:T.border, display:"flex", alignItems:"center", justifyContent:"center", color:ranked?"#FFF":T.muted, fontFamily:ranked?FM:FD, fontSize:ranked?10:13, flexShrink:0 }}>{ranked?`#${pos+1}`:w.blind}</div><div style={s.i({ fontSize:13, color:T.text })}>Vin {w.blind}</div></button>;})}
        <FixedBtn onClick={()=>saveRanking(rank)} disabled={!done} color={ser.color}>{done?(sIdx<series.length-1?"SÉRIE SUIVANTE →":"TERMINER →"):"Classez tous les vins"}</FixedBtn>
      </div>
    );
  }

  const totalWines=series.reduce((a,s)=>a+s.wines.length,0);
  const doneWines=series.slice(0,sIdx).reduce((a,s)=>a+s.wines.length,0)+wIdx;
  return (
    <div style={{ maxWidth:500, margin:"0 auto", padding:"18px 18px 90px" }}>
      <div style={{ height:2, background:T.border, borderRadius:1, overflow:"hidden", marginBottom:18 }}>
        <div style={{ width:`${((doneWines+1)/totalWines)*100}%`, height:"100%", background:ser.color, transition:"width .5s" }}/>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 16px", borderRadius:12, border:`1px solid ${ser.color}30`, background:`${ser.color}08`, marginBottom:18 }}>
        <div style={{ width:42, height:42, borderRadius:"50%", background:`${ser.color}18`, border:`2px solid ${ser.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:FD, fontSize:18, color:ser.color, flexShrink:0 }}>{wine.blind}</div>
        <div><div style={s.m({ fontSize:9, letterSpacing:".08em", color:ser.color, marginBottom:2 })}>VIN {wine.blind} · À L'AVEUGLE</div><div style={s.d({ fontSize:17, color:T.text })}>{participant.name}</div></div>
      </div>
      <Section icon="◈" title="COULEUR" color={ser.color}>
        <Lbl mb>Intensité</Lbl>
        <Dots val={cur.couleurNote} set={v=>setCur(p=>({...p,couleurNote:v}))} color={ser.color}/>
        <Lbl mt mb>Descripteurs</Lbl>
        <Chips opts={KW.couleur} sel={cur.couleurMots} toggle={v=>tg("couleurMots",v)}/>
      </Section>
      <Section icon="◉" title="NEZ" color={ser.color}>
        <Lbl mb>Complexité</Lbl>
        <Dots val={cur.nezNote} set={v=>setCur(p=>({...p,nezNote:v}))} color={ser.color}/>
        <Lbl mt mb>Descripteurs</Lbl>
        <Chips opts={KW.nez} sel={cur.nezMots} toggle={v=>tg("nezMots",v)}/>
      </Section>
      <Section icon="◆" title="BOUCHE" color={ser.color}>
        <Lbl mb>Structure · plaisir</Lbl>
        <Dots val={cur.boucheNote} set={v=>setCur(p=>({...p,boucheNote:v}))} color={ser.color}/>
        <Lbl mt mb>Descripteurs</Lbl>
        <Chips opts={KW.bouche} sel={cur.boucheMots} toggle={v=>tg("boucheMots",v)}/>
      </Section>
      <Section icon="✦" title="PROFIL NATUREL" color={ser.color}>
        <Lbl mb>De conventionnel à supernaturel</Lbl>
        <NatScale val={cur.natural} set={v=>setCur(p=>({...p,natural:v}))}/>
      </Section>
      <Section icon="◇" title="PRIX SUPPOSÉ" color={ser.color}>
        <Lbl mb>Estimation prix public</Lbl>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <input type="number" placeholder="ex: 18" value={cur.prix} onChange={e=>setCur(p=>({...p,prix:e.target.value}))}
            style={{ width:100, padding:"10px 14px", borderRadius:9, border:`1px solid ${cur.prix?ser.color:T.border}`, background:T.surf, fontFamily:FD, fontSize:16, color:T.text, outline:"none" }}/>
          <span style={{ fontFamily:FD, color:T.muted, fontSize:16 }}>€</span>
        </div>
      </Section>
      <FixedBtn onClick={saveRating} color={ser.color}>VALIDER →</FixedBtn>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view,setView]   =useState("loading");
  const [config,setConfig]=useState(null);
  const [series,setSeries]=useState(DEFAULT_SERIES);
  const [participants,setParticipants]=useState({});
  const [allResults,setAllResults]=useState({});
  const [allRankings,setAllRankings]=useState({});
  const [participant,setParticipant]=useState(null);
  const [presentMode,setPresentMode]=useState(false);
  const realtimeRef=useRef(null);

  useEffect(()=>{ const link=document.createElement("link"); link.href=GFONTS; link.rel="stylesheet"; document.head.appendChild(link); init(); return()=>document.head.removeChild(link); },[]);

  // Realtime subscription
  useEffect(()=>{
    if(view==="admin"||presentMode){
      realtimeRef.current=db.subscribeParticipants(()=>refreshSharedData());
    }
    return()=>db.unsubscribe(realtimeRef.current);
  },[view,presentMode]);

  const init=async()=>{
    const params = typeof window!=="undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const isAdminMode = params.has("admin");
    const joinParam   = params.get("j"); // config encodée dans le QR code

    // ── Flux QR code participant (priorité absolue) ──────────────────────────
    // ?j= contient la config encodée en base64 → affichage direct du formulaire
    // même si l'admin est connecté sur cet appareil
    if(joinParam){
      try {
        const decoded = JSON.parse(atob(joinParam));
        if(decoded?.joinCode){
          setConfig(decoded);
          const prt=session.getPart();
          if(prt){ setParticipant(prt); setView("participant"); return; }
          setView("join");
          return;
        }
      } catch {}
    }

    // ── Session admin encore valide ──────────────────────────────────────────
    if(!isAdminMode){
      const adm=session.getAdmin();
      if(adm?.expiry>Date.now()){
        const cfg=await db.getConfig();
        if(cfg){ setConfig(cfg); const w=await db.getWines(); if(w) setSeries(w.series); await refreshSharedData(); setView("admin"); return; }
      }
    }

    // ── Chargement config depuis Supabase / localStorage ─────────────────────
    const cfg=await db.getConfig();

    if(!cfg){
      setView(isAdminMode ? "setup" : "no-config");
      return;
    }

    setConfig(cfg);

    if(isAdminMode){ setView("admin-login"); return; }

    // Par défaut : flux participant
    const prt=session.getPart();
    if(prt){ setParticipant(prt); setView("participant"); return; }
    setView("join");
  };

  const refreshSharedData=async()=>{
    const ps=await db.getParticipants(); setParticipants(ps);
    const keys=Object.keys(ps);
    const results={}, rankings={};
    for(const k of keys){ results[k]=await db.getResultsFor(k); rankings[k]=await db.getRankingsFor(k); }
    setAllResults(results); setAllRankings(rankings);
  };

  const handleSeriesUpdate=async ns=>{setSeries(ns);await db.setWines({series:ns});};
  const handleLogout=()=>{ session.clearAdmin(); setView("landing"); };

  if(view==="loading") return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}><LogoBar /><div style={s.m({ fontSize:10, color:T.muted, marginTop:24, letterSpacing:".1em" })}>Chargement…</div></div>
    </div>
  );

  if(view==="no-config") return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ textAlign:"center", maxWidth:380 }}>
        <LogoBar />
        <div style={s.d({ fontSize:20, fontWeight:300, color:T.text, margin:"28px 0 8px" })}>Dégustation non configurée</div>
        <div style={s.m({ fontSize:11, color:T.muted, marginBottom:32 })}>Contactez l'organisateur pour obtenir le code d'accès.</div>
        <a href="?admin" style={s.m({ fontSize:10, color:T.muted, textDecoration:"none", opacity:.5 })}>Administration</a>
      </div>
    </div>
  );

  if(presentMode) return (
    <PresentationView config={config} series={series} participants={participants} allResults={allResults} allRankings={allRankings} onExit={()=>{setPresentMode(false);refreshSharedData();}}/>
  );

  return (
    <div style={{ minHeight:"100vh", background:T.bg }}>
      {view==="setup"        &&<SetupScreen onComplete={cfg=>{setConfig(cfg);setView("admin");}}/>}
      {view==="admin-login"  &&<AdminLoginScreen config={config} onLogin={async()=>{const w=await db.getWines();if(w)setSeries(w.series);await refreshSharedData();setView("admin");}} onBack={()=>{ window.location.href=window.location.pathname; }}/>}
      {view==="admin"        &&<AdminDashboard config={config} series={series} participants={participants} allResults={allResults} allRankings={allRankings} onSeriesUpdate={handleSeriesUpdate} onConfigUpdate={setConfig} onLaunch={()=>setPresentMode(true)} onLogout={handleLogout}/>}
      {view==="join"         &&<ParticipantJoin config={config} onJoined={p=>{setParticipant(p);setView("participant");}}/>}
      {view==="participant"  &&<ParticipantTasting participant={participant} series={series}/>}
    </div>
  );
}
