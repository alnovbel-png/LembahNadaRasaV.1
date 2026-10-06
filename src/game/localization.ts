import React, { createContext, useContext, useState } from 'react';
import { DialogueNode, ChoiceOption, GameQuest, PSEAchievement, Item } from '../types/game';

export type GameLanguage = 'id' | 'en';

export function getInitialLanguage(): GameLanguage {
  try {
    const saved = localStorage.getItem('lembah_game_language');
    if (saved === 'en' || saved === 'id') return saved;
  } catch (e) {
    // ignore
  }
  return 'id';
}

export const UI_TEXT = {
  id: {
    languageName: 'Bahasa Indonesia',
    switchPrompt: 'PILIH BAHASA / SELECT LANGUAGE',
    headerBadge: 'EDISI RESMI ANAK-ANAK',
    soundOn: 'Suara ON',
    soundMute: 'Bisu',
    genreBadge: 'RPG SOSIAL-EMOSIONAL & MINDFULNESS',
    gameTitle: 'LEMBAH NADA RASA',
    gameSubtitle: 'Valley of Feelings & Harmony',
    synopsis:
      'Sebuah kabut kelabu menyelimuti Lembah Nada Rasa. Sebagai penjelajah muda, kamu menemukan Pusaka Kompas Hati untuk memulihkan kepekaan rasa para warga desa.',
    empathy: 'Empati',
    breathRegulation: 'Regulasi Napas',
    emotionAwareness: 'Kenal Emosi',
    howToPlay: 'Cara Main',
    audioOptions: 'Audio & Opsi',
    safeBrowserNote: '100% di browser & aman untuk anak-anak',
    charCustomizationTitle: 'PILIH KARAKTER & NAMA PANGGILAN',
    freeCustomization: 'Kustomisasi Bebas',
    boyTitle: 'Petualang Laki-Laki',
    boyAvatar: 'Avatar: Ezzel',
    girlTitle: 'Petualang Perempuan',
    girlAvatar: 'Avatar: Ezzy',
    nicknameLabel: 'Nama Panggilan Karakter:',
    maxChars: 'Maks. 14 Karakter',
    placeholderBoy: 'Nama (misal: Ezzel)',
    placeholderGirl: 'Nama (misal: Ezzy)',
    reset: 'Reset',
    tipNote: '💡 Nama {name} otomatis tertera di dialog warga dan sertifikat!',
    startButton: 'MULAI SEBAGAI {name}',
    enterTip: 'Tekan tombol di atas atau tekan [ENTER] untuk masuk',

    // Start Menu Actions
    mainMenu: 'MENU UTAMA',
    play: 'BERMAIN',
    startAdventure: 'MULAI PETUALANGAN',
    settings: 'PENGATURAN',
    gameOptions: 'OPSI GAME & AKSESIBILITAS',
    exit: 'KELUAR',
    closeGame: 'TUTUP PERMAINAN',
    pressEnterToSelect: 'Tekan Tombol [ENTER] untuk Memilih',
    exitConfirmTitle: 'Konfirmasi Keluar Permainan',
    exitConfirmDesc: 'Apakah kamu yakin ingin menutup jendela permainan ini? Progres tersimpan otomatis di perangkatmu.',
    cancel: 'Batal',
    confirmExit: 'Keluar Permainan',

    // Dialogue Box
    skip: 'LEWATI',
    closeEsc: 'TUTUP [ESC]',
    missionGuidanceHeader: 'PANDUAN ALUR MISI BERURUTAN',
    missionGuidanceSub: 'Wajib Selesaikan 1 per 1',
    innerHeartVoice: 'Suara Hati Terdalam (Kompas):',
    showAllText: '⚡ Tampilkan Semua Teks [Spasi]',
    chooseResponse: 'Pilih Responmu',
    reReadText: '← Baca Ulang Teks',
    listenFirst: 'Dengarkan & baca ucapan karakter terlebih dahulu...',
    readFinished: 'Sudah membaca teks? Tekan tombol untuk memilih respon tanggapanmu.',
    continueNext: 'Lanjut [Spasi / Enter] →',
    selectResponsePrompt: 'Pilih Respon Jawaban [Spasi] 💬',
    startInteractiveBreathing: 'Mulai Latihan Napas Interaktif 🌬️',
    startInteractiveGrounding: 'Mulai Latihan Grounding Panca Indra 👁️',
    startInteractiveStop: 'Mulai Jeda Darurat STOP 🛑',
    startInteractiveShakeout: 'Mulai Goyang Lepas Ketegangan ⚡',

    // Sequential Missions
    missionStepBadge: 'MISI {step} DARI {total}',
    missionCompletedBadge: 'SELESAI',
    missionFreeRoamBadge: 'JELAJAH BEBAS',

    // Virtual Controls & HUD
    brandTitle: 'Lembah Nada Rasa',
    openPauseMenu: 'Buka Pause Menu [Esc]',
    activeResonance: 'RESONANSI AKTIF',
    heartCompass: 'KOMPAS HATI',
    toggleResonance: 'Aktifkan Kompas Resonansi Hati [C]',
    map: 'Peta',
    regulation: 'Regulasi',
    journal: 'Jurnal',
    tutorial: 'Tutorial',
    tutorialDesc: 'Panduan kontrol, kompas & cara bermain [H]',
    certificate: 'Sertifikat',
    adventureMenu: 'Menu Petualangan',
    valleyMap: 'Peta Lembah',
    valleyMapDesc: 'Lihat lokasi warga, jembatan, dan menara jam',
    mapActive: 'Aktif',
    regulationStudio: 'Studio Regulasi Emosi',
    regulationStudioDesc: 'Latihan napas balon, relaksasi 4-7-8 & grounding',
    journalBag: 'Jurnal & Tas Petualang',
    journalBagDesc: 'Lore cerita desa, barang pusaka & wawasan empati',
    certificateMenu: 'Sertifikat Kelulusan PSE',
    certificateMenuDesc: 'Piagam Duta Empati Emas',
    titleScreen: 'Menu Awal / Opening Start',
    titleScreenDesc: 'Buka layar pembuka, sinopsis & opsi game',
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
    guideButtonTitle: 'Tuntun karakter otomatis berjalan ke target misi',
    missionTarget: 'TARGET MISI',
    missionStep: 'MISI {step}/4',
    missionStepFull: 'MISI {step} DARI {total}',
    missionCompleted: 'SELESAI',
    freeRoamActive: 'JELAJAH BEBAS',

    // Mission Banners (Pencarian Komponen Menara Jam Harmoni)
    mission1Title: 'Misi 1: Dapatkan Pegas Jam (Kiki)',
    mission2Title: 'Misi 2: Dapatkan Poros Jam (Kakek Ranu)',
    mission3Title: 'Misi 3: Dapatkan Roda Gigi Emas (Bimo)',
    mission4Title: 'Misi 4: Kumpulkan 12 Komponen & Nyalakan Menara Jam',
    mission5Title: 'Menara Jam Berdentang & Harmoni Pulih!',
    mission1Hint: 'Hampiri Kiki di alun-alun. Pahami rasa panik & takutnya akibat salah paham, lalu beri respon empati untuk mendapatkan Pegas Detak Jam!',
    mission1HintActive: 'Ajak Kiki bicara [Tekan Spasi]. Tenangkan Kiki dengan respon empati agar Kiki merasa aman dan menyerahkan Pegas Detak Jam.',
    mission2Hint: 'Jalan ke jembatan di timur. Pahami rasa lelah Kakek Ranu dan luruskan salah paham untuk menerima Poros Penggerak Jam.',
    mission3Hint: 'Jalan ke Hutan Sunyi di barat laut. Bantu Bimo mengatasi rasa bersalahnya agar ia menyerahkan Roda Gigi Emas Jam.',
    mission4Hint: 'Kumpulkan seluruh 12 Komponen Jam dari warga desa! Setelah lengkap (12/12), temui Nenek Wilis di Menara Jam untuk merakit dan menyalakannya!',
    mission5Hint: '🌿 Menara Jam berdentang lagi! Seluruh 12 komponen jam telah menyatu dan harmoni desa telah pulih seutuhnya.',

    // Locations
    locationPlaza: 'Alun-Alun & Air Mancur',
    locationBridge: 'Jembatan Kayu (Arah Timur)',
    locationForest: 'Hutan Sunyi (Barat Laut)',
    locationTower: 'Menara Jam Harmoni (Timur Laut)',
    locationVillage: 'Seluruh Desa',

    // Pause Menu
    gamePaused: 'PERMAINAN DIJEDA',
    pausedDesc: 'Ambil napas sejenak, periksa jurnal, atau ubah pengaturan.',
    resumeGame: 'Lanjutkan Petualangan [Esc]',
    regulationMenu: 'Studio Regulasi [R]',
    journalMenu: 'Jurnal Kompas & Panduan [J]',
    optionsMenu: 'Pengaturan & Panduan [O]',
    backToTitle: 'Menu Awal / Mulai Ulang',

    // Regulation Studio
    regulationStudioTitle: 'STUDIO REGULASI EMOSI',
    regulationStudioSubtitle: 'Latihan Pernapasan, Kesadaran Panca Indra & Ketenangan Diri',
    modeBalloonTitle: 'Irama Balon Tenang',
    modeBalloonSubtitle: 'Napas Berirama 4-4-4',
    modeBalloonCategory: 'Ritme & Keseimbangan Napas',
    modeBalloonDesc: 'Tahan napas tepat 4 detik agar balon menyentuh cincin target, jaga kursor di zona hijau yang bergetar 4 detik, lalu hembuskan perlahan.',
    modeGroundingTitle: 'Kaca Pembesar Indra',
    modeGroundingSubtitle: 'Grounding 5-4-3-2-1',
    modeGroundingCategory: 'Pencarian Objek Bergerak (Hidden Object)',
    modeGroundingDesc: 'Kendalikan lensa kaca pembesar untuk menembus kabut kepanikan dan tangkap 5 objek alam yang bergerak cepat sebelum waktu habis.',
    modeStopTitle: 'Rem Reaksi S-T-O-P',
    modeStopSubtitle: 'Cegah Respon Impulsif',
    modeStopCategory: 'Quick Time Event & Tracing',
    modeStopDesc: 'Kejar dan smash tombol STOP merah yang memantul liar di layar! Bekukan waktu lalu tebalkan huruf S, T, O, dan P secara berurutan.',
    modeShakeoutTitle: 'Goyang Lepas Ketegangan',
    modeShakeoutSubtitle: 'Pelepasan Somatik Otot',
    modeShakeoutCategory: 'Pelepasan Stres & Regulasi Somatik',
    modeShakeoutDesc: 'Lepaskan hormon stres dan ketegangan otot dengan gerakan tubuh energik bergantian.',
    startExercise: 'Mulai Latihan',
    closeStudio: 'Kembali ke Petualangan',

    // Compass Journal
    journalTitle: 'Jurnal Kompas Hati & Lore Cerita',
    journalSubtitle: 'Kisah lengkap lembah harmoni, pencapaian lencana PSE, tas petualangan, & harmoni desa',
    tabLore: 'Lore Cerita',
    tabBadges: 'Lencana',
    tabBag: 'Tas & Pusaka',
    tabHarmony: 'Harmoni Desa',
    downloadCertificate: 'Unduh Sertifikat Kelulusan',

    // Settings Modal
    settingsTitle: 'Pusat Opsi & Panduan',
    tabQuest: 'Misi & Peta',
    tabAchievements: 'Lencana PSE',
    tabAudio: 'Pengaturan Audio',
    tabControls: 'Panduan Kontrol',
    tabLanguage: 'Bahasa / Language',
    chooseLanguage: 'PILIH BAHASA PERMAINAN / SELECT GAME LANGUAGE',
    langIdDesc: 'Gunakan Bahasa Indonesia di seluruh dialog, teks antarmuka, misi, dan lencana.',
    langEnDesc: 'Use English across all dialogues, UI text, quests, and badges.',
    bgmVolume: 'Volume Musik Latar (BGM)',
    sfxVolume: 'Volume Efek Suara (SFX)',
    soundMuted: 'Suara Dibisukan',
    soundUnmuted: 'Suara Aktif',
    testSound: 'Uji Suara',
    keyboardWalk: 'Berjalan / Bergerak',
    keyboardAction: 'Interaksi / Bicara / Maju Dialog',
    keyboardCompass: 'Nyalakan / Matikan Kompas Hati',
    keyboardRegulation: 'Buka Studio Regulasi Napas & Emosi',
    keyboardJournal: 'Buka Jurnal Kompas & Panduan PSE',
    keyboardMap: 'Tampilkan / Sembunyikan Peta Mini',
    keyboardSettings: 'Buka / Tutup Menu Opsi & Panduan',
    touchControlsTip: '💡 Di perangkat layar sentuh, gunakan analog virtual di kiri bawah dan tombol aksi di kanan bawah.',

    // MiniMap
    mapTitle: 'PETA LEMBAH NADA RASA',
    mapSubtitle: 'Navigasi Lokasi Desa & Target Misi',
    closeMap: 'Tutup Peta [M]',
    legendQuest: 'Target Misi Utama',
    legendVillagers: 'Warga Desa',
    legendRestored: 'Wilayah Harmonis',
    legendUnrestored: 'Terselimuti Kabut',
    clickToWalk: 'Klik pada peta untuk berjalan otomatis ke lokasi tersebut',
    northShort: 'U',
    southShort: 'S',
    westShort: 'B',
    eastShort: 'T',
    zoomInTitle: 'Perbesar Peta [+] / Scroll Atas',
    zoomOutTitle: 'Perkecil Peta [-] / Scroll Bawah',
    followPlayer: 'IKUTI',
    centerPlayer: 'PUSAT',

    // Celebrations & Endings
    allBadgesTitle: 'SELAMAT! 10 LENCANA EMAS PSE LENGKAP',
    allBadgesDesc: 'Kamu telah menguasai seluruh pilar Pembelajaran Sosial-Emosional di Lembah Nada Rasa!',
    missionSuccess: 'MISI BERHASIL DISELESAIKAN!',
    nextMissionOpen: 'MISI BERIKUTNYA TERBUKA!',
    continueAdventure: 'Lanjut Berpetualang',
    endingTitle: 'LEMBAH NADA RASA PULIH BERKILAU',
    endingSubtitle: 'Harmoni dan Empati Telah Kembali',
    continueFreeRoam: 'Jelajahi Desa Bebas',
    getCertificate: 'Lihat & Unduh Sertifikat',

    // Notifications
    devModeActive: '🚀 MODE DEVELOPER AKTIF: Mode Jelajah Bebas Terbuka! Misi Utama 100% & Pencapaian 100% Terbuka Penuh.',
  },

  en: {
    languageName: 'English',
    switchPrompt: 'SELECT LANGUAGE / PILIH BAHASA',
    headerBadge: 'OFFICIAL KIDS EDITION',
    soundOn: 'Sound ON',
    soundMute: 'Mute',
    genreBadge: 'SOCIAL-EMOTIONAL RPG & MINDFULNESS',
    gameTitle: 'VALLEY OF HARMONY',
    gameSubtitle: 'Valley of Feelings & Harmony',
    synopsis:
      'A thick grey fog blankets the Valley of Harmony. As a young explorer, you discover the sacred Heart Compass to restore the emotional sensitivity and peace of the villagers.',
    empathy: 'Empathy',
    breathRegulation: 'Breath Regulation',
    emotionAwareness: 'Emotion Awareness',
    howToPlay: 'How to Play',
    audioOptions: 'Audio & Options',
    safeBrowserNote: '100% in-browser & child-friendly',
    charCustomizationTitle: 'CHOOSE CHARACTER & NICKNAME',
    freeCustomization: 'Free Customization',
    boyTitle: 'Boy Adventurer',
    boyAvatar: 'Avatar: Ezzel',
    girlTitle: 'Girl Adventurer',
    girlAvatar: 'Avatar: Ezzy',
    nicknameLabel: 'Character Nickname:',
    maxChars: 'Max. 14 Characters',
    placeholderBoy: 'Name (e.g. Ezzel)',
    placeholderGirl: 'Name (e.g. Ezzy)',
    reset: 'Reset',
    tipNote: '💡 The name {name} will automatically appear in villager dialogues and certificates!',
    startButton: 'START AS {name}',
    enterTip: 'Click above or press [ENTER] to start',

    // Start Menu Actions
    mainMenu: 'MAIN MENU',
    play: 'PLAY',
    startAdventure: 'START ADVENTURE',
    settings: 'SETTINGS',
    gameOptions: 'GAME OPTIONS & ACCESSIBILITY',
    exit: 'EXIT',
    closeGame: 'CLOSE GAME',
    pressEnterToSelect: 'Press [ENTER] to Select',
    exitConfirmTitle: 'Confirm Exit Game',
    exitConfirmDesc: 'Are you sure you want to close this game window? Progress is automatically saved on your device.',
    cancel: 'Cancel',
    confirmExit: 'Exit Game',

    // Dialogue Box
    skip: 'SKIP',
    closeEsc: 'CLOSE [ESC]',
    missionGuidanceHeader: 'SEQUENTIAL MISSION GUIDELINES',
    missionGuidanceSub: 'Complete Step by Step',
    innerHeartVoice: 'Innermost Heart Voice (Compass):',
    showAllText: '⚡ Show Full Text [Space]',
    chooseResponse: 'Choose Your Response',
    reReadText: '← Re-read Text',
    listenFirst: 'Listen & read the character words first...',
    readFinished: 'Finished reading? Press button to select your response.',
    continueNext: 'Continue [Space / Enter] →',
    selectResponsePrompt: 'Choose Response [Space] 💬',
    startInteractiveBreathing: 'Start Interactive Breathing 🌬️',
    startInteractiveGrounding: 'Start Sense Grounding 👁️',
    startInteractiveStop: 'Start S.T.O.P. Reset 🛑',
    startInteractiveShakeout: 'Start Tension Shakeout ⚡',

    // Sequential Missions
    missionStepBadge: 'MISSION {step} OF {total}',
    missionCompletedBadge: 'COMPLETED',
    missionFreeRoamBadge: 'FREE ROAM',

    // Virtual Controls & HUD
    brandTitle: 'Valley of Harmony',
    openPauseMenu: 'Open Pause Menu [Esc]',
    activeResonance: 'RESONANCE ACTIVE',
    heartCompass: 'HEART COMPASS',
    toggleResonance: 'Toggle Heart Resonance Compass [C]',
    map: 'Map',
    regulation: 'Regulate',
    journal: 'Journal',
    tutorial: 'Tutorial',
    tutorialDesc: 'Controls, compass & how to play guide [H]',
    certificate: 'Certificate',
    adventureMenu: 'Adventure Menu',
    valleyMap: 'Valley Map',
    valleyMapDesc: 'View villagers, bridge, and clock tower locations',
    mapActive: 'Active',
    regulationStudio: 'Emotion Regulation Studio',
    regulationStudioDesc: 'Balloon breathing, 4-7-8 relaxation & grounding',
    journalBag: 'Journal & Explorer Bag',
    journalBagDesc: 'Village lore, sacred items & empathy insights',
    certificateMenu: 'SEL Completion Certificate',
    certificateMenuDesc: 'Golden Empathy Ambassador Charter',
    titleScreen: 'Title Screen / Main Menu',
    titleScreenDesc: 'Open opening title, synopsis & options',
    mainCharacterLabel: 'Main Character:',
    compassLabel: 'Heart Compass:',
    compassActive: 'Active',
    compassStandby: 'Standby',
    btnCompassActive: 'ACTIVE',
    btnCompassStandby: 'HEART',
    btnAction: 'ACTION',
    btnTalk: 'TALK',
    languageToggle: 'Language',

    // Quick Actions
    talkAction: 'TALK',
    examineAction: 'EXAMINE',
    readSignAction: 'READ SIGN',
    guideButton: 'Guide',
    guideButtonTitle: 'Auto-guide character to the mission target',
    missionTarget: 'MISSION TARGET',
    missionStep: 'MISSION {step}/4',
    missionStepFull: 'MISSION {step} OF {total}',
    missionCompleted: 'COMPLETED',
    freeRoamActive: 'FREE ROAM',

    // Mission Banners (Clock Tower Components Quest)
    mission1Title: 'Mission 1: Retrieve Clock Spring (Kiki)',
    mission2Title: 'Mission 2: Retrieve Clock Axle (Grandpa Ranu)',
    mission3Title: 'Mission 3: Retrieve Golden Gear (Bimo)',
    mission4Title: 'Mission 4: Gather 12 Clock Pieces & Light Up Tower',
    mission5Title: 'Clock Tower Restored & Harmony Healed!',
    mission1Hint: 'Approach Kiki near the plaza fountain. Empathize with his panic and soothe his fear to retrieve the Clock Mainspring!',
    mission1HintActive: 'Talk to Kiki [Press Space]. Offer genuine emotional reassurance so he feels safe to hand over the Clock Mainspring.',
    mission2Hint: 'Head to the bridge in the east. Validate Grandpa Ranu\'s exhaustion and resolve the misunderstanding to receive the Clock Drive Shaft.',
    mission3Hint: 'Head to the Silent Forest in the northwest. Guide Bimo through a growth mindset so he hands over the Golden Master Gear.',
    mission4Hint: 'Collect all 12 Clock Pieces from the villagers! Once complete (12/12), meet Grandma Wilis at the Clock Tower to assemble and light it up!',
    mission5Hint: '🌿 The Clock Tower is chiming! All 12 clock components are united, restoring harmony across the valley.',

    // Locations
    locationPlaza: 'Plaza & Fountain',
    locationBridge: 'Wooden Bridge (East)',
    locationForest: 'Silent Forest (Northwest)',
    locationTower: 'Harmony Clock Tower (Northeast)',
    locationVillage: 'Entire Village',

    // Pause Menu
    gamePaused: 'GAME PAUSED',
    pausedDesc: 'Take a mindful breath, check your journal, or change settings.',
    resumeGame: 'Resume Adventure [Esc]',
    regulationMenu: 'Regulation Studio [R]',
    journalMenu: 'Compass Journal & Lore [J]',
    optionsMenu: 'Settings & Guides [O]',
    backToTitle: 'Title Screen / Restart',

    // Regulation Studio
    regulationStudioTitle: 'EMOTION REGULATION STUDIO',
    regulationStudioSubtitle: 'Breathing Exercises, Sensory Awareness & Self-Calming',
    modeBalloonTitle: 'Calm Balloon Rhythm',
    modeBalloonSubtitle: 'Rhythmic Breathing 4-4-4',
    modeBalloonCategory: 'Breath Rhythm & Balance',
    modeBalloonDesc: 'Hold your breath for 4 seconds so the balloon touches the target ring, stabilize the cursor in the vibrating green zone, then exhale slowly.',
    modeGroundingTitle: 'Sensory Magnifier',
    modeGroundingSubtitle: '5-4-3-2-1 Sensory Grounding',
    modeGroundingCategory: 'Moving Object Discovery (Hidden Object)',
    modeGroundingDesc: 'Guide the magnifying glass through the fog of panic and spot 5 moving natural objects before time runs out.',
    modeStopTitle: 'S-T-O-P Reaction Brake',
    modeStopSubtitle: 'Prevent Impulsive Reactions',
    modeStopCategory: 'Quick Time Event & Tracing',
    modeStopDesc: 'Catch and smash the bouncing red STOP button! Freeze time then trace the letters S, T, O, and P in sequence.',
    modeShakeoutTitle: 'Tension Shake-Out',
    modeShakeoutSubtitle: 'Somatic Muscle Release',
    modeShakeoutCategory: 'Stress Discharge & Somatic Regulation',
    modeShakeoutDesc: 'Discharge stress hormones and physical tension with alternating energetic whole-body movements.',
    startExercise: 'Start Exercise',
    closeStudio: 'Back to Adventure',

    // Compass Journal
    journalTitle: 'Heart Compass Journal & Story Lore',
    journalSubtitle: 'Complete story of the valley, SEL badge achievements, adventure bag, & village harmony',
    tabLore: 'Story Lore',
    tabBadges: 'Badges',
    tabBag: 'Bag & Relics',
    tabHarmony: 'Village Harmony',
    downloadCertificate: 'Download SEL Certificate',

    // Settings Modal
    settingsTitle: 'Options & Guides Hub',
    tabQuest: 'Quests & Map',
    tabAchievements: 'SEL Badges',
    tabAudio: 'Audio Settings',
    tabControls: 'Controls Guide',
    tabLanguage: 'Language / Bahasa',
    chooseLanguage: 'SELECT GAME LANGUAGE / PILIH BAHASA',
    langIdDesc: 'Gunakan Bahasa Indonesia di seluruh dialog, teks antarmuka, misi, dan lencana.',
    langEnDesc: 'Use English across all dialogues, UI text, quests, and badges.',
    bgmVolume: 'Background Music Volume (BGM)',
    sfxVolume: 'Sound Effects Volume (SFX)',
    soundMuted: 'Sound Muted',
    soundUnmuted: 'Sound Active',
    testSound: 'Test Sound',
    keyboardWalk: 'Walk / Move Direction',
    keyboardAction: 'Interact / Talk / Advance Dialogue',
    keyboardCompass: 'Toggle Heart Resonance Compass',
    keyboardRegulation: 'Open Breath & Emotion Regulation Studio',
    keyboardJournal: 'Open Compass Journal & SEL Lore Guide',
    keyboardMap: 'Show / Hide Mini Map',
    keyboardSettings: 'Open / Close Options & Settings',
    touchControlsTip: '💡 On touchscreen devices, use the virtual analog joystick on the bottom-left and action buttons on the bottom-right.',

    // MiniMap
    mapTitle: 'VALLEY OF HARMONY MAP',
    mapSubtitle: 'Village Navigation & Quest Destinations',
    closeMap: 'Close Map [M]',
    legendQuest: 'Main Quest Target',
    legendVillagers: 'Villagers',
    legendRestored: 'Harmonized Zone',
    legendUnrestored: 'Fog Covered',
    clickToWalk: 'Click on map to automatically walk to this location',
    northShort: 'N',
    southShort: 'S',
    westShort: 'W',
    eastShort: 'E',
    zoomInTitle: 'Zoom In [+] / Scroll Up',
    zoomOutTitle: 'Zoom Out [-] / Scroll Down',
    followPlayer: 'FOLLOW',
    centerPlayer: 'CENTER',

    // Celebrations & Endings
    allBadgesTitle: 'CONGRATULATIONS! ALL 10 GOLD SEL BADGES ACHIEVED',
    allBadgesDesc: 'You have mastered all core Social-Emotional Learning pillars in the Valley of Harmony!',
    missionSuccess: 'MISSION COMPLETED SUCCESSFULLY!',
    nextMissionOpen: 'NEXT MISSION UNLOCKED!',
    continueAdventure: 'Continue Adventure',
    endingTitle: 'THE VALLEY OF HARMONY SHINES ANEW',
    endingSubtitle: 'Harmony and Empathy Have Returned',
    continueFreeRoam: 'Explore Free Roam Mode',
    getCertificate: 'View & Download Certificate',

    // Notifications
    devModeActive: '🚀 DEVELOPER MODE ACTIVE: Free Roam Mode Unlocked! 100% Main Quests & 100% Achievements Unlocked.',
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
  const [lang, setLangState] = useState<GameLanguage>(getInitialLanguage);

  const setLang = (newLang: GameLanguage) => {
    setLangState(newLang);
    try {
      localStorage.setItem('lembah_game_language', newLang);
    } catch (e) {
      // ignore
    }
  };

  const toggleLang = () => {
    setLang(lang === 'id' ? 'en' : 'id');
  };

  const ui = UI_TEXT[lang] || UI_TEXT.id;

  const t = (key: keyof typeof UI_TEXT.id, params?: Record<string, string | number>): string => {
    let str = (UI_TEXT[lang]?.[key] ?? UI_TEXT.id[key] ?? '') as string;
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
    const fallbackLang = getInitialLanguage();
    const ui = UI_TEXT[fallbackLang] || UI_TEXT.id;
    return {
      lang: fallbackLang,
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

export const NPC_NAMES_EN: Record<string, string> = {
  kiki: 'Kiki',
  kakek_ranu: 'Grandpa Ranu',
  'kakek ranu': 'Grandpa Ranu',
  'Kakek Ranu': 'Grandpa Ranu',
  bimo: 'Bimo',
  Bimo: 'Bimo',
  prof_kotek: 'Prof. Kotek',
  'Prof. Kotek': 'Prof. Kotek',
  'Profesor Kotek': 'Prof. Kotek',
  penjaga_kabut: 'Spirit Elder',
  'penjaga kabut': 'Spirit Elder',
  'Sosok Kabut': 'Spirit Elder',
  'Sosok Misterius Kabut': 'Mysterious Mist Spirit',
  'Sosok Kabut / Menara Jam': 'Spirit Elder / Clock Tower',
  'Sosok Kabut / Nenek Wilis': 'Spirit Elder / Grandma Wilis',
  'Nenek Wilis': 'Grandma Wilis',
  'nenek wilis': 'Grandma Wilis',
  kak_citra: 'Sister Citra',
  'kak citra': 'Sister Citra',
  'Kak Citra': 'Sister Citra',
  kakek_damai: 'Grandpa Damai',
  'kakek damai': 'Grandpa Damai',
  'Kakek Damai': 'Grandpa Damai',
  moka: 'Moka the Cat',
  moka_cat: 'Moka the Cat',
  'Moka': 'Moka the Cat',
  'Moka Si Kucing': 'Moka the Cat',
  pak_joko: 'Farmer Joko',
  'pak joko': 'Farmer Joko',
  'Pak Joko': 'Farmer Joko',
  didi: 'Didi',
  didi_scout: 'Didi',
  Didi: 'Didi',
  teguh: 'Mr. Teguh',
  teguh_woodcutter: 'Mr. Teguh',
  'Pak Teguh': 'Mr. Teguh',
  'pak teguh': 'Mr. Teguh',
  sari: 'Mrs. Sari',
  sari_fruit: 'Mrs. Sari',
  'Ibu Sari': 'Mrs. Sari',
  'ibu sari': 'Mrs. Sari',
  jala: 'Brother Jala',
  jala_fisher: 'Brother Jala',
  'Bung Jala': 'Brother Jala',
  'bung jala': 'Brother Jala',
  Pemain: 'Player',
  pemain: 'Player',
  'Karakter Utama': 'Player',
  'karakter utama': 'Player',
};

export const NPC_ROLES_EN: Record<string, string> = {
  kiki: 'Little Mail Squirrel',
  kakek_ranu: 'Carpenter & Bridge Keeper',
  bimo: 'Clockmaker Apprentice (Grade 4)',
  prof_kotek: 'Emotion Researcher Rooster',
  penjaga_kabut: 'Tower Keeper & Village Librarian',
  kak_citra: 'Flower Garden Counselor',
  kakek_damai: 'Mindful Bonsai Master',
  moka: 'Gentle Library Cat',
  moka_cat: 'Gentle Library Cat',
  pak_joko: 'Garden of Hope Farmer',
  didi: 'Little Village Scout',
  didi_scout: 'Little Village Scout',
  teguh: 'Wise Forest Woodcutter',
  teguh_woodcutter: 'Wise Forest Woodcutter',
  sari: 'Forest Orchard Farmer',
  sari_fruit: 'Forest Orchard Farmer',
  jala: 'Patient River Fisherman',
  jala_fisher: 'Patient River Fisherman',
  'Tupai Pos Cilik Lembah': 'Little Mail Squirrel',
  'Tukang Kayu Sepuh & Penjaga Jembatan': 'Carpenter & Bridge Keeper',
  'Murid Pengrajin Jam Lembah': 'Clockmaker Apprentice (Grade 4)',
  'Ayam Peneliti Emosi Lembah': 'Emotion Researcher Rooster',
  'Pustakawan Sepuh Desa': 'Elder Village Librarian',
  'Sosok Penjaga Puncak Menara Jam': 'Guardian of Clock Tower Summit',
  'Konselor Taman Bunga Harmoni': 'Flower Garden Counselor',
  'Master Tanaman & Perenungan Jiwa': 'Mindful Bonsai Master',
  'Kucing Lembut Penjaga Perpustakaan': 'Gentle Library Cat',
  'Petani Sepuh Kebun Harapan': 'Garden of Hope Farmer',
  'Pramuka Cilik Penjelajah Hutan': 'Little Village Scout',
  'Penebang Kayu Hutan Berhati Lembut': 'Wise Forest Woodcutter',
  'Pengelola Kebun Buah Hutan': 'Forest Orchard Farmer',
  'Nelayan Sabar Sungai Harmoni': 'Patient River Fisherman',
};

export const SPEAKER_NAMES_EN: Record<string, string> = {
  'Kakek Ranu': 'Grandpa Ranu',
  'Sosok Kabut': 'Spirit Elder',
  'Sosok Misterius Kabut': 'Mysterious Mist Spirit',
  'Sosok Kabut / Menara Jam': 'Spirit Elder / Clock Tower',
  'Sosok Kabut / Nenek Wilis': 'Spirit Elder / Grandma Wilis',
  'Nenek Wilis': 'Grandma Wilis',
  'Nenek Wilis & Seluruh Warga': 'Grandma Wilis & All Villagers',
  'Kak Citra': 'Sister Citra',
  'Kakek Damai': 'Grandpa Damai',
  'Moka': 'Moka the Cat',
  'Moka Si Kucing': 'Moka the Cat',
  'Pak Joko': 'Farmer Joko',
  'Didi': 'Didi',
  'Pak Teguh': 'Mr. Teguh',
  'Ibu Sari': 'Mrs. Sari',
  'Bung Jala': 'Brother Jala',
  'Profesor Kotek': 'Prof. Kotek',
  'Prof. Kotek': 'Prof. Kotek',
  'Pohon Sahabat Purba': 'Ancient Sacred Tree',
  'Pesan Kapsul Waktu 1950': 'Time Capsule Message 1950',
  'Air Mancur Harmoni': 'Harmony Fountain',
  'Plang Petunjuk Arah': 'Crossroads Signpost',
  'Plang Petunjuk Arah Hutan': 'Forest Trail Signpost',
  'Pondok Hutan Pak Teguh': "Mr. Teguh's Forest Lodge",
  'Plang Kawasan Pertanian': 'Farmland Signpost',
  'Menara Jam Harmoni': 'Harmony Clock Tower',
  'Menara Jam Harmoni (Telah Pulih!)': 'Harmony Clock Tower (Restored!)',
  'Prasasti Batu Pendiri Menara': 'Tower Founder Stone Tablet',
  'Mekanisme Jam Harmoni': 'Harmony Clockwork Mechanism',
  'Lonceng Harmoni Perunggu': 'Bronze Harmony Bell',
  'Lonceng Menara Jam': 'Chimes of Clock Tower',
  'Harmoni Lembah': 'Valley of Harmony',
  'Narator Cerita': 'Story Narrator',
  'Pencerita Kisah': 'Story Narrator',
  'Petunjuk Pertama': 'First Clue',
  'Petunjuk Awal': 'First Clue',
  'Pesan Suci Kompas': 'Sacred Message of the Compass',
  'Pesan Rahasia Kompas': 'Sacred Message of the Compass',
  'Suara Hati Terdalam': 'Innermost Heart Voice',
  'Kincir Angin Harmoni': 'Harmony Windmill',
  'Sapi Padang Rumput': 'Pasture Cow',
  'Domba Wol Putih': 'Fluffy White Sheep',
  'Rusa Tutul Hutan': 'Forest Spotted Deer',
  'Kelinci Padang Rumput': 'Meadow Bunny',
  'Anak Domba Gemas': 'Little Lamb',
  'Tupai Hutan': 'Forest Squirrel',
  'Aliran Sungai Jernih': 'Clear River Stream',
  'Air Terjun Sungai Harmoni': 'Harmony River Waterfall',
};

export function getLocalizedNpcName(
  npcId: string,
  lang: GameLanguage,
  isResolved?: boolean,
  originalName?: string
): string {
  if (lang === 'id') {
    if (npcId === 'penjaga_kabut' || npcId === 'Sosok Kabut') {
      return isResolved ? 'Nenek Wilis' : (originalName || 'Sosok Kabut');
    }
    return originalName || (npcId === 'kakek_ranu' ? 'Kakek Ranu' : npcId);
  }
  if (
    npcId === 'penjaga_kabut' ||
    npcId === 'Sosok Kabut' ||
    originalName === 'Sosok Kabut' ||
    originalName === 'Sosok Kabut / Nenek Wilis' ||
    originalName === 'Nenek Wilis'
  ) {
    return isResolved ? 'Grandma Wilis' : 'Spirit Elder';
  }
  return (
    NPC_NAMES_EN[npcId] ||
    NPC_NAMES_EN[npcId.toLowerCase()] ||
    SPEAKER_NAMES_EN[npcId] ||
    (originalName && (NPC_NAMES_EN[originalName] || NPC_NAMES_EN[originalName.toLowerCase()] || SPEAKER_NAMES_EN[originalName])) ||
    originalName ||
    npcId
  );
}

export function getLocalizedNpcRole(
  npcId: string,
  lang: GameLanguage,
  isResolved?: boolean,
  originalRole?: string
): string {
  if (lang === 'id') {
    if ((npcId === 'penjaga_kabut' || npcId === 'Sosok Kabut') && isResolved) {
      return 'Pustakawan Sepuh Desa';
    }
    return originalRole || '';
  }
  if ((npcId === 'penjaga_kabut' || npcId === 'Sosok Kabut') && isResolved) {
    return 'Elder Village Librarian';
  }
  return (
    NPC_ROLES_EN[npcId] ||
    NPC_ROLES_EN[npcId.toLowerCase()] ||
    (originalRole && (NPC_ROLES_EN[originalRole] || NPC_ROLES_EN[originalRole.trim()])) ||
    originalRole ||
    ''
  );
}

export function getLocalizedSpeaker(speaker: string | undefined, lang: GameLanguage): string {
  if (!speaker) return '';
  if (lang === 'id') return speaker;
  return SPEAKER_NAMES_EN[speaker] || NPC_NAMES_EN[speaker] || NPC_NAMES_EN[speaker.toLowerCase()] || speaker;
}

export type DialogueNodeOverride = Omit<Partial<DialogueNode>, 'choices'> & {
  choices?: Array<Partial<ChoiceOption>>;
};

export const GAME_DIALOGUES_EN: Record<string, DialogueNodeOverride> = {
  // --- PROLOGUE & KIKI ---
  intro_start: {
    speaker: 'Story Narrator',
    speakerRole: 'Valley of Harmony',
    text: 'The sky rumbles softly... Suddenly, a thick grey fog blankets the Valley of Harmony! The central fountain stops flowing, and the colorful flowers instantly fade into grey.',
  },
  intro_start_2: {
    speaker: 'Ezzel',
    speakerRole: 'Grade 4 Young Explorer',
    text: "Huh?! What is happening to our village? Look, something shiny just fell right in front of me... it looks like a Crystal Compass engraved with 'HEART COMPASS'!",
  },
  intro_start_3: {
    speaker: 'Sacred Message of the Compass',
    speakerRole: 'Valley Relic',
    text: '"Colors fade when hearts are locked by misunderstandings. Use the Heart Compass to discover the true feelings hidden beneath spoken words!"',
    choices: [
      {
        id: 'c_start_help',
        text: 'Activate the Compass and approach Kiki the Squirrel!',
        impactScore: 10,
        resultDialogueId: 'kiki_wait',
      },
    ],
  },
  kiki_wait: {
    speaker: 'First Clue',
    speakerRole: 'Mission 1',
    text: 'Kiki the little mail squirrel is hopping frantically to the left of the fountain! Approach him and press [RESONANCE / SPACE] to read what he is feeling.',
  },
  kiki_intro: {
    speaker: 'Kiki',
    speakerRole: 'Little Mail Squirrel',
    text: 'Squeak! Oh no! A huge disaster! The villagers\' letters were scattered away by the foggy wind! Everyone... everyone will be furious with me! Everyone will hate me!',
    thoughtBubble: 'My heart is pounding so fast, I can barely breathe... I am so afraid of failing everyone!',
    choices: [
      {
        id: 'c_kiki_1',
        text: 'Calm down Kiki, stop shouting like that, you are giving me a headache!',
        impactScore: -5,
        resultDialogueId: 'kiki_dismiss',
      },
      {
        id: 'c_kiki_2',
        text: "Calm down Kiki, take a slow breath. Let's calm our hearts down first.",
        impactScore: 15,
        resultDialogueId: 'kiki_calm_options',
      },
      {
        id: 'c_kiki_3',
        text: "It is completely normal to feel panicked, but we can gather the scattered letters together!",
        impactScore: 10,
        resultDialogueId: 'kiki_validate',
      },
    ],
  },
  kiki_dismiss: {
    speaker: 'Kiki',
    speakerRole: 'Little Mail Squirrel',
    text: 'Sniffle... you are blaming me too! My paws are trembling even harder now...',
  },
  kiki_validate: {
    speaker: 'Kiki',
    speakerRole: 'Little Mail Squirrel',
    text: 'You... you are not angry at me? But my chest is still beating so fast... it feels like it is about to burst.',
  },
  kiki_validate_options: {
    speaker: 'Kiki',
    speakerRole: 'Little Mail Squirrel',
    text: 'I am so relieved that you want to help collect the letters together! But my body is still trembling with panic. Can you teach me how to calm down first, Ezzel?',
    thoughtBubble: 'Once I am calm, we can surely collect all the letters together...',
    choices: [
      {
        id: 'c_kiki_reg_breathing_v',
        text: '🌬️ Balloon Breathing Technique (4-4-4): Inhale slowly through your nose, hold, then gently exhale.',
        impactScore: 20,
        resultDialogueId: 'kiki_prep_breathing',
      },
      {
        id: 'c_kiki_reg_grounding_v',
        text: '👁️ 5-4-3-2-1 Sensory Grounding: Observe our surroundings to bring your focus back to the present.',
        impactScore: 20,
        resultDialogueId: 'kiki_prep_grounding',
      },
      {
        id: 'c_kiki_reg_stop_v',
        text: '🛑 S.T.O.P Reset Method: Stop for a moment, Take a breath, Observe sensations, then Proceed calmly.',
        impactScore: 20,
        resultDialogueId: 'kiki_prep_stop',
      },
      {
        id: 'c_kiki_reg_shakeout_v',
        text: '⚡ Body Shake-Out: Shake your paws, feet, and tail to release tension and stress hormones.',
        impactScore: 20,
        resultDialogueId: 'kiki_prep_shakeout',
      },
    ],
  },
  kiki_calm_options: {
    speaker: 'Kiki',
    speakerRole: 'Little Mail Squirrel',
    text: 'Sniff... thank you for caring, Ezzel. But how? My heart is racing and my paws are trembling... What exercise can help me calm down?',
    thoughtBubble: 'I want to be calm, but I need my friend\'s guidance to soothe this panic...',
    choices: [
      {
        id: 'c_kiki_reg_breathing',
        text: '🌬️ Balloon Breathing Technique (4-4-4): Inhale slowly through your nose, hold, then gently exhale.',
        impactScore: 20,
        resultDialogueId: 'kiki_prep_breathing',
      },
      {
        id: 'c_kiki_reg_grounding',
        text: '👁️ 5-4-3-2-1 Sensory Grounding: Observe our surroundings to bring your focus back to the present.',
        impactScore: 20,
        resultDialogueId: 'kiki_prep_grounding',
      },
      {
        id: 'c_kiki_reg_stop',
        text: '🛑 S.T.O.P Reset Method: Stop for a moment, Take a breath, Observe sensations, then Proceed calmly.',
        impactScore: 20,
        resultDialogueId: 'kiki_prep_stop',
      },
      {
        id: 'c_kiki_reg_shakeout',
        text: '⚡ Body Shake-Out: Shake your paws, feet, and tail to release tension and stress hormones.',
        impactScore: 20,
        resultDialogueId: 'kiki_prep_shakeout',
      },
    ],
  },
  kiki_prep_breathing: {
    speaker: 'Ezzel',
    speakerRole: 'Main Adventurer (Empathy Friend)',
    text: 'Let\'s do it together, Kiki! Inhale slowly through your nose for 4 seconds, imagine inflating a big balloon in your belly, hold for a moment, then exhale gently.',
  },
  kiki_prep_grounding: {
    speaker: 'Ezzel',
    speakerRole: 'Main Adventurer (Empathy Friend)',
    text: "Let's use the 5-4-3-2-1 Grounding technique, Kiki! Look around the plaza: notice what you can see, touch, and hear so your mind feels grounded and safe.",
  },
  kiki_prep_stop: {
    speaker: 'Ezzel',
    speakerRole: 'Main Adventurer (Empathy Friend)',
    text: "Let's apply the S.T.O.P method, Kiki! Stop panicking, Take a deep breath, Observe your anxious feelings without fear, then Proceed to find the letters calmly.",
  },
  kiki_prep_shakeout: {
    speaker: 'Ezzel',
    speakerRole: 'Main Adventurer (Empathy Friend)',
    text: 'When we are anxious, our muscles tighten up! Shake your paws, wiggle your feet, and wag your tail to shake away the stiffness and stress hormones!',
  },
  kiki_breathe_prep: {
    speaker: 'Ezzel',
    speakerRole: 'Main Adventurer (Empathy Friend)',
    text: "Let's do this together, Kiki! Inhale slowly through your nose for 4 seconds, imagine inflating a balloon in your tummy, hold gently, then exhale slowly.",
  },
  kiki_after_breathing: {
    speaker: 'Kiki',
    speakerRole: 'Little Mail Squirrel',
    text: 'Phew... it worked like magic! My heartbeat is slowing down. My head feels so much clearer and I can breathe freely again! Thank you for balloon breathing with me, Ezzel!',
  },
  kiki_after_breathe: {
    speaker: 'Kiki',
    speakerRole: 'Little Mail Squirrel',
    text: 'Phew... it worked like magic! My heartbeat is slowing down. My head feels so much clearer and I can breathe freely again! Thank you for balloon breathing with me, Ezzel!',
  },
  kiki_after_grounding: {
    speaker: 'Kiki',
    speakerRole: 'Little Mail Squirrel',
    text: 'Wow... seeing the green grass, feeling the cool breeze, and hearing the gentle fountain splashing truly anchored my thoughts! Thank you for the grounding technique, Ezzel!',
  },
  kiki_after_stop: {
    speaker: 'Kiki',
    speakerRole: 'Little Mail Squirrel',
    text: 'Incredible! By pausing and noticing my fears without self-judgment, I realize we can solve this together step by step! Thank you for the S.T.O.P method, Ezzel!',
  },
  kiki_after_shakeout: {
    speaker: 'Kiki',
    speakerRole: 'Little Mail Squirrel',
    text: 'Yay! My body feels so light and free after shaking our paws and tail! My neck isn\'t stiff anymore and the panic is gone! Thank you, Ezzel!',
  },
  kiki_reward: {
    speaker: 'Kiki',
    speakerRole: 'Little Mail Squirrel',
    text: 'Look, Ezzel! The plaza fountain is sparkling with fresh water and the grass around us is blooming green again! Here is an "Ancient Village Letter" I recovered—it looks important for Grandpa Ranu at the Bridge!',
  },
  kiki_resolved: {
    speaker: 'Kiki',
    speakerRole: 'Little Mail Squirrel',
    text: 'Squeak! Hello, Ezzel! My heart feels peaceful and happy now. Whenever anxious thoughts pop up, I take three deep balloon breaths. Thank you for being such a wonderful friend!',
  },
  kiki_remind_bridge: {
    speaker: 'Kiki',
    speakerRole: 'Little Mail Squirrel',
    text: 'Squeak! Thank you Ezzel, the Plaza is colorful again! Now it\'s Grandpa Ranu\'s turn at the Wooden Bridge (to the east) who needs your compassionate help in Mission 2!',
  },

  // --- SEQUENTIAL QUEST DIALOGUES ---
  ranu_locked_need_kiki: {
    speaker: 'Grandpa Ranu',
    speakerRole: 'Bridge Carpenter',
    text: 'Hold on, youngster! I saw little squirrel Kiki panicking in distress near the Plaza Fountain. Head west and complete Mission 1 with Kiki first before you meet me at this bridge!',
    thoughtBubble: 'The village must be restored starting from the plaza with Kiki...',
    choices: [
      {
        id: 'ranu_locked_c1',
        text: 'Understood Grandpa Ranu, I will head to the Plaza right away to help Kiki in Mission 1!',
        impactScore: 10,
        resultDialogueId: 'ranu_locked_ack',
      },
    ],
  },
  ranu_locked_ack: {
    speaker: 'Grandpa Ranu',
    speakerRole: 'Bridge Carpenter',
    text: 'Good! Follow the golden quest indicator [➔ MISSION 1] to find Kiki at the Plaza!',
  },
  bimo_locked_need_bridge: {
    speaker: 'Bimo',
    speakerRole: 'Shy Boy Behind the Tree',
    text: 'Shh... the grey fog is still too dense and the wooden bridge hasn\'t been opened by Grandpa Ranu yet! Please complete Mission 2 with Grandpa Ranu so the path to this forest is safe!',
    thoughtBubble: 'Grandpa Ranu must open the bridge first...',
    choices: [
      {
        id: 'bimo_locked_c1',
        text: 'Alright Bimo, I will complete Mission 2 at the bridge with Grandpa Ranu first!',
        impactScore: 10,
        resultDialogueId: 'bimo_locked_ack',
      },
    ],
  },
  bimo_locked_ack: {
    speaker: 'Bimo',
    speakerRole: 'Shy Boy Behind the Tree',
    text: 'Thank you, Ezzel! Follow the golden mission indicator [➔ MISSION 2] toward Grandpa Ranu\'s bridge!',
  },
  tower_locked_need_gear: {
    speaker: 'Spirit Elder / Clock Tower',
    speakerRole: 'Monument of Harmony',
    text: 'Stop! The doors of the Harmony Clock Tower are firmly sealed in thick fog! The Golden Gear of Harmony is still with Bimo in the Silent Forest (Mission 3). Find and comfort Bimo first before restoring this tower!',
    thoughtBubble: 'This tower needs the Golden Gear of Harmony from Bimo...',
    choices: [
      {
        id: 'tower_locked_c1',
        text: 'I understand! I will go find Bimo in the Silent Forest to recover the sacred gear!',
        impactScore: 10,
        resultDialogueId: 'tower_locked_ack',
      },
    ],
  },
  tower_locked_ack: {
    speaker: 'Spirit Elder / Clock Tower',
    speakerRole: 'Monument of Harmony',
    text: 'The tower gate will unlock as soon as you bring the Golden Gear of Harmony from Bimo in Mission 3!',
  },
  ranu_remind_bimo: {
    speaker: 'Grandpa Ranu',
    speakerRole: 'Carpenter & Bridge Keeper',
    text: 'The wooden bridge is wide open for you now! Cross over and find young Bimo in the Silent Forest (to the northwest) in Mission 3. Please let him know that I am not angry at all, it was just a misunderstanding because I was tired!',
    thoughtBubble: 'Bimo is a kind, talented apprentice. My yelling earlier must have terrified him...',
  },
  bimo_remind_tower: {
    speaker: 'Bimo',
    speakerRole: 'Clockmaker Apprentice (Grade 4)',
    text: 'You have the Golden Gear of Harmony! Now take it to the top of the Clock Tower in the northeast (Mission 4). Grandma Wilis and the whole valley are waiting for the chime of harmony to return!',
    thoughtBubble: 'The Clock Tower will tick happily again thanks to our courage in clearing the misunderstanding!',
  },

  // --- GRANDPA RANU & BRIDGE ---
  ranu_intro: {
    speaker: 'Grandpa Ranu',
    speakerRole: 'Village Carpenter',
    text: 'GRRR! What do you noisy kids want?! This bridge is CLOSED! Go home! All you do is fool around and break things in the village!',
    thoughtBubble: 'People only ever come to me when something is broken... Now that I am old and slow, I am left all alone...',
    choices: [
      {
        id: 'ranu_c1',
        text: 'You must be exhausted maintaining the bridge all alone, Grandpa. We deeply appreciate your hard work.',
        impactScore: 20,
        resultDialogueId: 'ranu_path_empathy',
        branchTag: 'empathy_first',
      },
      {
        id: 'ranu_c2',
        text: 'We do not mean to cause trouble, Grandpa. We want to cross to help fellow villagers trapped by the grey fog.',
        impactScore: 15,
        resultDialogueId: 'ranu_path_logic',
        branchTag: 'logic_first',
      },
      {
        id: 'ranu_c3',
        text: 'You are mean, Grandpa! Stop being so grumpy or you will age even faster!',
        impactScore: -10,
        resultDialogueId: 'ranu_angry_rebuke',
      },
    ],
  },
  ranu_angry_rebuke: {
    speaker: 'Grandpa Ranu',
    speakerRole: 'Village Carpenter',
    text: 'WHAT DID YOU SAY?! Such disrespect! Get away from my bridge before I sweep you off with my broom!',
  },
  ranu_path_empathy: {
    speaker: 'Grandpa Ranu',
    speakerRole: 'Village Carpenter',
    text: 'W... what did you say, child? You... appreciate me? (Grandpa Ranu rubs the corner of his eyes). It has been years since anyone asked how I was doing instead of demanding a bridge fix...',
  },
  ranu_path_empathy_2: {
    speaker: 'Grandpa Ranu',
    speakerRole: 'Village Carpenter',
    text: 'I was so bitter and lonely that I locked the bridge to keep everyone out. But your kind words melted the ice in my heart. Let me unlock the bridge and give you the Archive Key!',
  },
  ranu_path_empathy_3: {
    speaker: 'Grandpa Ranu',
    speakerRole: 'Village Carpenter',
    text: 'Thank you for listening to my heart, Ezzel. Take this bridge key. Please meet my apprentice, Bimo, across the bridge. Tell him Grandpa is not angry at him. Grandpa is eagerly waiting for him to come home!',
  },
  ranu_path_logic: {
    speaker: 'Grandpa Ranu',
    speakerRole: 'Village Carpenter',
    text: 'Hmm... So you are not here to ruin my bridge? You genuinely wish to help the villagers struggling with the grey mist?',
  },
  ranu_path_logic_2: {
    speaker: 'Grandpa Ranu',
    speakerRole: 'Village Carpenter',
    text: 'Very well! Your honesty and goodwill deserve respect. I will lower the bridge planks. Take this Bridge Pass and stay safe in the forest ahead!',
  },
  ranu_resolved: {
    speaker: 'Grandpa Ranu',
    speakerRole: 'Village Carpenter',
    text: 'Look at that! The river ripples clear and the wooden bridge stands proud and strong once more! Thank you for hearing the loneliness beneath my anger, young explorer.',
  },

  // --- BIMO & THE SILENT FOREST ---
  bimo_intro: {
    speaker: 'Bimo',
    speakerRole: 'Clockmaker Apprentice (Grade 4)',
    text: '(Sobbing while clutching the Golden Gear tightly behind the tree)... Huwaaa! Ezzel, don\'t come near me! Grandpa Ranu yelled so loudly at me earlier when we inspected the clock tower... He must hate me! I panicked and fled to the forest with this Tower Gear... The village clock stopped and the grey fog came because of this misunderstanding! I feel so guilty and terrified of being scolded...',
    thoughtBubble: 'Grandpa Ranu must be furious with me... I am so afraid of being labelled a failure...',
    choices: [
      {
        id: 'bimo_c1',
        text: 'Grandpa Ranu does not hate you, Bimo. He sent his warm regards and admitted he only snapped because he was tired.',
        impactScore: 20,
        resultDialogueId: 'bimo_ranu_praise',
      },
      {
        id: 'bimo_c2',
        text: 'Making mistakes while learning is natural, Bimo. One mistake doesn\'t make you a bad kid. Let\'s fix this together!',
        impactScore: 20,
        resultDialogueId: 'bimo_growth_mindset',
      },
      {
        id: 'bimo_c3',
        text: 'Then why did you run off with the clock gear? You made everyone panic!',
        impactScore: -10,
        resultDialogueId: 'bimo_shame',
      },
    ],
  },
  bimo_shame: {
    speaker: 'Bimo',
    speakerRole: 'Clockmaker Apprentice (Grade 4)',
    text: 'See? I knew it... everyone blames me and thinks I\'m a wrecker! I don\'t want to speak anymore!',
  },
  bimo_ranu_praise: {
    speaker: 'Bimo',
    speakerRole: 'Clockmaker Apprentice (Grade 4)',
    text: 'R-really? Grandpa Ranu said that? (Bimo wipes his tears behind his glasses). So Grandpa doesn\'t hate me? He yelled so loud earlier that my knees shook... I thought he never wanted to see me again. It was all a misunderstanding because Grandpa was exhausted...',
  },
  bimo_growth_mindset: {
    speaker: 'Bimo',
    speakerRole: 'Clockmaker Apprentice (Grade 4)',
    text: 'Ezzel... your words warm my heart. Grandpa Ranu and my teacher always remind us of the Growth Mindset: mistakes aren\'t proof that we\'re foolish, but proof that we are bravely trying and learning!',
  },
  bimo_growth_mindset_2: {
    speaker: 'Bimo',
    speakerRole: 'Clockmaker Apprentice (Grade 4)',
    text: 'I will not hide from fear anymore! Here is the sacred Golden Gear of Harmony that I kept safe. Take it to the Clock Tower in the northeast for Grandma Wilis. Let\'s bring back the chime of time and colors to our village!',
  },
  bimo_resolved: {
    speaker: 'Bimo',
    speakerRole: 'Clockmaker Apprentice (Grade 4)',
    text: 'Hello Ezzel! I am not afraid anymore. My misunderstanding with Grandpa Ranu is resolved, and I learned to forgive myself. Thank you for your heartfelt help!',
  },

  // --- CLOCK TOWER & NENEK WILIS (ENDING CLIMAX) ---
  tower_intro: {
    speaker: 'Spirit Elder / Clock Tower',
    speakerRole: 'Final Guardian of the Valley of Harmony',
    text: 'Who dares step through the dense fog to the summit of the Clock Tower? Do not approach, young explorer... My heart is weary of hearing the villagers quarrel!',
    thoughtBubble: 'Everyone only blames each other... No one wants to listen with patience anymore...',
    choices: [
      {
        id: 'tw_c1',
        text: 'Who are you really? Are you the monster making the grey fog?',
        impactScore: 5,
        resultDialogueId: 'tower_reveal',
      },
      {
        id: 'tw_c2',
        text: 'We came not to fight. Our compass senses a profound sadness in your heart.',
        impactScore: 25,
        resultDialogueId: 'tower_empathy_twist',
      },
    ],
  },
  tower_reveal: {
    speaker: 'Mysterious Mist Spirit',
    speakerRole: 'Shadow of the Tower',
    text: 'A monster? Haha... take a closer look with your Heart Compass!',
  },
  tower_empathy_twist: {
    speaker: 'Grandma Wilis',
    speakerRole: 'Elder Village Librarian',
    text: 'My name is Grandma Wilis. I am no monster. This grey fog descended because we constantly misunderstood one another and forgot to truly listen.',
  },
  tower_twist_explanation: {
    speaker: 'Grandma Wilis',
    speakerRole: 'Elder Village Librarian',
    text: 'You have proven true kindness: helping anxious Kiki, comforting Grandpa Ranu, and reassuring Bimo. You are wonderful!',
  },
  tower_final_choice: {
    speaker: 'Grandma Wilis',
    speakerRole: 'Elder Village Librarian',
    text: 'Now the Golden Gear is in your hands, Ezzel. The final choice is yours: What proclamation do you wish to declare as the chime of harmony rings?',
    choices: [
      {
        id: 'choice_ending_perfect',
        text: '"Message of Empathy": Let us declare a Village of Heart Listeners, where every feeling is acknowledged and valued!',
        impactScore: 30,
        resultDialogueId: 'ending_perfect_scene',
      },
      {
        id: 'choice_ending_resilient',
        text: '"Message of Courage": Admitting mistakes and forgiving each other is the true strength of our Valley children!',
        impactScore: 25,
        resultDialogueId: 'ending_resilient_scene',
      },
    ],
  },
  ending_perfect_scene: {
    speaker: 'Clock Tower Bell',
    speakerRole: 'Harmony of the Valley',
    text: 'DIIING... DOOONG! The bell chime reverberates across the whole valley! A rainbow wave of golden sunlight washes across every land, restoring 100% of the world\'s colors!',
  },
  nenek_wilis_closing_perfect: {
    speaker: 'Grandma Wilis',
    speakerRole: 'Elder Village Librarian',
    text: 'Look all around us, Ezzel! The grey fog is gone. Flowers bloom again thanks to your kindness in listening to others.',
    thoughtBubble: 'My heart is deeply at peace seeing the children grow to love and listen to one another.',
  },
  ending_resilient_scene: {
    speaker: 'Clock Tower Bell',
    speakerRole: 'Harmony of the Valley',
    text: 'DIIING... DOOONG! Warm resonant chimes pierce through the mist! Trees bloom with vivid blossoms, birds sing, and villagers step out with bright smiles and warm hugs!',
  },
  nenek_wilis_closing_resilient: {
    speaker: 'Grandma Wilis',
    speakerRole: 'Elder Village Librarian',
    text: 'Thank you from the bottom of my heart, Ezzel... You proved that the courage to acknowledge mistakes and forgive each other is the true key to peace among villagers.',
    thoughtBubble: 'This child\'s bravery has melted prejudice and reunited the hearts of the villagers.',
  },
  ending_summary_perfect: {
    speaker: 'Grandma Wilis & All Villagers',
    speakerRole: 'Valley Harmony Celebration',
    text: 'Congratulations, Ezzel! All the villagers cheer and applaud our young hero. The Valley\'s harmony is 100% restored and you are officially awarded the highest honor: "GRADE 4 GOLDEN EMPATHY AMBASSADOR"!',
  },
  ending_summary_resilient: {
    speaker: 'Grandma Wilis & All Villagers',
    speakerRole: 'Valley Harmony Celebration',
    text: 'Incredible, Ezzel! The Valley\'s harmony is 100% restored from the fog of misunderstanding. Everyone learned that listening and forgiving brings peace. You are awarded: "RESILIENT HEART EXPLORER"!',
  },
  tower_resolved: {
    speaker: 'Grandma Wilis',
    speakerRole: 'Elder Village Librarian',
    text: 'May the chimes of the Clock Tower always remind us that empathy, gentle breath, and honest listening can heal any misunderstanding.',
  },
  chat_nenek_wilis: {
    speaker: 'Grandma Wilis',
    speakerRole: 'Tower Guardian & Village Librarian (Gazing at the Beautiful Valley)',
    text: 'Ezzel, my beloved grandchild... Look at the village from this tower landing. Agile Kiki delivering letters, cheerful Didi patrolling, Professor Kotek diligently recording laughter, and kind neighbors enjoying each other\'s company. You restored not only the colors, but the very soul of Harmony.',
    thoughtBubble: 'Every tick of the Harmony Clock now resonates in tune with the loving heartbeat of all villagers.',
  },

  // --- EDUCATOR NPCS: CITRA, DAMAI, MOKA, JOKO, DIDI, TEGUH, SARI, JALA, KOTEK ---
  citra_intro: {
    speaker: 'Sister Citra',
    speakerRole: 'Flower Garden Counselor',
    text: 'Welcome to the Flower Garden, Ezzel! Look at these flowers. Just like flowers blooming in countless colors, our feelings also have "4 Color Zones", and every single one is precious!',
    choices: [
      {
        id: 'citra_c1',
        text: 'What are the 4 Emotion Color Zones, Sister Citra?',
        impactScore: 10,
        resultDialogueId: 'citra_zones_explain',
      },
      {
        id: 'citra_c2',
        text: 'Is it okay if I am in the Red Zone (very angry)?',
        impactScore: 10,
        resultDialogueId: 'citra_zones_red_ask',
      },
    ],
  },
  citra_zones_explain: {
    speaker: 'Sister Citra',
    speakerRole: 'Flower Garden Counselor',
    text: '🌱 Green: Calm, Focused, Cheerful (Ready to learn). ⚡ Yellow: Anxious, Restless, Excited. 🔥 Red: Fiery Anger, Panic, Feeling like exploding. 🌧️ Blue: Sad, Exhausted, Disappointed.',
  },
  citra_zones_red_ask: {
    speaker: 'Sister Citra',
    speakerRole: 'Flower Garden Counselor',
    text: 'Of course it is okay! THERE ARE NO wrong or forbidden emotions. What matters is not suppressing emotions, but how we respond safely without hurting ourselves or our friends.',
  },
  citra_zones_question: {
    speaker: 'Sister Citra',
    speakerRole: 'Flower Garden Counselor',
    text: 'Quick SEL Quiz: If your friend is in the Red Zone (screaming angrily), what is your best response as a mindful listener?',
    choices: [
      {
        id: 'c_z1',
        text: 'Scream back even louder to make them be quiet.',
      },
      {
        id: 'c_z2',
        text: 'Provide a safe space, calm yourself first, then listen gently when they are ready to breathe peacefully.',
      },
    ],
  },
  citra_quiz_wrong: {
    speaker: 'Sister Citra',
    speakerRole: 'Flower Garden Counselor',
    text: 'Oh dear, pouring oil on a fire only makes the blaze roar! When a friend is in the Red Zone, their amygdala is on high alert. It is far better to stay calm and offer a gentle space.',
  },
  citra_reward: {
    speaker: 'Sister Citra',
    speakerRole: 'Flower Garden Counselor',
    text: 'Exactly right, Ezzel! Outstanding! You have mastered Self-Awareness regarding the 4 Regulation Zones. Receive this badge of honor in your Adventure Journal!',
  },
  citra_resolved: {
    speaker: 'Sister Citra',
    speakerRole: 'Flower Garden Counselor',
    text: 'The flowers in this garden bloom in harmony with the 4 color zones! Keep checking in with your feelings and recognize when your body needs rest.',
    thoughtBubble: 'Every child who can recognize their emotions holds a guiding lantern for life.',
  },

  damai_intro: {
    speaker: 'Grandpa Damai',
    speakerRole: 'Mindful Bonsai Master',
    text: 'Peaceful greetings, young Ezzel. Gaze upon this flowing river... the stones never yell at the water, and the water never forces the stone to move. Have you ever heard of the "Circle of Control"?',
    choices: [
      {
        id: 'damai_c1',
        text: 'What is the Circle of Control, Grandpa?',
        impactScore: 10,
        resultDialogueId: 'damai_control_explain',
      },
      {
        id: 'damai_c2',
        text: 'How do we stop worrying about things beyond our control?',
        impactScore: 10,
        resultDialogueId: 'damai_control_tips',
      },
    ],
  },
  damai_control_explain: {
    speaker: 'Grandpa Damai',
    speakerRole: 'Mindful Bonsai Master',
    text: 'There are things WITHIN OUR CONTROL: our words, study effort, how we respond, and our courage to apologize. And there are things OUTSIDE OUR CONTROL: the rain, how others treat us, or things that already happened.',
  },
  damai_control_tips: {
    speaker: 'Grandpa Damai',
    speakerRole: 'Mindful Bonsai Master',
    text: 'When anxiety strikes, ask your inner heart: "Can I change this through my own actions right now?" If not, take a deep breath and let it go into the care of the universe.',
  },
  damai_practice: {
    speaker: 'Grandpa Damai',
    speakerRole: 'Mindful Bonsai Master',
    text: 'When you lose a game or your group project is delayed because a friend is sick, where should you dedicate your energy?',
    choices: [
      {
        id: 'd_p1',
        text: 'Keep complaining and blaming bad luck or the weather.',
      },
      {
        id: 'd_p2',
        text: 'Focus on what I can do right now: help organize our parts and learn with patience from the process.',
      },
    ],
  },
  damai_wrong: {
    speaker: 'Grandpa Damai',
    speakerRole: 'Mindful Bonsai Master',
    text: 'Complaining wastes energy on things that cannot be changed. Turn your gaze back inside your own circle of control.',
  },
  damai_reward: {
    speaker: 'Grandpa Damai',
    speakerRole: 'Mindful Bonsai Master',
    text: 'Such a wise heart! You now understand the secret of inner serenity. Wear this "Ruler of the Circle of Control" badge as a mark of your wisdom.',
  },
  damai_resolved: {
    speaker: 'Grandpa Damai',
    speakerRole: 'Mindful Bonsai Master',
    text: 'Peaceful greetings... A mind that focuses on things within its control remains calm and still, like a tranquil lake without ripples.',
    thoughtBubble: 'True peace is not the absence of trouble, but inner stillness in the midst of storms.',
  },

  moka_intro: {
    speaker: 'Moka the Cat',
    speakerRole: 'Gentle Library Cat',
    text: 'Purrr... Meow! Sit beside me on this wooden bench for a moment, Ezzel. Sometimes we get so busy crafting replies in our heads while others talk that we forget to genuinely LISTEN.',
    choices: [
      {
        id: 'moka_c1',
        text: 'How do we listen with the eyes of the heart, Moka?',
        impactScore: 10,
        resultDialogueId: 'moka_listen_explain',
      },
      {
        id: 'moka_c2',
        text: 'Why does it hurt so much when someone interrupts our story?',
        impactScore: 10,
        resultDialogueId: 'moka_cut_explain',
      },
    ],
  },
  moka_listen_explain: {
    speaker: 'Moka the Cat',
    speakerRole: 'Gentle Library Cat',
    text: '3 Keys to Active Listening: 1) Put down devices & make gentle eye contact. 2) Hold back the impulse to interrupt or lecture. 3) Validate their feelings: "It must feel really painful to go through that."',
  },
  moka_cut_explain: {
    speaker: 'Moka the Cat',
    speakerRole: 'Gentle Library Cat',
    text: 'When our story is interrupted with "Oh that\'s nothing, I had it way worse!", we feel our feelings are belittled and unworthy.',
  },
  moka_question: {
    speaker: 'Moka the Cat',
    speakerRole: 'Gentle Library Cat',
    text: 'When a friend tells you they just lost their favorite pencil, which response reflects true empathy?',
    choices: [
      {
        id: 'm_q1',
        text: '"That\'s why you shouldn\'t be clumsy! Buying another one is easy anyway."',
      },
      {
        id: 'm_q2',
        text: '"You must be sad, that pencil has special memories for you. Would you like me to help search under the desks together?"',
      },
    ],
  },
  moka_wrong: {
    speaker: 'Moka the Cat',
    speakerRole: 'Gentle Library Cat',
    text: 'Meow... judgmental words make friends retreat into their shells. Try responding with empathetic validation.',
  },
  moka_reward: {
    speaker: 'Moka the Cat',
    speakerRole: 'Gentle Library Cat',
    text: 'Purrr! Your warmth soothes the soul. You truly deserve the "True Empathic Listener" badge! Continue to be a comforting listener for all your friends!',
  },
  moka_resolved: {
    speaker: 'Moka the Cat',
    speakerRole: 'Gentle Library Cat',
    text: 'Purrr... Meow! Ears that listen with care are the finest balm for an aching heart. Continue to be a safe haven for your friends!',
    thoughtBubble: 'Listening without judgment is the purest expression of compassion.',
  },

  joko_intro: {
    speaker: 'Farmer Joko',
    speakerRole: 'Garden of Hope Farmer',
    text: 'Hello young one! Crisp morning air, isn\'t it? Look at these rows of carrots, cabbages, and golden wheat I am watering. Every single one started from a tiny seed buried in dark soil.',
    thoughtBubble: 'Plants cannot be yanked upward to grow faster. Growth takes time, water, and loving patience.',
  },
  pak_joko_intro: {
    speaker: 'Farmer Joko',
    speakerRole: 'Garden of Hope Farmer',
    text: 'Hello youngster! Welcome to the garden! The gate is wide open so you can explore. Everything here blossomed from small seeds cared for with patience.',
  },
  joko_lesson: {
    speaker: 'Farmer Joko',
    speakerRole: 'Garden of Hope Farmer',
    text: 'In Social-Emotional Learning, there is a concept called the "Growth Mindset". Just like seedling sprouts, our brains and abilities expand through practice and refusing to give up.',
    choices: [
      {
        id: 'c_joko_ask',
        text: 'What if we make mistakes while learning, Farmer Joko?',
      },
      {
        id: 'c_joko_pass',
        text: 'Your harvest looks so lush and abundant, Farmer Joko!',
      },
    ],
  },
  joko_compliment: {
    speaker: 'Farmer Joko',
    speakerRole: 'Garden of Hope Farmer',
    text: 'Thank you, child! But this abundance was born from years of crop failures long ago. My crops once withered from improper watering, but I learned from every mistake.',
  },
  joko_question: {
    speaker: 'Farmer Joko',
    speakerRole: 'Garden of Hope Farmer',
    text: 'Now, answer this old farmer\'s riddle: When you receive a test score below what you hoped for, or struggle to solve a hard math problem, which attitude reflects a Growth Mindset?',
    choices: [
      {
        id: 'c_joko_fixed',
        text: '"I\'m simply not talented in this subject, I might as well quit."',
      },
      {
        id: 'c_joko_growth',
        text: '"I haven\'t mastered it YET, but with fresh study methods and asking questions, my skills will grow!"',
      },
    ],
  },
  joko_fixed_feedback: {
    speaker: 'Farmer Joko',
    speakerRole: 'Garden of Hope Farmer',
    text: 'Oh dear, that is called a Fixed Mindset. Do not limit your potential, child! Add the magic word "NOT YET" instead of "CANNOT". Let\'s reflect once more.',
  },
  joko_growth_reward: {
    speaker: 'Farmer Joko',
    speakerRole: 'Garden of Hope Farmer',
    text: 'Spot on! The magic word is "YET". Mistakes are the richest fertilizer for wisdom. Receive this "Growth Mindset Scholar" badge! Keep watering your dreams with grit!',
  },
  joko_resolved: {
    speaker: 'Farmer Joko',
    speakerRole: 'Garden of Hope Farmer',
    text: 'Look at that, child! Our vegetables flourish thanks to the fertilizer of patience and effort! Always remember the lesson of the little seed that never gave up!',
  },
  pak_joko_resolved: {
    speaker: 'Farmer Joko',
    speakerRole: 'Garden of Hope Farmer',
    text: 'The Garden of Hope is always open to you! Keep practicing and nurturing the great potential inside you!',
    thoughtBubble: 'A growth mindset enables children to stand tall and resilient like banyan trees.',
  },

  didi_intro: {
    speaker: 'Didi',
    speakerRole: 'Little Village Scout',
    text: 'Hello there new friend! *waves cheerfully* My name is Didi! I love walking all around our village, from the crossroads of the plaza to the eastern fruit orchards!',
    thoughtBubble: 'Greeting people with a smile always warms my heart!',
  },
  didi_lesson: {
    speaker: 'Didi',
    speakerRole: 'Little Village Scout',
    text: 'Do you know my biggest secret while exploring? Relationship Skills begin with something delightfully simple: a sincere smile and a warm greeting!',
    choices: [
      {
        id: 'c_didi_q',
        text: 'What if we feel shy or awkward meeting someone new, Didi?',
      },
      {
        id: 'c_didi_fun',
        text: 'Your backpack looks packed full of adventuring gear!',
      },
    ],
  },
  didi_backpack: {
    speaker: 'Didi',
    speakerRole: 'Little Village Scout',
    text: 'Hehehe! Inside my backpack is a village map, a little compass, and a notebook of new friends I meet along the road!',
  },
  didi_question: {
    speaker: 'Didi',
    speakerRole: 'Little Village Scout',
    text: 'Awkwardness is completely normal! Now, if a new kid is standing all alone in the schoolyard without any friends yet, what is the best step we can take?',
    choices: [
      {
        id: 'c_didi_ignore',
        text: 'Just ignore them; they can find friends on their own if they want to.',
      },
      {
        id: 'c_didi_greet',
        text: 'Smile warmly, greet them by name, and invite them to play together.',
      },
    ],
  },
  didi_wrong: {
    speaker: 'Didi',
    speakerRole: 'Little Village Scout',
    text: 'Oh no, if we ignore them they will feel lonely and excluded. Remember, our small greeting can be a bright light for their entire day! Let\'s try again!',
  },
  didi_reward: {
    speaker: 'Didi',
    speakerRole: 'Little Village Scout',
    text: 'Wonderful! Kindness and warm greetings are a universal language understood by every heart. Here is the "Village Ambassador of Warmth" badge for you! Let\'s spread smiles everywhere we go!',
  },
  didi_resolved: {
    speaker: 'Didi',
    speakerRole: 'Little Village Scout',
    text: 'Hello explorer friend! The village feels so lively and warm. Keep greeting everyone you meet with a sincere smile!',
    thoughtBubble: 'Seeing others smile gives my steps so much bounce and energy!',
  },
  didi_roaming: {
    speaker: 'Didi',
    speakerRole: 'Little Village Scout (Harmony Route Patrol)',
    text: 'Hello friend Ezzel! I just completed a full expedition round: from the Plaza fountain, along Farmer Joko\'s vegetable garden, through Mr. Teguh\'s pine forest, up to the Clock Tower stairs! The whole village breathes in peaceful rhythm!',
  },

  teguh_intro: {
    speaker: 'Mr. Teguh',
    speakerRole: 'Wise Forest Woodcutter',
    text: 'Chop... chop... chop! Greetings, young explorer! Enjoying our lush pine forest? Fear not, my axe only trims rotten branches and thorny vines that block the forest trail.',
    thoughtBubble: 'The forest teaches us that stiff trees break in storms, while flexible ones bend and stay strong.',
    choices: [
      {
        id: 'c_teguh_anger',
        text: 'Why is trimming rotten branches compared to managing anger, Mr. Teguh?',
      },
      {
        id: 'c_teguh_axe',
        text: 'Your axe looks sturdy and well-cared for, Mr. Teguh!',
      },
    ],
  },
  teguh_axe_reply: {
    speaker: 'Mr. Teguh',
    speakerRole: 'Wise Forest Woodcutter',
    text: 'Indeed! This axe is sharpened with patience. Just like sharpening our discernment: if dulled by boiling rage, we risk harming beautiful things around us.',
  },
  teguh_lesson: {
    speaker: 'Mr. Teguh',
    speakerRole: 'Wise Forest Woodcutter',
    text: 'In Social-Emotional Learning, when anger blazes like glowing embers in your chest, there is the art of "Self-Management". Try answering this old woodcutter\'s quiz:',
  },
  teguh_question: {
    speaker: 'Mr. Teguh',
    speakerRole: 'Wise Forest Woodcutter',
    text: 'When a friend accidentally damages something you made and you feel boiling mad, what action reflects wisely cutting the cycle of anger?',
    choices: [
      {
        id: 'c_teguh_retaliate',
        text: 'Immediately ruin one of their belongings in return so they know how it feels.',
      },
      {
        id: 'c_teguh_timeout',
        text: 'Take a time-out, breathe deeply to soothe the amygdala, and express disappointment calmly using an "I-statement".',
      },
    ],
  },
  teguh_wrong: {
    speaker: 'Mr. Teguh',
    speakerRole: 'Wise Forest Woodcutter',
    text: 'Careful! If fire is met with fire, the whole forest of friendship burns to ash! Take a mindful breath and rethink your choice.',
  },
  teguh_reward: {
    speaker: 'Mr. Teguh',
    speakerRole: 'Wise Forest Woodcutter',
    text: 'Right on the mark! Excellent! You know when to put down the axe of anger and choose peace. Here is your "Wise Anger Regulator" badge!',
  },
  teguh_resolved: {
    speaker: 'Mr. Teguh',
    speakerRole: 'Wise Forest Woodcutter',
    text: 'This pine forest feels all the cooler thanks to your inner calm. Remember: a 5-second mindful breath is always better than years of regret!',
  },

  sari_intro: {
    speaker: 'Mrs. Sari',
    speakerRole: 'Forest Orchard Farmer',
    text: 'Good morning, sweet child! Breathe in the scent of crisp red apples and juicy oranges! The orchard trees are bearing heavy harvest this year.',
    thoughtBubble: 'The sweetest fruit is the fruit picked and savored together with dear friends.',
    choices: [
      {
        id: 'c_sari_gratitude',
        text: 'How do these trees produce such luscious fruit, Mrs. Sari?',
      },
      {
        id: 'c_sari_taste',
        text: 'These apples look wonderfully delicious and fresh!',
      },
    ],
  },
  sari_taste_reply: {
    speaker: 'Mrs. Sari',
    speakerRole: 'Forest Orchard Farmer',
    text: 'Hehehe, of course! Because every single tree is tended with gratitude and loving care every morning.',
  },
  sari_lesson: {
    speaker: 'Mrs. Sari',
    speakerRole: 'Forest Orchard Farmer',
    text: 'In emotional learning, there is a sweet fruit called "Gratitude" and "Social-Awareness". Try answering this sweet riddle from Mrs. Sari:',
  },
  sari_question: {
    speaker: 'Mrs. Sari',
    speakerRole: 'Forest Orchard Farmer',
    text: 'When you achieve top of your class or win a big competition, what is the best way to multiply your gratitude according to social-emotional values?',
    choices: [
      {
        id: 'c_sari_boast',
        text: 'Show off your trophy repeatedly and tease friends who didn\'t win to feel superior.',
      },
      {
        id: 'c_sari_share',
        text: 'Thank your teachers and parents, stay humble, and encourage friends who are still striving.',
      },
    ],
  },
  sari_wrong: {
    speaker: 'Mrs. Sari',
    speakerRole: 'Forest Orchard Farmer',
    text: 'Boasting makes the fruit of friendship rot and pushes companions away. True gratitude bears sweet humility. Let\'s try again!',
  },
  sari_reward: {
    speaker: 'Mrs. Sari',
    speakerRole: 'Forest Orchard Farmer',
    text: 'What sweet character you have! Gratitude yields true joy that never withers. Receive this "Harvester of Gratitude & Giving" badge!',
  },
  sari_resolved: {
    speaker: 'Mrs. Sari',
    speakerRole: 'Forest Orchard Farmer',
    text: 'Seeing children of noble character like you makes the orchard fruit taste a thousand times sweeter! Continue sharing kindness!',
  },

  jala_intro: {
    speaker: 'Brother Jala',
    speakerRole: 'Patient River Fisherman',
    text: 'Shh... gentle steps, my friend. Look at the ripples of this clear river... still water reflects the blue sky with sheer perfection.',
    thoughtBubble: 'Patience is not passive waiting; it is maintaining a peaceful heart throughout the journey.',
    choices: [
      {
        id: 'c_jala_patience',
        text: 'Have any fish taken your bait yet, Brother Jala?',
      },
      {
        id: 'c_jala_bored',
        text: 'Don\'t you get bored sitting for hours by the riverbank?',
      },
    ],
  },
  jala_bored_reply: {
    speaker: 'Brother Jala',
    speakerRole: 'Patient River Fisherman',
    text: 'Haha! Those who only fixate on instant results get bored quickly. But those who savor the breeze, the water splash, and their gentle breaths find a lavish inner calm.',
  },
  jala_lesson: {
    speaker: 'Brother Jala',
    speakerRole: 'Patient River Fisherman',
    text: 'In child development, the ability to delay instant gratification for a greater outcome is known as "Delayed Gratification". Let us test your patience:',
  },
  jala_question: {
    speaker: 'Brother Jala',
    speakerRole: 'Patient River Fisherman',
    text: 'When you are learning a new skill (like an instrument, drawing, or math) and aren\'t immediately great at it, what is the wisest attitude?',
    choices: [
      {
        id: 'c_jala_quit',
        text: 'Slam your book or pencil down in frustration because you didn\'t master it in the first five minutes.',
      },
      {
        id: 'c_jala_persist',
        text: 'Breathe steadily, practice a little every day, and trust that every drop of effort will bear beautiful fruit.',
      },
    ],
  },
  jala_wrong: {
    speaker: 'Brother Jala',
    speakerRole: 'Patient River Fisherman',
    text: 'If you yank the line before the fish takes the bait, your line tangles and the fish swims away. Learning is just the same! Take a silent breath and choose anew.',
  },
  jala_reward: {
    speaker: 'Brother Jala',
    speakerRole: 'Patient River Fisherman',
    text: 'Your hook of patience is sharp and true! You have achieved deep inner calm. Wear this "Angler of Pure Patience" badge with pride!',
  },
  jala_resolved: {
    speaker: 'Brother Jala',
    speakerRole: 'Patient River Fisherman',
    text: 'Listen to the river\'s gentle murmur, friend... water carves through hard stone not by violence, but through persistent perseverance.',
  },

  kotek_intro: {
    speaker: 'Prof. Kotek',
    speakerRole: 'Emotion Researcher Rooster',
    text: 'Cluck-cluck! My scientific research proves that genuine laughter releases wonderful endorphins that instantly calm the fight-or-flight alarm in your brain!',
  },
  kotek_funny: {
    speaker: 'Prof. Kotek',
    speakerRole: 'Emotion Researcher Rooster',
    text: "Hold on, don't be fooled! These glasses have empathy-focus lenses! Because you smiled looking at me, you just released Oxytocin and Endorphins that relax your body!",
  },
  kotek_fact: {
    speaker: 'Prof. Kotek',
    speakerRole: 'Emotion Researcher Rooster',
    text: "SEL Science Fact: When humans feel angry or panicked, the Amygdala fires up like a fire alarm. One hug or wholesome laughter can turn off that alarm instantly! Take this 'Cheerful Egg Badge'!",
    thoughtBubble: 'Laughter and wholesome humor are the greatest shield against cortisol stress hormones!',
  },
  kotek_reward: {
    speaker: 'Prof. Kotek',
    speakerRole: 'Emotion Researcher Rooster',
    text: 'COCK-A-DOODLE-DOO! Congratulations! You mastered the science of emotions and are officially awarded the honorary "Doctor of Humor & Endorphins" badge! Remember, a sincere smile is the finest amygdala soother!',
    thoughtBubble: 'My cheerfulness sensor detects a 100% surge in happiness hormones across the entire village!',
  },
  kotek_resolved: {
    speaker: 'Prof. Kotek',
    speakerRole: 'Emotion Researcher Rooster',
    text: 'COCK-A-DOODLE-DOO! My endorphin sensor detects 100% happiness levels across the entire village! Keep smiling and spreading joyful laughter!',
    thoughtBubble: 'My cheerful crow today is guaranteed to lower the stress hormones of anyone who hears it!',
  },
  prof_kotek_roaming: {
    speaker: 'Prof. Kotek',
    speakerRole: 'Emotion Researcher Rooster (Field Research)',
    text: 'CLUCK-COCK-A-DOODLE-DOO! Ezzel! See the galvanometer sensor in my monitor glasses? Villager happiness waves are fluctuating at the golden 528 Hz frequency today! I am patrolling the laughter resonance between Plaza and Gardens!',
  },
  kiki_roaming: {
    speaker: 'Kiki',
    speakerRole: 'Little Mail Squirrel (Delivering Village Letters)',
    text: 'Squeak... Hello Ezzel! My mail bag is overflowing with heartfelt appreciation letters between villagers! A thank-you card for Grandpa Ranu, a recipe note for Mrs. Sari, and a friendship poem for Bimo. Connecting villagers makes my paws fly so lightly!',
  },

  // --- CHATTING PAIRS IN VILLAGE ---
  chat_citra_moka_citra: {
    speaker: 'Sister Citra',
    speakerRole: 'Flower Garden Counselor (Chatting with Moka)',
    text: 'Oh, Ezzel! What lovely timing! Moka and I were just admiring how fresh the flower garden feels now that village emotional harmony has returned. Moka noticed that children are much more peaceful when expressing their hearts.',
    thoughtBubble: 'Listening alongside Moka feels like reading a book brimming with friendship.',
  },
  chat_citra_moka_moka: {
    speaker: 'Moka the Cat',
    speakerRole: 'Gentle Library Cat',
    text: 'Purrr... Meow... That is so true, Ezzel! When Sister Citra listens with deep empathy and I purr on their lap, all anxieties gently melt away. Full presence without judgment is the most soothing embrace.',
  },
  chat_ranu_bimo_ranu: {
    speaker: 'Grandpa Ranu',
    speakerRole: 'Village Carpenter (Chatting with Bimo)',
    text: 'Ha! Look who is here! Ezzel! Clever boy Bimo is showing me a new gear blueprint for the bridge. I am so thankful our misunderstanding was cleared. Now I always remind myself to breathe deeply instead of snapping when weary!',
    thoughtBubble: 'Mentoring young ones like Bimo makes my heart warm and valued once again.',
  },
  chat_ranu_bimo_bimo: {
    speaker: 'Bimo',
    speakerRole: 'Clockmaker Apprentice (Learning with Grandpa Ranu)',
    text: 'And I learned not to assume the worst when Grandpa Ranu speaks firmly! We listen to each other now, and this bridge gear turns so smoothly!',
    thoughtBubble: 'I am no longer afraid of making mistakes because Grandpa Ranu encourages me with patience!',
  },
  chat_teguh_sari_teguh: {
    speaker: 'Mr. Teguh',
    speakerRole: 'Wise Forest Woodcutter (Chatting with Mrs. Sari)',
    text: 'Welcome, Ezzel! Mrs. Sari just brought over a basket of freshly picked wild apples. We were sharing tips on tree care: trimming thorny overgrowth is just as vital as checking our anger before it hurts others.',
  },
  chat_teguh_sari_sari: {
    speaker: 'Mrs. Sari',
    speakerRole: 'Forest Orchard Farmer',
    text: 'And the dry firewood split by Mr. Teguh helps us bake apple pies for the whole village! Sharing nature\'s bounty and appreciating our neighbors\' hard work is our greatest joy here!',
  },
  chat_damai_jala_damai: {
    speaker: 'Grandpa Damai',
    speakerRole: 'Mindful Bonsai Master (Chatting with Brother Jala)',
    text: 'Silent and peaceful greetings, Ezzel... Brother Jala and I are enjoying the dancing river ripples beneath the willow tree. We realized fishing and meditation share the same essence: releasing haste and being fully present now.',
  },
  chat_damai_jala_jala: {
    speaker: 'Brother Jala',
    speakerRole: 'Patient River Fisherman',
    text: 'Very true, Ezzel. A fish cannot be forced to strike the bait, just as emotions cannot be forced away in an instant. We simply observe the float, breathe deeply, and trust the flow of time with patience.',
  },

  // --- LANDMARKS & EXAMINATIONS ---
  secret_tree: {
    speaker: 'Ancient Sacred Tree',
    speakerRole: 'Village Heritage',
    text: 'You inspect the hollow of the giant ancient tree. Inside rests a sealed time capsule with three golden words inscribed: "PLEASE, THANK YOU, and I AM SORRY—the three magic keys of friendship."',
  },
  secret_tree_capsule: {
    speaker: '1950 Time Capsule Message',
    speakerRole: 'Founders of the Valley Letter',
    text: '"O child of the future: Whenever the fog of misunderstanding blankets your village, remember the three magical keys: Please, Thank You, and I am Sorry. Listening is the greatest gift you can offer your fellow human beings."',
  },
  fountain_examine: {
    speaker: 'Plaza Fountain',
    speakerRole: 'Heart of the Village',
    text: 'Crystal-clear water dances in the sunlight, singing a cheerful melody that echoes through the cobblestone square.',
  },
  signpost_examine: {
    speaker: 'Crossroads Signpost',
    speakerRole: 'Trail Guide',
    text: '📍 Carved Wooden Signpost: [⬅️ West: Villager Houses & Kiki\'s Post] [⬆️ North: Silent Forest & Sacred Ancient Tree] [➡️ East: Wooden Bridge & Harmony Clock Tower] [⬇️ South: Central Plaza & Harmony Fountain].',
  },
  signpost_forest: {
    speaker: 'Forest Trail Signpost',
    speakerRole: 'Trail Guide',
    text: 'Pointing arrows: [West: Central Plaza] • [East: River & Wooden Bridge] • [Northwest: Silent Forest & Woodcutter Lodge] • [Northeast: Harmony Clock Tower].',
  },
  signpost_farm: {
    speaker: 'Farmland Signpost',
    speakerRole: 'Trail Guide',
    text: 'Pointing arrows: [Southwest: Farmer Joko\'s Hope Garden] • [Southeast: Mrs. Sari\'s Sweet Fruit Orchard & Grandpa Damai\'s Tea House].',
  },
  forest_cabin_examine: {
    speaker: "Mr. Teguh's Forest Lodge",
    speakerRole: 'Forest Landmark',
    text: 'A cozy log cabin made of aromatic cedar. Neatly stacked firewood sits beside the stone chimney, smelling of fresh mountain pine.',
    choices: [
      {
        id: 'c_cabin_philosophy',
        text: '🪵 Learn the Philosophy of Branch Trimming & Self-Regulation',
        impactScore: 5,
        resultDialogueId: 'forest_cabin_philosophy',
      },
      {
        id: 'c_cabin_leave',
        text: '👋 Say thank you and continue your exploration',
        impactScore: 2,
        resultDialogueId: 'forest_cabin_farewell',
      },
    ],
  },
  forest_cabin_farewell: {
    speaker: "Mr. Teguh's Forest Lodge",
    speakerRole: 'Forest Landmark',
    text: 'Fresh mountain pine air invigorates your chest. Your steps feel light and ready to continue the quest to restore harmony.',
  },
  forest_cabin_philosophy: {
    speaker: 'Mr. Teguh',
    speakerRole: 'Wise Forest Woodcutter',
    text: 'Mr. Teguh smiles warmly: "Every log in this stack came from dry branches whose time had come to be trimmed. Just like our emotions—if anger or resentment is hoarded, it weighs heavily on the soul. Learn to cut the cycle of anger with mindful breath, so your heart remains spacious and luminous!"',
  },
  tower_examine: {
    speaker: 'Harmony Clock Tower',
    speakerRole: 'Ancient Spire',
    text: 'A magnificent stone clocktower reaching toward the clouds. Its heavy iron-banded door is quiet, waiting for the Golden Gear to awaken its harmonious bells.',
    choices: [
      {
        id: 'c_tw_hist',
        text: '📜 Read Historical Inscription & Tower Philosophy',
        impactScore: 5,
        resultDialogueId: 'tower_examine_history',
      },
      {
        id: 'c_tw_mech',
        text: '⚙️ Inspect the 4 Clockwork Gears & SEL Learning Pillars',
        impactScore: 5,
        resultDialogueId: 'tower_examine_mechanics',
      },
      {
        id: 'c_tw_bell',
        text: '🔔 Listen to the Resonant Chime of the Ancient Bell',
        impactScore: 5,
        resultDialogueId: 'tower_examine_bell',
      },
      {
        id: 'c_tw_exit',
        text: '🚪 Finish Inspecting the Tower (Continue Adventure)',
        impactScore: 0,
        resultDialogueId: '',
      },
    ],
  },
  tower_examine_history: {
    speaker: 'Tower Founder Stone Tablet',
    speakerRole: 'Valley Historical Record (1785)',
    text: '📜 "Erected in 1785 by Ki Waskita and the early pioneers. Designed as an Inner Harmony Barometer. The pendulum symbolizes Emotional Equilibrium: anger and sorrow may swing the soul to the edge, but through mindful breath, we can always return to our tranquil center."',
  },
  tower_examine_mechanics: {
    speaker: 'Harmony Clockwork Mechanism',
    speakerRole: '4 Pillars of Social-Emotional Learning (SEL)',
    text: '⚙️ The clockwork room is driven by 4 Core Gears:\n1. 🌟 Plaza Gear: Self-Awareness (Recognizing emotions without self-judgment).\n2. 🤝 Bridge Gear: Empathy & Respect (Understanding how others feel).\n3. 🌱 Garden & Forest Gear: Emotion Regulation & Growth Mindset (Managing responses & learning from mistakes).\n4. 🕊️ Tower Pinnacle Gear: Reconciliation & Conflict Resolution (Listening with an open heart).',
  },
  tower_examine_bell: {
    speaker: 'Bronze Harmony Bell',
    speakerRole: 'The Power of Pause',
    text: '🔔 *CLAAANG...* The clear resonance of the bronze bell vibrates across the valley. Take a deep breath for 4 counts... hold for 2... exhale slowly for 6. Feel tension dissolve as peace fills your heart.',
  },
  tower_examine_restored: {
    speaker: 'Harmony Clock Tower (Restored!)',
    speakerRole: 'Ancient Spire of Light',
    text: 'The astronomical golden clock ticks rhythmically with warm light. Its resonant bells ring on every hour, reminding the villagers to cherish harmony and empathy.',
  },
  free_roam_waterfall: {
    speaker: 'Harmony River Waterfall',
    speakerRole: 'Natural Wonder',
    text: 'Sparkling freshwater cascades down mossy rocks, creating tiny rainbows in the mist. The sound brings an instant sense of calm and clarity.',
  },
  free_roam_windmill: {
    speaker: 'Harmony Windmill',
    speakerRole: 'Village Mill',
    text: 'The large wooden sails turn lazily in the pleasant breeze, grinding golden wheat for the bakery with steady, soothing rhythm.',
  },
  free_roam_cow: {
    speaker: 'Pasture Cow',
    speakerRole: 'Meadow Grazer',
    text: 'Moo-oo! The healthy pasture cow happily chews sweet clover in the warm sunshine, completely relaxed and content.',
  },
  free_roam_sheep: {
    speaker: 'Fluffy White Sheep',
    speakerRole: 'Pasture Friend',
    text: 'Baa-aa! The fluffy sheep huddles warmly with its flock, enjoying the lush green grass of the restored valley.',
  },
  free_roam_deer: {
    speaker: 'Forest Spotted Deer',
    speakerRole: 'Forest Wildlife',
    text: 'A gentle spotted deer peeks through the blueberry bushes. Sensing your peaceful heart, it wiggles its ears happily instead of fleeing.',
  },
  free_roam_rabbit: {
    speaker: 'Meadow Bunny',
    speakerRole: 'Plaza Mascot',
    text: 'Hop, hop! A fluffy bunny munches on a fresh orange carrot near the flowerbeds, twitching its nose in greeting.',
  },
  free_roam_lamb: {
    speaker: 'Little Lamb',
    speakerRole: 'Pasture Friend',
    text: 'Baaa! The little lamb playfully prances across the meadow, enjoying the freedom of a peaceful afternoon.',
  },
  free_roam_squirrel: {
    speaker: 'Forest Squirrel',
    speakerRole: 'Nut Collector',
    text: 'Squeak-squeak! The squirrel buries an acorn beside the fountain, preparing for the upcoming harvest festival.',
  },
  free_roam_river: {
    speaker: 'Clear River Stream',
    speakerRole: 'Scenic View',
    text: 'Silvery trout leap gracefully in the clear stream beneath the bridge, catching droplets of golden sunshine.',
  },
};

/**
 * Returns a localized dialogue node based on the selected language.
 * When lang is 'en', merges translated properties while preserving all logic triggers.
 */
export function getLocalizedDialogue(
  node: DialogueNode | null | undefined,
  lang: GameLanguage
): DialogueNode | null {
  if (!node) return null;
  if (lang === 'id') return node;

  const enOverride = GAME_DIALOGUES_EN[node.id];
  const translatedSpeaker = enOverride?.speaker || getLocalizedSpeaker(node.speaker, lang);
  const translatedRole = enOverride?.speakerRole || node.speakerRole;

  if (!enOverride) {
    return {
      ...node,
      speaker: translatedSpeaker,
      speakerRole: translatedRole,
    };
  }

  const mergedChoices = node.choices?.map((originalChoice, idx) => {
    const enChoice = enOverride.choices?.[idx] || enOverride.choices?.find((c) => c.id === originalChoice.id);
    return {
      ...originalChoice,
      text: enChoice?.text || originalChoice.text,
    };
  });

  return {
    ...node,
    speaker: translatedSpeaker,
    speakerRole: translatedRole,
    text: enOverride.text || node.text,
    thoughtBubble: enOverride.thoughtBubble !== undefined ? enOverride.thoughtBubble : node.thoughtBubble,
    choices: mergedChoices || node.choices,
  };
}

export function getLocalizedQuests(quests: GameQuest[], lang: GameLanguage): GameQuest[] {
  if (lang === 'id') return quests;

  const enQuestMap: Record<string, Partial<GameQuest>> = {
    quest_start: {
      title: 'Mission 1: Use the Heart Resonance Compass',
      description: 'Step 1: The ground rumbles and colors fade! Approach Kiki the squirrel west of the Plaza Fountain and activate your Heart Compass.',
      stepHint: 'Approach Kiki west of the fountain then activate the Resonance Compass [C / Heart Button].',
    },
    quest_bridge: {
      title: 'Mission 2: Mystery of the Locked Bridge',
      description: 'Step 2: Grandpa Ranu has locked the wooden bridge to the east. Discover the reason beneath his anger with your Compass and respond empathetically.',
      stepHint: 'Head east toward the Wooden Bridge. Use Emotion Resonance to help Grandpa Ranu.',
    },
    quest_bimo: {
      title: 'Mission 3: Gear Trail in the Silent Forest',
      description: 'Step 3: Bimo is hiding in the northwest forest. Help him overcome guilt and shame so he returns the sacred clock gear.',
      stepHint: 'Cross the bridge to the Silent Forest in the northwest. Meet Bimo behind the lush trees.',
    },
    quest_tower: {
      title: 'Mission 4: Gather 12 Clock Pieces & Light Up Tower',
      description: 'Step 4: Collect all 12 Clock Pieces from the villagers across the village. Bring all 12 pieces to Grandma Wilis at the summit of the Clock Tower to assemble and light up the tower!',
      stepHint: 'Collect all 12 clock components from the villagers, then meet Grandma Wilis at the Clock Tower to assemble and light it up!',
    },
  };

  return quests.map((q) => {
    const en = enQuestMap[q.id];
    if (!en) return q;
    // If quest title or description already has localized dynamic progress, keep it
    const hasDynamicTitle = q.title.includes('/12');
    return {
      ...q,
      title: hasDynamicTitle ? q.title : (en.title || q.title),
      description: hasDynamicTitle ? q.description : (en.description || q.description),
      stepHint: hasDynamicTitle ? q.stepHint : (en.stepHint || q.stepHint),
    };
  });
}

export function getLocalizedAchievements(
  achievements: PSEAchievement[],
  lang: GameLanguage
): PSEAchievement[] {
  if (lang === 'id') return achievements;

  const enAchMap: Record<string, Partial<PSEAchievement>> = {
    badge_counselor_zones: {
      title: 'Master of 4 Emotion Zones',
      mentor: 'Sister Citra (Peer Counselor)',
      concept: 'Green, Yellow, Red, & Blue Zones',
      description: 'Understand that all emotions are human, and master healthy strategies to return to the Green Zone when overwhelmed.',
    },
    badge_circle_of_control: {
      title: 'Ruler of the Circle of Control',
      mentor: 'Grandpa Damai (Mindful Elder)',
      concept: 'Circle of Control vs Concern',
      description: 'Distinguish between what is within your control (reactions & effort) vs outside control (other people\'s moods).',
    },
    badge_active_listening: {
      title: 'True Empathic Listener',
      mentor: 'Moka the Library Cat',
      concept: 'Reflective Listening & Validation',
      description: 'Learn to listen with your whole heart without interrupting or judging a friend\'s story.',
    },
    badge_laughter_medicine: {
      title: 'Doctor of Humor & Endorphins',
      mentor: 'Prof. Kotek (Scholar Rooster)',
      concept: 'Stress Hormone Relief via Laughter',
      description: 'Discover Professor Kotek\'s secret that wholesome humor is the fastest soothe for an overactive amygdala.',
    },
    badge_sacred_tree: {
      title: 'Heir of the Ancient Tree',
      mentor: 'Ancient Sacred Tree',
      concept: 'Three Magic Relationship Keys',
      description: 'Discover the friendship time capsule and embrace the healing power of please, thank you, and I am sorry.',
    },
    badge_growth_mindset: {
      title: 'Growth Mindset Scholar',
      mentor: 'Farmer Joko (Hope Farmer)',
      concept: 'Growth Mindset & Gradual Progress',
      description: 'Realize that patience, hard work, and learning from mistakes are the keys to unlocking potential.',
    },
    badge_friendly_greeter: {
      title: 'Village Ambassador of Warmth',
      mentor: 'Didi (Little Village Scout)',
      concept: 'Relationship Skills & Warm Smiles',
      description: 'Understand the power of a warm greeting and sincere smile to break down barriers of social awkwardness.',
    },
    badge_woodcutter_anger: {
      title: 'Wise Anger Regulator',
      mentor: 'Mr. Teguh (Forest Woodcutter)',
      concept: 'Self-Management & Anger Time-out',
      description: 'Master taking a mindful time-out to calm the amygdala before anger burns the trees of friendship.',
    },
    badge_fruit_gratitude: {
      title: 'Harvester of Gratitude & Giving',
      mentor: 'Mrs. Sari (Orchard Farmer)',
      concept: 'Gratitude & Social-Awareness',
      description: 'Practice counting daily blessings and multiplying joy by sharing genuine care with neighbors.',
    },
    badge_fisherman_patience: {
      title: 'Angler of Pure Patience',
      mentor: 'Brother Jala (Patient Fisherman)',
      concept: 'Mindfulness & Delayed Gratification',
      description: 'Cultivate inner stillness, avoid impulsive haste, and embrace gradual steps toward beautiful results.',
    },
  };

  return achievements.map((a) => {
    const en = enAchMap[a.id];
    if (!en) return a;
    return {
      ...a,
      title: en.title || a.title,
      mentor: en.mentor || a.mentor,
      concept: en.concept || a.concept,
      description: en.description || a.description,
    };
  });
}

export function getLocalizedMissionStepData(
  step: number,
  lang: GameLanguage,
  isCompassActive: boolean,
  isCompleted?: boolean,
  isFreeRoam?: boolean,
  clockCount: number = 0,
  nextMissingNpcName?: string,
  nextMissingCoords?: { x: number; y: number },
  nextMissingSprite?: string
) {
  const ui = UI_TEXT[lang];
  if (isCompleted || isFreeRoam) {
    return {
      step: 5,
      total: 4,
      badge: ui.missionCompletedBadge,
      title: ui.mission5Title,
      speaker: lang === 'en' ? 'Ezzel & Villagers' : 'Ezzel & Warga Desa',
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
        speaker: lang === 'en' ? 'Kiki the Squirrel' : 'Kiki Si Tupai',
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
        speaker: lang === 'en' ? 'Grandpa Ranu' : 'Kakek Ranu',
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
        ? (lang === 'en'
            ? '🌟 All 12 Clock Pieces Collected (12/12)! Meet Grandma Wilis at the Clock Tower to assemble and light up the Harmony Clock Tower!'
            : '🌟 Seluruh 12 Komponen Jam Lengkap (12/12)! Segera temui Nenek Wilis di Menara Jam untuk merakit dan menyalakan kembali Menara Jam Harmoni!')
        : (nextMissingNpcName
            ? (lang === 'en'
                ? `Collect all 12 Clock Pieces (${clockCount}/12 collected, ${12 - clockCount} remaining). Meet ${nextMissingNpcName} to receive the next clock piece!`
                : `Kumpulkan seluruh 12 Komponen Jam (${clockCount}/12 terkumpul, tersisa ${12 - clockCount} komponen lagi). Temui ${nextMissingNpcName} untuk mendapatkan komponen jam berikutnya!`)
            : (lang === 'en'
                ? `Collect all 12 Clock Pieces (${clockCount}/12). Speak with villagers across the village!`
                : `Kumpulkan seluruh 12 Komponen Jam (${clockCount}/12). Temui para warga desa!`));

      const title = isComplete12
        ? (lang === 'en' ? 'Mission 4: Light Up Harmony Clock Tower (12/12)' : 'Misi 4: Nyalakan Menara Jam Harmoni (12/12)')
        : (lang === 'en' ? `Mission 4: Collect 12 Clock Pieces (${clockCount}/12)` : `Misi 4: Kumpulkan 12 Komponen Jam (${clockCount}/12)`);

      const speaker = isComplete12
        ? (lang === 'en' ? 'Grandma Wilis' : 'Nenek Wilis')
        : (nextMissingNpcName || (lang === 'en' ? 'Village Friends' : 'Warga Desa'));

      const portrait = isComplete12 ? 'grandmother' : (nextMissingSprite || 'girl_counselor');

      const locationName = isComplete12
        ? ui.locationTower
        : (nextMissingNpcName
            ? (lang === 'en' ? `${nextMissingNpcName} (${clockCount}/12 Pieces)` : `${nextMissingNpcName} (${clockCount}/12 Komponen)`)
            : (lang === 'en' ? 'Village Pockets' : 'Sudut-Sudut Desa'));

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
        speaker: lang === 'en' ? 'Ezzel & Villagers' : 'Ezzel & Warga Desa',
        portrait: 'player',
        hint: ui.mission5Hint,
        locationName: ui.locationVillage,
        targetCoords: { x: 11, y: 15 },
        isCompleted: true,
      };
  }
}

export function getLocalizedItems(items: Item[], lang: GameLanguage): Item[] {
  if (lang === 'id') return items;
  const enItemMap: Record<string, Partial<Item>> = {
    item_letter: {
      name: 'Clock Mainspring & Peace Letter',
      description: 'The spiral mainspring balancing the Clock Tower heartbeat, safeguarded by Kiki alongside letters of apology.',
      foundLocation: 'Village Plaza (Kiki)',
    },
    item_secret_key: {
      name: 'Clock Drive Axle & Lever Key',
      description: 'The locking drive axle of the Clock Tower kept by Grandpa Ranu when he felt unappreciated.',
      foundLocation: 'River Wooden Bridge (Grandpa Ranu)',
    },
    item_bridge_pass: {
      name: 'Clock Drive Shaft & Bridge Agreement',
      description: 'Clock drive shaft component and Grandpa Ranu\'s agreement supporting Bimo\'s emotional courage.',
      foundLocation: 'River Wooden Bridge (Grandpa Ranu)',
    },
    item_gold_gear: {
      name: 'Golden Master Gear of the Clock',
      description: 'The primary golden gear powering the Clock Tower, embraced and protected by Bimo in the Silent Forest.',
      foundLocation: 'Silent Forest (Bimo)',
    },
    item_clock_crystal: {
      name: 'Core Crystal & Golden Clock Hands',
      description: 'The radiant crown jewel and golden hands of the Clock Tower that unify all clockwork mechanisms.',
      foundLocation: 'Clock Tower Summit (Elder Wilis)',
    },
    item_clock_lens: {
      name: 'Reflection Prism Lens of the Clock',
      description: 'The prism casting the 4 Color Zones of the Clock Tower. Given by Kak Citra after mastering the 4 Zones of Regulation.',
      foundLocation: 'Flower Garden (Kak Citra)',
    },
    item_clock_pendulum: {
      name: 'Equilibrium Pendulum of the Clock',
      description: 'The rhythmic pendulum regulating the serene beat of the Clock. Given by Grandpa Damai after mastering the Circle of Control.',
      foundLocation: 'Mindful Riverbank (Grandpa Damai)',
    },
    item_clock_chime: {
      name: 'Resonance Chime Bell of the Clock',
      description: 'The bronze chime bell that rings pure harmony. Given by Moka the Cat after demonstrating Active Listening.',
      foundLocation: 'Village Library (Moka the Cat)',
    },
    item_egg_badge: {
      name: 'Laughter Spring & Cheer Badge',
      description: 'The comedic trigger spring of the clock and science badge from Prof. Kotek. Relieves stress hormones through healthy laughter!',
      foundLocation: 'Village Coop (Prof. Kotek)',
    },
    item_clock_oil: {
      name: 'Natural Lubricant Oil of the Clock',
      description: 'Pure oil ensuring gears spin smoothly without friction. Given by Farmer Joko after embracing a Growth Mindset.',
      foundLocation: 'Hope Vegetable Garden (Farmer Joko)',
    },
    item_clock_pointer: {
      name: 'Minute Hand Indicator of the Clock',
      description: 'The minute hand indicating the flow of harmony. Given by Didi the Wanderer after mastering the power of warm greetings.',
      foundLocation: 'Village Trail (Didi the Scout)',
    },
    item_clock_casing: {
      name: 'Protective Cedar Casing of the Clock',
      description: 'Sturdy hand-carved cedar casing shielding the clockwork from storms. Given by Woodcutter Teguh after mastering mindful pauses.',
      foundLocation: 'Forest Edge (Woodcutter Teguh)',
    },
    item_clock_screws: {
      name: 'Golden Precision Screws of the Clock',
      description: 'Precision screws fastening all clock components firmly. Given by Ibu Sari after learning gratitude and generous sharing.',
      foundLocation: 'Forest Orchard (Ibu Sari)',
    },
    item_clock_cord: {
      name: 'Counterweight Pulley Cord of the Clock',
      description: 'Durable fiber cord balancing gravitational weight in the clock. Given by Bung Jala after learning patient mindfulness.',
      foundLocation: 'River Dock (Bung Jala)',
    },
    item_friendship_capsule: {
      name: '1950 Friendship Time Capsule',
      description: 'A wise message from the village founders celebrating empathy and kindness.',
      foundLocation: 'Ancient Friendship Tree',
    },
  };
  return items.map((it) => {
    const en = enItemMap[it.id];
    if (!en) return it;
    return {
      ...it,
      name: en.name || it.name,
      description: en.description || it.description,
      foundLocation: en.foundLocation || it.foundLocation,
    };
  });
}

