import React, { useMemo } from 'react';

export type MummyArtKind =
  | 'explorer'
  | 'white'
  | 'red'
  | 'scorpion'
  | 'key_yellow'
  | 'key_red'
  | 'pit'
  | 'spikes'
  | 'sarcophagus'
  | 'exit_portal'
  | 'scarab'
  | 'canopic_jar'
  | 'torch';

function buildEgyptianArtSvg(kind: MummyArtKind): string {
  const defs = `
    <defs>
      <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fff6b7"/>
        <stop offset="42%" stop-color="#eab308"/>
        <stop offset="100%" stop-color="#854d0e"/>
      </linearGradient>
      <linearGradient id="lapisGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#0284c7"/>
        <stop offset="100%" stop-color="#1e3a8a"/>
      </linearGradient>
      <linearGradient id="turquoiseGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#a7f3d0"/>
        <stop offset="50%" stop-color="#10b981"/>
        <stop offset="100%" stop-color="#064e3b"/>
      </linearGradient>
      <linearGradient id="rubyGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fecdd3"/>
        <stop offset="45%" stop-color="#e11d48"/>
        <stop offset="100%" stop-color="#4c0519"/>
      </linearGradient>
      <linearGradient id="linenWhite" x1="0" y1="0" x2="0.9" y2="1">
        <stop offset="0%" stop-color="#fffbeb"/>
        <stop offset="55%" stop-color="#d6c7a9"/>
        <stop offset="100%" stop-color="#78684c"/>
      </linearGradient>
      <linearGradient id="linenRed" x1="0" y1="0" x2="0.9" y2="1">
        <stop offset="0%" stop-color="#fca5a5"/>
        <stop offset="50%" stop-color="#b91c1c"/>
        <stop offset="100%" stop-color="#450a0a"/>
      </linearGradient>
      <linearGradient id="sandstone" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e7cba0"/>
        <stop offset="55%" stop-color="#b48a52"/>
        <stop offset="100%" stop-color="#5c3e1b"/>
      </linearGradient>
      <radialGradient id="flameGlow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="40%" stop-color="#fde047"/>
        <stop offset="75%" stop-color="#f97316"/>
        <stop offset="100%" stop-color="#dc2626" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="curseCyan" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stop-color="#ecfeff"/>
        <stop offset="45%" stop-color="#22d3ee"/>
        <stop offset="100%" stop-color="#0891b2" stop-opacity="0"/>
      </radialGradient>
      <filter id="dropShadow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#000000" flood-opacity="0.62"/>
      </filter>
    </defs>
  `;

  let body = '';

  switch (kind) {
    case 'explorer':
      // 1930s Tomb Explorer Archaeologist with Fedora, Khaki Vest, Blazing Torch & Papyrus Map
      body = `
        <ellipse cx="64" cy="118" rx="34" ry="8" fill="#000" opacity="0.48"/>
        <!-- Boots & Cargo Trousers -->
        <path d="M46 84 L43 112 H58 L60 88 H68 L70 112 H85 L82 84 Z" fill="#4b3826" stroke="#1f140a" stroke-width="3" stroke-linejoin="round"/>
        <rect x="42" y="103" width="16" height="10" rx="3" fill="#2c1b0e" stroke="#140c05" stroke-width="2.5"/>
        <rect x="70" y="103" width="16" height="10" rx="3" fill="#2c1b0e" stroke="#140c05" stroke-width="2.5"/>
        <!-- Khaki Safari Shirt & Leather Expedition Vest -->
        <path d="M40 54 Q64 46 88 54 L84 86 H44 Z" fill="#e6d3a7" stroke="#291a0c" stroke-width="3"/>
        <path d="M45 54 H58 V86 H44 Z M70 54 H83 L84 86 H70 Z" fill="#8c5a2b" stroke="#291a0c" stroke-width="2.8"/>
        <!-- Leather Belt & Golden Buckle -->
        <rect x="43" y="80" width="42" height="7" rx="2" fill="#3b220c" stroke="#1a0f05" stroke-width="2"/>
        <rect x="59" y="79" width="10" height="9" rx="1.5" fill="url(#goldGrad)" stroke="#291a0c" stroke-width="1.8"/>
        <!-- Left Arm Holding Papyrus Scroll -->
        <path d="M40 56 L26 72 L34 80 L45 66 Z" fill="#e6d3a7" stroke="#291a0c" stroke-width="2.8"/>
        <g transform="rotate(-18 28 76)">
          <rect x="16" y="68" width="22" height="14" rx="4" fill="#f5deb3" stroke="#5c3a18" stroke-width="2.4"/>
          <line x1="21" y1="73" x2="33" y2="73" stroke="#8b5a2b" stroke-width="1.8"/>
          <line x1="21" y1="77" x2="31" y2="77" stroke="#8b5a2b" stroke-width="1.8"/>
        </g>
        <!-- Right Arm Raising Blazing Torch -->
        <path d="M88 56 L104 44 L96 36 L82 48 Z" fill="#e6d3a7" stroke="#291a0c" stroke-width="2.8"/>
        <path d="M99 30 L105 30 L101 64 L95 64 Z" fill="#5c3818" stroke="#1f1206" stroke-width="2.4"/>
        <rect x="96" y="27" width="12" height="6" rx="2" fill="url(#goldGrad)" stroke="#291a0c" stroke-width="2"/>
        <!-- Torch Flame -->
        <circle cx="102" cy="17" r="18" fill="url(#flameGlow)"/>
        <path d="M102 3 C93 12 92 22 97 27 C99 29 105 29 107 27 C112 22 110 11 102 3 Z" fill="#f97316" stroke="#fde047" stroke-width="1.5"/>
        <path d="M102 9 C97 15 97 22 102 26 C107 22 107 15 102 9 Z" fill="#fef08a"/>
        <!-- Adventurer Head & Determined Face -->
        <rect x="49" y="26" width="30" height="27" rx="11" fill="#f1c27d" stroke="#291a0c" stroke-width="3"/>
        <circle cx="58" cy="38" r="2.3" fill="#1e1b18"/>
        <circle cx="70" cy="38" r="2.3" fill="#1e1b18"/>
        <path d="M55 34 L61 35 M67 35 L73 34" stroke="#3b2313" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M59 46 Q64 49 69 46" fill="none" stroke="#5c3317" stroke-width="2.2" stroke-linecap="round"/>
        <!-- Classic Weathered Fedora Hat -->
        <path d="M44 24 C46 10 82 10 84 24 Z" fill="#6b3e1b" stroke="#241306" stroke-width="3"/>
        <path d="M45 22 H83" stroke="#d97706" stroke-width="4"/>
        <ellipse cx="64" cy="25" rx="28" ry="6" fill="#7c471f" stroke="#241306" stroke-width="3"/>
      `;
      break;

    case 'white':
      // White Mummy Guardian: Ancient Linen-Wrapped Pyramid Stalker with Glowing Cyan Curse Eyes
      body = `
        <ellipse cx="64" cy="118" rx="34" ry="8" fill="#000" opacity="0.5"/>
        <!-- Shambling Bandaged Legs -->
        <path d="M45 84 L41 113 H57 L60 88 H68 L71 113 H87 L83 84 Z" fill="url(#linenWhite)" stroke="#2b2318" stroke-width="3" stroke-linejoin="round"/>
        <!-- Bandaged Torso & Outstretched Grasping Arms -->
        <path d="M42 52 Q64 46 86 52 L82 86 H46 Z" fill="url(#linenWhite)" stroke="#2b2318" stroke-width="3"/>
        <path d="M42 54 L20 64 L25 74 L46 66 Z M86 54 L108 64 L103 74 L82 66 Z" fill="url(#linenWhite)" stroke="#2b2318" stroke-width="3" stroke-linejoin="round"/>
        <!-- Hanging Tattered Bandage Strips -->
        <path d="M24 72 Q18 84 23 92 M104 72 Q110 84 105 92 M80 82 Q88 94 84 104" fill="none" stroke="#d6c7a9" stroke-width="3.5" stroke-linecap="round"/>
        <!-- Wrapped Mummy Skull Head -->
        <rect x="44" y="16" width="40" height="39" rx="16" fill="url(#linenWhite)" stroke="#2b2318" stroke-width="3.2"/>
        <!-- Criss-cross Bandage Seams -->
        <path d="M45 25 L83 31 M44 38 L84 32 M47 47 L81 51 M46 62 L82 67 M47 75 L81 71 M43 96 L58 99 M70 98 L85 95" stroke="#5c4d36" stroke-width="2.6" stroke-linecap="round"/>
        <!-- Deep Eye Visor Slot & Glowing Turquoise Eyes -->
        <rect x="48" y="29" width="32" height="11" rx="5" fill="#0f172a" stroke="#2b2318" stroke-width="2"/>
        <circle cx="57" cy="34.5" r="7" fill="url(#curseCyan)"/>
        <circle cx="71" cy="34.5" r="7" fill="url(#curseCyan)"/>
        <circle cx="57" cy="34.5" r="3.2" fill="#67e8f9"/>
        <circle cx="71" cy="34.5" r="3.2" fill="#67e8f9"/>
      `;
      break;

    case 'red':
      // Red Royal Pharaoh Mummy: Crimson Linen, Golden Nemes Headdress, Lapis Collar & Fiery Eyes
      body = `
        <ellipse cx="64" cy="118" rx="36" ry="8" fill="#000" opacity="0.52"/>
        <!-- Royal Pharaoh Nemes Headdress Lappets (Back) -->
        <path d="M32 48 L38 14 H90 L96 48 L88 64 H40 Z" fill="url(#goldGrad)" stroke="#291507" stroke-width="3.2" stroke-linejoin="round"/>
        <path d="M36 24 H92 M35 34 H93 M34 44 H94" stroke="#1e3a8a" stroke-width="3.5"/>
        <!-- Crimson Wrapped Legs & Royal Kilt -->
        <path d="M46 84 L42 113 H58 L61 88 H67 L70 113 H86 L82 84 Z" fill="url(#linenRed)" stroke="#2a0606" stroke-width="3"/>
        <path d="M42 52 Q64 46 86 52 L83 86 H45 Z" fill="url(#linenRed)" stroke="#2a0606" stroke-width="3"/>
        <!-- Golden Usekh Broad Collar & Royal Apron -->
        <path d="M40 52 Q64 68 88 52 L83 62 Q64 76 45 62 Z" fill="url(#goldGrad)" stroke="#2a0606" stroke-width="2.5"/>
        <path d="M56 76 H72 L75 104 L64 110 L53 104 Z" fill="url(#goldGrad)" stroke="#2a0606" stroke-width="2.5"/>
        <!-- Outstretched Cursed Claws with Golden Bracers -->
        <path d="M42 54 L20 64 L25 74 L45 66 Z M86 54 L108 64 L103 74 L83 66 Z" fill="url(#linenRed)" stroke="#2a0606" stroke-width="3"/>
        <rect x="24" y="61" width="9" height="11" rx="2" transform="rotate(-24 28 66)" fill="url(#goldGrad)" stroke="#2a0606" stroke-width="2"/>
        <rect x="95" y="61" width="9" height="11" rx="2" transform="rotate(24 99 66)" fill="url(#goldGrad)" stroke="#2a0606" stroke-width="2"/>
        <!-- Crimson Mummy Head & Golden Uraeus Cobra Crest -->
        <rect x="46" y="18" width="36" height="36" rx="14" fill="url(#linenRed)" stroke="#2a0606" stroke-width="3"/>
        <path d="M48 26 L80 30 M47 40 L81 36 M48 68 L80 72" stroke="#450a0a" stroke-width="2.6"/>
        <!-- Cobra Crown Insignia -->
        <circle cx="64" cy="15" r="5.5" fill="url(#goldGrad)" stroke="#2a0606" stroke-width="2"/>
        <circle cx="64" cy="15" r="2.2" fill="#ef4444"/>
        <!-- Glowing Fiery Amber Eyes -->
        <rect x="49" y="29" width="30" height="10" rx="4" fill="#180404"/>
        <circle cx="57" cy="34" r="3.6" fill="#fde047"/>
        <circle cx="71" cy="34" r="3.6" fill="#fde047"/>
      `;
      break;

    case 'scorpion':
      // Giant Golden-Bronze Tomb Scorpion with Segmented Carapace, Pincers & Venomous Stinger
      body = `
        <ellipse cx="64" cy="114" rx="40" ry="9" fill="#000" opacity="0.48"/>
        <!-- 6 Articulated Chitin Legs -->
        <g stroke="#3b1d08" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <path d="M46 66 L22 58 L14 70"/>
          <path d="M44 78 L18 76 L10 90"/>
          <path d="M48 90 L24 94 L18 108"/>
          <path d="M82 66 L106 58 L114 70"/>
          <path d="M84 78 L110 76 L118 90"/>
          <path d="M80 90 L104 94 L110 108"/>
        </g>
        <!-- Giant Crushing Pincers (Chelae) -->
        <path d="M44 54 C24 44 14 28 24 18 C30 12 40 20 34 30 C42 28 46 38 38 46 Z" fill="url(#goldGrad)" stroke="#2b1405" stroke-width="3.2"/>
        <path d="M84 54 C104 44 114 28 104 18 C98 12 88 20 94 30 C86 28 82 38 90 46 Z" fill="url(#goldGrad)" stroke="#2b1405" stroke-width="3.2"/>
        <!-- Segmented Armored Body -->
        <ellipse cx="64" cy="74" rx="22" ry="28" fill="url(#goldGrad)" stroke="#2b1405" stroke-width="3.4"/>
        <path d="M45 64 Q64 70 83 64 M44 75 Q64 81 84 75 M47 86 Q64 92 81 86" fill="none" stroke="#5c2d0c" stroke-width="3"/>
        <!-- Raised Curving Tail & Glowing Venom Stinger -->
        <path d="M64 48 C64 28 76 14 64 8 C54 4 48 16 56 22" fill="none" stroke="url(#goldGrad)" stroke-width="11" stroke-linecap="round"/>
        <path d="M64 48 C64 28 76 14 64 8 C54 4 48 16 56 22" fill="none" stroke="#2b1405" stroke-width="3" stroke-linecap="round"/>
        <path d="M56 22 L46 30 L59 27 Z" fill="#ef4444" stroke="#2b1405" stroke-width="2"/>
        <!-- Glowing Ruby Eyes -->
        <circle cx="56" cy="54" r="3.2" fill="#ef4444" stroke="#2b1405" stroke-width="1.5"/>
        <circle cx="72" cy="54" r="3.2" fill="#ef4444" stroke="#2b1405" stroke-width="1.5"/>
      `;
      break;

    case 'key_yellow':
    case 'key_red': {
      const isYellow = kind === 'key_yellow';
      const fillUrl = isYellow ? 'url(#goldGrad)' : 'url(#rubyGrad)';
      const gemFill = isYellow ? 'url(#turquoiseGrad)' : '#fde047';
      body = `
        <ellipse cx="64" cy="114" rx="26" ry="6" fill="#000" opacity="0.4"/>
        <g transform="rotate(-35 64 64)">
          <!-- Ankh Loop -->
          <path d="M64 14 C46 14 44 46 64 52 C84 46 82 14 64 14 Z M64 24 C72 24 72 40 64 43 C56 40 56 24 64 24 Z" fill="${fillUrl}" stroke="#261405" stroke-width="3.2"/>
          <!-- Crossbar Wings -->
          <rect x="38" y="50" width="52" height="11" rx="5" fill="${fillUrl}" stroke="#261405" stroke-width="3"/>
          <!-- Key Shaft & Teeth -->
          <rect x="59" y="58" width="10" height="50" rx="4" fill="${fillUrl}" stroke="#261405" stroke-width="3"/>
          <path d="M69 86 H82 V94 H69 Z M69 98 H79 V105 H69 Z" fill="${fillUrl}" stroke="#261405" stroke-width="2.6"/>
          <!-- Center Scarab Gem -->
          <circle cx="64" cy="55.5" r="7" fill="${gemFill}" stroke="#261405" stroke-width="2.2"/>
        </g>
      `;
      break;
    }

    case 'pit':
      // Swirling Quicksand Vortex Trap with Skull
      body = `
        <rect x="12" y="16" width="104" height="96" rx="16" fill="url(#sandstone)" stroke="#3d2610" stroke-width="4"/>
        <ellipse cx="64" cy="64" rx="42" ry="34" fill="#291809" stroke="#785027" stroke-width="3.5"/>
        <ellipse cx="64" cy="66" rx="31" ry="24" fill="#170d04"/>
        <path d="M36 58 Q64 38 90 62 Q68 88 42 68 Q60 50 78 64" fill="none" stroke="#b48a52" stroke-width="3.2" stroke-linecap="round" opacity="0.75"/>
        <circle cx="64" cy="67" r="11" fill="#050301"/>
        <!-- Half-sunken Skull -->
        <circle cx="84" cy="52" r="8" fill="#e7dec8" stroke="#2b1d0e" stroke-width="2"/>
        <circle cx="81.5" cy="51" r="1.8" fill="#1c1309"/>
        <circle cx="86.5" cy="51" r="1.8" fill="#1c1309"/>
      `;
      break;

    case 'spikes':
      // Ancient Stone Pressure Plate with Iron Spikes
      body = `
        <rect x="14" y="22" width="100" height="88" rx="14" fill="url(#sandstone)" stroke="#3d2610" stroke-width="4"/>
        <rect x="22" y="30" width="84" height="72" rx="10" fill="#271c15" stroke="#5c4028" stroke-width="2.5"/>
        ${[
          [36, 52],
          [64, 48],
          [92, 52],
          [48, 76],
          [80, 76],
          [34, 88],
          [64, 86],
          [94, 88],
        ]
          .map(
            ([x, y]) => `
          <ellipse cx="${x}" cy="${y}" rx="7" ry="4" fill="#090706"/>
          <polygon points="${x - 5},${y} ${x},${y - 26} ${x + 5},${y}" fill="#cbd5e1" stroke="#1e293b" stroke-width="2"/>
          <polygon points="${x},${y - 26} ${x + 5},${y} ${x},${y}" fill="#64748b"/>
        `
          )
          .join('')}
      `;
      break;

    case 'sarcophagus':
      // Royal Golden Pharaoh Sarcophagus Trap
      body = `
        <ellipse cx="64" cy="116" rx="34" ry="8" fill="#000" opacity="0.5"/>
        <path d="M40 24 C40 12 88 12 88 24 L94 52 L84 112 H44 L34 52 Z" fill="url(#goldGrad)" stroke="#2b1706" stroke-width="3.6" stroke-linejoin="round"/>
        <path d="M45 32 H83 M42 48 H86 M44 66 H84 M46 84 H82 M48 98 H80" stroke="url(#lapisGrad)" stroke-width="5"/>
        <!-- Pharaoh Mask on Sarcophagus -->
        <rect x="52" y="22" width="24" height="24" rx="8" fill="url(#goldGrad)" stroke="#2b1706" stroke-width="2.5"/>
        <circle cx="59" cy="32" r="2" fill="#090d16"/>
        <circle cx="69" cy="32" r="2" fill="#090d16"/>
        <!-- Crossed Crook & Flail -->
        <path d="M48 64 L80 46 M80 64 L48 46" stroke="#fef08a" stroke-width="3.5" stroke-linecap="round"/>
      `;
      break;

    case 'exit_portal':
      // Ancient Temple Portal Gate with Lotus Columns, Winged Sun Disk & Torchlit Descending Stairs
      body = `
        <!-- Outer Carved Sandstone Pylon & Winged Sun Lintel -->
        <path d="M12 22 H116 L110 38 H18 Z" fill="url(#goldGrad)" stroke="#2b1706" stroke-width="3.2"/>
        <circle cx="64" cy="30" r="6" fill="url(#turquoiseGrad)" stroke="#2b1706" stroke-width="2"/>
        <!-- Left & Right Lotus Columns -->
        <rect x="18" y="38" width="18" height="76" rx="4" fill="url(#sandstone)" stroke="#2b1706" stroke-width="3"/>
        <rect x="92" y="38" width="18" height="76" rx="4" fill="url(#sandstone)" stroke="#2b1706" stroke-width="3"/>
        <!-- Glowing Emerald-Gold Stairway Interior -->
        <rect x="36" y="38" width="56" height="76" fill="#042f2e" stroke="#10b981" stroke-width="2.5"/>
        <!-- Descending Stone Steps -->
        <rect x="38" y="98" width="52" height="14" fill="#d97706" stroke="#451a03" stroke-width="2"/>
        <rect x="42" y="84" width="44" height="14" fill="#b45309" stroke="#451a03" stroke-width="2"/>
        <rect x="46" y="70" width="36" height="14" fill="#92400e" stroke="#451a03" stroke-width="2"/>
        <rect x="50" y="56" width="28" height="14" fill="#78350f" stroke="#451a03" stroke-width="2"/>
        <!-- Radiant Escape Portal Glow -->
        <circle cx="64" cy="52" r="14" fill="url(#turquoiseGrad)" opacity="0.85"/>
      `;
      break;

    case 'scarab':
      // Jeweled Golden Scarab Amulet
      body = `
        <circle cx="64" cy="64" r="52" fill="url(#goldGrad)" stroke="#2b1706" stroke-width="4"/>
        <circle cx="64" cy="64" r="42" fill="#1c1107" stroke="#d97706" stroke-width="2.5"/>
        <!-- Outspread Golden Wings -->
        <path d="M64 46 C34 32 18 50 24 76 C32 72 46 68 64 68 Z" fill="url(#lapisGrad)" stroke="#fde047" stroke-width="2.5"/>
        <path d="M64 46 C94 32 110 50 104 76 C96 72 82 68 64 68 Z" fill="url(#lapisGrad)" stroke="#fde047" stroke-width="2.5"/>
        <!-- Scarab Carapace -->
        <ellipse cx="64" cy="66" rx="18" ry="24" fill="url(#turquoiseGrad)" stroke="#fef08a" stroke-width="3"/>
        <line x1="64" y1="44" x2="64" y2="90" stroke="#fef08a" stroke-width="2.5"/>
        <!-- Solar Disk Held Above Head -->
        <circle cx="64" cy="28" r="9" fill="url(#rubyGrad)" stroke="#fef08a" stroke-width="2.5"/>
      `;
      break;

    case 'canopic_jar':
      // Golden Anubis/Falcon Canopic Jar for Revert Turn Charges
      body = `
        <ellipse cx="64" cy="114" rx="26" ry="6" fill="#000" opacity="0.45"/>
        <path d="M42 52 H86 L80 110 H48 Z" fill="url(#sandstone)" stroke="#2b1706" stroke-width="3.2" stroke-linejoin="round"/>
        <rect x="44" y="64" width="40" height="10" fill="url(#lapisGrad)" stroke="#2b1706" stroke-width="2"/>
        <path d="M46 52 C46 30 82 30 82 52 Z" fill="url(#goldGrad)" stroke="#2b1706" stroke-width="3"/>
        <path d="M48 36 L42 16 L56 28 M80 36 L86 16 L72 28" fill="url(#goldGrad)" stroke="#2b1706" stroke-width="2.8" stroke-linejoin="round"/>
        <circle cx="58" cy="38" r="2.5" fill="#22d3ee"/>
        <circle cx="70" cy="38" r="2.5" fill="#22d3ee"/>
      `;
      break;

    case 'torch':
      // Ancient Egyptian Wall Brazier / Torch Sconce
      body = `
        <path d="M52 64 H76 L68 114 H60 Z" fill="url(#goldGrad)" stroke="#2b1706" stroke-width="3" stroke-linejoin="round"/>
        <path d="M42 54 H86 L78 66 H50 Z" fill="url(#lapisGrad)" stroke="#2b1706" stroke-width="2.8"/>
        <circle cx="64" cy="32" r="26" fill="url(#flameGlow)"/>
        <path d="M64 8 C48 22 48 40 56 48 C60 52 68 52 72 48 C80 40 80 22 64 8 Z" fill="#f97316" stroke="#fde047" stroke-width="2"/>
        <path d="M64 18 C55 28 56 40 64 46 C72 40 73 28 64 18 Z" fill="#fef08a"/>
      `;
      break;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">${defs}<g filter="url(#dropShadow)">${body}</g></svg>`;
}

const artUriCache = new Map<MummyArtKind, string>();

export function getMummyArtUrl(kind: MummyArtKind): string {
  if (!artUriCache.has(kind)) {
    const svg = buildEgyptianArtSvg(kind);
    artUriCache.set(kind, `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
  }
  return artUriCache.get(kind)!;
}

export function MummySprite({
  kind,
  className = '',
}: {
  kind: MummyArtKind;
  className?: string;
}) {
  const url = useMemo(() => getMummyArtUrl(kind), [kind]);
  return (
    <img
      src={url}
      alt={kind}
      draggable={false}
      decoding="async"
      className={`mummy-sprite w-full h-full object-contain select-none pointer-events-none ${className}`}
    />
  );
}
