import { NPC, GameQuest, Item, PSEAchievement } from '../types/game';

export const TILE_SIZE = 32;
export const MAP_COLS = 36;
export const MAP_ROWS = 28;

// Tile types
export const TILE = {
  GRASS: 0,
  GRASS_FLOWERS: 1,
  PATH_STONE: 2,
  WATER: 3,
  WATER_DEEP: 4,
  WOOD_BRIDGE: 5,
  TREE_TRUNK: 6,
  TREE_TOP: 7,
  HOUSE_WALL: 8,
  HOUSE_ROOF: 9,
  FOUNTAIN: 10,
  FENCE: 11,
  FLOWER_BED: 12,
  TOWER_WALL: 13,
  SECRET_TREE: 14,
  CLIFF: 15,
  BENCH: 16,
  LAMP_POST: 17,
  SIGNPOST: 18,
  FLOWER_CART: 19,
  FOREST_PINE: 20,
  MUSHROOM_PATCH: 21,
  PLAZA_MOSAIC: 22,
  PLAZA_BORDER: 23,
  // New agricultural, plantation, and villager house tiles
  FARMLAND_SOIL: 24,
  CROP_CARROT: 25,
  CROP_CABBAGE: 26,
  CROP_WHEAT: 27,
  WATER_WELL: 28,
  SCARECROW: 29,
  HAY_BALE: 30,
  ORCHARD_APPLE: 31,
  ORCHARD_ORANGE: 32,
  HOUSE_DOOR: 33,
  HOUSE_WINDOW: 34,
};

// Map layout definition (28 rows x 36 cols)
// Generated with thoughtful zones: Plaza Alun-alun (center), River & Bridge (east), Forest (north-west), Tower (north-east),
// Village Farm & Agriculture (south-west), Village Houses & Fruit Orchard (south-east)
export function generateMapLayout(): number[][] {
  const map: number[][] = [];
  for (let r = 0; r < MAP_ROWS; r++) {
    const row: number[] = [];
    for (let c = 0; c < MAP_COLS; c++) {
      // Borders are cliffs/fences
      if (r === 0 || r === MAP_ROWS - 1 || c === 0 || c === MAP_COLS - 1) {
        row.push(TILE.CLIFF);
        continue;
      }

      // River flows vertically through columns 22 to 24
      if ((c === 22 || c === 23) && !(r >= 14 && r <= 16)) {
        row.push(TILE.WATER);
        continue;
      }

      // Wooden bridge over the river at r=14..16, c=21..24
      if ((c >= 21 && c <= 24) && (r >= 14 && r <= 16)) {
        row.push(TILE.WOOD_BRIDGE);
        continue;
      }

      // Clock Tower area (top right, r: 2..8, c: 26..33)
      if (r >= 3 && r <= 6 && c >= 28 && c <= 32) {
        row.push(r === 3 ? TILE.HOUSE_ROOF : TILE.TOWER_WALL);
        continue;
      }

      // Secret Sacred Tree in secluded forest grove (r: 3..5, c: 3..6)
      if (r === 4 && c === 4) {
        row.push(TILE.SECRET_TREE);
        continue;
      }

      // Forest zone (north-west: dense trees & pines)
      if (r < 9 && c < 15 && !(r === 4 && c === 4) && !(r === 7 && c === 8)) {
        if ((r === 1 && c === 4) || (r === 2 && c === 12) || (r === 6 && c === 2) || (r === 8 && c === 6)) {
          row.push(TILE.FOREST_PINE);
          continue;
        }
        if ((r % 2 === 1 && c % 2 === 1) || (r === 2 && c === 8)) {
          row.push(TILE.TREE_TRUNK);
          continue;
        }
        if ((r === 5 && c === 8) || (r === 7 && c === 4) || (r === 3 && c === 13)) {
          row.push(TILE.MUSHROOM_PATCH);
          continue;
        }
      }

      // --- RUMAH WARGA 1: RUMAH PETANI / PONDOK JERAMI (South-West: r: 18..20, c: 3..7) ---
      if (r >= 18 && r <= 20 && c >= 3 && c <= 7) {
        if (r === 18) {
          row.push(TILE.HOUSE_ROOF);
        } else if (r === 19) {
          if (c === 4 || c === 6) row.push(TILE.HOUSE_WINDOW);
          else row.push(TILE.HOUSE_WALL);
        } else if (r === 20) {
          if (c === 5) row.push(TILE.HOUSE_DOOR);
          else row.push(TILE.HOUSE_WALL);
        }
        continue;
      }

      // --- RUMAH WARGA 2: PONDOK PENGRAJIN & TEH (South-East: r: 19..21, c: 29..33) ---
      if (r >= 19 && r <= 21 && c >= 29 && c <= 33) {
        if (r === 19) {
          row.push(TILE.HOUSE_ROOF);
        } else if (r === 20) {
          if (c === 30 || c === 32) row.push(TILE.HOUSE_WINDOW);
          else row.push(TILE.HOUSE_WALL);
        } else if (r === 21) {
          if (c === 31) row.push(TILE.HOUSE_DOOR);
          else row.push(TILE.HOUSE_WALL);
        }
        continue;
      }

      // --- KAWASAN PERTANIAN & PERKEBUNAN SAYUR (South-West: r: 21..26, c: 2..15) ---
      // Hay bales beside farmhouse
      if ((r === 21 && (c === 3 || c === 4)) || (r === 22 && c === 2)) {
        row.push(TILE.HAY_BALE);
        continue;
      }

      // Village Water Well with stone base & bucket
      if (r === 21 && c === 9) {
        row.push(TILE.WATER_WELL);
        continue;
      }

      // Farm protective perimeter fences (Columns 6, 7, 8 left open for spacious entrance!)
      if (
        (r === 21 && (c === 2 || c === 3 || c === 4 || (c >= 10 && c <= 14))) ||
        (r === 26 && c >= 2 && c <= 14) ||
        (c === 2 && r >= 22 && r <= 25) ||
        (c === 14 && r >= 22 && r <= 25)
      ) {
        row.push(TILE.FENCE);
        continue;
      }

      // Scarecrow placed beside carrot plot (r=22, c=3) so the central path is 100% free!
      if (r === 22 && c === 3) {
        row.push(TILE.SCARECROW);
        continue;
      }

      // Central Farm Dirt Path & walking connector to Pak Joko
      if ((c === 7 && r >= 21 && r <= 25) || (r === 23 && (c === 6 || c === 7 || c === 8))) {
        row.push(TILE.PATH_STONE);
        continue;
      }

      // Farm Crops: Carrot rows (c: 4..6), Cabbage rows (c: 8..10), Golden Wheat field (c: 11..13, r: 22..25)
      if (r >= 22 && r <= 25 && c >= 3 && c <= 13) {
        if (c === 3) {
          row.push(TILE.FARMLAND_SOIL);
          continue;
        }
        if (c >= 4 && c <= 6) {
          row.push(r === 25 ? TILE.CROP_WHEAT : TILE.CROP_CARROT);
          continue;
        }
        if (c >= 8 && c <= 10) {
          row.push(r === 25 ? TILE.CROP_WHEAT : TILE.CROP_CABBAGE);
          continue;
        }
        if (c >= 11 && c <= 13) {
          row.push(TILE.CROP_WHEAT);
          continue;
        }
      }

      // --- PERKEBUNAN BUAH WARGA (Fruit Orchard South-East: r: 23..25, c: 25..28) ---
      if ((r === 23 && c === 25) || (r === 25 && c === 25) || (r === 24 && c === 27)) {
        row.push(TILE.ORCHARD_APPLE);
        continue;
      }
      if ((r === 23 && c === 28) || (r === 25 && c === 28) || (r === 24 && c === 26)) {
        row.push(TILE.ORCHARD_ORANGE);
        continue;
      }

      // Crossroads Signpost
      if (r === 9 && c === 11) {
        row.push(TILE.SIGNPOST);
        continue;
      }

      // Farm area signpost
      if (r === 17 && c === 7) {
        row.push(TILE.SIGNPOST);
        continue;
      }

      // Central Fountain Plaza (Alun-alun: r: 12..16, c: 8..14)
      if (r === 14 && c === 11) {
        row.push(TILE.FOUNTAIN);
        continue;
      }

      // Alun-Alun Plaza features & perimeter
      if (r >= 12 && r <= 16 && c >= 8 && c <= 14) {
        // Plaza corner street lamps
        if ((r === 12 && c === 8) || (r === 12 && c === 14) || (r === 16 && c === 8) || (r === 16 && c === 14)) {
          row.push(TILE.LAMP_POST);
          continue;
        }
        // Wooden park benches at plaza sides
        if ((r === 12 && c === 11) || (r === 16 && c === 11)) {
          row.push(TILE.BENCH);
          continue;
        }
        // Market flower cart at plaza corner
        if (r === 16 && c === 9) {
          row.push(TILE.FLOWER_CART);
          continue;
        }
        // Outer decorative plaza border
        if (r === 12 || r === 16 || c === 8 || c === 14) {
          row.push(TILE.PLAZA_BORDER);
          continue;
        }
        // Mosaic floor around fountain
        if (Math.abs(r - 14) + Math.abs(c - 11) <= 2) {
          row.push(TILE.PLAZA_MOSAIC);
          continue;
        }
        row.push(TILE.PATH_STONE);
        continue;
      }

      // Stone paths connecting areas
      // Horizontal plaza path (r: 15, c: 3..21)
      if (r === 15 && c >= 3 && c <= 21) {
        row.push(TILE.PATH_STONE);
        continue;
      }
      // Vertical path to North Forest (c: 11, r: 8..15)
      if (c === 11 && r >= 8 && r <= 15) {
        row.push(TILE.PATH_STONE);
        continue;
      }
      // Vertical path down to Farm & Village (c: 7, r: 15..20)
      if (c === 7 && r >= 15 && r <= 20) {
        row.push(TILE.PATH_STONE);
        continue;
      }
      // Village square connection path (r: 17, c: 7..11)
      if (r === 17 && c >= 7 && c <= 11) {
        row.push(TILE.PATH_STONE);
        continue;
      }
      // Path leading from bridge to Tower (r: 15..8, c: 24..30)
      if ((r === 15 && c >= 24 && c <= 30) || (c === 30 && r >= 7 && r <= 15)) {
        row.push(TILE.PATH_STONE);
        continue;
      }
      // Path leading to East Cottage & Orchard (c: 31, r: 16..22)
      if (c === 31 && r >= 16 && r <= 22) {
        row.push(TILE.PATH_STONE);
        continue;
      }
      // Orchard connecting path (r: 22, c: 24..31)
      if (r === 22 && c >= 24 && c <= 31) {
        row.push(TILE.PATH_STONE);
        continue;
      }

      // Benches along riverbank and village
      if ((r === 16 && c === 6) || (r === 18 && c === 27) || (r === 22 && c === 32)) {
        row.push(TILE.BENCH);
        continue;
      }

      // Streetlamps along paths
      if ((r === 14 && c === 19) || (r === 14 && c === 25) || (r === 10 && c === 30) || (r === 20 && c === 28)) {
        row.push(TILE.LAMP_POST);
        continue;
      }

      // Fences bordering gardens
      if (r === 17 && c >= 14 && c <= 17) {
        row.push(TILE.FENCE);
        continue;
      }

      // Flower patches
      if (
        (r === 13 && c === 6) ||
        (r === 18 && c === 15) ||
        (r === 19 && c === 16) ||
        (r === 12 && c === 19) ||
        (r === 18 && c === 25) ||
        (r === 24 && c === 30)
      ) {
        row.push(TILE.FLOWER_BED);
        continue;
      }

      // Random grass with tiny flowers
      if ((r * 17 + c * 31) % 9 === 0) {
        row.push(TILE.GRASS_FLOWERS);
      } else {
        row.push(TILE.GRASS);
      }
    }
    map.push(row);
  }
  return map;
}

// Solid obstacles for collision
export function isTileSolid(tile: number): boolean {
  return (
    tile === TILE.CLIFF ||
    tile === TILE.WATER ||
    tile === TILE.TREE_TRUNK ||
    tile === TILE.FOREST_PINE ||
    tile === TILE.HOUSE_WALL ||
    tile === TILE.HOUSE_ROOF ||
    tile === TILE.HOUSE_WINDOW ||
    tile === TILE.HOUSE_DOOR ||
    tile === TILE.FOUNTAIN ||
    tile === TILE.FENCE ||
    tile === TILE.TOWER_WALL ||
    tile === TILE.BENCH ||
    tile === TILE.LAMP_POST ||
    tile === TILE.FLOWER_CART ||
    tile === TILE.SIGNPOST ||
    tile === TILE.WATER_WELL ||
    tile === TILE.SCARECROW ||
    tile === TILE.HAY_BALE ||
    tile === TILE.ORCHARD_APPLE ||
    tile === TILE.ORCHARD_ORANGE
  );
}

// Initial NPCs configuration
export const INITIAL_NPCS: NPC[] = [
  {
    id: 'kiki',
    name: 'Kiki',
    role: 'Tupai Pos Cilik',
    x: 8,
    y: 13,
    sprite: 'squirrel',
    facing: 'down',
    emotionProfile: {
      surfaceEmotion: 'cemas',
      deepEmotion: 'takut',
      reason: 'Surat-surat penting desa berhamburan saat kabut datang, takut mengecewakan semua orang!',
      selInsight: 'Kecemasan membuat napas pendek & pikiran kusut. Teknik Napas Balon membantu menenangkan detak jantung.',
      calmTechnique: 'napas_balon',
    },
    currentDialogueId: 'kiki_intro',
    isResolved: false,
  },
  {
    id: 'kakek_ranu',
    name: 'Kakek Ranu',
    role: 'Tukang Kayu & Penjaga Jembatan',
    x: 20,
    y: 15,
    sprite: 'old_man',
    facing: 'left',
    emotionProfile: {
      surfaceEmotion: 'marah',
      deepEmotion: 'kecewa',
      reason: 'Marah karena jembatan dituduh rusak karena kelalaiannya, padahal ia kesepian dan merasa tak dihargai.',
      selInsight: 'Kemarahan seringkali adalah "lapisan luar" pelindung dari rasa terluka atau merasa tidak dipedulikan.',
      calmTechnique: 'validasi',
    },
    currentDialogueId: 'ranu_intro',
    isResolved: false,
  },
  {
    id: 'bimo',
    name: 'Bimo',
    role: 'Murid Pembuat Jam (Kelas 4)',
    x: 7,
    y: 6,
    sprite: 'boy_glasses',
    facing: 'right',
    emotionProfile: {
      surfaceEmotion: 'sedih',
      deepEmotion: 'cemas',
      reason: 'Bersembunyi di hutan karena roda gigi utama jam desa jatuh dari tangannya. Takut dibilang ceroboh.',
      selInsight: 'Membuat kesalahan adalah bagian dari proses belajar. Bimo butuh dukungan untuk memisahkan "kesalahan tindakan" dari "harga diri".',
      calmTechnique: 'reframing',
    },
    currentDialogueId: 'bimo_intro',
    isResolved: false,
  },
  {
    id: 'prof_kotek',
    name: 'Prof. Kotek',
    role: 'Ayam Peneliti Emosi (Rahasia Lucu)',
    x: 16,
    y: 19,
    sprite: 'chicken_glasses',
    facing: 'down',
    emotionProfile: {
      surfaceEmotion: 'gembira',
      deepEmotion: 'tenang',
      reason: 'Mengamati tingkat stres warga dengan alat pengukur detak kokok!',
      selInsight: 'Tawa dan humor sehat memicu pelepasan endorfin yang menurunkan hormon stres kortisol.',
      calmTechnique: 'solusi_bersama',
    },
    currentDialogueId: 'kotek_intro',
    isResolved: false,
    isCustomSecret: true,
  },
  {
    id: 'penjaga_kabut',
    name: 'Sosok Kabut / Nenek Wilis',
    role: 'Penjaga Menara & Pustakawan Desa',
    x: 30,
    y: 8,
    sprite: 'spirit_elder',
    facing: 'down',
    emotionProfile: {
      surfaceEmotion: 'kecewa',
      deepEmotion: 'sedih',
      reason: 'Menutup menara dengan kabut abu-abu karena lelah melihat warga saling menyalahkan tanpa mendengar isi hati.',
      selInsight: 'Kebutuhan dasar manusia adalah didengar (heard) dan dipahami (understood). Empati membuka jalan rekonsiliasi.',
      calmTechnique: 'solusi_bersama',
    },
    currentDialogueId: 'tower_intro',
    isResolved: false,
  },
  // --- OPTIONAL PSE EDUCATOR NPCS (Bonus Wawasan PSE & Achievement) ---
  {
    id: 'kak_citra',
    name: 'Kak Citra',
    role: 'Konselor Cilik Taman Bunga',
    x: 14,
    y: 18,
    sprite: 'girl_counselor',
    facing: 'left',
    emotionProfile: {
      surfaceEmotion: 'tenang',
      deepEmotion: 'gembira',
      reason: 'Senang membantu anak-anak mengenali 4 Zona Regulasi Emosi lewat bunga-bunga warna-warni.',
      selInsight: 'Mengenali zona emosi diri sendiri (Hijau, Kuning, Merah, Biru) adalah pilar kesadaran diri (Self-Awareness).',
      calmTechnique: 'validasi',
    },
    currentDialogueId: 'citra_intro',
    isResolved: false,
    isOptionalEducator: true,
  },
  {
    id: 'kakek_damai',
    name: 'Kakek Damai',
    role: 'Praktisi Mindful & Pohon Bonsai',
    x: 27,
    y: 19,
    sprite: 'zen_master',
    facing: 'left',
    emotionProfile: {
      surfaceEmotion: 'tenang',
      deepEmotion: 'tenang',
      reason: 'Mengamati aliran sungai jernih sambil melatih Lingkaran Kendali (Circle of Control).',
      selInsight: 'Fokus pada hal yang bisa kita kendalikan (respon, kata-kata) membebaskan pikiran dari kecemasan berlebih.',
      calmTechnique: 'reframing',
    },
    currentDialogueId: 'damai_intro',
    isResolved: false,
    isOptionalEducator: true,
  },
  {
    id: 'moka_cat',
    name: 'Moka',
    role: 'Kucing Pustakawan Lembut',
    x: 6,
    y: 15,
    sprite: 'cat_librarian',
    facing: 'down',
    emotionProfile: {
      surfaceEmotion: 'tenang',
      deepEmotion: 'haru',
      reason: 'Menemani siapa saja yang butuh didengarkan tanpa buru-buru dipotong atau dinasihati.',
      selInsight: 'Mendengarkan aktif (Active Listening) berarti hadir utuh dengan mata dan hati, bukan sekadar menunggu giliran bicara.',
      calmTechnique: 'validasi',
    },
    currentDialogueId: 'moka_intro',
    isResolved: false,
    isOptionalEducator: true,
  },
  {
    id: 'pak_joko',
    name: 'Pak Joko',
    role: 'Petani Kebun Harapan',
    x: 8,
    y: 23,
    sprite: 'farmer',
    facing: 'right',
    emotionProfile: {
      surfaceEmotion: 'tenang',
      deepEmotion: 'gembira',
      reason: 'Menyiram tanaman dengan sabar setiap pagi. Belajar bahwa pertumbuhan butuh waktu, pupuk perhatian, dan proses.',
      selInsight: 'Growth Mindset & Kesabaran Proses: Karakter dan ketenangan batin tidak tumbuh dalam semalam, melainkan dipupuk lewat latihan harian.',
      calmTechnique: 'reframing',
    },
    currentDialogueId: 'joko_intro',
    isResolved: false,
    isOptionalEducator: true,
  },
  {
    id: 'didi_scout',
    name: 'Didi',
    role: 'Pengelana Cilik Desa',
    x: 11,
    y: 17,
    sprite: 'wandering_scout',
    facing: 'down',
    emotionProfile: {
      surfaceEmotion: 'gembira',
      deepEmotion: 'tenang',
      reason: 'Senang berkeliling menyapa tetangga dan menikmati udara segar pedesaan!',
      selInsight: 'Keterampilan Relasi (Relationship Skills): Senyuman dan sapaan ramah adalah jembatan tercepat membangun rasa aman dan persahabatan di lingkungan sosial.',
      calmTechnique: 'solusi_bersama',
    },
    currentDialogueId: 'didi_intro',
    isResolved: false,
    isOptionalEducator: true,
  },
  {
    id: 'teguh_woodcutter',
    name: 'Pak Teguh',
    role: 'Penebang Pohon Hutan Bijak',
    x: 6,
    y: 8,
    sprite: 'woodcutter',
    facing: 'down',
    emotionProfile: {
      surfaceEmotion: 'tenang',
      deepEmotion: 'haru',
      reason: 'Hanya menebang ranting rapuh agar tunas muda mendapat cahaya matahari. Melatih kontrol amarah!',
      selInsight: 'Self-Management & Regulasi Amarah: Mengetahui kapan harus "memotong" siklus emosi mendidih sebelum melukai orang lain.',
      calmTechnique: 'reframing',
    },
    currentDialogueId: 'teguh_intro',
    isResolved: false,
    isOptionalEducator: true,
  },
  {
    id: 'sari_fruit',
    name: 'Ibu Sari',
    role: 'Petani Kebun Buah Hutan',
    x: 13,
    y: 7,
    sprite: 'fruit_farmer',
    facing: 'left',
    emotionProfile: {
      surfaceEmotion: 'gembira',
      deepEmotion: 'haru',
      reason: 'Memetik buah manis hutan bersama warga dan bersyukur atas berkah alam yang melimpah.',
      selInsight: 'Social-Awareness & Rasa Syukur: Berbagi keberhasilan dan mengapresiasi kebaikan sesama melipatgandakan kebahagiaan batin.',
      calmTechnique: 'solusi_bersama',
    },
    currentDialogueId: 'sari_intro',
    isResolved: false,
    isOptionalEducator: true,
  },
  {
    id: 'jala_fisher',
    name: 'Bung Jala',
    role: 'Pemancing Sabar Tepi Sungai',
    x: 21,
    y: 19,
    sprite: 'fisherman',
    facing: 'right',
    emotionProfile: {
      surfaceEmotion: 'tenang',
      deepEmotion: 'tenang',
      reason: 'Menikmati aliran air jernih sungai. Memancing mengajarkan bahwa hal berharga butuh kesabaran dan ketenangan.',
      selInsight: 'Mindfulness & Kesabaran (Delayed Gratification): Belajar hening, menerima proses tanpa frustrasi, dan bernapas teratur.',
      calmTechnique: 'napas_balon',
    },
    currentDialogueId: 'jala_intro',
    isResolved: false,
    isOptionalEducator: true,
  },
];

// Quests flow
export const INITIAL_QUESTS: GameQuest[] = [
  {
    id: 'quest_start',
    title: 'Gunakan Kompas Resonansi Hati',
    targetNPC: 'kiki',
    description: 'Bumi bergetar dan warna memudar! Ambil Kompas Hati yang bersinar di dekat Air Mancur lalu gunakan pada Kiki.',
    isCompleted: false,
    stepHint: 'Dekati Kiki di barat air mancur lalu tekan tombol Kompas Resonansi.',
  },
  {
    id: 'quest_bridge',
    title: 'Misteri Jembatan Terkunci',
    targetNPC: 'kakek_ranu',
    description: 'Kakek Ranu mengunci jembatan kayu ke timur. Kenali alasan kemarahannya dengan Kompas dan berikan respon empatik.',
    isCompleted: false,
    stepHint: 'Pergi ke timur menuju jembatan. Gunakan Resonansi Emosi untuk melihat luka batin Kakek Ranu.',
  },
  {
    id: 'quest_bimo',
    title: 'Jejak Roda Gigi di Hutan Sunyi',
    targetNPC: 'bimo',
    description: 'Bimo bersembunyi di hutan barat laut. Bantu dia mengatasi rasa takut bersalah agar ia berani menyerahkan roda gigi jam.',
    isCompleted: false,
    stepHint: 'Periksa pepohonan di sudut utara. Bicaralah pada Bimo dengan teknik pemisahan kesalahan.',
  },
  {
    id: 'quest_tower',
    title: 'Membuka Hati Menara Jam',
    targetNPC: 'penjaga_kabut',
    description: 'Bawa Roda Gigi Harmoni ke Menara Jam. Ungkap siapa sosok di balik kabut dan pulihkan warna Lembah Nada Rasa!',
    isCompleted: false,
    stepHint: 'Seberangi jembatan yang terbuka, menuju puncak menara jam di timur laut.',
  },
];

// Initial items
export const INITIAL_ITEMS: Item[] = [];

// Educational SEL Knowledge Nuggets (Kamus Cerdas Emosi)
export const SEL_GLOSSARY = [
  {
    title: 'Otak Siaga vs Otak Bijak',
    concept: 'Amigdala & Korteks Prefrontal',
    explanation: 'Saat kita panik atau marah besar, "Si Penjaga Siaga" (Amigdala) membunyikan alarm bahaya. Agar "Si Pemikir Bijak" (Korteks) bisa bekerja lagi, kita butuh napas perlahan dan ketenangan.',
    icon: '🧠',
  },
  {
    title: 'Gunung Es Emosi (Iceberg Emotion)',
    concept: 'Emosi Lapisan Luar vs Dalam',
    explanation: 'Marah seringkali hanya puncak gunung es yang terlihat di permukaan air. Di dasarnya, tersembunyi rasa kecewa, takut, sedih, atau merasa tidak dihargai.',
    icon: '🧊',
  },
  {
    title: 'Rumus Pesan-Aku (I-Message)',
    concept: 'Komunikasi Asertif Tanpa Menuduh',
    explanation: 'Alih-alih menuduh "Kamu selalu bikin salah!", katakan: "Aku merasa cemas ketika roda gigi hilang, karena kita butuh jam ini berbunyi tepat waktu. Bisakah kita cari bersama?"',
    icon: '💬',
  },
  {
    title: 'Teknik Napas Balon 4-4-4',
    concept: 'Regulasi Fisiologis Mandiri',
    explanation: 'Tarik napas 4 detik (bayangkan meniup balon besar di perut), tahan 4 detik, hembuskan perlahan 4 detik. Tubuh langsung memberi sinyal aman ke otak!',
    icon: '🎈',
  },
  {
    title: 'Jangkar Indera 5-4-3-2-1',
    concept: 'Teknik Grounding Sensori',
    explanation: 'Saat pikiran melayang atau terseret cemas, amati 5 benda terlihat, sentuh 4 tekstur, dengar 3 suara, hirup 2 aroma, dan rasakan 1 kebaikan diri untuk membumikan kesadaran.',
    icon: '👁️',
  },
  {
    title: 'Rem Darurat S-T-O-P',
    concept: 'Stop, Take Breath, Observe, Proceed',
    explanation: 'Jeda 1 menit sebelum bereaksi: Berhenti sejenak (Stop), Tarik napas (Take breath), Amati detak dan sensasi tubuh (Observe), lalu Lanjutkan dengan respon terbijak (Proceed).',
    icon: '🛑',
  },
  {
    title: 'Goyang Lepas Ketegangan',
    concept: 'Somatic Release & Regulasi Kinestetik',
    explanation: 'Hewan di alam liar mengguncangkan tubuh setelah lolos dari bahaya untuk membuang kelebihan hormon stres (kortisol). Goyang tangan dan bahu melonggarkan otot kaku.',
    icon: '⚡',
  },
];

// Achievements for completing optional PSE mentorships and explorations
export const PSE_ACHIEVEMENTS: PSEAchievement[] = [
  {
    id: 'badge_counselor_zones',
    title: 'Pakar 4 Zona Regulasi Emosi',
    mentor: 'Kak Citra (Konselor Cilik)',
    icon: '🌸',
    concept: 'Zona Hijau, Kuning, Merah, & Biru',
    description: 'Memahami bahwa semua emosi itu manusiawi, dan menguasai strategi kembali ke Zona Hijau saat kewalahan.',
    isUnlocked: false,
  },
  {
    id: 'badge_circle_of_control',
    title: 'Penguasa Lingkaran Kendali',
    mentor: 'Kakek Damai (Praktisi Mindful)',
    icon: '🧘🏻‍♂️',
    concept: 'Circle of Control vs Circle of Concern',
    description: 'Mampu membedakan apa yang ada di dalam kendali diri (respon & usaha) vs di luar kendali (sikap orang lain).',
    isUnlocked: false,
  },
  {
    id: 'badge_active_listening',
    title: 'Sahabat Pendengar Sejati',
    mentor: 'Moka si Kucing Pustakawan',
    icon: '🐱',
    concept: 'Mendengarkan Reflektif & Validasi',
    description: 'Belajar mendengarkan dengan mata hati tanpa memotong atau menghakimi cerita sahabat.',
    isUnlocked: false,
  },
  {
    id: 'badge_laughter_medicine',
    title: 'Doktor Humor & Endorfin',
    mentor: 'Prof. Kotek (Ayam Cendekia)',
    icon: '🐔',
    concept: 'Pelepasan Hormon Stres lewat Tawa',
    description: 'Menemukan rahasia Profesor Kotek bahwa humor sehat adalah peredam amigdala tercepat.',
    isUnlocked: false,
  },
  {
    id: 'badge_sacred_tree',
    title: 'Pewaris Pohon Purba',
    mentor: 'Pohon Sahabat Purba',
    icon: '🌳',
    concept: 'Tiga Kata Ajaib Hubungan Sosial',
    description: 'Menemukan kapsul waktu persahabatan di pohon rahasia dan memahami kekuatan maaf, tolong, dan terima kasih.',
    isUnlocked: false,
  },
  {
    id: 'badge_growth_mindset',
    title: 'Pakar Pola Pikir Berkembang',
    mentor: 'Pak Joko (Petani Harapan)',
    icon: '🌱',
    concept: 'Growth Mindset & Proses Bertumbuh',
    description: 'Menyadari bahwa kesabaran, kerja keras bertahap, dan belajar dari kesalahan adalah kunci menumbuhkan potensi diri.',
    isUnlocked: false,
  },
  {
    id: 'badge_friendly_greeter',
    title: 'Duta Sapaan Ramah Desa',
    mentor: 'Didi (Pengelana Cilik)',
    icon: '🌻',
    concept: 'Relationship Skills & Senyuman Hangat',
    description: 'Memahami kekuatan sebuah sapaan hangat dan senyuman tulus dalam meruntuhkan dinding kecanggungan sosial.',
    isUnlocked: false,
  },
  {
    id: 'badge_woodcutter_anger',
    title: 'Penebang Amarah Bijak',
    mentor: 'Pak Teguh (Penebang Pohon)',
    icon: '🪓',
    concept: 'Self-Management & Jeda Regulasi Amarah',
    description: 'Menguasai keterampilan mengambil time-out dan meredam amigdala sebelum membakar pohon hubungan pertemanan.',
    isUnlocked: false,
  },
  {
    id: 'badge_fruit_gratitude',
    title: 'Pemetik Rasa Syukur & Berbagi',
    mentor: 'Ibu Sari (Petani Buah Hutan)',
    icon: '🍎',
    concept: 'Gratitude & Social-Awareness',
    description: 'Belajar mensyukuri berkah harian dan melipatgandakan sukacita dengan membagikan kepedulian kepada sesama.',
    isUnlocked: false,
  },
  {
    id: 'badge_fisherman_patience',
    title: 'Pemancing Kesabaran Murni',
    mentor: 'Bung Jala (Pemancing Sabar)',
    icon: '🎣',
    concept: 'Mindfulness & Delayed Gratification',
    description: 'Melatih ketenangan batin, tidak tergesa-gesa atau impulsif, serta menikmati proses bertahap menuju hasil indah.',
    isUnlocked: false,
  },
];

