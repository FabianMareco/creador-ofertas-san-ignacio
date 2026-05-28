// lib/drawCanvas.js — Motor de renderizado · Despensa San Ignacio
// 17 templates | Auto-fit precio al 90% ancho | Formato paraguayo de miles

const STORE_NAME = 'Despensa San Ignacio';
let _logoCache = null;

// ─── Monedas disponibles ──────────────────────────────────────────────────────
export const CURRENCIES = [
  { id: 'gs',  symbol: 'Gs.',  name: 'Guaraní', flag: '🇵🇾', format: 'py' },
  { id: 'brl', symbol: 'R$',   name: 'Real',    flag: '🇧🇷', format: 'py' },
  { id: 'usd', symbol: 'US$',  name: 'Dólar',   flag: '🇺🇸', format: 'us' },
  { id: 'ars', symbol: '$',    name: 'Peso',    flag: '🇦🇷', format: 'py' },
];

// ─── Formato numérico ────────────────────────────────────────────────────────

// Formato paraguayo: 1000 → 1.000, 1000000 → 1.000.000
export function formatPY(str) {
  const digits = (str || '').toString().replace(/[^0-9]/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Texto completo del precio: "Gs. 1.000.000"
function priceStr(currency, value) {
  if (!value) return '';
  const fmt = formatPY(value);
  if (!fmt) return '';
  return `${currency} ${fmt}`;
}

// ─── Auto-ajuste de precio al 90% del ancho ──────────────────────────────────

function drawAutoFitPrice(ctx, text, cx, y, maxW, fillStyle, shadowArgs) {
  if (!text) return 0;
  const target = maxW * 0.90;
  let lo = 16, hi = Math.min(Math.round(maxW * 0.85), 600);
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    ctx.font = `900 ${mid}px Oswald, sans-serif`;
    ctx.measureText(text).width <= target ? (lo = mid) : (hi = mid);
  }
  ctx.font = `900 ${lo}px Oswald, sans-serif`;
  ctx.fillStyle = fillStyle;
  ctx.textAlign = 'center';
  if (shadowArgs) sh(ctx, ...shadowArgs);
  ctx.fillText(text, cx, y);
  if (shadowArgs) noSh(ctx);
  return lo;
}

function drawAutoFitPastel(ctx, text, cx, y, maxW, fillStyle) {
  if (!text) return 0;
  const target = maxW * 0.90;
  let lo = 16, hi = Math.min(Math.round(maxW * 0.85), 600);
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    ctx.font = `800 ${mid}px Syne, Oswald, sans-serif`;
    ctx.measureText(text).width <= target ? (lo = mid) : (hi = mid);
  }
  ctx.font = `800 ${lo}px Syne, Oswald, sans-serif`;
  ctx.fillStyle = fillStyle;
  ctx.textAlign = 'center';
  ctx.fillText(text, cx, y);
  return lo;
}

function drawNeonFitPrice(ctx, text, cx, y, maxW, glowColor, textColor, blur = 28) {
  if (!text) return 0;
  const target = maxW * 0.90;
  let lo = 16, hi = Math.min(Math.round(maxW * 0.85), 600);
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    ctx.font = `900 ${mid}px Oswald, sans-serif`;
    ctx.measureText(text).width <= target ? (lo = mid) : (hi = mid);
  }
  ctx.font = `900 ${lo}px Oswald, sans-serif`;
  ctx.textAlign = 'center';
  ctx.save();
  ctx.shadowBlur = blur; ctx.shadowColor = glowColor;
  ctx.fillStyle = glowColor; ctx.fillText(text, cx, y);
  ctx.shadowBlur = 0;
  ctx.fillStyle = textColor || '#FFFFFF'; ctx.fillText(text, cx, y);
  ctx.restore();
  return lo;
}

// Precio anterior (tachado), tamaño relativo al principal
function drawOldPrice(ctx, currency, oldValue, cx, y, maxW, color) {
  if (!oldValue) return;
  const text = priceStr(currency, oldValue);
  if (!text) return;
  const sz = Math.max(16, Math.round(maxW * 0.055));
  ctx.font = `400 ${sz}px Oswald, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(text, cx, y);
  const tw = ctx.measureText(text).width;
  ctx.beginPath();
  ctx.moveTo(cx - tw / 2, y - sz * 0.2);
  ctx.lineTo(cx + tw / 2, y - sz * 0.2);
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
}

// ─── Logo ────────────────────────────────────────────────────────────────────

async function loadLogo() {
  if (_logoCache) return _logoCache;
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => { _logoCache = img; resolve(img); };
    img.onerror = () => resolve(null);
    img.src = '/logo.png';
  });
}

function drawLogoPositioned(ctx, logo, W, H, position, logoH, yOffset) {
  if (!logo) return;
  const logoW = logoH * (logo.width / logo.height);
  const y = yOffset ?? H * 0.008;
  let x;
  if (position === 'left')       x = W * 0.04;
  else if (position === 'right') x = W * 0.96 - logoW;
  else                           x = W * 0.5 - logoW / 2;
  ctx.drawImage(logo, x, y, logoW, logoH);
}

// ─── Utilidades canvas ───────────────────────────────────────────────────────

export function loadImage(src) {
  return new Promise(resolve => {
    if (!src) return resolve(null);
    const img = new Image();
    if (!src.startsWith('blob:') && !src.startsWith('/') && !src.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawImageCover(ctx, img, x, y, w, h) {
  if (!img) return;
  const ia = img.width / img.height, ba = w / h;
  let sx, sy, sw, sh;
  if (ia > ba) { sh = img.height; sw = sh * ba; sx = (img.width - sw) / 2; sy = 0; }
  else         { sw = img.width; sh = sw / ba; sx = 0; sy = (img.height - sh) / 2; }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function clipRR(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.clip(); }
function fillRR(ctx, x, y, w, h, r, color) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = color; ctx.fill(); }
function strokeRR(ctx, x, y, w, h, r, color, lw) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.stroke(); }

function getLines(ctx, text, maxW) {
  const words = text.split(' '), lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

function sh(ctx, blur, color, ox = 0, oy = 3) {
  ctx.shadowBlur = blur; ctx.shadowColor = color; ctx.shadowOffsetX = ox; ctx.shadowOffsetY = oy;
}
function noSh(ctx) {
  ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
}

function placeholder(ctx, x, y, w, h, color = 'rgba(255,255,255,0.07)') {
  fillRR(ctx, x, y, w, h, 16, color);
  ctx.font = `${Math.min(w,h)*0.11}px sans-serif`; ctx.fillStyle='rgba(255,255,255,0.18)';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('📷', x+w/2, y+h/2-14);
  ctx.font=`${Math.min(w,h)*0.055}px Outfit,sans-serif`; ctx.fillStyle='rgba(255,255,255,0.25)';
  ctx.fillText('Subí tu foto aquí', x+w/2, y+h/2+22); ctx.textBaseline='alphabetic';
}

// ─── CLÁSICOS ────────────────────────────────────────────────────────────────

function drawTemplateRojo(ctx, W, H, img, { productName, currentPrice, oldPrice, currency, badgeText, tagline, showTagline, imageShape }, logo, pos) {
  const CUR = currency || 'Gs.';
  const bg = ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,'#C41E2A'); bg.addColorStop(1,'#7A0010');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
  ctx.save(); ctx.beginPath(); ctx.moveTo(W*0.52,0); ctx.lineTo(W,0); ctx.lineTo(W,H); ctx.lineTo(W*0.42,H);
  ctx.closePath(); ctx.fillStyle='rgba(0,0,0,0.22)'; ctx.fill(); ctx.restore();
  ctx.fillStyle='#FFFFFF'; ctx.fillRect(0,0,W,H*0.21);
  ctx.fillStyle='#F5A623'; ctx.fillRect(0,H*0.21,W,H*0.007);
  drawLogoPositioned(ctx,logo,W,H,pos,H*0.20,H*0.005);

  if(img){
    ctx.save(); sh(ctx,W*0.04,'rgba(0,0,0,0.5)',W*0.01,W*0.01);
    ctx.save(); clipRR(ctx,W*0.03,H*0.228,W*0.55,H*0.47,W*0.022);
    drawImageCover(ctx,img,W*0.03,H*0.228,W*0.55,H*0.47); ctx.restore(); ctx.restore();
  } else placeholder(ctx,W*0.03,H*0.228,W*0.55,H*0.47);

  fillRR(ctx,W*0.615,H*0.245,W*0.36,H*0.065,8,'#F5A623');
  ctx.font=`700 ${H*0.04}px Oswald,sans-serif`; ctx.fillStyle='#7A0010';
  ctx.textAlign='center'; ctx.fillText(badgeText||'¡OFERTA!',W*0.795,H*0.295);

  ctx.font=`600 ${H*0.046}px Oswald,sans-serif`; ctx.fillStyle='#FFFFFF'; ctx.textAlign='center'; sh(ctx,6,'rgba(0,0,0,0.4)');
  getLines(ctx,productName||'Nombre del Producto',W*0.36).slice(0,3).forEach((l,i)=>ctx.fillText(l,W*0.795,H*0.38+i*H*0.052));
  noSh(ctx);

  const priceMaxW = W * 0.36;
  const priceX = W * 0.795;

  if(oldPrice){
    drawOldPrice(ctx,CUR,oldPrice,priceX,H*0.555,priceMaxW,'rgba(255,255,255,0.5)');
    drawAutoFitPrice(ctx,priceStr(CUR,currentPrice),priceX,H*0.655,priceMaxW,'#F5A623',[12,'rgba(0,0,0,0.5)',4,4]);
  } else {
    drawAutoFitPrice(ctx,priceStr(CUR,currentPrice),priceX,H*0.625,priceMaxW,'#F5A623',[12,'rgba(0,0,0,0.5)',4,4]);
  }

  // Tagline band — opcional y editable
  if (showTagline !== false) {
    fillRR(ctx,W*0.03,H*0.718,W*0.94,H*0.098,10,'rgba(0,0,0,0.2)');
    const tl = tagline || '¡No te lo pierdas! Oferta por tiempo limitado';
    const tlMaxW = W*0.86;
    let tlSz = Math.max(Math.round(H*0.028), 10);
    ctx.font = `italic 400 ${tlSz}px Georgia,serif`;
    // Reducir fuente si no cabe en una línea
    while (ctx.measureText(tl).width > tlMaxW && tlSz > 9) {
      tlSz -= 1;
      ctx.font = `italic 400 ${tlSz}px Georgia,serif`;
    }
    // Dividir en líneas si aún no cabe
    const tlLines = getLines(ctx, tl, tlMaxW);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.textAlign = 'center';
    const tlY = tlLines.length > 1 ? H*0.757 : H*0.775;
    tlLines.slice(0,2).forEach((l,i) => ctx.fillText(l, W*0.5, tlY + i*tlSz*1.35));
  }
  ctx.fillStyle='#F5A623'; ctx.fillRect(0,H*0.834,W,H*0.066);
  if(logo){ const fh=H*0.055,fw=fh*(logo.width/logo.height); ctx.drawImage(logo,W*0.5-fw/2,H*0.837,fw,fh); }
  else { ctx.font=`700 ${H*0.034}px Oswald,sans-serif`; ctx.fillStyle='#7A0010'; ctx.textAlign='center'; ctx.fillText(STORE_NAME,W*0.5,H*0.876); }
}

function drawTemplateVerde(ctx, W, H, img, { productName, currentPrice, oldPrice, currency, badgeText, tagline, showTagline, imageShape }, logo, pos) {
  const CUR = currency || 'Gs.';
  const bg=ctx.createLinearGradient(0,0,0,H); bg.addColorStop(0,'#1B4D20'); bg.addColorStop(1,'#0D2B10');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
  const tb=ctx.createLinearGradient(0,0,W,0); tb.addColorStop(0,'#2D6A31'); tb.addColorStop(1,'#1B4D20');
  ctx.fillStyle=tb; ctx.fillRect(0,0,W,H*0.22); ctx.fillStyle='#5CB85C'; ctx.fillRect(0,H*0.22,W,H*0.006);
  drawLogoPositioned(ctx,logo,W,H,pos,H*0.20,H*0.008);
  const _vc=getImageClip(W*0.08,H*0.238,W*0.84,H*0.43,imageShape);if(img){ctx.save();sh(ctx,W*0.06,'rgba(0,0,0,0.6)',0,W*0.02);clipRR(ctx,_vc.x,_vc.y,_vc.w,_vc.h,W*0.03);drawImageCover(ctx,img,_vc.x,_vc.y,_vc.w,_vc.h);ctx.restore();}
  else placeholder(ctx,W*0.08,H*0.238,W*0.84,H*0.43);
  ctx.save();ctx.translate(W*0.5,H*0.695);fillRR(ctx,-W*0.36,-H*0.034,W*0.72,H*0.068,30,'#5CB85C');
  ctx.font=`700 ${H*0.035}px Oswald,sans-serif`;ctx.fillStyle='#FFFFFF';ctx.textAlign='center';ctx.fillText(badgeText||'PRECIO ESPECIAL',0,H*0.02);ctx.restore();

  ctx.font=`600 ${H*0.049}px Oswald,sans-serif`;ctx.fillStyle='#FFFFFF';ctx.textAlign='center';sh(ctx,4,'rgba(0,0,0,0.4)');
  getLines(ctx,productName||'Nombre del Producto',W*0.82).slice(0,2).forEach((l,i)=>ctx.fillText(l,W*0.5,H*0.763+i*H*0.055));
  noSh(ctx);

  const maxW = W*0.88;
  if(oldPrice){
    drawOldPrice(ctx,CUR,oldPrice,W*0.5,H*0.852,maxW,'rgba(255,255,255,0.5)');
    drawAutoFitPrice(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.948,maxW,'#8DE88D',[8,'rgba(0,0,0,0.4)',2,4]);
  } else {
    drawAutoFitPrice(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.920,maxW,'#8DE88D',[8,'rgba(0,0,0,0.4)',2,4]);
  }
  drawTaglineFooter(ctx,W,H,tagline,showTagline,'rgba(100,220,100,0.55)');
  ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.fillRect(0,H*0.96,W,H*0.04);
  if(logo){const fh=H*0.035,fw=fh*(logo.width/logo.height);ctx.globalAlpha=0.45;ctx.drawImage(logo,W*0.5-fw/2,H*0.961,fw,fh);ctx.globalAlpha=1;}
}

function drawTemplateAzul(ctx, W, H, img, { productName, currentPrice, oldPrice, currency, badgeText, tagline, showTagline, imageShape }, logo, pos) {
  const CUR = currency || 'Gs.';
  ctx.fillStyle='#0D1B35'; ctx.fillRect(0,0,W,H);
  const gr=ctx.createRadialGradient(W*0.5,H*0.3,0,W*0.5,H*0.3,W*0.8);
  gr.addColorStop(0,'rgba(20,50,100,0.7)');gr.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=gr; ctx.fillRect(0,0,W,H);
  const gl=ctx.createLinearGradient(0,0,W,0);
  gl.addColorStop(0,'transparent');gl.addColorStop(0.2,'#F5A623');gl.addColorStop(0.8,'#F5A623');gl.addColorStop(1,'transparent');
  ctx.fillStyle=gl; ctx.fillRect(0,0,W,H*0.004);
  ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.fillRect(0,0,W,H*0.225);
  drawLogoPositioned(ctx,logo,W,H,pos,H*0.20,H*0.01);
  const _ac=getImageClip(W*0.1,H*0.235,W*0.8,H*0.43,imageShape);if(img){ctx.save();sh(ctx,W*0.08,'rgba(100,150,255,0.25)',0,0);clipRR(ctx,_ac.x,_ac.y,_ac.w,_ac.h,W*0.025);drawImageCover(ctx,img,_ac.x,_ac.y,_ac.w,_ac.h);ctx.restore();strokeRR(ctx,_ac.x,_ac.y,_ac.w,_ac.h,W*0.025,'rgba(245,166,35,0.45)',2);}
  else placeholder(ctx,W*0.1,H*0.235,W*0.8,H*0.43,'rgba(255,255,255,0.05)');
  ctx.save();ctx.translate(W*0.5,H*0.695);fillRR(ctx,-W*0.3,-H*0.024,W*0.6,H*0.048,20,'rgba(245,166,35,0.12)');
  strokeRR(ctx,-W*0.3,-H*0.024,W*0.6,H*0.048,20,'rgba(245,166,35,0.45)',1);
  ctx.font=`500 ${H*0.025}px Outfit,sans-serif`;ctx.fillStyle='#F5A623';ctx.textAlign='center';ctx.fillText(badgeText||'◆ PRODUCTO DESTACADO ◆',0,H*0.013);ctx.restore();

  ctx.font=`300 ${H*0.049}px Outfit,sans-serif`;ctx.fillStyle='#FFFFFF';ctx.textAlign='center';sh(ctx,4,'rgba(0,0,0,0.5)');
  getLines(ctx,productName||'Nombre del Producto',W*0.8).slice(0,2).forEach((l,i)=>ctx.fillText(l,W*0.5,H*0.755+i*H*0.053));
  noSh(ctx);

  const maxW = W*0.88;
  if(oldPrice){
    drawOldPrice(ctx,CUR,oldPrice,W*0.5,H*0.845,maxW,'rgba(255,255,255,0.4)');
    drawAutoFitPrice(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.948,maxW,'#F5A623',[10,'rgba(245,166,35,0.3)',0,0]);
  } else {
    drawAutoFitPrice(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.918,maxW,'#F5A623',[10,'rgba(245,166,35,0.3)',0,0]);
  }
  drawTaglineFooter(ctx,W,H,tagline,showTagline,'rgba(245,166,35,0.5)');
  ctx.fillStyle=gl; ctx.fillRect(0,H*0.971,W,H*0.004);
}

function drawTemplateNaranja(ctx, W, H, img, { productName, currentPrice, oldPrice, currency, badgeText, tagline, showTagline, imageShape }, logo, pos) {
  const CUR = currency || 'Gs.';
  const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#E8650A');bg.addColorStop(1,'#B34500');
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#FFFFFF';ctx.fillRect(0,0,W,H*0.22);ctx.fillStyle='#E8650A';ctx.fillRect(0,H*0.22,W,H*0.008);
  drawLogoPositioned(ctx,logo,W,H,pos,H*0.20,H*0.008);
  const _nc=getImageClip(W*0.13,H*0.24,W*0.74,H*0.41,imageShape);if(img){ctx.save();sh(ctx,W*0.05,'rgba(0,0,0,0.5)',W*0.01,W*0.015);clipRR(ctx,_nc.x,_nc.y,_nc.w,_nc.h,W*0.025);drawImageCover(ctx,img,_nc.x,_nc.y,_nc.w,_nc.h);ctx.restore();}
  else placeholder(ctx,W*0.13,H*0.24,W*0.74,H*0.41);
  fillRR(ctx,W*0.05,H*0.67,W*0.9,H*0.29,16,'rgba(255,255,255,0.11)');
  ctx.font=`600 ${H*0.047}px Oswald,sans-serif`;ctx.fillStyle='#FFFFFF';ctx.textAlign='center';sh(ctx,3,'rgba(0,0,0,0.3)');
  getLines(ctx,productName||'Nombre del Producto',W*0.84).slice(0,2).forEach((l,i)=>ctx.fillText(l,W*0.5,H*0.728+i*H*0.052));
  noSh(ctx);
  const maxW=W*0.88;
  if(oldPrice){drawOldPrice(ctx,CUR,oldPrice,W*0.5,H*0.838,maxW,'rgba(255,255,255,0.5)');drawAutoFitPrice(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.940,maxW,'#FFFFFF',[10,'rgba(0,0,0,0.4)',3,3]);}
  else{drawAutoFitPrice(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.905,maxW,'#FFFFFF',[10,'rgba(0,0,0,0.4)',3,3]);}
  drawTaglineFooter(ctx,W,H,tagline,showTagline,'rgba(255,200,150,0.55)');
  ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fillRect(0,H*0.958,W,H*0.042);
  if(logo){const fh=H*0.035,fw=fh*(logo.width/logo.height);ctx.globalAlpha=0.6;ctx.drawImage(logo,W*0.5-fw/2,H*0.959,fw,fh);ctx.globalAlpha=1;}
}

function drawTemplateMinimal(ctx, W, H, img, { productName, currentPrice, oldPrice, currency, badgeText, tagline, showTagline, imageShape }, logo, pos) {
  const CUR = currency || 'Gs.';
  ctx.fillStyle='#F7F7F5';ctx.fillRect(0,0,W,H);
  const ra=ctx.createLinearGradient(0,0,W,0);ra.addColorStop(0,'#C41E2A');ra.addColorStop(1,'#8B0010');
  ctx.fillStyle=ra;ctx.fillRect(0,0,W,H*0.22);
  drawLogoPositioned(ctx,logo,W,H,pos,H*0.20,H*0.008);
  if(img){ctx.save();sh(ctx,W*0.04,'rgba(0,0,0,0.12)',0,W*0.012);clipRR(ctx,W*0.06,H*0.235,W*0.88,H*0.44,W*0.02);drawImageCover(ctx,img,W*0.06,H*0.235,W*0.88,H*0.44);ctx.restore();}
  else{fillRR(ctx,W*0.06,H*0.235,W*0.88,H*0.44,W*0.02,'#EBEBEB');ctx.font=`${H*0.06}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('📷',W*0.5,H*0.455);ctx.font=`400 ${H*0.034}px Outfit,sans-serif`;ctx.fillStyle='#AAAAAA';ctx.fillText('Subí tu foto aquí',W*0.5,H*0.52);ctx.textBaseline='alphabetic';}
  ctx.fillStyle='#C41E2A';ctx.fillRect(W*0.06,H*0.695,W*0.88,2);
  ctx.font=`600 ${H*0.049}px Syne,sans-serif`;ctx.fillStyle='#1C1C1E';ctx.textAlign='center';
  getLines(ctx,productName||'Nombre del Producto',W*0.84).slice(0,2).forEach((l,i)=>ctx.fillText(l,W*0.5,H*0.748+i*H*0.055));
  const maxW=W*0.88;
  if(oldPrice){
    ctx.font=`400 ${H*0.034}px Outfit,sans-serif`;ctx.fillStyle='#AAAAAA';ctx.textAlign='center';
    const op=`Antes: ${priceStr(CUR,oldPrice)}`;ctx.fillText(op,W*0.5,H*0.84);
    const tw=ctx.measureText(op).width;ctx.beginPath();ctx.moveTo(W*0.5-tw/2,H*0.832);ctx.lineTo(W*0.5+tw/2,H*0.832);ctx.strokeStyle='#AAAAAA';ctx.lineWidth=2;ctx.stroke();
    drawAutoFitPastel(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.950,maxW,'#C41E2A');
  } else {
    drawAutoFitPastel(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.920,maxW,'#C41E2A');
  }
  drawTaglineFooter(ctx,W,H,tagline,showTagline,'rgba(100,100,100,0.55)');
  ctx.font=`400 ${H*0.024}px Outfit,sans-serif`;ctx.fillStyle='rgba(100,100,100,0.6)';ctx.textAlign='center';ctx.fillText(STORE_NAME,W*0.5,H*0.982);
}

// ─── NEÓN ─────────────────────────────────────────────────────────────────────

const NEON_LAYOUT = (ctx,W,H,img,logo,pos,borderColor,bgColor,lineColor) => {
  ctx.fillStyle=bgColor||'#08080F';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(0,0,W,H*0.225);
  ctx.save();ctx.strokeStyle=borderColor;ctx.lineWidth=H*0.003;sh(ctx,W*0.025,borderColor);
  ctx.beginPath();ctx.roundRect(W*0.025,H*0.008,W*0.95,H*0.984,8);ctx.stroke();ctx.restore();noSh(ctx);
  ctx.save();sh(ctx,15,lineColor||borderColor);ctx.fillStyle=lineColor||borderColor;ctx.fillRect(0,H*0.227,W,H*0.004);ctx.restore();noSh(ctx);
  drawLogoPositioned(ctx,logo,W,H,pos,H*0.20,H*0.01);
  if(img){ctx.save();clipRR(ctx,W*0.05,H*0.232,W*0.9,H*0.40,W*0.022);drawImageCover(ctx,img,W*0.05,H*0.232,W*0.9,H*0.40);ctx.restore();ctx.save();sh(ctx,20,borderColor);strokeRR(ctx,W*0.05,H*0.232,W*0.9,H*0.40,W*0.022,borderColor,2);ctx.restore();noSh(ctx);}
  else placeholder(ctx,W*0.05,H*0.232,W*0.9,H*0.40,`rgba(128,128,128,0.06)`);
};

const NEON_NAME = (ctx,W,H,productName,glowColor,textColor) => {
  ctx.font=`600 ${H*0.048}px Oswald,sans-serif`;ctx.fillStyle=textColor||'#FFFFFF';ctx.textAlign='center';
  getLines(ctx,productName||'Nombre del Producto',W*0.86).slice(0,2).forEach((l,i)=>ctx.fillText(l,W*0.5,H*0.72+i*H*0.054));
};

function drawNeonPink(ctx,W,H,img,{productName,currentPrice,oldPrice,currency,badgeText,tagline,showTagline,imageShape},logo,pos) {
  const CUR=currency||'Gs.';
  NEON_LAYOUT(ctx,W,H,img,logo,pos,'#FF1694','#08080F','#FF1694');
  ctx.save();ctx.font=`700 ${H*0.034}px Oswald,sans-serif`;ctx.textAlign='center';sh(ctx,12,'#FF1694');ctx.fillStyle='#FF1694';ctx.fillText(badgeText||'— OFERTA ESPECIAL —',W*0.5,H*0.665);ctx.restore();noSh(ctx);
  NEON_NAME(ctx,W,H,productName,'#FF1694','#FFFFFF');
  const maxW=W*0.88;
  if(oldPrice){drawOldPrice(ctx,CUR,oldPrice,W*0.5,H*0.828,maxW,'rgba(255,255,255,0.38)');drawNeonFitPrice(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.935,maxW,'#FF1694','#FFFFFF');}
  else{drawNeonFitPrice(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.905,maxW,'#FF1694','#FFFFFF');}
  drawTaglineFooter(ctx,W,H,tagline,showTagline,'rgba(255,25,148,0.5)');
}
function drawNeonCyan(ctx,W,H,img,{productName,currentPrice,oldPrice,currency,badgeText,tagline,showTagline,imageShape},logo,pos) {
  const CUR=currency||'Gs.';
  ctx.fillStyle='#020D18';ctx.fillRect(0,0,W,H);
  ctx.save();ctx.globalAlpha=0.04;for(let y=0;y<H;y+=4){ctx.fillStyle='#00FFFF';ctx.fillRect(0,y,W,1);}ctx.restore();
  ctx.fillStyle='rgba(0,20,35,0.6)';ctx.fillRect(0,0,W,H*0.228);ctx.save();sh(ctx,15,'#00E5FF');ctx.fillStyle='#00E5FF';ctx.fillRect(0,H*0.228,W,H*0.004);ctx.restore();noSh(ctx);
  drawLogoPositioned(ctx,logo,W,H,pos,H*0.20,H*0.01);
  if(img){ctx.save();clipRR(ctx,W*0.06,H*0.24,W*0.88,H*0.39,W*0.02);drawImageCover(ctx,img,W*0.06,H*0.24,W*0.88,H*0.39);ctx.restore();ctx.save();sh(ctx,18,'#00E5FF');strokeRR(ctx,W*0.06,H*0.24,W*0.88,H*0.39,W*0.02,'#00E5FF',2);ctx.restore();noSh(ctx);}
  else placeholder(ctx,W*0.06,H*0.24,W*0.88,H*0.39,'rgba(0,200,255,0.06)');
  ctx.save();ctx.font=`700 ${H*0.032}px Oswald,sans-serif`;ctx.textAlign='center';sh(ctx,10,'#00E5FF');ctx.fillStyle='#00E5FF';ctx.fillText(badgeText||'[ PRECIO ESPECIAL ]',W*0.5,H*0.66);ctx.restore();noSh(ctx);
  ctx.font=`500 ${H*0.048}px Oswald,sans-serif`;ctx.fillStyle='#E0FFFF';ctx.textAlign='center';
  getLines(ctx,productName||'Nombre del Producto',W*0.84).slice(0,2).forEach((l,i)=>ctx.fillText(l,W*0.5,H*0.717+i*H*0.054));
  const maxW=W*0.88;
  if(oldPrice){drawOldPrice(ctx,CUR,oldPrice,W*0.5,H*0.824,maxW,'rgba(200,255,255,0.35)');drawNeonFitPrice(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.930,maxW,'#00E5FF','#FFFFFF');}
  else{drawNeonFitPrice(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.900,maxW,'#00E5FF','#FFFFFF');}
  drawTaglineFooter(ctx,W,H,tagline,showTagline,'rgba(0,229,255,0.5)');
}
function drawNeonPurple(ctx,W,H,img,{productName,currentPrice,oldPrice,currency,badgeText,tagline,showTagline,imageShape},logo,pos) {
  const CUR=currency||'Gs.';
  const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#0D0015');bg.addColorStop(1,'#150025');
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fillRect(0,0,W,H*0.228);ctx.save();sh(ctx,15,'#C800FF');ctx.fillStyle='rgba(200,0,255,0.6)';ctx.fillRect(0,H*0.225,W,H*0.003);ctx.restore();noSh(ctx);
  drawLogoPositioned(ctx,logo,W,H,pos,H*0.20,H*0.01);
  if(img){ctx.save();clipRR(ctx,W*0.07,H*0.24,W*0.86,H*0.38,W*0.025);drawImageCover(ctx,img,W*0.07,H*0.24,W*0.86,H*0.38);ctx.restore();ctx.save();sh(ctx,20,'#C800FF');strokeRR(ctx,W*0.07,H*0.24,W*0.86,H*0.38,W*0.025,'#C800FF',2);ctx.restore();noSh(ctx);}
  else placeholder(ctx,W*0.07,H*0.24,W*0.86,H*0.38,'rgba(180,0,255,0.07)');
  fillRR(ctx,W*0.2,H*0.643,W*0.6,H*0.058,30,'rgba(200,0,255,0.12)');
  ctx.save();sh(ctx,12,'#C800FF');strokeRR(ctx,W*0.2,H*0.643,W*0.6,H*0.058,30,'#C800FF',1.5);
  ctx.font=`700 ${H*0.033}px Oswald,sans-serif`;ctx.fillStyle='#C800FF';ctx.textAlign='center';ctx.fillText(badgeText||'✦ OFERTA ESPECIAL ✦',W*0.5,H*0.682);ctx.restore();noSh(ctx);
  ctx.font=`500 ${H*0.048}px Oswald,sans-serif`;ctx.fillStyle='#F0D0FF';ctx.textAlign='center';
  getLines(ctx,productName||'Nombre del Producto',W*0.82).slice(0,2).forEach((l,i)=>ctx.fillText(l,W*0.5,H*0.746+i*H*0.053));
  const maxW=W*0.88;
  if(oldPrice){drawOldPrice(ctx,CUR,oldPrice,W*0.5,H*0.850,maxW,'rgba(220,180,255,0.38)');drawNeonFitPrice(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.950,maxW,'#C800FF','#FFFFFF');}
  else{drawNeonFitPrice(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.915,maxW,'#C800FF','#FFFFFF');}
  drawTaglineFooter(ctx,W,H,tagline,showTagline,'rgba(200,0,255,0.5)');
}
function drawNeonOrange(ctx,W,H,img,{productName,currentPrice,oldPrice,currency,badgeText,tagline,showTagline,imageShape},logo,pos) {
  const CUR=currency||'Gs.';
  ctx.fillStyle='#0C0800';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(10,5,0,0.55)';ctx.fillRect(0,0,W,H*0.228);ctx.save();sh(ctx,15,'#FF6600');ctx.fillStyle='rgba(255,100,0,0.7)';ctx.fillRect(0,H*0.226,W,H*0.004);ctx.restore();noSh(ctx);
  drawLogoPositioned(ctx,logo,W,H,pos,H*0.20,H*0.01);
  if(img){ctx.save();clipRR(ctx,W*0.06,H*0.238,W*0.88,H*0.38,W*0.022);drawImageCover(ctx,img,W*0.06,H*0.238,W*0.88,H*0.38);ctx.restore();ctx.save();sh(ctx,18,'#FF6600');strokeRR(ctx,W*0.06,H*0.238,W*0.88,H*0.38,W*0.022,'#FF6600',2);ctx.restore();noSh(ctx);}
  else placeholder(ctx,W*0.06,H*0.238,W*0.88,H*0.38,'rgba(255,100,0,0.07)');
  ctx.save();ctx.font=`700 ${H*0.033}px Oswald,sans-serif`;ctx.textAlign='center';sh(ctx,12,'#FF6600');ctx.fillStyle='#FF6600';ctx.fillText(badgeText||'🔥 SUPER PRECIO 🔥',W*0.5,H*0.648);ctx.restore();noSh(ctx);
  ctx.font=`600 ${H*0.048}px Oswald,sans-serif`;ctx.fillStyle='#FFE8CC';ctx.textAlign='center';
  getLines(ctx,productName||'Nombre del Producto',W*0.84).slice(0,2).forEach((l,i)=>ctx.fillText(l,W*0.5,H*0.705+i*H*0.053));
  const maxW=W*0.88;
  if(oldPrice){drawOldPrice(ctx,CUR,oldPrice,W*0.5,H*0.814,maxW,'rgba(255,220,180,0.38)');drawNeonFitPrice(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.925,maxW,'#FF6600','#FFFFFF');}
  else{drawNeonFitPrice(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.888,maxW,'#FF6600','#FFFFFF');}
  drawTaglineFooter(ctx,W,H,tagline,showTagline,'rgba(255,102,0,0.5)');
}
function drawNeonGreen(ctx,W,H,img,{productName,currentPrice,oldPrice,currency,badgeText,tagline,showTagline,imageShape},logo,pos) {
  const CUR=currency||'Gs.';
  ctx.fillStyle='#000D00';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(0,10,0,0.7)';ctx.fillRect(0,0,W,H*0.228);ctx.save();sh(ctx,15,'#00FF41');ctx.fillStyle='rgba(0,255,65,0.7)';ctx.fillRect(0,H*0.226,W,H*0.004);ctx.restore();noSh(ctx);
  drawLogoPositioned(ctx,logo,W,H,pos,H*0.20,H*0.01);
  if(img){ctx.save();clipRR(ctx,W*0.06,H*0.238,W*0.88,H*0.39,W*0.022);drawImageCover(ctx,img,W*0.06,H*0.238,W*0.88,H*0.39);ctx.restore();ctx.save();sh(ctx,20,'#00FF41');strokeRR(ctx,W*0.06,H*0.238,W*0.88,H*0.39,W*0.022,'#00FF41',2);ctx.restore();noSh(ctx);}
  else placeholder(ctx,W*0.06,H*0.238,W*0.88,H*0.39,'rgba(0,255,65,0.06)');
  ctx.save();ctx.font=`700 ${H*0.032}px Oswald,sans-serif`;ctx.textAlign='center';sh(ctx,10,'#00FF41');ctx.fillStyle='#00FF41';ctx.fillText(badgeText||'>> OFERTA ACTIVA <<',W*0.5,H*0.653);ctx.restore();noSh(ctx);
  ctx.font=`600 ${H*0.048}px Oswald,sans-serif`;ctx.fillStyle='#CCFFCC';ctx.textAlign='center';
  getLines(ctx,productName||'Nombre del Producto',W*0.84).slice(0,2).forEach((l,i)=>ctx.fillText(l,W*0.5,H*0.71+i*H*0.054));
  const maxW=W*0.88;
  if(oldPrice){drawOldPrice(ctx,CUR,oldPrice,W*0.5,H*0.820,maxW,'rgba(180,255,180,0.35)');drawNeonFitPrice(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.932,maxW,'#00FF41','#FFFFFF');}
  else{drawNeonFitPrice(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.895,maxW,'#00FF41','#FFFFFF');}
  drawTaglineFooter(ctx,W,H,tagline,showTagline,'rgba(0,255,65,0.5)');
}
function drawNeonGold(ctx,W,H,img,{productName,currentPrice,oldPrice,currency,badgeText,tagline,showTagline,imageShape},logo,pos) {
  const CUR=currency||'Gs.';
  const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#100800');bg.addColorStop(1,'#080500');
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  ctx.save();ctx.strokeStyle='rgba(255,215,0,0.8)';ctx.lineWidth=H*0.0025;sh(ctx,20,'rgba(255,215,0,0.8)');ctx.beginPath();ctx.roundRect(W*0.018,H*0.006,W*0.964,H*0.988,6);ctx.stroke();ctx.restore();noSh(ctx);
  ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,W,H*0.228);
  drawLogoPositioned(ctx,logo,W,H,pos,H*0.20,H*0.01);
  if(img){ctx.save();clipRR(ctx,W*0.07,H*0.24,W*0.86,H*0.39,W*0.025);drawImageCover(ctx,img,W*0.07,H*0.24,W*0.86,H*0.39);ctx.restore();ctx.save();sh(ctx,18,'#FFD700');strokeRR(ctx,W*0.07,H*0.24,W*0.86,H*0.39,W*0.025,'#FFD700',2);ctx.restore();noSh(ctx);}
  else placeholder(ctx,W*0.07,H*0.24,W*0.86,H*0.39,'rgba(255,200,0,0.06)');
  ctx.save();ctx.font=`500 ${H*0.03}px Outfit,sans-serif`;ctx.textAlign='center';sh(ctx,8,'#FFD700');ctx.fillStyle='#FFD700';ctx.fillText(badgeText||'◈ PRODUCTO PREMIUM ◈',W*0.5,H*0.655);ctx.restore();noSh(ctx);
  ctx.font=`400 ${H*0.048}px Outfit,sans-serif`;ctx.fillStyle='#FFF8E0';ctx.textAlign='center';
  getLines(ctx,productName||'Nombre del Producto',W*0.82).slice(0,2).forEach((l,i)=>ctx.fillText(l,W*0.5,H*0.712+i*H*0.053));
  const maxW=W*0.88;
  if(oldPrice){drawOldPrice(ctx,CUR,oldPrice,W*0.5,H*0.820,maxW,'rgba(255,240,180,0.38)');drawNeonFitPrice(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.930,maxW,'#FFD700','#FFFFFF');}
  else{drawNeonFitPrice(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.895,maxW,'#FFD700','#FFFFFF');}
  drawTaglineFooter(ctx,W,H,tagline,showTagline,'rgba(255,215,0,0.5)');
}

// ─── PASTELES ─────────────────────────────────────────────────────────────────

const PASTEL_CARD = (ctx,W,H,img,logo,pos,hdrColor1,hdrColor2,cardShadow,cardBg='#FFFFFF') => {
  const hg=ctx.createLinearGradient(0,0,0,H*0.22);hg.addColorStop(0,hdrColor1);hg.addColorStop(1,hdrColor2);
  ctx.fillStyle=hg;ctx.fillRect(0,0,W,H*0.22);
  drawLogoPositioned(ctx,logo,W,H,pos,H*0.20,H*0.008);
  ctx.save();sh(ctx,W*0.03,cardShadow,0,W*0.012);fillRR(ctx,W*0.055,H*0.228,W*0.89,H*0.44,W*0.025,cardBg);ctx.restore();
  if(img){ctx.save();clipRR(ctx,W*0.06,H*0.235,W*0.88,H*0.425,W*0.022);drawImageCover(ctx,img,W*0.06,H*0.235,W*0.88,H*0.425);ctx.restore();}
  else placeholder(ctx,W*0.06,H*0.235,W*0.88,H*0.425,'rgba(128,128,128,0.1)');
};

function drawPastelRosa(ctx,W,H,img,{productName,currentPrice,oldPrice,currency,badgeText,tagline,showTagline,imageShape},logo,pos) {
  const CUR=currency||'Gs.';
  const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#FFE8F0');bg.addColorStop(1,'#FFD0E4');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  PASTEL_CARD(ctx,W,H,img,logo,pos,'#FF8FB0','#FF6B9D','rgba(255,100,150,0.2)');
  fillRR(ctx,W*0.2,H*0.679,W*0.6,H*0.058,30,'#FF8FB0');ctx.font=`700 ${H*0.033}px Outfit,sans-serif`;ctx.fillStyle='#FFFFFF';ctx.textAlign='center';ctx.fillText(badgeText||'💕 OFERTA ESPECIAL 💕',W*0.5,H*0.718);
  ctx.font=`600 ${H*0.048}px Syne,sans-serif`;ctx.fillStyle='#6B2040';ctx.textAlign='center';
  getLines(ctx,productName||'Nombre del Producto',W*0.82).slice(0,2).forEach((l,i)=>ctx.fillText(l,W*0.5,H*0.778+i*H*0.053));
  const maxW=W*0.88;
  if(oldPrice){drawOldPrice(ctx,CUR,oldPrice,W*0.5,H*0.870,maxW,'rgba(180,100,130,0.55)');drawAutoFitPastel(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.962,maxW,'#FF6B9D');}
  else{drawAutoFitPastel(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.928,maxW,'#FF6B9D');}
    drawTaglineFooter(ctx,W,H,tagline,showTagline,'rgba(255,107,157,0.5)');
  ctx.font=`400 ${H*0.024}px Outfit,sans-serif`;ctx.fillStyle='rgba(180,80,120,0.5)';ctx.textAlign='center';ctx.fillText(STORE_NAME,W*0.5,H*0.986);
}
function drawPastelMenta(ctx,W,H,img,{productName,currentPrice,oldPrice,currency,badgeText,tagline,showTagline,imageShape},logo,pos) {
  const CUR=currency||'Gs.';
  const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#E8F8F0');bg.addColorStop(1,'#C8EFDA');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  PASTEL_CARD(ctx,W,H,img,logo,pos,'#5CB87A','#3D9B5E','rgba(60,180,100,0.15)');
  fillRR(ctx,W*0.18,H*0.679,W*0.64,H*0.058,30,'#5CB87A');ctx.font=`700 ${H*0.033}px Outfit,sans-serif`;ctx.fillStyle='#FFFFFF';ctx.textAlign='center';ctx.fillText(badgeText||'🌿 PRECIO FRESCO 🌿',W*0.5,H*0.718);
  ctx.font=`600 ${H*0.048}px Syne,sans-serif`;ctx.fillStyle='#1A4D2A';ctx.textAlign='center';
  getLines(ctx,productName||'Nombre del Producto',W*0.82).slice(0,2).forEach((l,i)=>ctx.fillText(l,W*0.5,H*0.778+i*H*0.053));
  const maxW=W*0.88;
  if(oldPrice){drawOldPrice(ctx,CUR,oldPrice,W*0.5,H*0.870,maxW,'rgba(80,160,100,0.55)');drawAutoFitPastel(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.962,maxW,'#3D9B5E');}
  else{drawAutoFitPastel(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.928,maxW,'#3D9B5E');}
    drawTaglineFooter(ctx,W,H,tagline,showTagline,'rgba(92,184,122,0.5)');
  ctx.font=`400 ${H*0.024}px Outfit,sans-serif`;ctx.fillStyle='rgba(60,130,80,0.5)';ctx.textAlign='center';ctx.fillText(STORE_NAME,W*0.5,H*0.986);
}
function drawPastelLavanda(ctx,W,H,img,{productName,currentPrice,oldPrice,currency,badgeText,tagline,showTagline,imageShape},logo,pos) {
  const CUR=currency||'Gs.';
  const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#F0E8FF');bg.addColorStop(1,'#DDD0F5');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  PASTEL_CARD(ctx,W,H,img,logo,pos,'#9B59B6','#7D3C98','rgba(150,80,200,0.18)');
  fillRR(ctx,W*0.2,H*0.679,W*0.6,H*0.058,30,'#9B59B6');ctx.font=`700 ${H*0.033}px Outfit,sans-serif`;ctx.fillStyle='#FFFFFF';ctx.textAlign='center';ctx.fillText(badgeText||'✨ OFERTA ESPECIAL ✨',W*0.5,H*0.718);
  ctx.font=`600 ${H*0.048}px Syne,sans-serif`;ctx.fillStyle='#4A1F6B';ctx.textAlign='center';
  getLines(ctx,productName||'Nombre del Producto',W*0.82).slice(0,2).forEach((l,i)=>ctx.fillText(l,W*0.5,H*0.778+i*H*0.053));
  const maxW=W*0.88;
  if(oldPrice){drawOldPrice(ctx,CUR,oldPrice,W*0.5,H*0.870,maxW,'rgba(120,60,160,0.5)');drawAutoFitPastel(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.962,maxW,'#7D3C98');}
  else{drawAutoFitPastel(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.928,maxW,'#7D3C98');}
    drawTaglineFooter(ctx,W,H,tagline,showTagline,'rgba(155,89,182,0.5)');
  ctx.font=`400 ${H*0.024}px Outfit,sans-serif`;ctx.fillStyle='rgba(100,50,140,0.5)';ctx.textAlign='center';ctx.fillText(STORE_NAME,W*0.5,H*0.986);
}
function drawPastelDurazno(ctx,W,H,img,{productName,currentPrice,oldPrice,currency,badgeText,tagline,showTagline,imageShape},logo,pos) {
  const CUR=currency||'Gs.';
  const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#FFF0E0');bg.addColorStop(1,'#FFE0C0');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  PASTEL_CARD(ctx,W,H,img,logo,pos,'#FF9040','#E06820','rgba(230,130,50,0.18)');
  fillRR(ctx,W*0.2,H*0.679,W*0.6,H*0.058,30,'#FF9040');ctx.font=`700 ${H*0.033}px Outfit,sans-serif`;ctx.fillStyle='#FFFFFF';ctx.textAlign='center';ctx.fillText(badgeText||'🍑 PRECIO ESPECIAL 🍑',W*0.5,H*0.718);
  ctx.font=`600 ${H*0.048}px Syne,sans-serif`;ctx.fillStyle='#6B2A00';ctx.textAlign='center';
  getLines(ctx,productName||'Nombre del Producto',W*0.82).slice(0,2).forEach((l,i)=>ctx.fillText(l,W*0.5,H*0.778+i*H*0.053));
  const maxW=W*0.88;
  if(oldPrice){drawOldPrice(ctx,CUR,oldPrice,W*0.5,H*0.870,maxW,'rgba(190,100,40,0.5)');drawAutoFitPastel(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.962,maxW,'#E06820');}
  else{drawAutoFitPastel(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.928,maxW,'#E06820');}
    drawTaglineFooter(ctx,W,H,tagline,showTagline,'rgba(255,144,64,0.5)');
  ctx.font=`400 ${H*0.024}px Outfit,sans-serif`;ctx.fillStyle='rgba(170,80,20,0.5)';ctx.textAlign='center';ctx.fillText(STORE_NAME,W*0.5,H*0.986);
}
function drawPastelCielo(ctx,W,H,img,{productName,currentPrice,oldPrice,currency,badgeText,tagline,showTagline,imageShape},logo,pos) {
  const CUR=currency||'Gs.';
  const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#E8F4FF');bg.addColorStop(1,'#C8E4FF');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  PASTEL_CARD(ctx,W,H,img,logo,pos,'#5B9FD4','#3B7AB0','rgba(60,130,200,0.15)');
  fillRR(ctx,W*0.2,H*0.679,W*0.6,H*0.058,30,'#5B9FD4');ctx.font=`700 ${H*0.033}px Outfit,sans-serif`;ctx.fillStyle='#FFFFFF';ctx.textAlign='center';ctx.fillText(badgeText||'☁️ PRECIO ESPECIAL ☁️',W*0.5,H*0.718);
  ctx.font=`600 ${H*0.048}px Syne,sans-serif`;ctx.fillStyle='#1A3D5C';ctx.textAlign='center';
  getLines(ctx,productName||'Nombre del Producto',W*0.82).slice(0,2).forEach((l,i)=>ctx.fillText(l,W*0.5,H*0.778+i*H*0.053));
  const maxW=W*0.88;
  if(oldPrice){drawOldPrice(ctx,CUR,oldPrice,W*0.5,H*0.870,maxW,'rgba(40,100,160,0.5)');drawAutoFitPastel(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.962,maxW,'#3B7AB0');}
  else{drawAutoFitPastel(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.928,maxW,'#3B7AB0');}
    drawTaglineFooter(ctx,W,H,tagline,showTagline,'rgba(91,159,212,0.5)');
  ctx.font=`400 ${H*0.024}px Outfit,sans-serif`;ctx.fillStyle='rgba(40,100,160,0.45)';ctx.textAlign='center';ctx.fillText(STORE_NAME,W*0.5,H*0.986);
}
function drawPastelLimon(ctx,W,H,img,{productName,currentPrice,oldPrice,currency,badgeText,tagline,showTagline,imageShape},logo,pos) {
  const CUR=currency||'Gs.';
  const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#FFFFF0');bg.addColorStop(1,'#F0FAD0');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  ctx.save();ctx.globalAlpha=0.07;for(let x=0;x<=W;x+=W*0.1)for(let y=0;y<=H;y+=H*0.05){ctx.beginPath();ctx.arc(x,y,W*0.012,0,Math.PI*2);ctx.fillStyle='#AADD00';ctx.fill();}ctx.restore();
  PASTEL_CARD(ctx,W,H,img,logo,pos,'#AADD00','#88BB00','rgba(150,200,0,0.15)');
  fillRR(ctx,W*0.2,H*0.679,W*0.6,H*0.058,30,'#AADD00');ctx.font=`700 ${H*0.033}px Outfit,sans-serif`;ctx.fillStyle='#FFFFFF';ctx.textAlign='center';ctx.fillText(badgeText||'🍋 PRECIO ESPECIAL 🍋',W*0.5,H*0.718);
  ctx.font=`600 ${H*0.048}px Syne,sans-serif`;ctx.fillStyle='#3A5000';ctx.textAlign='center';
  getLines(ctx,productName||'Nombre del Producto',W*0.82).slice(0,2).forEach((l,i)=>ctx.fillText(l,W*0.5,H*0.778+i*H*0.053));
  const maxW=W*0.88;
  if(oldPrice){drawOldPrice(ctx,CUR,oldPrice,W*0.5,H*0.870,maxW,'rgba(100,150,0,0.5)');drawAutoFitPastel(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.962,maxW,'#5A8800');}
  else{drawAutoFitPastel(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.928,maxW,'#5A8800');}
    drawTaglineFooter(ctx,W,H,tagline,showTagline,'rgba(170,221,0,0.5)');
  ctx.font=`400 ${H*0.024}px Outfit,sans-serif`;ctx.fillStyle='rgba(80,120,0,0.5)';ctx.textAlign='center';ctx.fillText(STORE_NAME,W*0.5,H*0.986);
}

// ─── Templates ───────────────────────────────────────────────────────────────

export const TEMPLATES = [
  { id:'rojo',          name:'Rojo Clásico',    category:'clasico', colors:['#C41E2A','#7A0010','#F5A623'], draw:(c,W,H,i,d,l,p)=>drawTemplateRojo(c,W,H,i,d,l,p) },
  { id:'verde',         name:'Verde Natural',   category:'clasico', colors:['#1B4D20','#2D6A31','#5CB85C'], draw:(c,W,H,i,d,l,p)=>drawTemplateVerde(c,W,H,i,d,l,p) },
  { id:'azul',          name:'Azul Premium',    category:'clasico', colors:['#0D1B35','#1A3560','#F5A623'], draw:(c,W,H,i,d,l,p)=>drawTemplateAzul(c,W,H,i,d,l,p) },
  { id:'naranja',       name:'Naranja Energía', category:'clasico', colors:['#E8650A','#B34500','#FFFFFF'], draw:(c,W,H,i,d,l,p)=>drawTemplateNaranja(c,W,H,i,d,l,p) },
  { id:'minimal',       name:'Minimalista',     category:'clasico', colors:['#F7F7F5','#C41E2A','#1C1C1E'], draw:(c,W,H,i,d,l,p)=>drawTemplateMinimal(c,W,H,i,d,l,p) },
  { id:'neon-pink',     name:'Neón Rosa',       category:'neon',    colors:['#08080F','#FF1694','#FFFFFF'],  draw:(c,W,H,i,d,l,p)=>drawNeonPink(c,W,H,i,d,l,p) },
  { id:'neon-cyan',     name:'Neón Cian',       category:'neon',    colors:['#020D18','#00E5FF','#FFFFFF'],  draw:(c,W,H,i,d,l,p)=>drawNeonCyan(c,W,H,i,d,l,p) },
  { id:'neon-purple',   name:'Neón Púrpura',    category:'neon',    colors:['#0D0015','#C800FF','#FFFFFF'],  draw:(c,W,H,i,d,l,p)=>drawNeonPurple(c,W,H,i,d,l,p) },
  { id:'neon-orange',   name:'Neón Naranja',    category:'neon',    colors:['#0C0800','#FF6600','#FFFFFF'],  draw:(c,W,H,i,d,l,p)=>drawNeonOrange(c,W,H,i,d,l,p) },
  { id:'neon-green',    name:'Neón Verde',      category:'neon',    colors:['#000D00','#00FF41','#CCFFCC'],  draw:(c,W,H,i,d,l,p)=>drawNeonGreen(c,W,H,i,d,l,p) },
  { id:'neon-gold',     name:'Neón Dorado',     category:'neon',    colors:['#100800','#FFD700','#FFF8E0'],  draw:(c,W,H,i,d,l,p)=>drawNeonGold(c,W,H,i,d,l,p) },
  { id:'pastel-rosa',   name:'Pastel Rosa',     category:'pastel',  colors:['#FFE8F0','#FF6B9D','#6B2040'], draw:(c,W,H,i,d,l,p)=>drawPastelRosa(c,W,H,i,d,l,p) },
  { id:'pastel-menta',  name:'Pastel Menta',    category:'pastel',  colors:['#E8F8F0','#5CB87A','#1A4D2A'], draw:(c,W,H,i,d,l,p)=>drawPastelMenta(c,W,H,i,d,l,p) },
  { id:'pastel-lavanda',name:'Pastel Lavanda',  category:'pastel',  colors:['#F0E8FF','#9B59B6','#4A1F6B'], draw:(c,W,H,i,d,l,p)=>drawPastelLavanda(c,W,H,i,d,l,p) },
  { id:'pastel-durazno',name:'Pastel Durazno',  category:'pastel',  colors:['#FFF0E0','#FF9040','#6B2A00'], draw:(c,W,H,i,d,l,p)=>drawPastelDurazno(c,W,H,i,d,l,p) },
  { id:'pastel-cielo',  name:'Pastel Cielo',    category:'pastel',  colors:['#E8F4FF','#5B9FD4','#1A3D5C'], draw:(c,W,H,i,d,l,p)=>drawPastelCielo(c,W,H,i,d,l,p) },
  { id:'pastel-limon',  name:'Pastel Limón',    category:'pastel',  colors:['#FFFFF0','#AADD00','#3A5000'], draw:(c,W,H,i,d,l,p)=>drawPastelLimon(c,W,H,i,d,l,p) },
  // ── Navidad
  { id:'navidad-clasico', name:'Navidad Clásico',  category:'navidad', colors:['#6B0000','#FFD700','#2D0000'], draw:(c,W,H,i,d,l,p)=>drawNavidadClasico(c,W,H,i,d,l,p) },
  { id:'navidad-nieve',   name:'Navidad Nieve',    category:'navidad', colors:['#061224','#7EC8E3','#0A2040'], draw:(c,W,H,i,d,l,p)=>drawNavidadNieve(c,W,H,i,d,l,p) },
  { id:'navidad-dorado',  name:'Navidad Dorado',   category:'navidad', colors:['#0C0800','#FFD700','#181000'], draw:(c,W,H,i,d,l,p)=>drawNavidadDorado(c,W,H,i,d,l,p) },
  { id:'navidad-verde',   name:'Navidad Verde',    category:'navidad', colors:['#0A2B0A','#FF4444','#051505'], draw:(c,W,H,i,d,l,p)=>drawNavidadVerde(c,W,H,i,d,l,p) },
  // ── Invierno
  { id:'invierno-azul',   name:'Invierno Azul',    category:'invierno', colors:['#050E1A','#5BB8D4','#0A1C30'], draw:(c,W,H,i,d,l,p)=>drawInviernoAzul(c,W,H,i,d,l,p) },
  { id:'invierno-polar',  name:'Invierno Polar',   category:'invierno', colors:['#020810','#00C8FF','#040C18'], draw:(c,W,H,i,d,l,p)=>drawInviernoPolar(c,W,H,i,d,l,p) },
  { id:'invierno-gris',   name:'Invierno Gris',    category:'invierno', colors:['#0D0F12','#A0B0C0','#181C20'], draw:(c,W,H,i,d,l,p)=>drawInviernoGris(c,W,H,i,d,l,p) },
  { id:'invierno-aurora', name:'Invierno Aurora',  category:'invierno', colors:['#040810','#00E0A0','#08100C'], draw:(c,W,H,i,d,l,p)=>drawInviernoAurora(c,W,H,i,d,l,p) },
  // ── Paraguay
  { id:'paraguay-rojo',   name:'Paraguay Rojo',    category:'paraguay', colors:['#C41020','#FFFFFF','#8A0010'], draw:(c,W,H,i,d,l,p)=>drawParaguayRojo(c,W,H,i,d,l,p) },
  { id:'paraguay-azul',   name:'Paraguay Azul',    category:'paraguay', colors:['#0036A8','#FFFFFF','#001E6E'], draw:(c,W,H,i,d,l,p)=>drawParaguayAzul(c,W,H,i,d,l,p) },
  { id:'paraguay-tricolor',name:'Paraguay Tricolor',category:'paraguay',colors:['#1A0A1A','#F5A623','#100808'], draw:(c,W,H,i,d,l,p)=>drawParaguayTricolor(c,W,H,i,d,l,p) },
  { id:'paraguay-selva',  name:'Paraguay Selva',   category:'paraguay', colors:['#0A2010','#5CB85C','#050D08'], draw:(c,W,H,i,d,l,p)=>drawParaguaySelva(c,W,H,i,d,l,p) },
  // ── Amor
  { id:'amor-rojo',       name:'Amor Rojo',        category:'amor',     colors:['#5C0010','#FF4466','#2A0008'], draw:(c,W,H,i,d,l,p)=>drawAmorRojo(c,W,H,i,d,l,p) },
  { id:'amor-rosa',       name:'Amor Rosa',        category:'amor',     colors:['#4A0A28','#FF80B0','#2A0518'], draw:(c,W,H,i,d,l,p)=>drawAmorRosa(c,W,H,i,d,l,p) },
  { id:'amor-vintage',    name:'Amor Vintage',     category:'amor',     colors:['#1A100A','#C8965A','#100808'], draw:(c,W,H,i,d,l,p)=>drawAmorVintage(c,W,H,i,d,l,p) },
  { id:'amor-neon',       name:'Amor Neón',        category:'amor',     colors:['#080010','#FF1493','#040008'], draw:(c,W,H,i,d,l,p)=>drawAmorNeon(c,W,H,i,d,l,p) },
  // ── Ñanduti
  { id:'nanduti-blanco',  name:'Ñanduti Blanco',   category:'nanduti',  colors:['#0A0A14','#FFFFFF','#050508'], draw:(c,W,H,i,d,l,p)=>drawNandutiBlanco(c,W,H,i,d,l,p) },
  { id:'nanduti-colorido',name:'Ñanduti Colorido', category:'nanduti',  colors:['#060A18','#FFD700','#030510'], draw:(c,W,H,i,d,l,p)=>drawNandutiColorido(c,W,H,i,d,l,p) },
  { id:'nanduti-dorado',  name:'Ñanduti Dorado',   category:'nanduti',  colors:['#200008','#FFD700','#0C0004'], draw:(c,W,H,i,d,l,p)=>drawNandutiDorado(c,W,H,i,d,l,p) },
  { id:'nanduti-solar',   name:'Ñanduti Solar',    category:'nanduti',  colors:['#080410','#FF8C00','#040208'], draw:(c,W,H,i,d,l,p)=>drawNandutiSolar(c,W,H,i,d,l,p) },
  // ── Mascotas
  { id:'mascotas-perro',    name:'Mascotas Perro',   category:'mascotas', colors:['#2A1508','#E8943A','#150A04'], draw:(c,W,H,i,d,l,p)=>drawMascotasPerro(c,W,H,i,d,l,p) },
  { id:'mascotas-gato',     name:'Mascotas Gato',    category:'mascotas', colors:['#180A22','#C880D8','#0C0514'], draw:(c,W,H,i,d,l,p)=>drawMascotasGato(c,W,H,i,d,l,p) },
  { id:'mascotas-colorido', name:'Mascotas Colorido',category:'mascotas', colors:['#042022','#FFD93D','#021214'], draw:(c,W,H,i,d,l,p)=>drawMascotasColorido(c,W,H,i,d,l,p) },
  { id:'mascotas-premium',  name:'Mascotas Premium', category:'mascotas', colors:['#080806','#FFD700','#040402'], draw:(c,W,H,i,d,l,p)=>drawMascotasPremium(c,W,H,i,d,l,p) },
];


// ─── Image shape helper ───────────────────────────────────────────────────────
// shape: 'wide' (default) | 'square' | 'portrait'
function getImageClip(x, y, w, h, shape) {
  if (shape === 'square') {
    const s = Math.min(w, h);
    return { x: x+(w-s)/2, y: y+(h-s)/2, w: s, h: s };
  }
  if (shape === 'portrait') {
    const pw = Math.min(w, h * 0.75);
    return { x: x+(w-pw)/2, y, w: pw, h };
  }
  return { x, y, w, h };
}

// ─── Tagline footer (shared by ALL templates) ─────────────────────────────────
function drawTaglineFooter(ctx, W, H, tagline, showTagline, color = 'rgba(255,255,255,0.5)') {
  if (!showTagline) return;
  const text = tagline || '';
  if (!text) return;
  const maxW = W * 0.86, yBase = H * 0.968;
  let sz = Math.max(Math.round(H * 0.022), 8);
  ctx.font = `italic 400 ${sz}px Georgia, serif`;
  while (ctx.measureText(text).width > maxW && sz > 7) {
    sz -= 1; ctx.font = `italic 400 ${sz}px Georgia, serif`;
  }
  const lines = getLines(ctx, text, maxW);
  ctx.fillStyle = color; ctx.textAlign = 'center';
  const y0 = lines.length > 1 ? yBase - sz * 0.75 : yBase;
  lines.slice(0,2).forEach((l,i) => ctx.fillText(l, W*0.5, y0 + i*sz*1.3));
}

// ─── Decorative helpers ───────────────────────────────────────────────────────

function drawSnowflake(ctx, cx, cy, size, color, opacity = 0.4) {
  ctx.save(); ctx.globalAlpha = opacity; ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, size*0.06); ctx.lineCap = 'round';
  ctx.translate(cx, cy);
  for (let arm = 0; arm < 6; arm++) {
    ctx.save(); ctx.rotate(arm*60*Math.PI/180);
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-size);
    for (const f of [0.45,0.7]) {
      ctx.moveTo(0,-size*f); ctx.lineTo(-size*0.22,-size*(f+0.18));
      ctx.moveTo(0,-size*f); ctx.lineTo( size*0.22,-size*(f+0.18));
    }
    ctx.stroke(); ctx.restore();
  }
  ctx.restore();
}

function drawHeartPath(ctx, cx, cy, size) {
  const s = size, x = cx - s/2, y = cy - s*0.45;
  ctx.beginPath();
  ctx.moveTo(cx, y + s*0.3);
  ctx.bezierCurveTo(cx, y,        x,         y,        x,         y+s*0.3);
  ctx.bezierCurveTo(x, y+s*0.6,  cx,         y+s*0.9, cx,         y+s);
  ctx.bezierCurveTo(cx,y+s*0.9,  cx+s,       y+s*0.6, cx+s,      y+s*0.3);
  ctx.bezierCurveTo(cx+s,y,      cx,          y,        cx,        y+s*0.3);
  ctx.closePath();
}

function drawNanduti(ctx, cx, cy, radius, col1, col2, opacity, segs = 12) {
  ctx.save(); ctx.globalAlpha = opacity; ctx.translate(cx, cy);
  const inner = radius * 0.12;
  for (let i = 0; i < segs; i++) {
    const a = (i/segs)*Math.PI*2, a2 = ((i+0.5)/segs)*Math.PI*2;
    const c = i%2===0 ? col1 : col2;
    ctx.strokeStyle = c; ctx.lineWidth = Math.max(1, radius*0.014);
    ctx.beginPath();
    ctx.moveTo(inner*Math.cos(a), inner*Math.sin(a));
    ctx.lineTo(radius*Math.cos(a), radius*Math.sin(a));
    ctx.stroke();
    for (const r of [radius*0.32, radius*0.58, radius*0.82]) {
      ctx.strokeStyle = i%3===0 ? col1 : col2;
      ctx.lineWidth = Math.max(0.5, radius*0.007);
      ctx.beginPath(); ctx.arc(0,0,r,a,a2); ctx.stroke();
    }
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.arc(radius*Math.cos(a),radius*Math.sin(a),radius*0.04,0,Math.PI*2); ctx.fill();
  }
  ctx.strokeStyle = col1; ctx.lineWidth = Math.max(1, radius*0.02);
  ctx.beginPath(); ctx.arc(0,0,inner,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle = col1; ctx.beginPath(); ctx.arc(0,0,radius*0.05,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

// ─── Shared theme base (used by all seasonal templates) ──────────────────────
function drawThemeBase(ctx, W, H, img, data, logo, pos, cfg) {
  const { productName, currentPrice, oldPrice, currency, badgeText, tagline, showTagline, imageShape } = data;
  const CUR = currency||'Gs.';
  const { bg1, bg2, bgX=0, bgY=0, bgX2=W, bgY2=H,
    accent, priceColor, nameColor='#FFFFFF',
    borderColor, headerOverlay='rgba(0,0,0,0.38)',
    defaultBadge='¡OFERTA!', badgeBg, badgeTextColor='#FFF',
    decorFn, taglineColor='rgba(255,255,255,0.5)',
    glowPrice=false } = cfg;

  const gr = ctx.createLinearGradient(bgX,bgY,bgX2||W,bgY2||H);
  gr.addColorStop(0,bg1); gr.addColorStop(1,bg2);
  ctx.fillStyle=gr; ctx.fillRect(0,0,W,H);

  if (borderColor) {
    ctx.save(); sh(ctx,W*0.022,borderColor);
    ctx.strokeStyle=borderColor; ctx.lineWidth=H*0.0025;
    ctx.beginPath(); ctx.roundRect(W*0.018,H*0.006,W*0.964,H*0.988,8); ctx.stroke();
    ctx.restore(); noSh(ctx);
  }

  ctx.fillStyle=headerOverlay; ctx.fillRect(0,0,W,H*0.225);
  ctx.save(); sh(ctx,8,accent); ctx.fillStyle=accent; ctx.fillRect(0,H*0.225,W,H*0.004); ctx.restore(); noSh(ctx);
  drawLogoPositioned(ctx,logo,W,H,pos,H*0.20,H*0.01);

  decorFn?.(ctx,W,H);

  // Image with shape
  const IX=W*0.06, IY=H*0.235, IW=W*0.88, IH=H*0.395;
  const ic = getImageClip(IX,IY,IW,IH,imageShape||'wide');
  if (img) {
    ctx.save(); sh(ctx,W*0.04,borderColor||'rgba(0,0,0,0.4)');
    ctx.save(); clipRR(ctx,ic.x,ic.y,ic.w,ic.h,W*0.022);
    drawImageCover(ctx,img,ic.x,ic.y,ic.w,ic.h);
    ctx.restore(); ctx.restore(); noSh(ctx);
    ctx.save(); sh(ctx,14,accent); strokeRR(ctx,ic.x,ic.y,ic.w,ic.h,W*0.022,accent,2); ctx.restore(); noSh(ctx);
  } else placeholder(ctx,ic.x,ic.y,ic.w,ic.h,'rgba(128,128,128,0.07)');

  // Badge
  const bdg = badgeText||defaultBadge;
  ctx.font=`700 ${H*0.032}px Oswald,sans-serif`;
  const bw = Math.min(ctx.measureText(bdg).width+W*0.08, W*0.88);
  fillRR(ctx,W*0.5-bw/2,H*0.648,bw,H*0.054,30,badgeBg||accent);
  ctx.font=`700 ${H*0.032}px Oswald,sans-serif`;
  ctx.fillStyle=badgeTextColor; ctx.textAlign='center';
  ctx.fillText(bdg,W*0.5,H*0.687);

  // Name
  ctx.font=`600 ${H*0.048}px Oswald,sans-serif`;
  ctx.fillStyle=nameColor; ctx.textAlign='center'; sh(ctx,4,'rgba(0,0,0,0.4)');
  getLines(ctx,productName||'Nombre del Producto',W*0.84).slice(0,2)
    .forEach((l,i)=>ctx.fillText(l,W*0.5,H*0.716+i*H*0.052));
  noSh(ctx);

  // Price
  const pc = priceColor||accent; const maxW=W*0.88;
  if (oldPrice) {
    drawOldPrice(ctx,CUR,oldPrice,W*0.5,H*0.822,maxW,'rgba(255,255,255,0.38)');
    glowPrice
      ? drawNeonFitPrice(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.930,maxW,pc,'#FFF')
      : drawAutoFitPrice(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.930,maxW,pc);
  } else {
    glowPrice
      ? drawNeonFitPrice(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.900,maxW,pc,'#FFF')
      : drawAutoFitPrice(ctx,priceStr(CUR,currentPrice),W*0.5,H*0.900,maxW,pc);
  }

  drawTaglineFooter(ctx,W,H,tagline,showTagline,taglineColor);
}

// ─── NAVIDAD ─────────────────────────────────────────────────────────────────

function snowDecor(count,color,opBase) {
  return (ctx,W,H) => {
    for(let i=0;i<count;i++){
      const cx=W*(0.04+Math.sin(i*1.7)*0.92), cy=H*(0.03+((i*0.137)%0.9));
      const sz=W*(0.012+Math.sin(i*2.3)*0.018);
      drawSnowflake(ctx,cx,cy,sz,color,opBase*(0.4+Math.sin(i*3.1)*0.3));
    }
  };
}

function starDecor(count,color,opacity){
  return (ctx,W,H) => {
    for(let i=0;i<count;i++){
      const cx=W*(0.05+((i*0.173)%0.9)), cy=H*(0.02+((i*0.251)%0.96));
      const r=W*(0.006+Math.sin(i*4.1)*0.006);
      ctx.save(); ctx.globalAlpha=opacity*(0.5+Math.sin(i*2.7)*0.3);
      ctx.fillStyle=color;
      ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
  };
}

function drawNavidadClasico(ctx,W,H,img,data,logo,pos){
  const stars=(c,W,H)=>{starDecor(35,'#FFD700',0.6)(c,W,H);snowDecor(12,'#FFF',0.35)(c,W,H);};
  drawThemeBase(ctx,W,H,img,data,logo,pos,{bg1:'#6B0000',bg2:'#2D0000',bgY2:H,accent:'#FFD700',
    priceColor:'#FFD700',defaultBadge:'🎄 OFERTA NAVIDEÑA 🎄',
    badgeBg:'rgba(139,0,0,0.8)',badgeTextColor:'#FFD700',decorFn:stars,
    taglineColor:'rgba(255,210,100,0.6)'});
}
function drawNavidadNieve(ctx,W,H,img,data,logo,pos){
  const deco=snowDecor(20,'#AADDFF',0.5);
  drawThemeBase(ctx,W,H,img,data,logo,pos,{bg1:'#061224',bg2:'#0A2040',bgY2:H,accent:'#7EC8E3',
    borderColor:'rgba(126,200,227,0.6)',defaultBadge:'❄️ PROMO NAVIDAD ❄️',
    badgeBg:'rgba(6,18,36,0.8)',decorFn:deco,glowPrice:true,
    taglineColor:'rgba(126,200,227,0.55)'});
}
function drawNavidadDorado(ctx,W,H,img,data,logo,pos){
  const deco=(c,W,H)=>{starDecor(40,'#FFD700',0.5)(c,W,H);};
  drawThemeBase(ctx,W,H,img,data,logo,pos,{bg1:'#0C0800',bg2:'#181000',bgY2:H,accent:'#FFD700',
    borderColor:'rgba(255,215,0,0.7)',defaultBadge:'🌟 ESPECIAL NAVIDAD 🌟',
    badgeBg:'rgba(12,8,0,0.85)',badgeTextColor:'#FFD700',decorFn:deco,glowPrice:true,
    taglineColor:'rgba(255,215,0,0.5)'});
}
function drawNavidadVerde(ctx,W,H,img,data,logo,pos){
  const deco=(c,W,H)=>{snowDecor(10,'#FFFFFF',0.25)(c,W,H);starDecor(20,'#FF4444',0.4)(c,W,H);};
  drawThemeBase(ctx,W,H,img,data,logo,pos,{bg1:'#0A2B0A',bg2:'#051505',bgY2:H,accent:'#FF4444',
    defaultBadge:'🎄 PROMO FIN DE AÑO 🎄',badgeBg:'rgba(139,0,0,0.9)',
    decorFn:deco,taglineColor:'rgba(255,120,120,0.55)'});
}

// ─── INVIERNO ─────────────────────────────────────────────────────────────────

function drawInviernoAzul(ctx,W,H,img,data,logo,pos){
  const deco=snowDecor(18,'#B0D8F0',0.45);
  drawThemeBase(ctx,W,H,img,data,logo,pos,{bg1:'#050E1A',bg2:'#0A1C30',bgY2:H,accent:'#5BB8D4',
    borderColor:'rgba(91,184,212,0.5)',defaultBadge:'❄ PRECIO DE INVIERNO ❄',
    badgeBg:'rgba(5,14,26,0.85)',decorFn:deco,glowPrice:true,
    taglineColor:'rgba(91,184,212,0.55)'});
}
function drawInviernoPolar(ctx,W,H,img,data,logo,pos){
  const deco=(c,W,H)=>{
    snowDecor(22,'#FFFFFF',0.4)(c,W,H);
    const gr=c.createRadialGradient(W*0.5,H*0.15,0,W*0.5,H*0.15,W*0.5);
    gr.addColorStop(0,'rgba(0,200,255,0.06)'); gr.addColorStop(1,'transparent');
    c.fillStyle=gr; c.fillRect(0,0,W,H);
  };
  drawThemeBase(ctx,W,H,img,data,logo,pos,{bg1:'#020810',bg2:'#040C18',bgY2:H,accent:'#00C8FF',
    borderColor:'rgba(0,200,255,0.5)',defaultBadge:'🧊 FRÍO PRECIO POLAR 🧊',
    badgeBg:'rgba(2,8,16,0.85)',decorFn:deco,glowPrice:true,
    taglineColor:'rgba(0,200,255,0.5)'});
}
function drawInviernoGris(ctx,W,H,img,data,logo,pos){
  const deco=snowDecor(14,'#C0C8D0',0.3);
  drawThemeBase(ctx,W,H,img,data,logo,pos,{bg1:'#0D0F12',bg2:'#181C20',bgY2:H,accent:'#A0B0C0',
    defaultBadge:'❄ OFERTA INVIERNO ❄',badgeBg:'rgba(13,15,18,0.9)',
    decorFn:deco,taglineColor:'rgba(160,176,192,0.55)'});
}
function drawInviernoAurora(ctx,W,H,img,data,logo,pos){
  const deco=(c,W,H)=>{
    const cols=['rgba(0,180,120,0.08)','rgba(100,0,200,0.07)','rgba(0,150,200,0.06)'];
    cols.forEach((col,i)=>{
      const gr=c.createRadialGradient(W*(0.2+i*0.3),H*(0.1+i*0.05),0,W*(0.2+i*0.3),H*0.5,W*0.6);
      gr.addColorStop(0,col); gr.addColorStop(1,'transparent');
      c.fillStyle=gr; c.fillRect(0,0,W,H);
    });
    snowDecor(8,'#80FFD0',0.25)(c,W,H);
  };
  drawThemeBase(ctx,W,H,img,data,logo,pos,{bg1:'#040810',bg2:'#08100C',bgY2:H,accent:'#00E0A0',
    defaultBadge:'🌌 PRECIO ESPECIAL 🌌',badgeBg:'rgba(0,80,50,0.8)',
    decorFn:deco,glowPrice:true,taglineColor:'rgba(0,224,160,0.5)'});
}

// ─── PARAGUAY ────────────────────────────────────────────────────────────────

function drawParaguayRojo(ctx,W,H,img,data,logo,pos){
  // Horizontal red/white stripes inspired by the flag
  const deco=(c,W,H)=>{
    c.fillStyle='rgba(255,255,255,0.04)';
    for(let i=0;i<H;i+=H*0.12){c.fillRect(0,i,W,H*0.06);}
  };
  drawThemeBase(ctx,W,H,img,data,logo,pos,{bg1:'#C41020',bg2:'#8A0010',bgY2:H,accent:'#FFFFFF',
    priceColor:'#FFFFFF',defaultBadge:'🇵🇾 OFERTA PARAGUAYA 🇵🇾',
    badgeBg:'rgba(140,0,16,0.9)',badgeTextColor:'#FFF',decorFn:deco,
    taglineColor:'rgba(255,255,255,0.55)'});
}
function drawParaguayAzul(ctx,W,H,img,data,logo,pos){
  // Blue and white, Coat of Arms feel
  const deco=(c,W,H)=>{
    const gr=c.createRadialGradient(W*0.5,H*0.5,W*0.1,W*0.5,H*0.5,W*0.7);
    gr.addColorStop(0,'rgba(255,255,255,0.04)'); gr.addColorStop(1,'transparent');
    c.fillStyle=gr; c.fillRect(0,0,W,H);
  };
  drawThemeBase(ctx,W,H,img,data,logo,pos,{bg1:'#0036A8',bg2:'#001E6E',bgY2:H,accent:'#FFFFFF',
    priceColor:'#FFFFFF',defaultBadge:'🇵🇾 PRECIO ESPECIAL 🇵🇾',
    badgeBg:'rgba(0,30,110,0.85)',badgeTextColor:'#FFF',decorFn:deco,
    taglineColor:'rgba(255,255,255,0.55)'});
}
function drawParaguayTricolor(ctx,W,H,img,data,logo,pos){
  // Red, white, blue horizontal tricolor
  const deco=(c,W,H)=>{
    c.save(); c.globalAlpha=0.12;
    c.fillStyle='#D52B1E'; c.fillRect(0,0,W,H*0.34);
    c.fillStyle='#FFFFFF'; c.fillRect(0,H*0.33,W,H*0.34);
    c.fillStyle='#0038A8'; c.fillRect(0,H*0.66,W,H*0.34);
    c.restore();
  };
  drawThemeBase(ctx,W,H,img,data,logo,pos,{bg1:'#1A0A1A',bg2:'#100808',bgY2:H,accent:'#F5A623',
    priceColor:'#F5A623',defaultBadge:'🌟 PRECIO ESPECIAL 🌟',
    badgeBg:'rgba(26,10,26,0.9)',decorFn:deco,
    taglineColor:'rgba(245,166,35,0.55)'});
}
function drawParaguaySelva(ctx,W,H,img,data,logo,pos){
  // Deep jungle green — the Paraguayan landscape
  const deco=(c,W,H)=>{
    const gr=c.createRadialGradient(W*0.5,0,0,W*0.5,0,W*0.7);
    gr.addColorStop(0,'rgba(100,200,80,0.06)'); gr.addColorStop(1,'transparent');
    c.fillStyle=gr; c.fillRect(0,0,W,H);
  };
  drawThemeBase(ctx,W,H,img,data,logo,pos,{bg1:'#0A2010',bg2:'#050D08',bgY2:H,accent:'#5CB85C',
    priceColor:'#8DE88D',defaultBadge:'🌿 PRECIO NATURAL 🌿',
    badgeBg:'rgba(10,32,16,0.9)',decorFn:deco,
    taglineColor:'rgba(92,184,92,0.55)'});
}

// ─── AMOR ────────────────────────────────────────────────────────────────────

function heartDecor(count,color,opacity){
  return (c,W,H) => {
    for(let i=0;i<count;i++){
      const cx=W*(0.04+((i*0.173)%0.92)), cy=H*(0.02+((i*0.211)%0.95));
      const sz=W*(0.018+Math.abs(Math.sin(i*2.7))*0.022);
      c.save(); c.globalAlpha=opacity*(0.3+Math.abs(Math.sin(i*3.1))*0.4);
      c.fillStyle=color; drawHeartPath(c,cx,cy,sz); c.fill(); c.restore();
    }
  };
}

function drawAmorRojo(ctx,W,H,img,data,logo,pos){
  drawThemeBase(ctx,W,H,img,data,logo,pos,{bg1:'#5C0010',bg2:'#2A0008',bgY2:H,accent:'#FF4466',
    priceColor:'#FF8899',defaultBadge:'❤️ PRECIO CON AMOR ❤️',
    badgeBg:'rgba(92,0,16,0.85)',decorFn:heartDecor(20,'#FF3355',0.35),
    glowPrice:true,taglineColor:'rgba(255,68,102,0.55)'});
}
function drawAmorRosa(ctx,W,H,img,data,logo,pos){
  drawThemeBase(ctx,W,H,img,data,logo,pos,{bg1:'#4A0A28',bg2:'#2A0518',bgY2:H,accent:'#FF80B0',
    priceColor:'#FFB0D0',defaultBadge:'💕 OFERTA ESPECIAL 💕',
    badgeBg:'rgba(74,10,40,0.85)',decorFn:heartDecor(16,'#FF69B4',0.3),
    glowPrice:true,taglineColor:'rgba(255,128,176,0.55)'});
}
function drawAmorVintage(ctx,W,H,img,data,logo,pos){
  // Sepia/vintage romantic feel
  const deco=(c,W,H)=>{
    heartDecor(12,'#C08060',0.2)(c,W,H);
    const gr=c.createRadialGradient(W*0.5,H*0.5,0,W*0.5,H*0.5,W*0.7);
    gr.addColorStop(0,'rgba(180,120,60,0.05)'); gr.addColorStop(1,'transparent');
    c.fillStyle=gr; c.fillRect(0,0,W,H);
  };
  drawThemeBase(ctx,W,H,img,data,logo,pos,{bg1:'#1A100A',bg2:'#100808',bgY2:H,accent:'#C8965A',
    priceColor:'#E8B070',defaultBadge:'♥ PRECIO ESPECIAL ♥',
    badgeBg:'rgba(26,16,10,0.9)',decorFn:deco,
    taglineColor:'rgba(200,150,90,0.55)'});
}
function drawAmorNeon(ctx,W,H,img,data,logo,pos){
  const deco=(c,W,H)=>{
    heartDecor(14,'#FF1493',0.28)(c,W,H);
    const gr=c.createRadialGradient(W*0.5,H*0.4,0,W*0.5,H*0.4,W*0.6);
    gr.addColorStop(0,'rgba(255,20,147,0.06)'); gr.addColorStop(1,'transparent');
    c.fillStyle=gr; c.fillRect(0,0,W,H);
  };
  drawThemeBase(ctx,W,H,img,data,logo,pos,{bg1:'#080010',bg2:'#040008',bgY2:H,accent:'#FF1493',
    borderColor:'rgba(255,20,147,0.6)',defaultBadge:'💘 PRECIO ESPECIAL 💘',
    badgeBg:'rgba(8,0,16,0.85)',decorFn:deco,glowPrice:true,
    taglineColor:'rgba(255,20,147,0.5)'});
}

// ─── ÑANDUTI ─────────────────────────────────────────────────────────────────

function nandutiDecor(positions, col1, col2, opacity, segs=12) {
  return (c,W,H) => {
    positions.forEach(([rx,ry,rr])=>{
      drawNanduti(c, W*rx, H*ry, W*rr, col1, col2, opacity, segs);
    });
  };
}

function drawNandutiBlanco(ctx,W,H,img,data,logo,pos){
  const deco=nandutiDecor([[0.5,0.5,0.42],[0.1,0.12,0.14],[0.9,0.88,0.14],[0.15,0.88,0.1],[0.85,0.12,0.1]],'#FFFFFF','#CCCCCC',0.12);
  drawThemeBase(ctx,W,H,img,data,logo,pos,{bg1:'#0A0A14',bg2:'#050508',bgY2:H,accent:'#FFFFFF',
    borderColor:'rgba(255,255,255,0.4)',defaultBadge:'✿ OFERTA ESPECIAL ✿',
    badgeBg:'rgba(10,10,20,0.85)',decorFn:deco,
    taglineColor:'rgba(255,255,255,0.5)'});
}
function drawNandutiColorido(ctx,W,H,img,data,logo,pos){
  // Traditional ñanduti — colorful, Itauguá style
  const COLS=['#FFD700','#FF4444','#4488FF','#44CC44','#FF88FF'];
  const deco=(c,W,H)=>{
    [[0.5,0.5,0.42],[0.1,0.12,0.13],[0.9,0.88,0.13]].forEach(([rx,ry,rr],i)=>{
      drawNanduti(c,W*rx,H*ry,W*rr,COLS[i%5],COLS[(i+2)%5],0.15,16);
    });
  };
  drawThemeBase(ctx,W,H,img,data,logo,pos,{bg1:'#060A18',bg2:'#030510',bgY2:H,accent:'#FFD700',
    borderColor:'rgba(255,215,0,0.5)',defaultBadge:'🌺 PRECIO PARAGUAYO 🌺',
    badgeBg:'rgba(6,10,24,0.85)',badgeTextColor:'#FFD700',decorFn:deco,
    taglineColor:'rgba(255,215,0,0.5)'});
}
function drawNandutiDorado(ctx,W,H,img,data,logo,pos){
  const deco=nandutiDecor([[0.5,0.5,0.42],[0.08,0.1,0.12],[0.92,0.9,0.12],[0.1,0.9,0.1],[0.9,0.1,0.1]],'#FFD700','#C8960A',0.14);
  drawThemeBase(ctx,W,H,img,data,logo,pos,{bg1:'#200008',bg2:'#0C0004',bgY2:H,accent:'#FFD700',
    borderColor:'rgba(200,150,10,0.6)',priceColor:'#FFD700',
    defaultBadge:'✦ PRECIO ESPECIAL ✦',badgeBg:'rgba(32,0,8,0.9)',badgeTextColor:'#FFD700',
    decorFn:deco,taglineColor:'rgba(255,215,0,0.5)'});
}
function drawNandutiSolar(ctx,W,H,img,data,logo,pos){
  // Sun-inspired ñanduti — orange/gold rays
  const deco=(c,W,H)=>{
    const gr=c.createRadialGradient(W*0.5,H*0.5,0,W*0.5,H*0.5,W*0.5);
    gr.addColorStop(0,'rgba(255,160,0,0.07)'); gr.addColorStop(1,'transparent');
    c.fillStyle=gr; c.fillRect(0,0,W,H);
    drawNanduti(c,W*0.5,H*0.5,W*0.43,'#FF8C00','#FFC040',0.13,18);
    drawNanduti(c,W*0.1,H*0.1,W*0.12,'#FFA500','#FFD700',0.12,10);
    drawNanduti(c,W*0.9,H*0.9,W*0.12,'#FFA500','#FFD700',0.12,10);
  };
  drawThemeBase(ctx,W,H,img,data,logo,pos,{bg1:'#080410',bg2:'#040208',bgY2:H,accent:'#FF8C00',
    borderColor:'rgba(255,140,0,0.55)',priceColor:'#FFC040',
    defaultBadge:'☀ PRECIO ESPECIAL ☀',badgeBg:'rgba(8,4,16,0.85)',badgeTextColor:'#FFC040',
    decorFn:deco,glowPrice:true,taglineColor:'rgba(255,140,0,0.5)'});
}


// ─── MASCOTAS ─────────────────────────────────────────────────────────────────

function drawPaw(ctx, cx, cy, size, color, opacity) {
  ctx.save(); ctx.globalAlpha = opacity; ctx.fillStyle = color;
  // Almohadilla principal
  ctx.beginPath();
  ctx.ellipse(cx, cy + size*0.12, size*0.52, size*0.46, 0, 0, Math.PI*2);
  ctx.fill();
  // 4 dedos
  [[-0.42,-0.52],[-0.14,-0.68],[0.14,-0.68],[0.42,-0.52]].forEach(([dx,dy],i) => {
    ctx.beginPath();
    ctx.ellipse(cx+dx*size, cy+dy*size, size*0.19, size*0.22, dx*0.25, 0, Math.PI*2);
    ctx.fill();
  });
  ctx.restore();
}

function drawBone(ctx, cx, cy, size, color, opacity, angle = 0) {
  ctx.save(); ctx.globalAlpha = opacity; ctx.fillStyle = color;
  ctx.translate(cx, cy); ctx.rotate(angle);
  // Barra central
  ctx.beginPath(); ctx.roundRect(-size*0.38, -size*0.1, size*0.76, size*0.2, size*0.1); ctx.fill();
  // Extremos redondeados
  [[-size*0.4, -size*0.22],[size*0.4, -size*0.22],[-size*0.4, size*0.22],[size*0.4, size*0.22]].forEach(([ex,ey]) => {
    ctx.beginPath(); ctx.arc(ex, ey, size*0.17, 0, Math.PI*2); ctx.fill();
  });
  ctx.restore();
}

function pawDecor(count, color, opacity, showBones = false) {
  return (ctx, W, H) => {
    for (let i = 0; i < count; i++) {
      const cx = W * (0.05 + ((i * 0.19) % 0.9));
      const cy = H * (0.02 + ((i * 0.137) % 0.95));
      const sz = W * (0.025 + Math.abs(Math.sin(i * 2.7)) * 0.02);
      const op = opacity * (0.3 + Math.abs(Math.sin(i * 3.1)) * 0.4);
      if (showBones && i % 3 === 0) {
        drawBone(ctx, cx, cy, sz * 1.4, color, op, Math.sin(i) * 0.8);
      } else {
        drawPaw(ctx, cx, cy, sz, color, op);
      }
    }
  };
}

function drawMascotasPerro(ctx, W, H, img, data, logo, pos) {
  const deco = pawDecor(18, '#D4956A', 0.35, true);
  drawThemeBase(ctx, W, H, img, data, logo, pos, {
    bg1: '#2A1508', bg2: '#150A04', bgY2: H,
    accent: '#E8943A',
    priceColor: '#F0B060',
    defaultBadge: '🐾 PRECIO ESPECIAL 🐾',
    badgeBg: 'rgba(42,21,8,0.88)',
    decorFn: deco,
    taglineColor: 'rgba(232,148,58,0.55)',
  });
}

function drawMascotasGato(ctx, W, H, img, data, logo, pos) {
  // Cat paws — smaller and more delicate
  const deco = (ctx, W, H) => {
    for (let i = 0; i < 16; i++) {
      const cx = W * (0.04 + ((i * 0.173) % 0.92));
      const cy = H * (0.02 + ((i * 0.211) % 0.96));
      const sz = W * (0.016 + Math.abs(Math.sin(i * 2.3)) * 0.014);
      drawPaw(ctx, cx, cy, sz, '#D4A0C8', 0.25 + Math.abs(Math.sin(i * 3.7)) * 0.25);
    }
  };
  drawThemeBase(ctx, W, H, img, data, logo, pos, {
    bg1: '#180A22', bg2: '#0C0514', bgY2: H,
    accent: '#C880D8',
    priceColor: '#DDA0EE',
    defaultBadge: '🐱 PRECIO ESPECIAL 🐱',
    badgeBg: 'rgba(24,10,34,0.88)',
    decorFn: deco,
    glowPrice: true,
    taglineColor: 'rgba(200,128,216,0.55)',
  });
}

function drawMascotasColorido(ctx, W, H, img, data, logo, pos) {
  const COLORS = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6FC8'];
  const deco = (ctx, W, H) => {
    for (let i = 0; i < 20; i++) {
      const cx = W * (0.04 + ((i * 0.157) % 0.92));
      const cy = H * (0.02 + ((i * 0.193) % 0.96));
      const sz = W * (0.018 + Math.abs(Math.sin(i * 2.1)) * 0.016);
      drawPaw(ctx, cx, cy, sz, COLORS[i % 5], 0.22 + Math.abs(Math.sin(i * 4.1)) * 0.28);
    }
  };
  drawThemeBase(ctx, W, H, img, data, logo, pos, {
    bg1: '#042022', bg2: '#021214', bgY2: H,
    accent: '#FFD93D',
    priceColor: '#FFE870',
    borderColor: 'rgba(255,217,61,0.5)',
    defaultBadge: '🐶 OFERTA MASCOTAS 🐶',
    badgeBg: 'rgba(4,32,34,0.88)',
    badgeTextColor: '#FFD93D',
    decorFn: deco,
    taglineColor: 'rgba(255,217,61,0.55)',
  });
}

function drawMascotasPremium(ctx, W, H, img, data, logo, pos) {
  const deco = (ctx, W, H) => {
    for (let i = 0; i < 14; i++) {
      const cx = W * (0.05 + ((i * 0.167) % 0.9));
      const cy = H * (0.02 + ((i * 0.231) % 0.96));
      const sz = W * (0.022 + Math.abs(Math.sin(i * 1.9)) * 0.018);
      drawPaw(ctx, cx, cy, sz, '#C8960A', 0.15 + Math.abs(Math.sin(i * 2.8)) * 0.2);
    }
  };
  drawThemeBase(ctx, W, H, img, data, logo, pos, {
    bg1: '#080806', bg2: '#040402', bgY2: H,
    accent: '#FFD700',
    priceColor: '#FFD700',
    borderColor: 'rgba(255,215,0,0.65)',
    defaultBadge: '🐾 PREMIUM PETS 🐾',
    badgeBg: 'rgba(8,8,6,0.9)',
    badgeTextColor: '#FFD700',
    decorFn: deco,
    glowPrice: true,
    taglineColor: 'rgba(255,215,0,0.5)',
  });
}

export const FORMATS = [
  { id:'story',     name:'Historia',   label:'WhatsApp / Instagram Story', width:1080, height:1920, icon:'📱' },
  { id:'square',    name:'Cuadrado',   label:'Instagram Feed / Facebook',  width:1080, height:1080, icon:'⬛' },
  { id:'landscape', name:'Horizontal', label:'Facebook / Web',             width:1200, height:628,  icon:'🖥️' },
];

export async function renderToCanvas(canvas, { templateId, imageUrl, productName, currentPrice, oldPrice, logoPosition = 'center', currency = 'Gs.', badgeText = '', tagline = '', showTagline = true, imageShape = 'wide', drawWidth, drawHeight }) {
  const template = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];
  const ctx = canvas.getContext('2d');
  // drawWidth/drawHeight are the CSS coordinate dimensions (= canvas.width / dpr).
  // When no DPR scaling is used (export), drawWidth === canvas.width.
  const W = drawWidth  || canvas.width;
  const H = drawHeight || canvas.height;
  try { await document.fonts.ready; } catch(_) {}
  const [img, logo] = await Promise.all([loadImage(imageUrl), loadLogo()]);
  ctx.clearRect(0, 0, W, H);
  template.draw(ctx, W, H, img, { productName, currentPrice, oldPrice, currency, badgeText, tagline, showTagline, imageShape }, logo, logoPosition);
}
