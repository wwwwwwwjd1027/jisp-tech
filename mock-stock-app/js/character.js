// ─── High-Quality Flat Vector Character System + Shop Catalog ──────────────────
// Chest-up stylized avatar portrait with modern shadows and gradients.
// Fits the JISP Pro aesthetic perfectly.

export function renderCharacter(equipped, custom, size = 300) {
  const skin = custom.skinColor || '#FFDCB5';
  const hairColor = custom.hairColor || '#4A3728';
  const eyeColor = custom.eyeColor || '#2C1810';
  const uid = 'c' + Math.random().toString(36).substr(2, 6);

  const bgSvg = equipped.background ? SHOP_ITEMS.find(i => i.id === equipped.background)?.svg || '' : DEFAULT_BG;
  const topSvg = equipped.top ? SHOP_ITEMS.find(i => i.id === equipped.top)?.svg || '' : '';
  const bottomSvg = equipped.bottom ? SHOP_ITEMS.find(i => i.id === equipped.bottom)?.svg || '' : '';
  const shoesSvg = equipped.shoes ? SHOP_ITEMS.find(i => i.id === equipped.shoes)?.svg || '' : '';
  const hatSvg = equipped.hat ? SHOP_ITEMS.find(i => i.id === equipped.hat)?.svg || '' : '';
  const accSvg = equipped.accessory ? SHOP_ITEMS.find(i => i.id === equipped.accessory)?.svg || '' : '';

  return `<svg viewBox="0 0 300 380" width="${size}" height="${size * 380/300}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Skin Gradient -->
      <radialGradient id="sk_${uid}" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stop-color="${lighten(skin, 15)}" />
        <stop offset="100%" stop-color="${skin}" />
      </radialGradient>
      <!-- Shadow Filter -->
      <filter id="sh_${uid}" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#0f172a" flood-opacity="0.12"/>
      </filter>
      <!-- Blush Gradient -->
      <radialGradient id="bl_${uid}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(244,63,94,0.3)" />
        <stop offset="100%" stop-color="rgba(244,63,94,0)" />
      </radialGradient>
      <!-- Golden Glow -->
      <radialGradient id="gl_${uid}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(245,158,11,0.2)" />
        <stop offset="100%" stop-color="rgba(245,158,11,0)" />
      </radialGradient>
    </defs>

    <!-- 1. Background -->
    <g>${bgSvg}</g>

    <!-- 2. Hair Back (for long hairstyles) -->
    <g>${getHairBack(custom.hairStyle, hairColor)}</g>

    <!-- 3. Base Neck & Shoulders Body Structure -->
    <g filter="url(#sh_${uid})">
      <!-- Torso Base (Shoulders) -->
      <path d="M 50 380 C 50 250, 250 250, 250 380 Z" fill="url(#sk_${uid})" />
      
      <!-- Neck -->
      <rect x="132" y="160" width="36" height="50" rx="8" fill="url(#sk_${uid})" />
      <path d="M 132 180 Q 150 195 168 180" fill="rgba(0,0,0,0.06)" />
    </g>

    <!-- 4. Innerwear (Re-interpreted Bottom slot) -->
    <g>${bottomSvg || defaultInner()}</g>

    <!-- 5. Outerwear (Top slot) -->
    <g>${topSvg || defaultOuter()}</g>

    <!-- 6. Neckwear / Lanyard / Chain (Re-interpreted Shoes slot) -->
    <g>${shoesSvg}</g>

    <!-- 7. Head -->
    <g filter="url(#sh_${uid})">
      <!-- Ears -->
      <ellipse cx="88" cy="120" rx="9" ry="13" fill="${skin}" />
      <ellipse cx="212" cy="120" rx="9" ry="13" fill="${skin}" />
      <!-- Head shape -->
      <ellipse cx="150" cy="115" rx="56" ry="62" fill="url(#sk_${uid})" />
    </g>

    <!-- 8. Face Features (High quality minimalist style) -->
    <g>
      <!-- Cheek Blush -->
      <ellipse cx="116" cy="132" rx="12" ry="7" fill="url(#bl_${uid})" />
      <ellipse cx="184" cy="132" rx="12" ry="7" fill="url(#bl_${uid})" />

      <!-- Eyes -->
      <g class="character-eyes">
        <!-- Left Eye -->
        <ellipse cx="124" cy="112" rx="11" ry="12" fill="white" />
        <ellipse cx="125" cy="113" rx="7" ry="8" fill="${eyeColor}" />
        <circle cx="128" cy="109" r="2.5" fill="white" />
        <path d="M 112 104 Q 124 98 134 104" stroke="${darken(skin, 35)}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        
        <!-- Right Eye -->
        <ellipse cx="176" cy="112" rx="11" ry="12" fill="white" />
        <ellipse cx="175" cy="113" rx="7" ry="8" fill="${eyeColor}" />
        <circle cx="178" cy="109" r="2.5" fill="white" />
        <path d="M 188 104 Q 176 98 166 104" stroke="${darken(skin, 35)}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      </g>

      <!-- Eyebrows -->
      <path d="M 112 95 Q 124 89 135 93" stroke="${hairColor}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M 188 95 Q 176 89 165 93" stroke="${hairColor}" stroke-width="3" fill="none" stroke-linecap="round"/>

      <!-- Nose -->
      <path d="M 148 118 Q 152 124 150 128" stroke="${darken(skin, 20)}" stroke-width="2" fill="none" stroke-linecap="round" />

      <!-- Smile -->
      <path d="M 140 138 Q 150 148 160 138" stroke="#0f172a" fill="none" stroke-width="2.5" stroke-linecap="round"/>
    </g>

    <!-- 9. Hair Front -->
    <g>${getHairFront(custom.hairStyle, hairColor)}</g>

    <!-- 10. Hat / Crown / Headband -->
    <g>${hatSvg}</g>

    <!-- 11. Accessories (Glasses / Visor / Chain) -->
    <g>${accSvg}</g>
  </svg>`;
}

/* ── Hair Styles ─────────────────────────── */
function getHairFront(style, color) {
  const d = darken(color, 12);
  switch (style) {
    case 'short':
      return `<path d="M 85 85 Q 90 40 125 30 Q 150 22 175 30 Q 210 40 215 85 Q 205 60 185 50 Q 150 40 150 44 Q 150 40 115 50 Q 95 60 85 85" fill="${color}" />
              <path d="M 100 70 Q 110 50 140 42 Q 150 38 150 44" fill="${d}" opacity="0.3"/>`;
    case 'long':
      return `<path d="M 85 85 Q 90 40 125 28 Q 150 20 175 28 Q 210 40 215 85 Q 220 130 215 190 L 208 190 Q 212 130 208 85 Q 200 55 185 45 Q 150 33 150 38 Q 150 33 115 45 Q 100 55 92 85 Q 88 130 92 190 L 85 190 Q 80 130 85 85 Z" fill="${color}" />
              <path d="M 100 65 Q 110 48 140 40 Q 150 35 150 40" fill="${d}" opacity="0.3"/>`;
    case 'curly':
      return `<path d="M 86 85 Q 84 35 125 24 Q 150 15 175 24 Q 216 35 214 85" fill="${color}" />
              <circle cx="86" cy="85" r="14" fill="${color}" />
              <circle cx="92" cy="110" r="11" fill="${color}" />
              <circle cx="214" cy="85" r="14" fill="${color}" />
              <circle cx="208" cy="110" r="11" fill="${color}" />
              <circle cx="150" cy="22" r="18" fill="${color}" />
              <circle cx="120" cy="26" r="16" fill="${color}" />
              <circle cx="180" cy="26" r="16" fill="${color}" />`;
    case 'ponytail':
      return `<path d="M 85 85 Q 90 40 125 28 Q 150 20 175 28 Q 210 40 215 85 Q 205 60 185 48 Q 150 38 150 42 Q 150 38 115 48 Q 95 60 85 85" fill="${color}" />`;
    case 'buzz':
      return `<path d="M 88 90 Q 90 50 125 40 Q 150 32 175 40 Q 210 50 212 90 Q 205 70 190 60 Q 150 50 150 52 Q 150 50 110 60 Q 95 70 88 90" fill="${color}" opacity="0.75" />`;
    default: // default
      return `<path d="M 85 85 Q 88 38 125 26 Q 150 18 175 26 Q 212 38 215 85 Q 208 60 188 48 Q 150 36 150 40 Q 150 36 112 48 Q 92 60 85 85" fill="${color}" />`;
  }
}

function getHairBack(style, color) {
  switch (style) {
    case 'long':
      return `<path d="M 80 100 Q 70 170 78 240 Q 82 280 100 310 Q 90 280 88 240 Q 80 170 88 100 Z" fill="${color}" opacity="0.8"/>
              <path d="M 220 100 Q 230 170 222 240 Q 218 280 200 310 Q 210 280 212 240 Q 220 170 212 100 Z" fill="${color}" opacity="0.8"/>`;
    case 'ponytail':
      return `<path d="M 210 55 Q 240 60 250 100 Q 255 140 242 190 Q 235 220 225 230 Q 230 190 235 140 Q 240 100 215 70 Z" fill="${color}" />`;
    default:
      return '';
  }
}

/* ── Default Clothes (Bust vector style) ─── */
function defaultOuter() {
  return `
    <!-- Royal Blue Crewneck Sweater -->
    <path d="M 70 380 L 70 310 C 70 280, 110 240, 150 240 C 190 240, 230 280, 230 310 L 230 380 Z" fill="#3b82f6" />
    <path d="M 125 240 Q 150 262 175 240" fill="#2563eb" />
  `;
}

function defaultInner() {
  return `
    <!-- White Inner Shirt Collar -->
    <path d="M 125 210 L 150 245 L 175 210 L 165 248 L 135 248 Z" fill="#ffffff" />
  `;
}

const DEFAULT_BG = `
  <rect width="300" height="380" rx="24" fill="url(#db_${Math.random().toString(36).substr(2,4)})" />
  <defs>
    <linearGradient id="db_temp" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#e2e8f0" />
    </linearGradient>
  </defs>
`;

/* ── Color Helpers ───────────────────────── */
function lighten(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + Math.round(2.55 * percent));
  const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(2.55 * percent));
  const b = Math.min(255, (num & 0x0000FF) + Math.round(2.55 * percent));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

function darken(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - Math.round(2.55 * percent));
  const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(2.55 * percent));
  const b = Math.max(0, (num & 0x0000FF) - Math.round(2.55 * percent));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}


/* ══════════════════════════════════════════
   HIGH-QUALITY SHOP ITEMS CATALOG
   ══════════════════════════════════════════ */

export const SHOP_ITEMS = [
  // ─── HATS (Headwear / Crowns / Headsets) ───
  { id: 'hat_cap_black', name: 'Black Street Cap', category: 'hat', rarity: 'common', price: 8,
    description: 'Minimalist black streetwear cap',
    emoji: '🧢',
    svg: `<path d="M 105 65 Q 110 32 150 28 Q 190 32 195 65 L 225 68 Q 228 60 218 56 L 195 56 Q 190 28 150 24 Q 110 28 105 56 L 82 56 Q 72 60 75 68 Z" fill="#0f172a"/>
          <ellipse cx="78" cy="62" rx="24" ry="4" fill="#1e293b"/>` },

  { id: 'hat_beanie_red', name: 'Red Beanie Hat', category: 'hat', rarity: 'common', price: 10,
    description: 'Cozy red urban beanie',
    emoji: '🎒',
    svg: `<path d="M 98 78 Q 94 32 150 24 Q 206 32 202 78" fill="#f43f5e"/>
          <path d="M 94 78 Q 150 86 206 78 Q 204 70 150 67 Q 96 70 94 78" fill="#e11d48"/>
          <circle cx="150" cy="22" r="8" fill="#f43f5e"/>` },

  { id: 'hat_crown', name: '👑 Golden VIP Crown', category: 'hat', rarity: 'epic', price: 150,
    description: 'Crown for elite high-profit premium traders',
    emoji: '👑',
    svg: `<path d="M 100 62 L 92 28 L 120 44 L 150 14 L 180 44 L 208 28 L 200 62 Z" fill="#eab308" filter="drop-shadow(0 4px 6px rgba(234,179,8,0.3))" />
          <circle cx="92" cy="26" r="3.5" fill="#ef4444"/>
          <circle cx="150" cy="12" r="4.5" fill="#3b82f6"/>
          <circle cx="208" cy="26" r="3.5" fill="#10b981"/>
          <rect x="100" y="58" width="100" height="5" fill="#ca8a04" rx="2"/>` },

  { id: 'hat_tophat', name: 'Wall Street Top Hat', category: 'hat', rarity: 'rare', price: 50,
    description: 'Classic gentleman top hat',
    emoji: '🎩',
    svg: `<rect x="115" y="10" width="70" height="52" rx="4" fill="#0f172a"/>
          <ellipse cx="150" cy="62" rx="55" ry="8" fill="#0f172a"/>
          <rect x="120" y="54" width="60" height="5" fill="#a855f7"/>` },

  { id: 'hat_headphones', name: 'Trading Floor Headset', category: 'hat', rarity: 'rare', price: 45,
    description: 'Pro headset for busy traders',
    emoji: '🎧',
    svg: `<path d="M 94 110 Q 88 45 150 40 Q 212 45 206 110" stroke="#475569" stroke-width="7" fill="none"/>
          <rect x="80" y="100" width="16" height="30" rx="8" fill="#1e293b"/>
          <rect x="204" y="100" width="16" height="30" rx="8" fill="#1e293b"/>
          <path d="M 85 125 L 75 145" stroke="#475569" stroke-width="2" fill="none"/>
          <circle cx="75" cy="145" r="3.5" fill="#1e293b"/>` },

  { id: 'hat_diamond', name: 'Glistening Tiara', category: 'hat', rarity: 'legendary', price: 400,
    description: 'Tiara made of pure white diamonds',
    emoji: '💎',
    svg: `<path d="M 105 68 L 120 32 L 150 20 L 180 32 L 195 68 Z" fill="none" stroke="#e2e8f0" stroke-width="4.5" filter="drop-shadow(0 0 10px rgba(255,255,255,0.8))" />
          <polygon points="150,20 144,52 156,52" fill="#38bdf8" opacity="0.9"/>
          <polygon points="120,32 125,56 142,50" fill="#7dd3fc" opacity="0.7"/>
          <polygon points="180,32 175,56 158,50" fill="#7dd3fc" opacity="0.7"/>
          <circle cx="150" cy="22" r="5" fill="#ffffff" />
          <circle cx="120" cy="34" r="4.5" fill="#ffffff" />
          <circle cx="180" cy="34" r="4.5" fill="#ffffff" />` },

  // ─── TOPS (Outerwear - Suits / Jackets / Blazers) ───
  { id: 'top_hoodie_gray', name: 'Silicon Valley Hoodie', category: 'top', rarity: 'common', price: 12,
    description: 'Comfy developer gray hoodie',
    emoji: '🧥',
    svg: `<path d="M 68 380 L 68 310 C 68 280, 108 240, 150 240 C 192 240, 232 280, 232 310 L 232 380 Z" fill="#64748b" />
          <path d="M 115 240 C 115 210, 185 210, 185 240 Z" fill="#475569" opacity="0.5"/>
          <circle cx="140" cy="275" r="3" fill="#cbd5e1" />
          <circle cx="160" cy="275" r="3" fill="#cbd5e1" />
          <path d="M 140 278 L 140 310" stroke="#cbd5e1" stroke-width="2" fill="none" />
          <path d="M 160 278 L 160 305" stroke="#cbd5e1" stroke-width="2" fill="none" />` },

  { id: 'top_suit_navy', name: 'Navy Executive Blazer', category: 'top', rarity: 'rare', price: 60,
    description: 'Sharp navy blazer with white pocket square',
    emoji: '🤵',
    svg: `<path d="M 64 380 L 64 300 C 64 270, 104 235, 150 235 C 196 235, 236 270, 236 300 L 236 380 Z" fill="#1e3a8a" />
          <!-- Blazer Lapels -->
          <path d="M 105 235 L 140 310 L 150 235" fill="#1d4ed8" />
          <path d="M 195 235 L 160 310 L 150 235" fill="#1d4ed8" />
          <!-- Gold Buttons -->
          <circle cx="157" cy="325" r="4.5" fill="#fbbf24" />
          <circle cx="157" cy="350" r="4.5" fill="#fbbf24" />
          <!-- Pocket Square -->
          <polygon points="85,295 98,285 105,295" fill="#ffffff" />
          <rect x="85" y="295" width="22" height="4" fill="#1d4ed8" />` },

  { id: 'top_tshirt_green', name: 'Bullish Designer Tee', category: 'top', rarity: 'common', price: 10,
    description: 'Green graphic t-shirt for daily gains',
    emoji: '👕',
    svg: `<path d="M 70 380 L 70 315 C 70 285, 110 245, 150 245 C 190 245, 230 285, 230 315 L 230 380 Z" fill="#10b981" />
          <path d="M 128 245 Q 150 262 172 245" fill="#047857" />
          <text x="150" y="325" text-anchor="middle" font-size="34" font-weight="900" fill="#064e3b" opacity="0.3">📈</text>` },

  { id: 'top_tshirt_red', name: 'Bearish Designer Tee', category: 'top', rarity: 'common', price: 10,
    description: 'Red designer tee - hedges are on!',
    emoji: '👕',
    svg: `<path d="M 70 380 L 70 315 C 70 285, 110 245, 150 245 C 190 245, 230 285, 230 315 L 230 380 Z" fill="#ef4444" />
          <path d="M 128 245 Q 150 262 172 245" fill="#b91c1c" />
          <text x="150" y="325" text-anchor="middle" font-size="34" font-weight="900" fill="#7f1d1d" opacity="0.3">📉</text>` },

  { id: 'top_leather', name: 'Rebel Leather Jacket', category: 'top', rarity: 'rare', price: 75,
    description: 'Cool black leather jacket',
    emoji: '🧥',
    svg: `<path d="M 64 380 L 64 300 C 64 270, 104 235, 150 235 C 196 235, 236 270, 236 300 L 236 380 Z" fill="#1e293b" />
          <!-- Metallic Zippers & Lapels -->
          <path d="M 100 235 L 135 320 L 150 235" fill="#334155" />
          <path d="M 200 235 L 165 320 L 150 235" fill="#334155" />
          <path d="M 132 285 L 138 380" stroke="#94a3b8" stroke-width="2.5" fill="none" />
          <path d="M 168 285 L 162 380" stroke="#94a3b8" stroke-width="2.5" fill="none" />` },

  { id: 'top_buffett', name: 'CEO Charcoal Suit', category: 'top', rarity: 'legendary', price: 500,
    description: 'Executive double-breasted formal charcoal suit',
    emoji: '💼',
    svg: `<path d="M 60 380 L 60 295 C 60 265, 100 230, 150 230 C 200 230, 240 265, 240 295 L 240 380 Z" fill="#334155" />
          <path d="M 100 230 L 142 300 L 150 230" fill="#1e293b" />
          <path d="M 200 230 L 158 300 L 150 230" fill="#1e293b" />
          <!-- Golden Badge Pin -->
          <circle cx="95" cy="275" r="4.5" fill="#f59e0b" filter="drop-shadow(0 0 4px #fbbf24)" />
          <!-- Purple Silk Tie -->
          <polygon points="144,242 156,242 160,305 150,320 140,305" fill="#8b5cf6" />` },

  // ─── BOTTOMS (Re-interpreted Innerwear / Shirts / Collars) ───
  { id: 'bottom_jeans', name: 'Blue Oxford Collar', category: 'bottom', rarity: 'common', price: 10,
    description: 'Classic blue button-down shirt collar',
    emoji: '👖',
    svg: `<path d="M 125 210 L 150 250 L 175 210 L 162 254 L 138 254 Z" fill="#93c5fd" />
          <circle cx="150" cy="232" r="1.5" fill="#1e40af" />
          <circle cx="150" cy="245" r="1.5" fill="#1e40af" />` },

  { id: 'bottom_chinos', name: 'Beige Casual Shirt', category: 'bottom', rarity: 'common', price: 12,
    description: 'Casual beige business-casual inner shirt',
    emoji: '👖',
    svg: `<path d="M 125 210 L 150 250 L 175 210 L 162 254 L 138 254 Z" fill="#fed7aa" />
          <circle cx="150" cy="232" r="1.5" fill="#ea580c" />` },

  { id: 'bottom_suit_pants', name: 'Premium Silk Necktie', category: 'bottom', rarity: 'rare', price: 40,
    description: 'Formal white shirt with executive black necktie',
    emoji: '👔',
    svg: `<path d="M 125 210 L 150 250 L 175 210 L 162 254 L 138 254 Z" fill="#ffffff" />
          <!-- Black Tie -->
          <polygon points="146,245 154,245 157,330 150,345 143,330" fill="#0f172a" />` },

  { id: 'bottom_gold_pants', name: 'Golden Silk Collar', category: 'bottom', rarity: 'epic', price: 120,
    description: 'Innerwear made of glowing golden threads',
    emoji: '✨',
    svg: `<path d="M 125 210 L 150 250 L 175 210 L 162 254 L 138 254 Z" fill="#fbbf24" filter="drop-shadow(0 0 6px #f59e0b)"/>` },

  // ─── SHOES (Re-interpreted Lanyards / Badges / Neck Scarf) ───
  { id: 'shoes_sneakers_white', name: 'White Tech Lanyard', category: 'shoes', rarity: 'common', price: 8,
    description: 'Silicon Valley developer badge lanyard',
    emoji: '👟',
    svg: `<path d="M 120 220 C 120 330, 180 330, 180 220" stroke="#f8fafc" stroke-width="3" fill="none" />
          <!-- White Developer Card -->
          <rect x="138" y="305" width="24" height="32" rx="3" fill="#ffffff" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
          <rect x="142" y="310" width="16" height="4" fill="#3b82f6" />
          <rect x="142" y="320" width="16" height="2" fill="#64748b" />
          <rect x="142" y="326" width="10" height="2" fill="#64748b" />` },

  { id: 'shoes_loafers', name: 'Cashmere Scarf', category: 'shoes', rarity: 'rare', price: 35,
    description: 'Cozy cashmere orange neck scarf',
    emoji: '👞',
    svg: `<path d="M 112 210 Q 150 240 188 210 L 195 235 Q 150 265 105 235 Z" fill="#ea580c" />
          <!-- Scarf knot hanging -->
          <path d="M 170 238 L 182 320 L 162 315 Z" fill="#c2410c" />` },

  { id: 'shoes_boots', name: 'Premium Black Choker', category: 'shoes', rarity: 'rare', price: 40,
    description: 'Chic black leather neck strap with metallic tag',
    emoji: '🥾',
    svg: `<path d="M 132 205 C 132 225, 168 225, 168 205" stroke="#0f172a" stroke-width="5" fill="none" />
          <!-- Silver Tag -->
          <polygon points="150,215 144,228 156,228" fill="#e2e8f0" />` },

  { id: 'shoes_diamond', name: 'Hologram Cyber Amulet', category: 'shoes', rarity: 'legendary', price: 350,
    description: 'Glowing crystal diamond floating on chest',
    emoji: '💎',
    svg: `<path d="M 126 215 C 126 290, 174 290, 174 215" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="3,3" fill="none" />
          <!-- Floating Glowing Gem -->
          <polygon points="150,260 138,275 150,295 162,275" fill="#38bdf8" filter="drop-shadow(0 0 10px #0ea5e9)" />
          <polygon points="150,260 143,275 150,295" fill="#e0f2fe" opacity="0.6"/>` },

  // ─── ACCESSORIES (Eyewear / Cyber Visor / Watches / Wings) ───
  { id: 'acc_sunglasses', name: 'Aviator Dark Shades', category: 'accessory', rarity: 'common', price: 15,
    description: 'Sleek black shades',
    emoji: '🕶️',
    svg: `<g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.2))">
            <!-- Left lens -->
            <path d="M 106 112 C 106 128, 134 128, 138 112 Z" fill="#0f172a" opacity="0.95" />
            <!-- Right lens -->
            <path d="M 194 112 C 194 128, 166 128, 162 112 Z" fill="#0f172a" opacity="0.95" />
            <!-- Metallic Frame connection -->
            <path d="M 136 111 L 164 111" stroke="#f1f5f9" stroke-width="2.5" />
            <path d="M 108 108 L 86 112" stroke="#f1f5f9" stroke-width="1.5" />
            <path d="M 192 108 L 214 112" stroke="#f1f5f9" stroke-width="1.5" />
          </g>` },

  { id: 'acc_watch_gold', name: 'Hologram Tech Watch', category: 'accessory', rarity: 'rare', price: 65,
    description: 'Holographic golden clock widget floating beside avatar',
    emoji: '⌚',
    svg: `<g filter="drop-shadow(0 0 8px #fbbf24)">
            <circle cx="50" cy="180" r="22" fill="rgba(245,158,11,0.06)" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3,3" />
            <text x="50" y="185" text-anchor="middle" font-size="10" font-weight="900" fill="#fbbf24">PRO</text>
            <!-- Hand details -->
            <line x1="50" y1="180" x2="50" y2="168" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>
            <line x1="50" y1="180" x2="60" y2="180" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>
          </g>` },

  { id: 'acc_necklace', name: 'Bling Dollar Chain', category: 'accessory', rarity: 'rare', price: 55,
    description: 'Thick golden chain with a massive dollar sign',
    emoji: '💲',
    svg: `<g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))">
            <path d="M 115 220 Q 150 265 185 220" stroke="#f59e0b" stroke-width="5.5" fill="none" />
            <circle cx="150" cy="272" r="15" fill="#eab308" />
            <text x="150" y="278" text-anchor="middle" font-size="20" font-weight="900" fill="#451a03">$</text>
          </g>` },

  { id: 'acc_monocle', name: 'Gold Cyber Visor', category: 'accessory', rarity: 'epic', price: 180,
    description: 'High-tech neon HUD scanner visor',
    emoji: '🧐',
    svg: `<g filter="drop-shadow(0 0 10px #c084fc)">
            <!-- Cyber Visor bar across face -->
            <path d="M 102 108 L 198 108 L 194 122 L 106 122 Z" fill="rgba(168,85,247,0.3)" stroke="#c084fc" stroke-width="2" />
            <line x1="102" y1="108" x2="88" y2="114" stroke="#c084fc" stroke-width="1.5" />
            <line x1="198" y1="108" x2="212" y2="114" stroke="#c084fc" stroke-width="1.5" />
            <!-- Floating data tick markers -->
            <rect x="110" y="112" width="6" height="4" fill="#a855f7" />
            <rect x="184" y="112" width="6" height="4" fill="#a855f7" />
          </g>` },

  { id: 'acc_rocket', name: 'Holographic Angel Wings', category: 'accessory', rarity: 'legendary', price: 450,
    description: 'Beautiful glowing cyan angel wings behind character',
    emoji: '🚀',
    svg: `<g filter="drop-shadow(0 0 12px #38bdf8)">
            <!-- Left Wing -->
            <path d="M 94 220 C 50 170, 0 200, 10 260 C 20 310, 70 290, 94 250 Z" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" stroke-width="2.5" />
            <path d="M 70 225 Q 30 200 40 250" stroke="#7dd3fc" stroke-width="1.5" fill="none" />
            <!-- Right Wing -->
            <path d="M 206 220 C 250 170, 300 200, 290 260 C 280 310, 230 290, 206 250 Z" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" stroke-width="2.5" />
            <path d="M 230 225 Q 270 200 260 250" stroke="#7dd3fc" stroke-width="1.5" fill="none" />
          </g>` },

  // ─── BACKGROUNDS ───
  { id: 'bg_office', name: 'Penthouse Office', category: 'background', rarity: 'common', price: 15,
    description: 'Sleek luxury office view background',
    emoji: '🏢',
    svg: `<rect width="300" height="380" rx="24" fill="#0f172a"/>
          <!-- Grid Window structures -->
          <rect x="15" y="15" width="270" height="350" rx="16" fill="#1e293b" />
          <line x1="150" y1="15" x2="150" y2="365" stroke="#334155" stroke-width="3" />
          <line x1="15" y1="200" x2="285" y2="200" stroke="#334155" stroke-width="3" />
          <!-- Floating Skyscrapers silhouettes outside window -->
          <rect x="35" y="100" width="40" height="100" fill="#0f172a" opacity="0.4" />
          <rect x="225" y="70" width="45" height="130" fill="#0f172a" opacity="0.4" />` },

  { id: 'bg_trading', name: 'WallStreet Server Glow', category: 'background', rarity: 'rare', price: 50,
    description: 'Bustling server array background',
    emoji: '📊',
    svg: `<rect width="300" height="380" rx="24" fill="#020617"/>
          <!-- Grid pattern -->
          ${Array.from({length: 8}, (_, i) => `<line x1="0" y1="${i*55}" x2="300" y2="${i*55}" stroke="#1e293b" stroke-width="1" opacity="0.4"/>`).join('')}
          ${Array.from({length: 6}, (_, i) => `<line x1="${i*60}" y1="0" x2="${i*60}" y2="380" stroke="#1e293b" stroke-width="1" opacity="0.4"/>`).join('')}
          <!-- Tech data curves -->
          <path d="M 0 300 Q 80 180 150 250 T 300 120" fill="none" stroke="#10b981" stroke-width="3.5" opacity="0.6" filter="drop-shadow(0 0 6px #10b981)" />
          <path d="M 0 340 Q 90 290 170 320 T 300 240" fill="none" stroke="#ef4444" stroke-width="2" opacity="0.4" />` },

  { id: 'bg_moon', name: 'Cosmic Royal Space', category: 'background', rarity: 'epic', price: 200,
    description: 'Exotic star field space background',
    emoji: '🌙',
    svg: `<rect width="300" height="380" rx="24" fill="url(#cosmicGrad)"/>
          <defs>
            <linearGradient id="cosmicGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#090514" />
              <stop offset="60%" stop-color="#0f172a" />
              <stop offset="100%" stop-color="#1e1b4b" />
            </linearGradient>
          </defs>
          <!-- Stars -->
          ${Array.from({length: 25}, (_, i) => `<circle cx="${10 + (i*17 + 23)%280}" cy="${20 + (i*31 + 47)%340}" r="${1 + i%2}" fill="#ffffff" opacity="${0.4 + (i%5)*0.15}"/>`).join('')}
          <!-- Floating Crescent Moon -->
          <circle cx="240" cy="80" r="28" fill="#e2e8f0" filter="drop-shadow(0 0 16px rgba(255,255,255,0.4))" />
          <circle cx="225" cy="70" r="28" fill="#090514" />` },

  // ─── NEW EXPANDED ITEMS (3 per category) ───
  // HATS (hat)
  { id: 'hat_cat_ears', name: '🐱 Cat Ears Headband', category: 'hat', rarity: 'rare', price: 30,
    description: 'Sleek black headband with cute neon pink cat ears',
    emoji: '🐱',
    svg: `<path d="M 120 75 Q 110 50 100 45 Q 120 40 135 65" fill="#1e293b"/>
          <path d="M 122 72 Q 115 54 108 50 Q 122 47 132 64" fill="#ec4899"/>
          <path d="M 180 75 Q 190 50 200 45 Q 180 40 165 65" fill="#1e293b"/>
          <path d="M 178 72 Q 185 54 192 50 Q 178 47 168 64" fill="#ec4899"/>
          <path d="M 105 75 Q 150 65 195 75" stroke="#0f172a" stroke-width="4.5" fill="none"/>` },

  { id: 'hat_straw', name: '👒 Straw Summer Hat', category: 'hat', rarity: 'common', price: 15,
    description: 'Lightweight summer straw hat with a blue ribbon',
    emoji: '👒',
    svg: `<path d="M 95 72 Q 150 40 205 72 Z" fill="#fef08a" stroke="#ca8a04" stroke-width="1"/>
          <path d="M 75 75 Q 150 82 225 75 C 235 75 235 70 225 70 Q 150 62 75 70 C 65 70 65 75 75 75 Z" fill="#fef08a" stroke="#ca8a04" stroke-width="1"/>
          <rect x="94" y="66" width="112" height="6" fill="#3b82f6"/>` },

  { id: 'hat_cyber_helmet', name: '🪖 Cyber Punk Helmet', category: 'hat', rarity: 'legendary', price: 250,
    description: 'Neon glowing cyberpunk tactical helmet',
    emoji: '🪖',
    svg: `<path d="M 96 70 Q 94 15 150 15 Q 206 15 204 70 L 195 75 L 105 75 Z" fill="#0f172a" stroke="#06b6d4" stroke-width="2.5"/>
          <rect x="110" y="45" width="80" height="15" rx="4" fill="rgba(6,182,212,0.25)" stroke="#06b6d4" stroke-width="1.5" filter="drop-shadow(0 0 5px #06b6d4)"/>
          <path d="M 94 50 L 85 62 L 95 62 Z" fill="#0f172a"/>
          <path d="M 206 50 L 215 62 L 205 62 Z" fill="#0f172a"/>` },

  // TOPS (top)
  { id: 'top_royal_cape', name: '🧣 Royal Golden Cape', category: 'top', rarity: 'legendary', price: 350,
    description: 'Regal red cape bordered with glowing gold embroidery',
    emoji: '🧣',
    svg: `<path d="M 70 380 L 70 280 C 70 250, 100 230, 150 230 C 200 230, 230 250, 230 280 L 230 380 Z" fill="#991b1b" />
          <path d="M 70 280 C 70 250, 100 230, 150 230 C 200 230, 230 250, 230 280 L 220 380 L 220 290 C 220 270, 190 245, 150 245 C 110 245, 80 270, 80 290 L 80 380 Z" fill="#fbbf24" filter="drop-shadow(0 0 5px #fbbf24)"/>
          <circle cx="150" cy="255" r="7" fill="#fbbf24"/>` },

  { id: 'top_denim_jacket', name: 'Casual Denim Jacket', category: 'top', rarity: 'common', price: 25,
    description: 'Stylish washed blue denim jacket with brass buttons',
    emoji: '🧥',
    svg: `<path d="M 66 380 L 66 305 C 66 275, 106 240, 150 240 C 194 240, 234 275, 234 305 L 234 380 Z" fill="#2563eb" />
          <path d="M 98 240 L 138 315 L 150 240" fill="#1d4ed8" />
          <path d="M 202 240 L 162 315 L 150 240" fill="#1d4ed8" />
          <line x1="140" y1="290" x2="140" y2="380" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3,3"/>
          <line x1="160" y1="290" x2="160" y2="380" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3,3"/>` },

  { id: 'top_pink_cardigan', name: 'Pink Pastel Cardigan', category: 'top', rarity: 'rare', price: 40,
    description: 'Soft pink knitted cardigan with white buttons',
    emoji: '👚',
    svg: `<path d="M 68 380 L 68 310 C 68 280, 108 242, 150 242 C 192 242, 232 280, 232 310 L 232 380 Z" fill="#f472b6" />
          <path d="M 125 242 Q 150 262 175 242" fill="#db2777" />
          <circle cx="150" cy="285" r="4.5" fill="#ffffff" />
          <circle cx="150" cy="315" r="4.5" fill="#ffffff" />
          <circle cx="150" cy="345" r="4.5" fill="#ffffff" />` },

  // BOTTOMS (bottom)
  { id: 'bottom_neon_turtleneck', name: 'Cyber Neon Turtleneck', category: 'bottom', rarity: 'rare', price: 50,
    description: 'High-neck futuristic neon cyber turtleneck sweater',
    emoji: '👕',
    svg: `<path d="M 115 200 L 115 250 L 185 250 L 185 200 Z" fill="#0f172a" />
          <rect x="110" y="240" width="80" height="8" fill="#10b981" filter="drop-shadow(0 0 4px #10b981)" />` },

  { id: 'bottom_striped_shirt', name: 'Retro Striped Shirt', category: 'bottom', rarity: 'common', price: 15,
    description: 'Vintage retro striped undershirt collar',
    emoji: '👔',
    svg: `<path d="M 125 210 L 150 250 L 175 210 L 162 254 L 138 254 Z" fill="#e2e8f0" />
          <path d="M 130 215 L 140 252" stroke="#ef4444" stroke-width="2.5"/>
          <path d="M 170 215 L 160 252" stroke="#ef4444" stroke-width="2.5"/>
          <path d="M 150 220 L 150 254" stroke="#3b82f6" stroke-width="2.5"/>` },

  { id: 'bottom_diamond_bowtie', name: '🎀 Premium Diamond Bowtie', category: 'bottom', rarity: 'legendary', price: 280,
    description: 'White silk wingtip collar with a shining diamond bowtie',
    emoji: '🎀',
    svg: `<path d="M 125 210 L 150 250 L 175 210 L 162 254 L 138 254 Z" fill="#ffffff" />
          <!-- Diamond Bowtie -->
          <polygon points="135,215 150,225 135,235" fill="#38bdf8" filter="drop-shadow(0 0 4px #38bdf8)"/>
          <polygon points="165,215 150,225 165,235" fill="#38bdf8" filter="drop-shadow(0 0 4px #38bdf8)"/>
          <circle cx="150" cy="225" r="4" fill="#ffffff" />` },

  // SHOES (shoes)
  { id: 'shoes_emerald_medal', name: '🏅 VIP Emerald Medal', category: 'shoes', rarity: 'epic', price: 180,
    description: 'Gold neck chain with a large glowing green emerald medal',
    emoji: '🏅',
    svg: `<path d="M 120 220 C 120 310, 180 310, 180 220" stroke="#fbbf24" stroke-width="3" fill="none" />
          <!-- Emerald Medal -->
          <circle cx="150" cy="300" r="14" fill="#fbbf24" />
          <polygon points="150,290 140,300 150,310 160,300" fill="#10b981" filter="drop-shadow(0 0 6px #10b981)"/>` },

  { id: 'shoes_lanyard_red', name: 'Red Tech Lanyard', category: 'shoes', rarity: 'common', price: 10,
    description: 'Red professional tech conference lanyard',
    emoji: '🎫',
    svg: `<path d="M 122 220 C 122 330, 178 330, 178 220" stroke="#ef4444" stroke-width="3" fill="none" />
          <!-- Red Pass Card -->
          <rect x="138" y="305" width="24" height="32" rx="3" fill="#ef4444" />
          <circle cx="150" cy="315" r="3.5" fill="#ffffff" />
          <rect x="143" y="325" width="14" height="2" fill="#ffffff" />` },

  { id: 'shoes_winter_muffler', name: 'Cozy Winter Muffler', category: 'shoes', rarity: 'rare', price: 30,
    description: 'Chic grey checkered winter wool muffler',
    emoji: '🧣',
    svg: `<path d="M 112 210 Q 150 236 188 210 L 195 232 Q 150 258 105 232 Z" fill="#475569" />
          <path d="M 165 232 L 175 320 Q 165 325 155 320 Z" fill="#334155" />
          <line x1="112" y1="210" x2="195" y2="232" stroke="#64748b" stroke-width="2" stroke-dasharray="4,4"/>` },

  // ACCESSORIES (accessory)
  { id: 'acc_cyber_glasses', name: 'Cyber Neon Glasses', category: 'accessory', rarity: 'rare', price: 45,
    description: 'Futuristic glasses with neon blue frame glows',
    emoji: '👓',
    svg: `<g filter="drop-shadow(0 0 6px #06b6d4)">
            <rect x="105" y="106" width="36" height="15" rx="3" fill="rgba(6,182,212,0.1)" stroke="#06b6d4" stroke-width="2"/>
            <rect x="159" y="106" width="36" height="15" rx="3" fill="rgba(6,182,212,0.1)" stroke="#06b6d4" stroke-width="2"/>
            <line x1="141" y1="112" x2="159" y2="112" stroke="#06b6d4" stroke-width="2.5"/>
            <line x1="105" y1="110" x2="88" y2="114" stroke="#06b6d4" stroke-width="1.5"/>
            <line x1="195" y1="110" x2="212" y2="114" stroke="#06b6d4" stroke-width="1.5"/>
          </g>` },

  { id: 'acc_matrix_visor', name: 'Matrix Green Visor', category: 'accessory', rarity: 'epic', price: 220,
    description: 'Iconic digital rain matrix green scanner visor',
    emoji: '🕶️',
    svg: `<g filter="drop-shadow(0 0 8px #22c55e)">
            <path d="M 100 106 L 200 106 L 194 122 L 106 122 Z" fill="rgba(34,197,94,0.25)" stroke="#22c55e" stroke-width="2" />
            <circle cx="115" cy="114" r="2.5" fill="#22c55e"/>
            <circle cx="150" cy="114" r="2.5" fill="#22c55e"/>
            <circle cx="185" cy="114" r="2.5" fill="#22c55e"/>
            <path d="M 100 106 L 86 112" stroke="#22c55e" stroke-width="1.5"/>
            <path d="M 200 106 L 214 112" stroke="#22c55e" stroke-width="1.5"/>
          </g>` },

  { id: 'acc_dragon_wings', name: '🐉 Pixel Dragon Wings', category: 'accessory', rarity: 'legendary', price: 500,
    description: 'Epic glowing pixelated golden dragon wings',
    emoji: '🐉',
    svg: `<g filter="drop-shadow(0 0 12px #fbbf24)">
            <!-- Left Dragon Wing -->
            <path d="M 94 220 C 40 140, -10 180, 5 270 C 15 310, 60 270, 94 240 Z" fill="rgba(251,191,36,0.12)" stroke="#fbbf24" stroke-width="3" />
            <polygon points="5,270 20,250 35,260 50,240 65,250 94,240" fill="#fbbf24" opacity="0.3"/>
            <!-- Right Dragon Wing -->
            <path d="M 206 220 C 260 140, 310 180, 295 270 C 285 310, 240 270, 206 240 Z" fill="rgba(251,191,36,0.12)" stroke="#fbbf24" stroke-width="3" />
            <polygon points="295,270 280,250 265,260 250,240 235,250 206,240" fill="#fbbf24" opacity="0.3"/>
          </g>` },

  // BACKGROUNDS (background)
  { id: 'bg_matrix', name: 'Cyber Matrix Green', category: 'background', rarity: 'rare', price: 60,
    description: 'Digital matrix code stream background',
    emoji: '🟢',
    svg: `<rect width="300" height="380" rx="24" fill="#022c22"/>
          \${Array.from({length: 12}, (_, i) => \`<line x1="\${15 + i*23}" y1="0" x2="\${15 + i*23}" y2="380" stroke="#10b981" stroke-width="1.5" opacity="0.12" stroke-dasharray="10,25"/>\`).join('')}
          <path d="M 0 250 Q 80 340 150 270 T 300 320" fill="none" stroke="#22c55e" stroke-width="2.5" opacity="0.3" filter="drop-shadow(0 0 5px #22c55e)"/>` },

  { id: 'bg_vault', name: 'Golden Bank Vault', category: 'background', rarity: 'legendary', price: 300,
    description: 'Massive heavy steel and gold vault door background',
    emoji: '🏦',
    svg: `<rect width="300" height="380" rx="24" fill="#1e293b"/>
          <circle cx="150" cy="190" r="105" fill="#0f172a" stroke="#ca8a04" stroke-width="6" />
          <circle cx="150" cy="190" r="85" fill="#334155" stroke="#fbbf24" stroke-width="4" stroke-dasharray="12,12" />
          <circle cx="150" cy="190" r="30" fill="#1e293b" stroke="#ca8a04" stroke-width="4" />
          <line x1="150" y1="50" x2="150" y2="330" stroke="#ca8a04" stroke-width="3" opacity="0.4"/>
          <line x1="10" y1="190" x2="290" y2="190" stroke="#ca8a04" stroke-width="3" opacity="0.4"/>` },

  { id: 'bg_garden', name: 'Peaceful Zen Garden', category: 'background', rarity: 'common', price: 20,
    description: 'Serene Japanese zen garden view background',
    emoji: '🏡',
    svg: `<rect width="300" height="380" rx="24" fill="#a5f3fc"/>
          <!-- Sun -->
          <circle cx="230" cy="90" r="35" fill="#fef08a" opacity="0.8" filter="drop-shadow(0 0 10px #fef08a)"/>
          <!-- Mountains -->
          <path d="M -20 380 L 80 180 L 180 380 Z" fill="#64748b" opacity="0.7"/>
          <path d="M 100 380 L 200 150 L 320 380 Z" fill="#475569" opacity="0.9"/>
          <!-- Ground green -->
          <path d="M 0 320 Q 150 280 300 320 L 300 380 L 0 380 Z" fill="#22c55e" />` }
];

export const CATEGORIES = [
  { id: 'hat', name: 'Headwear', emoji: '👒' },
  { id: 'top', name: 'Outerwear', emoji: '👕' },
  { id: 'bottom', name: 'Innerwear', emoji: '👔' },
  { id: 'shoes', name: 'Neckwear', emoji: '🎗️' },
  { id: 'accessory', name: 'Acc', emoji: '🕶️' },
  { id: 'background', name: 'Background', emoji: '🖼️' },
];

export const HAIR_STYLES = [
  { id: 'default', name: 'Default' },
  { id: 'short', name: 'Short' },
  { id: 'long', name: 'Long' },
  { id: 'curly', name: 'Curly' },
  { id: 'ponytail', name: 'Ponytail' },
  { id: 'buzz', name: 'Buzz' }
];

export const HAIR_COLORS = ['#1a1a1a', '#4a3728', '#8b5a2b', '#d97706', '#f59e0b', '#94a3b8', '#ffffff'];
export const SKIN_COLORS = ['#FFDCB5', '#F3D3B4', '#E8C5A0', '#D0A080', '#A87858', '#704830'];
export const EYE_COLORS = ['#1a1a1a', '#2c1810', '#3b82f6', '#10b981', '#6b7280', '#6366f1'];

export const RARITY_COLORS = {
  common: '#94a3b8',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b'
};

export const ITEM_EFFECTS = {
  hat_crown: { description: '수수료 50% 인하, 판매수익 10% 추가지급', commissionDiscount: 0.5, profitMultiplier: 1.1 },
  hat_headphones: { description: '수수료 30% 인하', commissionDiscount: 0.3 },
  hat_diamond: { description: '판매수익 15% 추가지급', profitMultiplier: 1.15 },
  hat_cyber_helmet: { description: '판매수익 20% 추가지급, 시드머니 +$1,000', profitMultiplier: 1.2, seedBonus: 1000 },
  top_royal_cape: { description: '판매수익 25% 추가지급', profitMultiplier: 1.25 },
  top_suit_navy: { description: '수수료 20% 인하', commissionDiscount: 0.2 },
  top_buffett: { description: '판매수익 30% 추가지급', profitMultiplier: 1.3 },
  bottom_gold_pants: { description: '시드머니 +$500', seedBonus: 500 },
  bottom_diamond_bowtie: { description: '판매수익 15% 추가지급', profitMultiplier: 1.15 },
  shoes_emerald_medal: { description: '시드머니 +$1,500, 수수료 40% 인하', seedBonus: 1500, commissionDiscount: 0.4 },
  shoes_lanyard_red: { description: '시드머니 +$100', seedBonus: 100 },
  acc_necklace: { description: '판매수익 10% 추가지급', profitMultiplier: 1.1 },
  acc_dragon_wings: { description: '판매수익 50% 추가지급, 시드머니 +$3,000', profitMultiplier: 1.5, seedBonus: 3000 },
  bg_vault: { description: '시드머니 +$5,000', seedBonus: 5000 },
  bg_garden: { description: '수수료 10% 인하', commissionDiscount: 0.1 }
};

SHOP_ITEMS.forEach(item => {
  if (ITEM_EFFECTS[item.id]) {
    item.effect = ITEM_EFFECTS[item.id];
  }
});

export function getItemsByCategory(category) {
  return SHOP_ITEMS.filter(item => item.category === category);
}

export function getItemById(id) {
  return SHOP_ITEMS.find(item => item.id === id) || null;
}

