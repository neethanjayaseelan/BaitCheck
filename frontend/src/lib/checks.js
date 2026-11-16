// Rule-based checks for emails and links. These run in the browser, so both checkers work
// without the backend. Finding details are HTML strings: user text is escaped with esc().
import { STORIES as ARTICLES } from './stories'

function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

/* ---------- Email checker ---------- */
const BRANDS = {
  microsoft: ["microsoft", "outlook", "office 365", "microsoft 365", "onedrive"],
  ezpass: ["e-zpass", "ezpass"],
  paypal: ["paypal"], amazon: ["amazon"], apple: ["apple", "icloud"], netflix: ["netflix"],
  google: ["google", "gmail"], usps: ["usps", "postal service"], fedex: ["fedex"], ups: ["ups package", "ups delivery"],
  dhl: ["dhl"], irs: ["irs", "internal revenue"], flyfrontier: ["frontier airlines"], chase: ["chase bank", "jpmorgan"],
  wellsfargo: ["wells fargo"], bankofamerica: ["bank of america"], coinbase: ["coinbase"], venmo: ["venmo"], zelle: ["zelle"]
};
const FREE_MAIL = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "aol.com", "icloud.com", "proton.me", "protonmail.com", "gmx.com", "mail.com"];
const RISKY_TLDS = ["top", "xyz", "icu", "click", "shop", "cfd", "sbs", "live", "buzz", "rest", "zip", "mov", "info", "online", "site", "cyou", "monster", "lol", "tk", "ml", "ga", "cf", "gq"];
const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly", "rebrand.ly", "cutt.ly", "shorturl.at", "rb.gy", "t.ly"];
const URGENCY = ["urgent", "immediately", "within 24 hours", "within 48 hours", "final notice", "final warning", "act now", "suspended", "will be suspended", "locked", "deactivated", "expire", "expires today", "last chance", "penalty", "late fee", "fine", "legal action", "unusual activity", "unauthorized"];
const SENSITIVE = ["password", "verification code", "one-time code", "security code", "card number", "credit card", "debit card", "cvv", "social security", "ssn", "bank account", "routing number", "login details", "verify your account", "confirm your identity", "update your payment", "billing information", "seed phrase", "recovery phrase"];
const PAYMENT = ["gift card", "itunes card", "google play card", "bitcoin", "crypto", "usdt", "wire transfer", "western union", "moneygram", "zelle", "cash app", "venmo"];
const BAIT = ["refund", "you have won", "you've won", "congratulations", "prize", "reward", "claim your", "free gift", "inheritance", "job offer", "part-time", "part time", "per week", "lottery", "unclaimed"];
const GENERIC = ["dear customer", "dear user", "dear client", "dear member", "valued customer", "dear account holder", "dear sir/madam", "hello user"];
// Each pattern catches a brand spelled with swapped characters; the real spelling is excluded.
const LOOKALIKE = [[/pay[p][a@][l1i|]{1,2}/, "paypal"], [/m[i1l]cr[o0]s[o0]f[t7]|rnicrosoft/, "microsoft"], [/[a@]m[a@]z[o0][nm]|arnazon/, "amazon"],
  [/[a@]pp[l1i]e/, "apple"], [/g[o0][o0]g[l1i]e/, "google"], [/netf[l1i]{1,2}x/, "netflix"], [/c[o0][i1l]nb[a@]se/, "coinbase"]];
function isLookalike(s) { return LOOKALIKE.some(([re, real]) => { const m = s.match(re); return m && m[0] !== real; }); }

function wordRe(w) { return new RegExp("(^|[^a-z0-9])" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "($|[^a-z0-9])"); }
function hasAny(text, list) { return list.filter(w => wordRe(w).test(text)); }
function domainOf(addr) { const m = addr.toLowerCase().match(/@([a-z0-9.-]+\.[a-z]{2,})/); return m ? m[1] : ""; }
function rootOf(d) {
  const p = d.split(".");
  const n = p.length >= 3 && p[p.length - 1].length === 2 && ["co", "com", "org", "gov", "ac", "net"].includes(p[p.length - 2]) ? 3 : 2;
  return p.slice(-n).join(".");
}

export function analyzeEmail(from, subject, body) {
  const text = (subject + "\n" + body).toLowerCase();
  const fromL = from.trim().toLowerCase();
  const sd = domainOf(fromL);
  const out = [];
  const add = (sev, title, detail, pts) => out.push({ sev, title, detail, pts });

  // Sender checks
  const mentionedBrands = Object.entries(BRANDS).filter(([, words]) => hasAny(text, words).length).map(([b]) => b);
  if (sd) {
    const tld = sd.split(".").pop();
    if (FREE_MAIL.includes(sd) && mentionedBrands.length)
      add("high", "A company email sent from a personal account", `It talks about <code>${esc(mentionedBrands[0])}</code> but came from <code>${esc(sd)}</code>. Real companies don't email you from free accounts.`, 30);
    else if (mentionedBrands.length && !mentionedBrands.some(b => sd.replace(/[-.]/g, "").includes(b)))
      add("high", "Sender doesn't match the company", `It claims to be <code>${esc(mentionedBrands[0])}</code> but the address ends in <code>${esc(sd)}</code>.`, 30);
    else {
      const brandHit = mentionedBrands.find(b => sd.replace(/[-.]/g, "").includes(b));
      const lbl = rootOf(sd).split(".")[0].replace(/-/g, "");
      if (brandHit && !FREE_MAIL.includes(sd)) {
        if (!lbl.includes(brandHit))
          add("high", "Brand name placed in front of a different website", `<code>${esc(sd)}</code> really belongs to <code>${esc(rootOf(sd))}</code>, not ${esc(brandHit)}.`, 30);
        else if (/(secure|alert|verify|login|support|service|billing|account|pay|update|help|notice|team)/.test(lbl.replace(brandHit, "")))
          add("high", "Brand name mixed with extra words", `<code>${esc(sd)}</code> isn't the company's real address. Scammers add words like "alerts" or "secure" to a brand name.`, 25);
      }
    }
    if (RISKY_TLDS.includes(tld))
      add("med", "Unusual web ending in the sender address", `<code>.${esc(tld)}</code> addresses are cheap and common in scams. Big companies rarely use them.`, 15);
    if (/\d{3,}/.test(sd) || sd.split(".").length > 3)
      add("med", "Odd-looking sender domain", `<code>${esc(sd)}</code> has lots of numbers or extra parts, a common way to fake an address.`, 10);
    if (isLookalike(sd))
      add("high", "Lookalike spelling in the sender", `<code>${esc(sd)}</code> swaps letters to imitate a brand (like 1 for l, 0 for o).`, 30);
  } else if (fromL) {
    add("low", "Couldn't read the sender address", "Paste the full address, the part inside < >, for a better check.", 0);
  }

  // Links
  const urls = [...(subject + " " + body).matchAll(/\b((?:https?:\/\/|www\.)[^\s<>"')\]]+)/gi)].map(m => m[1]);
  const seen = new Set();
  for (const u of urls) {
    let host = "";
    try { host = new URL(u.startsWith("http") ? u : "http://" + u).hostname.toLowerCase(); } catch { continue; }
    if (seen.has(host)) continue; seen.add(host);
    if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) add("high", "Link goes to a bare number address", `<code>${esc(host)}</code> is an IP address instead of a website name. Legit companies don't do this.`, 30);
    else if (SHORTENERS.includes(host)) add("med", "Link is shortened and hides where it goes", `<code>${esc(host)}</code> links hide the real destination.`, 15);
    else if (host.startsWith("xn--") || host.includes(".xn--")) add("high", "Link uses disguised characters", `<code>${esc(host)}</code> uses foreign characters that can look like normal letters.`, 30);
    else if (isLookalike(host)) add("high", "Link imitates a brand name", `<code>${esc(host)}</code> misspells a well-known brand.`, 30);
    else {
      if (RISKY_TLDS.includes(host.split(".").pop())) add("med", "Link has an unusual web ending", `<code>${esc(host)}</code>`, 12);
      if (sd && rootOf(host) !== rootOf(sd) && !FREE_MAIL.includes(sd) && mentionedBrands.length && !mentionedBrands.some(b => host.replace(/[-.]/g, "").includes(b)))
        add("med", "Link goes somewhere other than the company", `It claims to be <code>${esc(mentionedBrands[0])}</code> but links to <code>${esc(host)}</code>.`, 15);
    }
    if (u.toLowerCase().startsWith("http://")) add("low", "Link isn't secure (http)", `<code>${esc(host)}</code> doesn't use https.`, 5);
  }
  if (!urls.length && /click here|click the link|click below|tap here|pay now|verify now/.test(text))
    add("low", "Asks you to click, but the link wasn't pasted", "Hover over the button in the real email (don't click) and paste the address it shows.", 5);

  // Content
  const u = hasAny(text, URGENCY);
  if (u.length) add(u.length > 1 ? "high" : "med", "Pressure to act fast", `Words like <code>${esc(u.slice(0, 3).join("</code>, <code>"))}</code> are meant to rush you past thinking.`, u.length > 1 ? 20 : 12);
  const s = hasAny(text, SENSITIVE);
  if (s.length) add("high", "Asks for private information", `Mentions <code>${esc(s.slice(0, 3).join("</code>, <code>"))}</code>. Real companies don't ask for this by email.`, 25);
  const p = hasAny(text, PAYMENT);
  if (p.length) add("high", "Wants an unusual way to pay", `<code>${esc(p.slice(0, 3).join("</code>, <code>"))}</code> payments are hard to get back. Scammers prefer them.`, 25);
  const b = hasAny(text, BAIT);
  if (b.length) add("med", "Offers something you weren't expecting", `<code>${esc(b.slice(0, 3).join("</code>, <code>"))}</code>: a refund, prize or job out of nowhere is a classic hook.`, 12);
  const g = hasAny(text, GENERIC);
  if (g.length) add("low", "Doesn't use your name", `<code>${esc(g[0])}</code>: companies you deal with usually know your name.`, 8);
  if (/qr code|scan the code|scan this code/.test(text)) add("med", "Asks you to scan a QR code", "QR codes hide the web address, so you can't check it before it opens.", 12);
  if (/devicelogin|device code|enter (the|this) code|enter code/.test(text)) add("high", "Asks you to enter a code on a sign-in page", "This is how the Kali365 scam takes over Microsoft accounts, even on the real Microsoft site.", 30);
  if (/attach(ed|ment)|\.(zip|html?|iso|exe|docm|xlsm)\b/.test(text) && /(invoice|open|download|view)/.test(text)) add("med", "Pushes you to open an attachment", "Unexpected invoices or files are a common way to install malware.", 10);

  // Score
  const score = Math.min(100, out.reduce((n, f) => n + f.pts, 0));
  const matches = score < 20 ? [] : ARTICLES.map(a => ({ a, hits: a.keys.filter(k => wordRe(k).test(text) || (k.length > 4 && sd.includes(k.replace(/[^a-z]/g, "")))).length }))
    .filter(m => m.hits).sort((x, y) => y.hits - x.hits).slice(0, 2).map(m => m.a);
  return { score, findings: out.sort((x, y) => y.pts - x.pts), matches };
}

/* ---------- Link checker ---------- */
const LINK_BRANDS = ["microsoft", "outlook", "office365", "paypal", "amazon", "apple", "icloud", "netflix", "google", "gmail", "usps", "fedex", "ups", "dhl", "irs", "ezpass", "chase", "wellsfargo", "bankofamerica", "coinbase", "venmo", "zelle", "facebook", "instagram", "whatsapp", "walmart", "frontier", "okta"];
const KNOWN_GOOD = ["microsoft.com", "office.com", "office365.com", "live.com", "outlook.com", "microsoftonline.com", "sharepoint.com", "google.com", "gmail.com", "youtube.com", "apple.com", "icloud.com", "amazon.com", "amazon.co.uk", "paypal.com", "netflix.com", "usps.com", "fedex.com", "ups.com", "dhl.com", "irs.gov", "chase.com", "wellsfargo.com", "bankofamerica.com", "coinbase.com", "venmo.com", "zellepay.com", "facebook.com", "instagram.com", "whatsapp.com", "walmart.com", "flyfrontier.com", "okta.com"];
const EXTRA_WORDS = /(secure|alert|verify|login|signin|support|service|billing|account|pay|update|help|notice|team|refund|confirm|wallet)/;

export function analyzeLink(raw) {
  const s = raw.trim().replace(/^<|>$/g, "");
  if (!s || /\s/.test(s)) return null;
  const hadScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(s);
  let url;
  try { url = new URL(hadScheme ? s : "http://" + s); } catch { return null; }
  const fullHost = url.hostname.toLowerCase();
  const host = fullHost.replace(/^www\./, "");
  if (!host.includes(".")) return null;
  const out = [];
  const add = (sev, title, detail, pts) => out.push({ sev, title, detail, pts });
  const isIP = /^\d+\.\d+\.\d+\.\d+$/.test(host);
  const root = isIP ? host : rootOf(host);
  const label = root.split(".")[0].replace(/-/g, "");
  const tld = host.split(".").pop();
  const sub = isIP ? "" : host.slice(0, host.length - root.length);
  const flat = host.replace(/-/g, "");
  const hostTokens = host.split(/[.-]/);
  const pathTokens = (url.pathname + url.search).toLowerCase().split(/[^a-z0-9]+/);
  const trusted = KNOWN_GOOD.includes(root);

  if (hadScheme && !/^https?:$/.test(url.protocol)) add("high", "Not a normal web link", `It starts with <code>${esc(url.protocol)}</code> instead of https.`, 50);
  if (isIP) add("high", "Goes to a bare number address", `<code>${esc(host)}</code> is an IP address, not a website name. Real companies don't send links like this.`, 50);
  if (url.username || /\/\/[^/]*@/.test(s)) add("high", "Real address is hidden behind an @ sign", `Everything before the <code>@</code> is ignored. The link really goes to <code>${esc(host)}</code>.`, 50);
  if (SHORTENERS.includes(host)) add("med", "Shortened link hides where it goes", `<code>${esc(host)}</code> is a link shortener, so the real destination can't be seen. Be extra careful if you didn't expect it.`, 25);
  if (host.startsWith("xn--") || host.includes(".xn--")) add("high", "Uses disguised characters", `<code>${esc(host)}</code> contains foreign letters that can look identical to normal ones.`, 50);
  if (isLookalike(flat)) add("high", "Misspells a well-known brand", `<code>${esc(host)}</code> swaps characters (like 1 for l, 0 for o) to look like a real company.`, 50);

  if (!trusted && !isIP) {
    const brand = LINK_BRANDS.find(b => b.length >= 6 ? flat.includes(b) : hostTokens.includes(b));
    if (brand) {
      if (!label.includes(brand))
        add("high", "Brand name placed in front of a different website", `It shows <code>${esc(brand)}</code>, but the site is really <code>${esc(root)}</code>. Only the highlighted part above decides where you land.`, 50);
      else if (label !== brand && EXTRA_WORDS.test(label.replace(brand, "")))
        add("high", "Brand name mixed with extra words", `<code>${esc(root)}</code> isn't the company's real site. Scammers add words like "secure" or "pay" to a brand name.`, 50);
    } else {
      const pb = LINK_BRANDS.find(b => pathTokens.includes(b));
      if (pb) add("med", "Brand name appears only after the slash", `<code>${esc(pb)}</code> is in the page path, but the website is <code>${esc(root)}</code>. Anyone can put any name there.`, 15);
    }
  }
  if (RISKY_TLDS.includes(tld)) add("med", "Unusual web ending", `<code>.${esc(tld)}</code> addresses are cheap and common in scams. Big companies rarely use them.`, 15);
  if (!isIP && sub.split(".").filter(Boolean).length >= 3) add("med", "Lots of parts before the real site name", `Long chains like <code>${esc(sub.replace(/\.$/, ""))}</code> are used to push the real site out of view.`, 12);
  if ((host.match(/-/g) || []).length >= 3) add("low", "Many dashes in the address", "Real company sites rarely look like this.", 8);
  if (url.port) add("med", "Uses an unusual port number", `<code>:${esc(url.port)}</code> after the site name is rare on real public websites.`, 12);
  if (hadScheme && url.protocol === "http:") add("low", "Not secure (http)", "It doesn't use https, so anything you type could be read by others.", 8);
  if (out.length && pathTokens.some(t => /^(login|signin|verify|secure|account|update|confirm|password|billing|wallet|pay|payment|settle|refund)$/.test(t)))
    add("low", "Page name asks for a login or payment", "On a site that already looks suspicious, this is where details get stolen.", 6);

  const score = Math.min(100, out.reduce((n, f) => n + f.pts, 0));
  const toks = [...hostTokens, ...pathTokens];
  const matches = score < 20 ? [] : ARTICLES.map(a => ({ a, hits: a.keys.map(k => k.replace(/[^a-z0-9]/g, "")).filter(k => k.length > 3 && toks.some(t => t === k || (k.length >= 5 && t.includes(k)))).length }))
    .filter(m => m.hits).sort((x, y) => y.hits - x.hits).slice(0, 1).map(m => m.a);
  return { score, findings: out.sort((x, y) => y.pts - x.pts), matches, where: { sub, root, trusted } };
}
