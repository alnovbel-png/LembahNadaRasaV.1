import fs from 'fs';

fs.mkdirSync('public', { recursive: true });

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">
  <defs>
    <!-- Night Sky Gradient -->
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#070a17"/>
      <stop offset="35%" stop-color="#12162c"/>
      <stop offset="70%" stop-color="#1b1f3a"/>
      <stop offset="100%" stop-color="#192534"/>
    </linearGradient>

    <!-- River Water Gradient -->
    <linearGradient id="riverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1d3f6d"/>
      <stop offset="50%" stop-color="#194c84"/>
      <stop offset="100%" stop-color="#103663"/>
    </linearGradient>

    <!-- Torch Glow Filter -->
    <radialGradient id="torchGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fef08a" stop-opacity="0.85"/>
      <stop offset="25%" stop-color="#f59e0b" stop-opacity="0.5"/>
      <stop offset="65%" stop-color="#ea580c" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#ea580c" stop-opacity="0"/>
    </radialGradient>

    <!-- Window Glow -->
    <radialGradient id="windowGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fffbeb" stop-opacity="0.9"/>
      <stop offset="50%" stop-color="#fde047" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
    </radialGradient>

    <!-- Blue Wisp Glow -->
    <radialGradient id="wispGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#e0f2fe" stop-opacity="1"/>
      <stop offset="30%" stop-color="#38bdf8" stop-opacity="0.8"/>
      <stop offset="70%" stop-color="#0284c7" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0"/>
    </radialGradient>

    <!-- Ground Mist Gradient -->
    <linearGradient id="mistGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#94a3b8" stop-opacity="0"/>
      <stop offset="50%" stop-color="#cbd5e1" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#94a3b8" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- 1. NIGHT SKY BACKGROUND -->
  <rect x="0" y="0" width="1920" height="1080" fill="url(#skyGrad)"/>

  <!-- Pixel Stars -->
  <g fill="#ffffff">
    <rect x="120" y="60" width="4" height="4" opacity="0.9"/>
    <rect x="180" y="110" width="3" height="3" opacity="0.75"/>
    <rect x="290" y="80" width="4" height="4" opacity="0.85"/>
    <rect x="340" y="140" width="3" height="3" opacity="0.6"/>
    <rect x="480" y="90" width="5" height="5" opacity="0.9" fill="#fef08a"/>
    <rect x="550" y="50" width="3" height="3" opacity="0.7"/>
    <rect x="650" y="120" width="4" height="4" opacity="0.8"/>
    <rect x="720" y="70" width="3" height="3" opacity="0.65"/>
    <rect x="850" y="100" width="4" height="4" opacity="0.85"/>
    <rect x="990" y="45" width="4" height="4" opacity="0.9" fill="#fde047"/>
    <rect x="1100" y="95" width="3" height="3" opacity="0.7"/>
    <rect x="1220" y="65" width="4" height="4" opacity="0.8"/>
    <rect x="1350" y="115" width="3" height="3" opacity="0.6"/>
    <rect x="1460" y="55" width="5" height="5" opacity="0.9" fill="#bae6fd"/>
    <rect x="1590" y="90" width="4" height="4" opacity="0.75"/>
    <rect x="1710" y="75" width="3" height="3" opacity="0.8"/>
    <rect x="1820" y="130" width="4" height="4" opacity="0.7"/>
    <rect x="70" y="160" width="3" height="3" opacity="0.6"/>
    <rect x="420" y="170" width="4" height="4" opacity="0.85"/>
    <rect x="910" y="160" width="3" height="3" opacity="0.7"/>
    <rect x="1280" y="150" width="4" height="4" opacity="0.8" fill="#fef08a"/>
    <rect x="1650" y="160" width="3" height="3" opacity="0.65"/>
  </g>

  <!-- Distant Night Clouds -->
  <g fill="#242244" opacity="0.85">
    <rect x="80" y="140" width="220" height="40"/>
    <rect x="100" y="120" width="180" height="20"/>
    <rect x="130" y="100" width="120" height="20"/>
    <rect x="360" y="150" width="260" height="45"/>
    <rect x="390" y="130" width="190" height="20"/>
    <rect x="1280" y="120" width="320" height="50"/>
    <rect x="1320" y="95" width="230" height="25"/>
    <rect x="1370" y="75" width="140" height="20"/>
  </g>
  <g fill="#373966" opacity="0.65">
    <rect x="120" y="160" width="170" height="25"/>
    <rect x="410" y="170" width="200" height="25"/>
    <rect x="1340" y="145" width="240" height="30"/>
  </g>

  <!-- Floating Resonant Cyan Wisps in the Sky -->
  <circle cx="1480" cy="165" r="28" fill="url(#wispGlow)"/>
  <circle cx="1480" cy="165" r="7" fill="#ffffff"/>
  <circle cx="1540" cy="195" r="24" fill="url(#wispGlow)"/>
  <circle cx="1540" cy="195" r="5" fill="#ffffff"/>
  <circle cx="1345" cy="245" r="16" fill="url(#wispGlow)"/>
  <circle cx="1345" cy="245" r="4" fill="#ffffff"/>

  <!-- 2. ANCIENT STONE FORTRESS & CLOCK TOWER (BACKGROUND) -->
  <!-- Left Rampart Stone Wall -->
  <g>
    <rect x="0" y="380" width="580" height="700" fill="#2b3346"/>
    <rect x="0" y="360" width="580" height="20" fill="#38435c"/>
    <!-- Stepped Battlements -->
    <rect x="360" y="320" width="60" height="40" fill="#38435c"/>
    <rect x="450" y="320" width="60" height="40" fill="#38435c"/>
    <rect x="540" y="320" width="40" height="40" fill="#38435c"/>
    <!-- Wall Brick Texture Lines -->
    <g fill="#1f2533" opacity="0.6">
      <rect x="380" y="380" width="200" height="4"/>
      <rect x="380" y="420" width="200" height="4"/>
      <rect x="380" y="460" width="200" height="4"/>
      <rect x="440" y="380" width="4" height="40"/>
      <rect x="520" y="420" width="4" height="40"/>
    </g>
  </g>

  <!-- Right Rampart Stone Wall & Iron Portcullis -->
  <g>
    <rect x="1280" y="380" width="640" height="700" fill="#2b3346"/>
    <rect x="1280" y="360" width="640" height="20" fill="#38435c"/>
    <!-- Stepped Battlements -->
    <rect x="1280" y="320" width="60" height="40" fill="#38435c"/>
    <rect x="1370" y="320" width="60" height="40" fill="#38435c"/>
    <rect x="1460" y="320" width="60" height="40" fill="#38435c"/>
    <rect x="1550" y="320" width="60" height="40" fill="#38435c"/>
    <!-- Iron Portcullis Grate on the right -->
    <rect x="1760" y="340" width="160" height="280" fill="#151922"/>
    <g stroke="#334155" stroke-width="6">
      <line x1="1780" y1="340" x2="1780" y2="620"/>
      <line x1="1810" y1="340" x2="1810" y2="620"/>
      <line x1="1840" y1="340" x2="1840" y2="620"/>
      <line x1="1870" y1="340" x2="1870" y2="620"/>
      <line x1="1900" y1="340" x2="1900" y2="620"/>
      <line x1="1760" y1="400" x2="1920" y2="400"/>
      <line x1="1760" y1="480" x2="1920" y2="480"/>
      <line x1="1760" y1="560" x2="1920" y2="560"/>
    </g>
  </g>

  <!-- Enchanted Cherry Blossom / Purple Tree behind Tower -->
  <g>
    <circle cx="1120" cy="110" r="42" fill="#581c87"/>
    <circle cx="1145" cy="125" r="36" fill="#7e22ce"/>
    <circle cx="1110" cy="135" r="40" fill="#9333ea"/>
    <circle cx="1135" cy="100" r="28" fill="#c084fc"/>
    <rect x="1110" y="80" width="8" height="8" fill="#f472b6"/>
    <rect x="1138" y="110" width="8" height="8" fill="#f472b6"/>
  </g>

  <!-- Ancient Center Clock Tower -->
  <g>
    <!-- Tower Main Column -->
    <rect x="810" y="60" width="260" height="330" fill="#38435c"/>
    <rect x="790" y="40" width="300" height="24" fill="#475569"/>
    <!-- Tower Top Battlements -->
    <rect x="790" y="16" width="50" height="24" fill="#475569"/>
    <rect x="870" y="16" width="50" height="24" fill="#475569"/>
    <rect x="960" y="16" width="50" height="24" fill="#475569"/>
    <rect x="1040" y="16" width="50" height="24" fill="#475569"/>
    <!-- Ruined Spire Crest -->
    <polygon points="940,16 935,-15 945,-15" fill="#334155"/>
    <!-- Stone Shading Details -->
    <g fill="#252d3d" opacity="0.75">
      <rect x="810" y="110" width="260" height="6"/>
      <rect x="810" y="170" width="260" height="6"/>
      <rect x="810" y="230" width="260" height="6"/>
      <rect x="810" y="290" width="260" height="6"/>
      <rect x="890" y="64" width="6" height="46"/>
      <rect x="990" y="116" width="6" height="54"/>
      <rect x="870" y="176" width="6" height="54"/>
      <rect x="1010" y="236" width="6" height="54"/>
    </g>
    <!-- Tower Arched Gate -->
    <rect x="890" y="220" width="100" height="150" fill="#131722"/>
    <rect x="900" y="200" width="80" height="20" fill="#131722"/>
    <rect x="915" y="185" width="50" height="15" fill="#131722"/>
    <!-- Inlaid Magical Cyan Diamond Crest -->
    <polygon points="940,240 955,255 940,270 925,255" fill="#38bdf8" stroke="#bae6fd" stroke-width="2"/>
    <!-- Tower Lantern Pillar on right -->
    <rect x="1140" y="190" width="100" height="190" fill="#38435c"/>
    <rect x="1130" y="175" width="120" height="18" fill="#475569"/>
    <!-- Hanging Lantern -->
    <rect x="1175" y="230" width="24" height="40" fill="#f59e0b" rx="4"/>
    <circle cx="1187" cy="250" r="45" fill="url(#torchGlow)"/>
    <rect x="1181" y="238" width="12" height="24" fill="#ffffff"/>
  </g>

  <!-- Lush Purple/Green Foliage Trees beside Tower -->
  <g>
    <circle cx="730" cy="180" r="60" fill="#3b0764"/>
    <circle cx="710" cy="205" r="50" fill="#581c87"/>
    <circle cx="750" cy="210" r="45" fill="#6b21a8"/>
    <circle cx="1270" cy="330" r="45" fill="#3b0764"/>
    <circle cx="1290" cy="345" r="35" fill="#581c87"/>
  </g>

  <!-- 3. CENTRAL COURTYARD, PATHWAY & STONE BRIDGE -->
  <!-- Courtyard Ground Surface -->
  <rect x="0" y="440" width="1920" height="640" fill="#192828"/>
  <rect x="560" y="400" width="760" height="340" fill="#203330"/>

  <!-- Dirt Paths -->
  <polygon points="560,780 720,780 820,760 820,740 600,740" fill="#5c4d3c"/>
  <polygon points="1100,760 1700,810 1700,850 1100,820" fill="#5c4d3c"/>

  <!-- Flowing River under Bridge -->
  <rect x="840" y="760" width="240" height="320" fill="url(#riverGrad)"/>
  <!-- River Stone Banks -->
  <g fill="#334155">
    <rect x="815" y="760" width="25" height="320"/>
    <rect x="1080" y="760" width="25" height="320"/>
  </g>
  <!-- Water Currents -->
  <g fill="#60a5fa" opacity="0.75">
    <rect x="880" y="860" width="60" height="5"/>
    <rect x="980" y="890" width="70" height="5"/>
    <rect x="860" y="940" width="80" height="6"/>
    <rect x="970" y="980" width="90" height="6"/>
    <rect x="900" y="1030" width="75" height="5"/>
  </g>
  <g fill="#ffffff" opacity="0.8">
    <rect x="910" y="862" width="25" height="2"/>
    <rect x="880" y="942" width="35" height="2"/>
    <rect x="1000" y="982" width="40" height="2"/>
  </g>

  <!-- Stone Arched Bridge -->
  <g>
    <!-- Bridge Parapet Stones -->
    <path d="M 810 820 Q 960 720 1110 820 L 1110 860 Q 960 760 810 860 Z" fill="#475569"/>
    <!-- Bridge Arch Span -->
    <path d="M 830 840 Q 960 760 1090 840 L 1090 870 Q 960 790 830 870 Z" fill="#64748b"/>
    <!-- Arch Shadow underneath -->
    <path d="M 850 865 Q 960 810 1070 865 L 1070 885 Q 960 830 850 885 Z" fill="#1e293b"/>
    <!-- Bridge Stone Railing Blocks -->
    <g fill="#334155">
      <rect x="830" y="800" width="16" height="24"/>
      <rect x="870" y="780" width="16" height="24"/>
      <rect x="910" y="765" width="16" height="24"/>
      <rect x="950" y="760" width="16" height="24"/>
      <rect x="990" y="765" width="16" height="24"/>
      <rect x="1030" y="780" width="16" height="24"/>
      <rect x="1070" y="800" width="16" height="24"/>
    </g>
  </g>

  <!-- Central Swirling Mist -->
  <ellipse cx="960" cy="580" rx="360" ry="110" fill="url(#mistGrad)"/>
  <ellipse cx="880" cy="640" rx="280" ry="90" fill="url(#mistGrad)"/>
  <ellipse cx="1060" cy="620" rx="260" ry="85" fill="url(#mistGrad)"/>

  <!-- 4. WOODEN CABIN ON LEFT (x: 80-580, y: 680-1040) -->
  <g>
    <!-- Cabin Roof Tiling -->
    <polygon points="50,750 330,660 610,750" fill="#451a03"/>
    <polygon points="70,740 330,670 590,740" fill="#78350f"/>
    <!-- Cabin Front Timber Wall -->
    <rect x="90" y="740" width="480" height="260" fill="#451a03"/>
    <rect x="80" y="990" width="500" height="40" fill="#334155"/>
    <!-- Wooden Vertical Planks -->
    <g fill="#78350f">
      <rect x="90" y="740" width="16" height="250"/>
      <rect x="230" y="740" width="16" height="250"/>
      <rect x="370" y="740" width="16" height="250"/>
      <rect x="554" y="740" width="16" height="250"/>
      <rect x="90" y="860" width="480" height="14"/>
    </g>
    <!-- Diagonal Timber Bracing -->
    <g stroke="#261005" stroke-width="8">
      <line x1="106" y1="750" x2="230" y2="860"/>
      <line x1="230" y1="750" x2="106" y2="860"/>
      <line x1="246" y1="750" x2="370" y2="860"/>
      <line x1="370" y1="750" x2="246" y2="860"/>
      <line x1="386" y1="750" x2="554" y2="860"/>
      <line x1="554" y1="750" x2="386" y2="860"/>
    </g>
    <!-- Cozy Lit Windows -->
    <!-- Window 1 -->
    <circle cx="280" cy="800" r="70" fill="url(#windowGlow)"/>
    <rect x="250" y="770" width="60" height="60" fill="#fde047" stroke="#451a03" stroke-width="6"/>
    <line x1="280" y1="770" x2="280" y2="830" stroke="#451a03" stroke-width="4"/>
    <line x1="250" y1="800" x2="310" y2="800" stroke="#451a03" stroke-width="4"/>
    <!-- Window 2 -->
    <circle cx="440" cy="800" r="70" fill="url(#windowGlow)"/>
    <rect x="410" y="770" width="60" height="60" fill="#fde047" stroke="#451a03" stroke-width="6"/>
    <line x1="440" y1="770" x2="440" y2="830" stroke="#451a03" stroke-width="4"/>
    <line x1="410" y1="800" x2="470" y2="800" stroke="#451a03" stroke-width="4"/>
    <!-- Doorway -->
    <rect x="365" y="874" width="70" height="116" fill="#1c0b02" stroke="#78350f" stroke-width="6"/>
    <circle cx="355" cy="880" r="30" fill="url(#torchGlow)"/>
    <rect x="350" y="870" width="12" height="18" fill="#f59e0b"/>
  </g>

  <!-- Left Trees & Rocky Outcrop -->
  <g>
    <!-- Pixel Trees -->
    <circle cx="120" cy="330" r="65" fill="#14532d"/>
    <circle cx="80" cy="360" r="55" fill="#166534"/>
    <circle cx="150" cy="380" r="50" fill="#15803d"/>
    <!-- Firefly Motives -->
    <rect x="100" y="310" width="4" height="4" fill="#fde047"/>
    <rect x="140" y="340" width="4" height="4" fill="#fde047"/>
    <rect x="75" y="375" width="4" height="4" fill="#fde047"/>
    <!-- Rocky Boulders -->
    <circle cx="160" cy="520" r="38" fill="#475569"/>
    <circle cx="130" cy="550" r="44" fill="#334155"/>
    <circle cx="190" cy="560" r="36" fill="#475569"/>
    <circle cx="110" cy="610" r="45" fill="#334155"/>
    <circle cx="160" cy="630" r="40" fill="#475569"/>
    <!-- Wood Logs Pile -->
    <g fill="#92400e" stroke="#451a03" stroke-width="4">
      <rect x="230" y="470" width="80" height="20" rx="6"/>
      <rect x="240" y="490" width="90" height="20" rx="6"/>
      <rect x="220" y="510" width="100" height="22" rx="6"/>
    </g>
  </g>

  <!-- 5. WOODEN BARN & FARM FENCE ON RIGHT (x: 1480-1840) -->
  <g>
    <!-- Barn Roof -->
    <polygon points="1440,680 1660,570 1820,680" fill="#78350f"/>
    <!-- Barn Wall -->
    <rect x="1480" y="660" width="300" height="180" fill="#451a03"/>
    <rect x="1480" y="660" width="18" height="180" fill="#92400e"/>
    <rect x="1620" y="660" width="18" height="180" fill="#92400e"/>
    <rect x="1760" y="660" width="18" height="180" fill="#92400e"/>
    <!-- Barn Door -->
    <rect x="1560" y="710" width="80" height="130" fill="#180b03"/>
    <!-- Wooden Crate beside barn -->
    <rect x="1640" y="780" width="45" height="45" fill="#b45309" stroke="#451a03" stroke-width="4"/>
    <line x1="1640" y1="780" x2="1685" y2="825" stroke="#451a03" stroke-width="3"/>
    <!-- Picket Farm Fence -->
    <g fill="#78350f">
      <path d="M 1280 820 Q 1520 950 1740 850" stroke="#78350f" stroke-width="8" fill="none"/>
      <path d="M 1280 845 Q 1520 975 1740 875" stroke="#78350f" stroke-width="8" fill="none"/>
      <!-- Fence Pickets -->
      <rect x="1300" y="800" width="12" height="60" rx="3"/>
      <rect x="1350" y="820" width="12" height="65" rx="3"/>
      <rect x="1400" y="845" width="12" height="70" rx="3"/>
      <rect x="1450" y="865" width="12" height="75" rx="3"/>
      <rect x="1500" y="875" width="12" height="75" rx="3"/>
      <rect x="1550" y="875" width="12" height="75" rx="3"/>
      <rect x="1600" y="865" width="12" height="75" rx="3"/>
      <rect x="1650" y="845" width="12" height="70" rx="3"/>
      <rect x="1700" y="820" width="12" height="65" rx="3"/>
    </g>
  </g>

  <!-- 6. TORCHES & LANTERNS WITH WARM LIGHT -->
  <!-- Torch 1 (by Cottage Steps) -->
  <g>
    <rect x="660" y="580" width="10" height="90" fill="#78350f"/>
    <circle cx="665" cy="565" r="90" fill="url(#torchGlow)"/>
    <polygon points="665,540 673,565 657,565" fill="#f59e0b"/>
    <polygon points="665,545 670,565 660,565" fill="#fef08a"/>
  </g>
  <!-- Torch 2 (by Cottage Wall) -->
  <g>
    <rect x="660" y="690" width="10" height="90" fill="#78350f"/>
    <circle cx="665" cy="675" r="90" fill="url(#torchGlow)"/>
    <polygon points="665,650 673,675 657,675" fill="#f59e0b"/>
    <polygon points="665,655 670,675 660,675" fill="#fef08a"/>
  </g>
  <!-- Stone Lantern Post by Path -->
  <g>
    <rect x="770" y="720" width="28" height="50" fill="#334155"/>
    <circle cx="784" cy="735" r="75" fill="url(#torchGlow)"/>
    <rect x="776" y="726" width="16" height="20" fill="#fde047" stroke="#1e293b" stroke-width="2"/>
  </g>
  <!-- Stone Monument near Bridge -->
  <g>
    <rect x="745" y="900" width="45" height="70" fill="#334155" rx="6"/>
    <rect x="755" y="915" width="25" height="35" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
    <circle cx="767" cy="932" r="6" fill="#fde047"/>
  </g>

  <!-- Notice Board near Prof Kotek -->
  <g>
    <rect x="1160" y="700" width="10" height="80" fill="#78350f"/>
    <rect x="1150" y="715" width="50" height="40" fill="#84cc16" stroke="#f59e0b" stroke-width="4" rx="4"/>
    <rect x="1158" y="723" width="34" height="24" fill="#fef08a"/>
  </g>

  <!-- Floating Cyan Fireflies / Wisps near Bridge & Walls -->
  <circle cx="1560" cy="860" r="14" fill="url(#wispGlow)"/>
  <circle cx="1560" cy="860" r="3.5" fill="#ffffff"/>
  <circle cx="1320" cy="570" r="12" fill="url(#wispGlow)"/>
  <circle cx="1320" cy="570" r="3" fill="#ffffff"/>
  <circle cx="740" cy="460" r="14" fill="url(#wispGlow)"/>
  <circle cx="740" cy="460" r="3.5" fill="#ffffff"/>
  <circle cx="1180" cy="620" r="12" fill="url(#wispGlow)"/>
  <circle cx="1180" cy="620" r="3" fill="#ffffff"/>

  <!-- 7. CHARACTERS & NAMEPLATES (From User Image) -->

  <!-- CHARACTER 1: KIKI (Fox) at Upper Plaza -->
  <g transform="translate(685, 235)">
    <!-- Question Mark Gold Badge -->
    <circle cx="70" cy="18" r="16" fill="#b45309" stroke="#f59e0b" stroke-width="2.5"/>
    <circle cx="70" cy="18" r="12" fill="#d97706"/>
    <text x="70" y="24" font-family="monospace" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">?</text>
    <!-- Gold Nameplate Box -->
    <rect x="10" y="44" width="120" height="28" fill="#120e06" stroke="#f59e0b" stroke-width="2.5" rx="3"/>
    <text x="70" y="63" font-family="monospace, sans-serif" font-size="15" font-weight="bold" fill="#fde047" text-anchor="middle">Kiki</text>
    <!-- Kiki Fox Sprite -->
    <!-- Head & Body -->
    <rect x="48" y="80" width="44" height="36" fill="#ea580c" rx="6"/>
    <!-- Fox Ears -->
    <polygon points="50,80 58,62 66,80" fill="#ea580c"/>
    <polygon points="54,80 58,68 62,80" fill="#ffffff"/>
    <polygon points="74,80 82,62 90,80" fill="#ea580c"/>
    <polygon points="78,80 82,68 86,80" fill="#ffffff"/>
    <!-- Fox Snout & Eyes -->
    <rect x="58" y="90" width="24" height="18" fill="#ffffff" rx="4"/>
    <rect x="68" y="98" width="6" height="4" fill="#18181b"/>
    <circle cx="58" cy="88" r="2.5" fill="#18181b"/>
    <circle cx="82" cy="88" r="2.5" fill="#18181b"/>
    <!-- Bushy Fox Tail with White Tip -->
    <path d="M 46 95 C 28 90 24 110 38 120 C 44 114 46 102 46 95 Z" fill="#ea580c"/>
    <path d="M 32 110 C 26 115 30 122 38 120 Z" fill="#ffffff"/>
    <!-- Paws -->
    <rect x="52" y="116" width="10" height="12" fill="#c2410c"/>
    <rect x="76" y="116" width="10" height="12" fill="#c2410c"/>
  </g>

  <!-- CHARACTER 2: MOKA (Squirrel) on Left Wall -->
  <g transform="translate(460, 375)">
    <!-- Question Mark Gold Badge -->
    <circle cx="70" cy="18" r="16" fill="#b45309" stroke="#f59e0b" stroke-width="2.5"/>
    <circle cx="70" cy="18" r="12" fill="#d97706"/>
    <text x="70" y="24" font-family="monospace" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">?</text>
    <!-- Gold Nameplate Box -->
    <rect x="10" y="44" width="120" height="28" fill="#120e06" stroke="#f59e0b" stroke-width="2.5" rx="3"/>
    <text x="70" y="63" font-family="monospace, sans-serif" font-size="15" font-weight="bold" fill="#fde047" text-anchor="middle">Moka</text>
    <!-- Squirrel Sprite -->
    <rect x="54" y="80" width="34" height="32" fill="#b45309" rx="6"/>
    <!-- Big Bushy Tail -->
    <path d="M 88 80 C 112 60 114 110 88 114 Z" fill="#92400e"/>
    <circle cx="62" cy="90" r="3" fill="#18181b"/>
    <rect x="56" y="96" width="16" height="12" fill="#fde68a" rx="4"/>
    <rect x="56" y="112" width="8" height="10" fill="#78350f"/>
    <rect x="74" y="112" width="8" height="10" fill="#78350f"/>
  </g>

  <!-- CHARACTER 3: KAKEK RANU on Right Wall -->
  <g transform="translate(1540, 375)">
    <!-- Question Mark Gold Badge -->
    <circle cx="130" cy="18" r="16" fill="#b45309" stroke="#f59e0b" stroke-width="2.5"/>
    <circle cx="130" cy="18" r="12" fill="#d97706"/>
    <text x="130" y="24" font-family="monospace" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">?</text>
    <!-- Gold Nameplate Box -->
    <rect x="10" y="44" width="240" height="28" fill="#120e06" stroke="#f59e0b" stroke-width="2.5" rx="3"/>
    <text x="130" y="63" font-family="monospace, sans-serif" font-size="15" font-weight="bold" fill="#fde047" text-anchor="middle">Kakek Ranu</text>
    <!-- Kakek Ranu Sprite -->
    <!-- Head & Blue Cap -->
    <rect x="110" y="78" width="36" height="22" fill="#3b82f6" rx="4"/>
    <rect x="112" y="94" width="32" height="14" fill="#fbcfe8"/>
    <!-- Long White Beard -->
    <path d="M 110 102 C 110 128 146 128 146 102 Z" fill="#ffffff"/>
    <!-- Blue Robe -->
    <rect x="112" y="112" width="32" height="32" fill="#1d4ed8"/>
    <!-- Brown Walking Staff -->
    <rect x="150" y="80" width="5" height="66" fill="#78350f"/>
    <circle cx="152" cy="80" r="5" fill="#b45309"/>
  </g>

  <!-- CHARACTER 4: PROF. KOTEK (Rooster) by Bridge -->
  <g transform="translate(1200, 685)">
    <!-- Question Mark Gold Badge -->
    <circle cx="135" cy="18" r="16" fill="#b45309" stroke="#f59e0b" stroke-width="2.5"/>
    <circle cx="135" cy="18" r="12" fill="#d97706"/>
    <text x="135" y="24" font-family="monospace" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">?</text>
    <!-- Gold Nameplate Box -->
    <rect x="10" y="44" width="250" height="28" fill="#120e06" stroke="#f59e0b" stroke-width="2.5" rx="3"/>
    <text x="135" y="63" font-family="monospace, sans-serif" font-size="15" font-weight="bold" fill="#fde047" text-anchor="middle">Prof. Kotek</text>
    <!-- Rooster Sprite -->
    <!-- Red Crest -->
    <polygon points="125,78 135,62 145,78" fill="#dc2626"/>
    <circle cx="128" cy="72" r="5" fill="#ef4444"/>
    <circle cx="138" cy="70" r="5" fill="#ef4444"/>
    <!-- White Chicken Body -->
    <circle cx="135" cy="95" r="22" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
    <!-- Yellow Beak & Glasses -->
    <polygon points="135,92 147,96 135,102" fill="#eab308"/>
    <circle cx="128" cy="90" r="4.5" fill="none" stroke="#000000" stroke-width="2"/>
    <circle cx="136" cy="90" r="4.5" fill="none" stroke="#000000" stroke-width="2"/>
    <!-- Red Wattle -->
    <circle cx="134" cy="106" r="4" fill="#dc2626"/>
    <!-- Chicken Legs -->
    <rect x="128" y="116" width="3" height="12" fill="#eab308"/>
    <rect x="138" y="116" width="3" height="12" fill="#eab308"/>
  </g>

  <!-- CHARACTER 5: BUNG JALA by Barn -->
  <g transform="translate(1620, 685)">
    <!-- Question Mark Gold Badge -->
    <circle cx="115" cy="18" r="16" fill="#b45309" stroke="#f59e0b" stroke-width="2.5"/>
    <circle cx="115" cy="18" r="12" fill="#d97706"/>
    <text x="115" y="24" font-family="monospace" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">?</text>
    <!-- Gold Nameplate Box -->
    <rect x="10" y="44" width="210" height="28" fill="#120e06" stroke="#f59e0b" stroke-width="2.5" rx="3"/>
    <text x="115" y="63" font-family="monospace, sans-serif" font-size="15" font-weight="bold" fill="#fde047" text-anchor="middle">Bung Jala</text>
    <!-- Bung Jala Sprite -->
    <!-- Straw Hat -->
    <ellipse cx="115" cy="80" rx="22" ry="8" fill="#ca8a04"/>
    <rect x="105" y="68" width="20" height="12" fill="#a16207" rx="3"/>
    <!-- Face -->
    <rect x="104" y="82" width="22" height="16" fill="#fed7aa" rx="3"/>
    <!-- Green-Blue Overalls -->
    <rect x="102" y="98" width="26" height="24" fill="#0d9488"/>
    <rect x="105" y="122" width="8" height="12" fill="#047857"/>
    <rect x="117" y="122" width="8" height="12" fill="#047857"/>
  </g>

  <!-- CHARACTER 6: PAK JOKO at Bottom -->
  <g transform="translate(500, 915)">
    <!-- Question Mark Gold Badge -->
    <circle cx="105" cy="18" r="16" fill="#b45309" stroke="#f59e0b" stroke-width="2.5"/>
    <circle cx="105" cy="18" r="12" fill="#d97706"/>
    <text x="105" y="24" font-family="monospace" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">?</text>
    <!-- Gold Nameplate Box -->
    <rect x="10" y="44" width="190" height="28" fill="#120e06" stroke="#f59e0b" stroke-width="2.5" rx="3"/>
    <text x="105" y="63" font-family="monospace, sans-serif" font-size="15" font-weight="bold" fill="#fde047" text-anchor="middle">Pak Joko</text>
  </g>

  <!-- Atmospheric Dark Vignette Overlay for UI Contrast -->
  <rect x="0" y="0" width="1920" height="1080" fill="#000000" opacity="0.18"/>
</svg>`;

fs.writeFileSync('public/start_menu_bg.svg', svg, 'utf8');
// Also duplicate with the uploaded image name so either path works
fs.writeFileSync('public/Gemini_Generated_Image_7c2kv7c2kv7c2kv7.jpg', svg, 'utf8');
fs.writeFileSync('public/start_menu_bg.png', svg, 'utf8');

console.log('Background generated successfully!');
