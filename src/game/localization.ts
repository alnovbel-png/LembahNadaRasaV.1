import React, { createContext, useContext, useState } from 'react';
import { DialogueNode, ChoiceOption, GameQuest, PSEAchievement, Item } from '../types/game';

export type GameLanguage = 'id';

export function getInitialLanguage(): GameLanguage {
  return 'id';
}

export const UI_TEXT = {
  id: {
    languageName: 'Bahasa Indonesia',
    switchPrompt: 'BAHASA PERMAINAN',
    headerBadge: 'EDISI RESMI ANAK-ANAK',
    soundOn: 'Suara Hidup',
    soundMute: 'Senyap',
    genreBadge: 'GIM PERAN SOSIAL-EMOSIONAL',
    gameTitle: 'LEMBAH NADA RASA',
    gameSubtitle: 'Petualangan Harmoni & Resonansi Rasa',
    synopsis:
      'Sebuah kabut kelabu menyelimuti Lembah Nada Rasa. Sebagai penjelajah muda, kamu menemukan Pusaka Kompas Hati untuk memulihkan kepekaan rasa para warga desa.',
    empathy: 'Empati',
    breathRegulation: 'Regulasi Napas',
    emotionAwareness: 'Mengenal Emosi',
    howToPlay: 'Cara Bermain',
    audioOptions: 'Audio dan Opsi',
    safeBrowserNote: '100% di peramban dan ramah anak',
    charCustomizationTitle: 'PILIH KARAKTER DAN NAMA PANGGILAN',
    freeCustomization: 'Penyesuaian Bebas',
    boyTitle: 'Petualang Laki-Laki',
    boyAvatar: 'Avatar: Ezzel',
    girlTitle: 'Petualang Perempuan',
    girlAvatar: 'Avatar: Ezzy',
    nicknameLabel: 'Nama Panggilan Karakter:',
    maxChars: 'Maksimal 14 Karakter',
    placeholderBoy: 'Nama (misalnya: Ezzel)',
    placeholderGirl: 'Nama (misalnya: Ezzy)',
    reset: 'Atur Ulang',
    tipNote: '💡 Nama {name} otomatis tertera pada dialog warga dan sertifikat!',
    startButton: 'MULAI SEBAGAI {name}',
    enterTip: 'Tekan tombol di atas atau tekan Enter untuk masuk',

    // Start Menu Actions
    mainMenu: 'MENU UTAMA',
    play: 'BERMAIN',
    startAdventure: 'MULAI PETUALANGAN',
    settings: 'Pengaturan',
    gameOptions: 'PENGATURAN GIM DAN AKSESIBILITAS',
    exit: 'KELUAR',
    closeGame: 'TUTUP PERMAINAN',
    pressEnterToSelect: 'Tekan Tombol Enter untuk Memilih',
    exitConfirmTitle: 'Konfirmasi Keluar dari Permainan',
    exitConfirmDesc: 'Apakah kamu yakin ingin menutup jendela permainan ini? Kemajuan tersimpan otomatis di perangkatmu.',
    cancel: 'Batal',
    confirmExit: 'Keluar dari Permainan',

    // Dialogue Box
    skip: 'LEWATI',
    closeEsc: 'TUTUP (ESC)',
    missionGuidanceHeader: 'PANDUAN ALUR MISI BERURUTAN',
    missionGuidanceSub: 'Wajib Selesaikan Satu per Satu',
    innerHeartVoice: 'Suara Hati Terdalam (Kompas):',
    showAllText: '⚡ Tampilkan Semua Teks (Spasi)',
    chooseResponse: 'Pilih Responsmu',
    reReadText: '← Baca Ulang Teks',
    listenFirst: 'Dengarkan dan baca ucapan karakter terlebih dahulu...',
    readFinished: 'Sudah selesai membaca teks? Tekan tombol untuk menentukan respons tanggapanmu.',
    continueNext: 'Lanjutkan (Spasi / Enter) →',
    selectResponsePrompt: 'Pilih Respons Tanggapan (Spasi) 💬',
    startInteractiveBreathing: 'Mulai Latihan Napas Interaktif 🌬️',
    startInteractiveGrounding: 'Mulai Latihan Pembumian Pancaindra 👁️',
    startInteractiveStop: 'Mulai Jeda Darurat STOP 🛑',
    startInteractiveShakeout: 'Mulai Goyang Lepas Ketegangan ⚡',

    // Sequential Missions
    missionStepBadge: 'MISI {step} DARI {total}',
    missionCompletedBadge: 'SELESAI',
    missionFreeRoamBadge: 'JELAJAH BEBAS',

    // Virtual Controls & HUD
    brandTitle: 'Lembah Nada Rasa',
    openPauseMenu: 'Buka Menu Jeda (Esc)',
    activeResonance: 'Resonansi Aktif',
    heartCompass: 'Kompas Hati',
    toggleResonance: 'Aktifkan Kompas Resonansi Hati (C)',
    map: 'Peta',
    regulation: 'Regulasi',
    journal: 'Jurnal',
    tutorial: 'Panduan',
    tutorialDesc: 'Panduan kendali, kompas, dan cara bermain (H)',
    certificate: 'Sertifikat',
    adventureMenu: 'Menu Petualangan',
    valleyMap: 'Peta Lembah',
    valleyMapDesc: 'Lihat lokasi warga, jembatan, dan menara jam',
    mapActive: 'Aktif',
    regulationStudio: 'Studio Regulasi Emosi',
    regulationStudioDesc: 'Latihan napas balon, relaksasi 4-7-8, dan pembumian pancaindra',
    journalBag: 'Jurnal dan Tas Petualang',
    journalBagDesc: 'Kisah desa, barang pusaka, dan wawasan empati',
    certificateMenu: 'Sertifikat Kelulusan PSE',
    certificateMenuDesc: 'Piagam Duta Empati Emas',
    titleScreen: 'Layar Judul / Menu Awal',
    titleScreenDesc: 'Buka layar pembuka, sinopsis, dan pengaturan gim',
    mainCharacterLabel: 'Karakter Utama:',
    compassLabel: 'Kompas Hati:',
    compassActive: 'Aktif',
    compassStandby: 'Siaga',
    btnCompassActive: 'AKTIF',
    btnCompassStandby: 'HATI',
    btnAction: 'AKSI',
    btnTalk: 'BICARA',
    languageToggle: 'Bahasa',

    // Quick Actions
    talkAction: 'BICARA',
    examineAction: 'PERIKSA',
    readSignAction: 'BACA PLANG',
    guideButton: 'Tuntun',
    guideButtonTitle: 'Tuntun karakter berjalan otomatis menuju sasaran misi',
    missionTarget: 'SASARAN MISI',
    missionStep: 'MISI {step}/4',
    missionStepFull: 'MISI {step} DARI {total}',
    missionCompleted: 'SELESAI',
    freeRoamActive: 'JELAJAH BEBAS',

    // Mission Banners (Pencarian Komponen Menara Jam Harmoni)
    mission1Title: 'Misi 1: Dapatkan Pegas Jam (Kiki)',
    mission2Title: 'Misi 2: Dapatkan Poros Jam (Kakek Ranu)',
    mission3Title: 'Misi 3: Dapatkan Roda Gigi Emas (Bimo)',
    mission4Title: 'Misi 4: Kumpulkan 12 Komponen dan Nyalakan Menara Jam',
    mission5Title: 'Menara Jam Berdentang dan Harmoni Pulih!',
    mission1Hint: 'Hampiri Kiki di alun-alun. Pahami rasa panik dan takutnya akibat salah paham, lalu berikan respons empati untuk mendapatkan Pegas Detak Jam!',
    mission1HintActive: 'Ajak Kiki berbicara (Tekan Spasi). Tenangkan Kiki dengan respons empati agar Kiki merasa aman dan menyerahkan Pegas Detak Jam.',
    mission2Hint: 'Berjalanlah ke jembatan di timur. Pahami rasa lelah Kakek Ranu dan luruskan kesalahpahaman untuk menerima Poros Penggerak Jam.',
    mission3Hint: 'Berjalanlah ke Hutan Sunyi di barat laut. Bantu Bimo mengatasi rasa bersalahnya agar ia menyerahkan Roda Gigi Emas Jam.',
    mission4Hint: 'Kumpulkan seluruh 12 Komponen Jam dari warga desa! Setelah lengkap (12/12), temui Nenek Wilis di Menara Jam untuk merakit dan menyalakannya!',
    mission5Hint: '🌿 Menara Jam berdentang lagi! Seluruh 12 komponen jam telah menyatu dan harmoni desa telah pulih seutuhnya.',

    // Locations
    locationPlaza: 'Alun-Alun dan Air Mancur',
    locationBridge: 'Jembatan Kayu (Arah Timur)',
    locationForest: 'Hutan Sunyi (Barat Laut)',
    locationTower: 'Menara Jam Harmoni (Timur Laut)',
    locationVillage: 'Seluruh Desa',

    // Pause Menu
    gamePaused: 'PERMAINAN DIJEDA',
    pausedDesc: 'Ambil napas sejenak, periksa jurnal, atau ubah pengaturan.',
    resumeGame: 'Lanjutkan Petualangan (Esc)',
    regulationMenu: 'Studio Regulasi (R)',
    journalMenu: 'Jurnal Kompas dan Panduan (J)',
    optionsMenu: 'Pengaturan dan Panduan (O)',
    backToTitle: 'Menu Awal / Mulai Ulang',

    // Regulation Studio
    regulationStudioTitle: 'STUDIO REGULASI EMOSI',
    regulationStudioSubtitle: 'Latihan Pernapasan, Kesadaran Pancaindra, dan Ketenangan Diri',
    modeBalloonTitle: 'Irama Balon Tenang',
    modeBalloonSubtitle: 'Napas Berirama 4-4-4',
    modeBalloonCategory: 'Ritme dan Keseimbangan Napas',
    modeBalloonDesc: 'Tahan napas tepat selama 4 detik agar balon menyentuh cincin sasaran, jaga kursor di zona hijau yang bergetar selama 4 detik, lalu embuskan perlahan.',
    modeGroundingTitle: 'Kaca Pembesar Indra',
    modeGroundingSubtitle: 'Pembumian Pancaindra 5-4-3-2-1',
    modeGroundingCategory: 'Pencarian Objek Bergerak',
    modeGroundingDesc: 'Kendalikan lensa kaca pembesar untuk menembus kabut kepanikan dan tangkap 5 objek alam yang bergerak cepat sebelum waktu habis.',
    modeStopTitle: 'Rem Reaksi S-T-O-P',
    modeStopSubtitle: 'Cegah Respons Impulsif',
    modeStopCategory: 'Refleks Cepat dan Penebalan Huruf',
    modeStopDesc: 'Kejar dan tekan tombol STOP merah yang memantul di layar! Bekukan waktu, lalu tebalkan huruf S, T, O, dan P secara berurutan.',
    modeShakeoutTitle: 'Goyang Lepas Ketegangan',
    modeShakeoutSubtitle: 'Pelepasan Somatik Otot',
    modeShakeoutCategory: 'Pelepasan Stres dan Regulasi Somatik',
    modeShakeoutDesc: 'Lepaskan hormon stres dan ketegangan otot dengan gerakan tubuh energik bergantian.',
    startExercise: 'Mulai Latihan',
    closeStudio: 'Kembali ke Petualangan',

    // Compass Journal
    journalTitle: 'Jurnal Kompas Hati dan Kisah Lembah',
    journalSubtitle: 'Kisah lengkap Lembah Harmoni, pencapaian lencana PSE, tas petualang, dan keharmonisan desa',
    tabLore: 'Kisah Lembah',
    tabBadges: 'Lencana',
    tabBag: 'Tas dan Pusaka',
    tabHarmony: 'Harmoni Desa',
    downloadCertificate: 'Unduh Sertifikat Kelulusan',

    // Settings Modal
    settingsTitle: 'Pusat Pengaturan dan Panduan',
    tabQuest: 'Misi dan Peta',
    tabAchievements: 'Lencana PSE',
    tabAudio: 'Pengaturan Audio',
    tabControls: 'Panduan Kendali',
    bgmVolume: 'Volume Musik Latar (BGM)',
    sfxVolume: 'Volume Efek Suara (SFX)',
    soundMuted: 'Suara Dibisukan',
    soundUnmuted: 'Suara Aktif',
    testSound: 'Uji Suara',
    keyboardWalk: 'Berjalan / Bergerak',
    keyboardAction: 'Interaksi / Berbicara / Lanjutkan Dialog',
    keyboardCompass: 'Nyalakan / Matikan Kompas Hati',
    keyboardRegulation: 'Buka Studio Regulasi Napas dan Emosi',
    keyboardJournal: 'Buka Jurnal Kompas dan Panduan PSE',
    keyboardMap: 'Tampilkan / Sembunyikan Peta Mini',
    keyboardSettings: 'Buka / Tutup Menu Pengaturan dan Panduan',
    touchControlsTip: '💡 Pada perangkat layar sentuh, gunakan tombol analog virtual di kiri bawah dan tombol aksi di kanan bawah.',

    // MiniMap
    mapTitle: 'PETA LEMBAH NADA RASA',
    mapSubtitle: 'Navigasi Lokasi Desa dan Sasaran Misi',
    closeMap: 'Tutup Peta (M)',
    legendQuest: 'Sasaran Misi Utama',
    legendVillagers: 'Warga Desa',
    legendRestored: 'Wilayah Harmonis',
    legendUnrestored: 'Terselimuti Kabut',
    clickToWalk: 'Klik pada peta untuk berjalan otomatis ke lokasi tersebut',
    northShort: 'U',
    southShort: 'S',
    westShort: 'B',
    eastShort: 'T',
    zoomInTitle: 'Perbesar Peta (+) / Gulir ke Atas',
    zoomOutTitle: 'Perkecil Peta (-) / Gulir ke Bawah',
    followPlayer: 'IKUTI',
    centerPlayer: 'PUSAT',

    // Celebrations & Endings
    allBadgesTitle: 'SELAMAT! 10 LENCANA EMAS PSE LENGKAP',
    allBadgesDesc: 'Kamu telah menguasai seluruh pilar Pembelajaran Sosial-Emosional di Lembah Nada Rasa!',
    missionSuccess: 'MISI BERHASIL DISELESAIKAN!',
    nextMissionOpen: 'MISI BERIKUTNYA TERBUKA!',
    continueAdventure: 'Lanjutkan Petualangan',
    endingTitle: 'LEMBAH NADA RASA PULIH BERKILAU',
    endingSubtitle: 'Harmoni dan Empati Telah Kembali',
    continueFreeRoam: 'Jelajahi Desa secara Bebas',
    getCertificate: 'Lihat dan Unduh Sertifikat',

    // Notifications
    devModeActive: '🚀 MODE PENGEMBANG AKTIF: Mode Jelajah Bebas Terbuka! Misi Utama 100% dan Pencapaian 100% Terbuka Penuh.',
  },
  get en() {
    return this.id;
  },
};

export interface LanguageContextType {
  lang: GameLanguage;
  setLang: (lang: GameLanguage) => void;
  toggleLang: () => void;
  ui: (typeof UI_TEXT)['id'];
  t: (key: keyof (typeof UI_TEXT)['id'], params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const lang: GameLanguage = 'id';
  const setLang = (_newLang: GameLanguage) => {};
  const toggleLang = () => {};
  const ui = UI_TEXT.id;

  const t = (key: keyof typeof UI_TEXT.id, params?: Record<string, string | number>): string => {
    let str = (UI_TEXT.id[key] ?? '') as string;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return str;
  };

  return React.createElement(
    LanguageContext.Provider,
    { value: { lang, setLang, toggleLang, ui, t } },
    children
  );
};

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    const ui = UI_TEXT.id;
    return {
      lang: 'id',
      setLang: () => {},
      toggleLang: () => {},
      ui,
      t: (key, params) => {
        let str = (ui[key] ?? '') as string;
        if (params) {
          Object.entries(params).forEach(([k, v]) => {
            str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
          });
        }
        return str;
      },
    };
  }
  return ctx;
}

export const NPC_NAMES_EN: Record<string, string> = {};

export const NPC_ROLES_EN: Record<string, string> = {};
export const SPEAKER_NAMES_EN: Record<string, string> = {};

export function getLocalizedNpcName(
  npcId: string,
  _lang?: GameLanguage,
  isResolved?: boolean,
  originalName?: string
): string {
  if (npcId === 'penjaga_kabut' || npcId === 'Sosok Kabut') {
    return isResolved ? 'Nenek Wilis' : (originalName || 'Sosok Kabut');
  }
  return originalName || (npcId === 'kakek_ranu' ? 'Kakek Ranu' : npcId);
}

export function getLocalizedNpcRole(
  npcId: string,
  _lang?: GameLanguage,
  isResolved?: boolean,
  originalRole?: string
): string {
  if ((npcId === 'penjaga_kabut' || npcId === 'Sosok Kabut') && isResolved) {
    return 'Pustakawan Sepuh Desa';
  }
  return originalRole || '';
}

export function getLocalizedSpeaker(speaker: string | undefined, _lang?: GameLanguage): string {
  return speaker || '';
}

export type DialogueNodeOverride = Omit<Partial<DialogueNode>, 'choices'> & {
  choices?: Array<Partial<ChoiceOption>>;
};

export const GAME_DIALOGUES_EN: Record<string, DialogueNodeOverride> = {};

/**
 * Returns dialogue node in pure Bahasa Indonesia.
 */
export function getLocalizedDialogue(
  node: DialogueNode | null | undefined,
  _lang?: GameLanguage
): DialogueNode | null {
  if (!node) return null;
  return node;
}

export function getLocalizedQuests(quests: GameQuest[], _lang?: GameLanguage): GameQuest[] {
  return quests;
}

export function getLocalizedAchievements(
  achievements: PSEAchievement[],
  _lang?: GameLanguage
): PSEAchievement[] {
  return achievements;
}

export function getLocalizedMissionStepData(
  step: number,
  _lang?: GameLanguage,
  isCompassActive?: boolean,
  isCompleted?: boolean,
  isFreeRoam?: boolean,
  clockCount: number = 0,
  nextMissingNpcName?: string,
  nextMissingCoords?: { x: number; y: number },
  nextMissingSprite?: string
) {
  const ui = UI_TEXT.id;
  if (isCompleted || isFreeRoam) {
    return {
      step: 5,
      total: 4,
      badge: ui.missionCompletedBadge,
      title: ui.mission5Title,
      speaker: 'Ezzel & Warga Desa',
      portrait: 'player',
      hint: ui.mission5Hint,
      locationName: ui.locationVillage,
      targetCoords: { x: 11, y: 15 },
      isCompleted: true,
    };
  }
  switch (step) {
    case 1:
      return {
        step: 1,
        total: 4,
        badge: ui.missionStepFull.replace('{step}', '1').replace('{total}', '4'),
        title: ui.mission1Title,
        speaker: 'Kiki Si Tupai',
        portrait: 'squirrel',
        hint: isCompassActive ? ui.mission1HintActive : ui.mission1Hint,
        locationName: ui.locationPlaza,
        targetCoords: { x: 8, y: 14 },
        isCompleted: false,
      };
    case 2:
      return {
        step: 2,
        total: 4,
        badge: ui.missionStepFull.replace('{step}', '2').replace('{total}', '4'),
        title: ui.mission2Title,
        speaker: 'Kakek Ranu',
        portrait: 'old_man',
        hint: ui.mission2Hint,
        locationName: ui.locationBridge,
        targetCoords: { x: 20, y: 15 },
        isCompleted: false,
      };
    case 3:
      return {
        step: 3,
        total: 4,
        badge: ui.missionStepFull.replace('{step}', '3').replace('{total}', '4'),
        title: ui.mission3Title,
        speaker: 'Bimo',
        portrait: 'boy_glasses',
        hint: ui.mission3Hint,
        locationName: ui.locationForest,
        targetCoords: { x: 7, y: 6 },
        isCompleted: false,
      };
    case 4: {
      const isComplete12 = clockCount >= 12;
      const hint = isComplete12
        ? '🌟 Seluruh 12 Komponen Jam Lengkap (12/12)! Segera temui Nenek Wilis di Menara Jam untuk merakit dan menyalakan kembali Menara Jam Harmoni!'
        : (nextMissingNpcName
            ? `Kumpulkan seluruh 12 Komponen Jam (${clockCount}/12 terkumpul, tersisa ${12 - clockCount} komponen lagi). Temui ${nextMissingNpcName} untuk mendapatkan komponen jam berikutnya!`
            : `Kumpulkan seluruh 12 Komponen Jam (${clockCount}/12). Temui para warga desa!`);

      const title = isComplete12
        ? 'Misi 4: Nyalakan Menara Jam Harmoni (12/12)'
        : `Misi 4: Kumpulkan 12 Komponen Jam (${clockCount}/12)`;

      const speaker = isComplete12
        ? 'Nenek Wilis'
        : (nextMissingNpcName || 'Warga Desa');

      const portrait = isComplete12 ? 'grandmother' : (nextMissingSprite || 'girl_counselor');

      const locationName = isComplete12
        ? ui.locationTower
        : (nextMissingNpcName
            ? `${nextMissingNpcName} (${clockCount}/12 Komponen)`
            : 'Sudut-Sudut Desa');

      return {
        step: 4,
        total: 4,
        badge: ui.missionStepFull.replace('{step}', '4').replace('{total}', '4'),
        title,
        speaker,
        portrait,
        hint,
        locationName,
        targetCoords: (!isComplete12 && nextMissingCoords) ? nextMissingCoords : { x: 29, y: 8 },
        isCompleted: false,
      };
    }
    default:
      return {
        step: 5,
        total: 4,
        badge: ui.missionCompletedBadge,
        title: ui.mission5Title,
        speaker: 'Ezzel & Warga Desa',
        portrait: 'player',
        hint: ui.mission5Hint,
        locationName: ui.locationVillage,
        targetCoords: { x: 11, y: 15 },
        isCompleted: true,
      };
  }
}

export function getLocalizedItems(items: Item[], _lang?: GameLanguage): Item[] {
  return items;
}

