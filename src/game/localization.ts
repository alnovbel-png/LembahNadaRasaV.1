import { DialogueNode, GameQuest, PSEAchievement, Item } from '../types/game';

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

    // Settings Modal
    settingsTitle: 'Pusat Opsi & Panduan',
    tabQuest: 'Misi & Peta',
    tabAchievements: 'Lencana PSE',
    tabAudio: 'Pengaturan Audio',
    tabControls: 'Panduan Kontrol',
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

    // Settings Modal
    settingsTitle: 'Options & Guides Hub',
    tabQuest: 'Quests & Map',
    tabAchievements: 'SEL Badges',
    tabAudio: 'Audio Settings',
    tabControls: 'Controls Guide',
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

    // Notifications
    devModeActive: '🚀 DEVELOPER MODE ACTIVE: Free Roam Mode Unlocked! 100% Main Quests & 100% Achievements Unlocked.',
  },
};

export const GAME_DIALOGUES_EN: Record<string, Partial<DialogueNode>> = {
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
  kiki_after_breathing: {
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

  // --- CLOCK TOWER & ENDINGS ---
  tower_intro: {
    speaker: 'Spirit Elder',
    speakerRole: 'Keeper of the Clock Tower',
    text: 'Welcome, young bearer of the Heart Compass! The final mist lingers here at the top of the world. Who do you hold responsible for the grey fog that descended upon our valley?',
    thoughtBubble: 'Will they blame one person, or recognize that misunderstandings were shared?',
    choices: [
      {
        id: 'tower_c1',
        text: 'No single person is to blame. Fear, loneliness, and shame locked our hearts, but empathy and listening brought our colors back!',
        impactScore: 25,
        resultDialogueId: 'tower_empathy',
      },
      {
        id: 'tower_c2',
        text: 'It was all Bimo\'s fault for dropping the gear and Kakek Ranu\'s fault for being grumpy!',
        impactScore: -10,
        resultDialogueId: 'tower_accuse',
      },
    ],
  },
  tower_accuse: {
    speaker: 'Spirit Elder',
    speakerRole: 'Keeper of the Clock Tower',
    text: 'Pointing fingers only deepens the fog of resentment, child. Look deeper into the hearts of your neighbors and try again.',
  },
  tower_empathy: {
    speaker: 'Spirit Elder',
    speakerRole: 'Keeper of the Clock Tower',
    text: 'Wisdom shines brightly from your spirit! Place the Golden Gear into the heart of the tower and pull the golden cord to ring the chimes of harmony!',
  },
  tower_ring_bell: {
    speaker: 'Valley of Harmony',
    speakerRole: 'Triumphant Chimes',
    text: 'DIIING... DOOONG... The golden bell chimes across the skies! A warm wave of sunlight bursts forth, banishing the last trace of grey fog. Every flower, brook, and rooftop sparkles with glorious colors!',
  },
  ending_summary_perfect: {
    speaker: 'Grandma Wilis',
    speakerRole: 'Village Librarian & Elder',
    text: 'Splendid work, Ezzel! You guided every soul with patience, kindness, and deep empathy. The Valley of Harmony has never shone more brightly!',
  },
  ending_summary_resilient: {
    speaker: 'Grandma Wilis',
    speakerRole: 'Village Librarian & Elder',
    text: 'You persevered through doubts and mistakes, Ezzel! Learning from missteps is the true heart of resilience. Our valley celebrates your courage!',
  },
  tower_resolved: {
    speaker: 'Spirit Elder',
    speakerRole: 'Keeper of the Clock Tower',
    text: 'May the chimes of the Clock Tower always remind us that empathy, gentle breath, and honest listening can heal any misunderstanding.',
  },

  // --- EDUCATOR NPCS ---
  citra_intro: {
    speaker: 'Sister Citra',
    speakerRole: 'Flower Garden Counselor',
    text: 'Welcome to the Flower Garden! Did you know that our feelings can be grouped into 4 colorful zones? Green (calm & focused), Yellow (worried or excited), Red (intense anger or panic), and Blue (tired or sad). All zones are completely normal!',
  },
  damai_intro: {
    speaker: 'Grandpa Damai',
    speakerRole: 'Mindful Bonsai Master',
    text: 'Breathe in peace, breathe out worry... In life, there are things within our Circle of Control (our words, efforts, and reactions) and things outside our control (the weather or other people\'s moods). Focus your energy on what you can control!',
  },
  moka_intro: {
    speaker: 'Moka the Cat',
    speakerRole: 'Gentle Library Cat',
    text: 'Meow! True listening is done not just with ears, but with an open heart. Put down distractions, make gentle eye contact, and validate how your friend feels before offering advice.',
  },
  joko_intro: {
    speaker: 'Farmer Joko',
    speakerRole: 'Garden of Hope Farmer',
    text: 'Seeds do not sprout overnight, young adventurer! Patience and a Growth Mindset mean knowing that abilities can be nurtured through practice, curiosity, and learning from mistakes.',
  },
  teguh_intro: {
    speaker: 'Mr. Teguh',
    speakerRole: 'Wise Forest Woodcutter',
    text: 'When anger surges like a blazing fire, do not throw wood onto it! Take a deliberate pause, step back, and cool down your amygdala before speaking words you cannot take back.',
  },
  sari_intro: {
    speaker: 'Mrs. Sari',
    speakerRole: 'Orchard Farmer',
    text: 'Look at these sweet apples! Sharing our blessings and pausing to count three things we are grateful for every morning doubles our daily joy and spreads warmth to everyone.',
  },
  jala_intro: {
    speaker: 'Brother Jala',
    speakerRole: 'Patient River Fisherman',
    text: 'The river flows at its own pace. Fishing taught me that rushing brings frustration, while quiet patience and deep breaths reward us with true peace of mind.',
  },
  kotek_intro: {
    speaker: 'Prof. Kotek',
    speakerRole: 'Emotion Researcher Rooster',
    text: 'Cluck-cluck! My scientific research proves that genuine laughter releases wonderful endorphins that instantly calm the fight-or-flight alarm in your brain!',
  },
  didi_intro: {
    speaker: 'Didi',
    speakerRole: 'Little Village Scout',
    text: 'A cheerful smile and a warm greeting are the fastest bridges between two hearts! Never underestimate the power of saying a kind "Good morning!" to someone.',
  },

  // Landmark examinations
  secret_tree: {
    speaker: 'Ancient Sacred Tree',
    speakerRole: 'Village Heritage',
    text: 'You inspect the hollow of the giant ancient tree. Inside rests a sealed time capsule with three golden words inscribed: "PLEASE, THANK YOU, and I AM SORRY—the three magic keys of friendship."',
  },
  fountain_examine: {
    speaker: 'Plaza Fountain',
    speakerRole: 'Heart of the Village',
    text: 'Crystal-clear water dances in the sunlight, singing a cheerful melody that echoes through the cobblestone square.',
  },
  signpost_forest: {
    speaker: 'Crossroads Signpost',
    speakerRole: 'Trail Guide',
    text: 'Pointing arrows: [West: Central Plaza] • [East: River & Wooden Bridge] • [Northwest: Silent Forest & Woodcutter Lodge] • [Northeast: Harmony Clock Tower].',
  },
  signpost_farm: {
    speaker: 'Orchard Signpost',
    speakerRole: 'Trail Guide',
    text: 'Pointing arrows: [Southwest: Farmer Joko\'s Hope Garden] • [Southeast: Mrs. Sari\'s Sweet Fruit Orchard & Grandpa Damai\'s Tea House].',
  },
  forest_cabin_examine: {
    speaker: "Woodcutter's Lodge",
    speakerRole: 'Forest Landmark',
    text: 'A cozy log cabin made of aromatic cedar. Neatly stacked firewood sits beside the stone chimney, smelling of fresh mountain pine.',
  },
  tower_examine: {
    speaker: 'Harmony Clock Tower',
    speakerRole: 'Ancient Spire',
    text: 'A magnificent stone clocktower reaching toward the clouds. Its heavy iron-banded door is quiet, waiting for the Golden Gear to awaken its harmonious bells.',
  },
  tower_examine_restored: {
    speaker: 'Harmony Clock Tower',
    speakerRole: 'Ancient Spire',
    text: 'The astronomical golden clock ticks rhythmically with warm light. Its resonant bells ring on every hour, reminding the villagers to cherish harmony and empathy.',
  },
  free_roam_waterfall: {
    speaker: 'Harmony River Waterfall',
    speakerRole: 'Natural Wonder',
    text: 'Sparkling freshwater cascades down mossy rocks, creating tiny rainbows in the mist. The sound brings an instant sense of calm and clarity.',
  },
  free_roam_windmill: {
    speaker: 'Meadow Windmill',
    speakerRole: 'Village Mill',
    text: 'The large wooden sails turn lazily in the pleasant breeze, grinding golden wheat for the bakery with steady, soothing rhythm.',
  },
  free_roam_cow: {
    speaker: 'Daisy the Cow',
    speakerRole: 'Meadow Grazer',
    text: 'Moo-oo! Daisy is happily chewing fresh clover in the warm sunshine, completely relaxed and content.',
  },
  free_roam_sheep: {
    speaker: 'Fluffy Sheep',
    speakerRole: 'Pasture Friend',
    text: 'Baa-aa! The sheep huddles warmly with its flock, enjoying the lush green grass of the restored valley.',
  },
  free_roam_deer: {
    speaker: 'Spotted Fawn',
    speakerRole: 'Forest Wildlife',
    text: 'A gentle fawn peeks through the blueberry bushes. Sensing your peaceful heart, it wiggles its ears happily instead of fleeing.',
  },
  free_roam_rabbit: {
    speaker: 'Hop the Bunny',
    speakerRole: 'Plaza Mascot',
    text: 'Hop, hop! A fluffy bunny munches on a fresh orange carrot near the flowerbeds, twitching its nose in greeting.',
  },
  free_roam_lamb: {
    speaker: 'Little Lamb',
    speakerRole: 'Pasture Friend',
    text: 'Baaa! The little lamb playfully prances across the meadow, enjoying the freedom of a peaceful afternoon.',
  },
  free_roam_squirrel: {
    speaker: 'Plaza Squirrel',
    speakerRole: 'Nut Collector',
    text: 'Squeak-squeak! The squirrel buries an acorn beside the fountain, preparing for the upcoming harvest festival.',
  },
  free_roam_river: {
    speaker: 'Harmony Riverbed',
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
  if (!enOverride) return node;

  const mergedChoices = node.choices?.map((originalChoice, idx) => {
    const enChoice = enOverride.choices?.[idx] || enOverride.choices?.find((c) => c.id === originalChoice.id);
    return {
      ...originalChoice,
      text: enChoice?.text || originalChoice.text,
    };
  });

  return {
    ...node,
    speaker: enOverride.speaker || node.speaker,
    speakerRole: enOverride.speakerRole || node.speakerRole,
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
      title: 'Mission 4: Unlocking the Clock Tower',
      description: 'Step 4 (Final Mission): Bring the Golden Gear of Harmony to the top of the Clock Tower in the northeast and restore the valley!',
      stepHint: 'Head to the summit of the Clock Tower in the northeast to reunite the village in harmony.',
    },
  };

  return quests.map((q) => {
    const en = enQuestMap[q.id];
    if (!en) return q;
    return {
      ...q,
      title: en.title || q.title,
      description: en.description || q.description,
      stepHint: en.stepHint || q.stepHint,
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
