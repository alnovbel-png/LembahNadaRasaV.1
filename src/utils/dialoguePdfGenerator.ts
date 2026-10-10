import { jsPDF } from 'jspdf';
import { GAME_DIALOGUES } from '../game/dialogueData';
import { INITIAL_NPCS } from '../game/constants';
import { VILLAGER_GUIDE_DATA } from '../game/villagerGuideData';
import { DialogueNode, ChoiceOption } from '../types/game';

/**
 * PDF Document Generator for Lembah Nada Rasa Game Transcript
 * Generates an official, comprehensive PDF containing:
 * 1. Prologue & Story Introduction
 * 2. All 13 NPC full dialogue trees, thought bubbles, choices, emotional feedback, and resolved dialogue
 * 3. Environmental props & interactive landmarks (Fountain, Clock Tower, Signs, Cabin, etc.)
 * 4. Living fauna & creature interactions (Cow, Sheep, Deer, Rabbits, Fish, etc.)
 * 5. Living village conversations between villagers in Free Roam mode
 * 6. Ending scenes & CASEL SEL moral reflection summaries
 */
export async function generateGameTranscriptPdf(playerName: string = 'Ezzel'): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 15;
  const marginRight = 15;
  const contentWidth = 180;
  const marginBottom = 18;
  let currentY = 22;

  // Helper: check page break
  function ensureSpace(neededHeight: number) {
    if (currentY + neededHeight > pageHeight - marginBottom) {
      doc.addPage();
      currentY = 22;
    }
  }

  // Helper: write text with word wrapping
  function writeWrapped(
    text: string,
    x: number,
    maxWidth: number,
    fontSize: number,
    style: 'normal' | 'bold' | 'italic' = 'normal',
    color: [number, number, number] = [30, 41, 59],
    lineHeight: number = 4.2
  ) {
    doc.setFont('helvetica', style);
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, maxWidth);
    const blockHeight = lines.length * lineHeight;
    ensureSpace(blockHeight + 1);
    doc.text(lines, x, currentY);
    currentY += blockHeight;
  }

  // Helper: Draw Section Category Banner
  function drawSectionBanner(title: string, subtitle?: string, colorBg: [number, number, number] = [180, 83, 9]) {
    ensureSpace(18);
    doc.setFillColor(colorBg[0], colorBg[1], colorBg[2]);
    doc.roundedRect(marginLeft, currentY, contentWidth, 12, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(title, marginLeft + 4, currentY + 7.5);
    currentY += 15;

    if (subtitle) {
      writeWrapped(subtitle, marginLeft, contentWidth, 8.5, 'italic', [100, 116, 139], 3.8);
      currentY += 2;
    }
  }

  // Helper: Draw Subsection Header
  function drawSubsectionHeader(title: string, badge?: string) {
    ensureSpace(10);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(marginLeft, currentY, contentWidth, 7, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(title, marginLeft + 3, currentY + 5);

    if (badge) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(180, 83, 9);
      doc.text(badge, pageWidth - marginRight - 3, currentY + 5, { align: 'right' });
    }
    currentY += 9;
  }

  // Helper: Render a single Dialogue Node
  function renderDialogueCard(node: DialogueNode, customLabel?: string) {
    const cardPadding = 3;
    const innerWidth = contentWidth - 6;

    // Estimate height
    const textLines = doc.splitTextToSize(`"${node.text}"`, innerWidth);
    let estHeight = 8 + textLines.length * 4;
    if (node.thoughtBubble) {
      const tbLines = doc.splitTextToSize(`Isi Hati: "${node.thoughtBubble}"`, innerWidth);
      estHeight += tbLines.length * 3.8 + 3;
    }
    if (node.choices && node.choices.length > 0) {
      node.choices.forEach((c) => {
        const cLines = doc.splitTextToSize(`Pilihan: "${c.text}"`, innerWidth - 6);
        estHeight += cLines.length * 3.8 + 6;
      });
    }
    if (node.isWrongFeedback) estHeight += 5;
    if (node.givesItem || node.unlocksBadge) estHeight += 5;

    ensureSpace(Math.min(estHeight + 4, 60));

    // Outer card container
    const isSpecial = node.isWrongFeedback;
    doc.setFillColor(isSpecial ? 254 : 248, isSpecial ? 242 : 250, isSpecial ? 242 : 252);
    doc.setDrawColor(isSpecial ? 248 : 226, isSpecial ? 113 : 232, isSpecial ? 113 : 240);
    doc.setLineWidth(0.3);

    // Header line inside card
    const speakerTitle = `${node.speaker} [${node.speakerRole}]`;
    const tagInfo = customLabel ? ` (${customLabel})` : '';
    const auraInfo = node.emotionAura ? ` | Aura: ${node.emotionAura.toUpperCase()}` : '';

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(isSpecial ? 185 : 30, isSpecial ? 28 : 58, isSpecial ? 28 : 138);
    doc.text(`${speakerTitle}${tagInfo}${auraInfo}`, marginLeft + cardPadding, currentY + 4.5);
    currentY += 6.5;

    // Thought bubble if available
    if (node.thoughtBubble) {
      doc.setFillColor(254, 249, 195);
      doc.roundedRect(marginLeft + cardPadding, currentY, innerWidth, 5.5, 1, 1, 'F');
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(133, 77, 14);
      doc.text(`[Isi Hati/Batin]: "${node.thoughtBubble}"`, marginLeft + cardPadding + 2, currentY + 3.8);
      currentY += 7;
    }

    // Main spoken text
    writeWrapped(`"${node.text}"`, marginLeft + cardPadding, innerWidth, 8, 'normal', [15, 23, 42], 3.8);

    // Wrong feedback note
    if (node.isWrongFeedback) {
      writeWrapped(
        `Catatan Respon: Respon ini belum tepat / belum memvalidasi emosi. NPC meminta pemain mengulang respon dengan lebih bijak.`,
        marginLeft + cardPadding,
        innerWidth,
        7.5,
        'bold',
        [190, 18, 60],
        3.5
      );
    }

    // Choices list
    if (node.choices && node.choices.length > 0) {
      currentY += 1.5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Pilihan Respon Pemain (${node.choices.length} Opsi):`, marginLeft + cardPadding, currentY + 2.5);
      currentY += 4;

      node.choices.forEach((c: ChoiceOption, idx: number) => {
        const scoreLabel = c.impactScore >= 0 ? `+${c.impactScore}` : `${c.impactScore}`;
        const scoreColor = c.impactScore >= 15 ? '[Sangat Empatik]' : c.impactScore > 0 ? '[Cukup Baik]' : '[Kurang Peka]';

        doc.setFillColor(241, 245, 249);
        doc.roundedRect(marginLeft + cardPadding + 2, currentY, innerWidth - 4, 6, 1, 1, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(30, 41, 59);
        doc.text(`Opsi ${String.fromCharCode(65 + idx)}:`, marginLeft + cardPadding + 4, currentY + 4);

        const choiceLines = doc.splitTextToSize(c.text, innerWidth - 28);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(choiceLines[0] || c.text, marginLeft + cardPadding + 16, currentY + 4);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(c.impactScore >= 0 ? 16 : 225, c.impactScore >= 0 ? 120 : 29, c.impactScore >= 0 ? 80 : 72);
        doc.text(`${scoreLabel} Poin ${scoreColor}`, pageWidth - marginRight - cardPadding - 3, currentY + 4, { align: 'right' });

        currentY += 7;

        // If choice text is long and wraps
        if (choiceLines.length > 1) {
          for (let l = 1; l < choiceLines.length; l++) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(30, 41, 59);
            doc.text(choiceLines[l], marginLeft + cardPadding + 16, currentY + 1);
            currentY += 3.5;
          }
        }

        // Additional choice outcomes (items / regulation)
        if (c.triggerRegulationMode) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(7);
          doc.setTextColor(8, 145, 178);
          doc.text(`* Memicu Latihan Regulasi Diri: ${c.triggerRegulationMode.toUpperCase()}`, marginLeft + cardPadding + 16, currentY);
          currentY += 3.5;
        }
      });
    }

    // Item reward or badge unlock
    if (node.givesItem) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(217, 119, 6);
      doc.text(`Hadiah Komponen / Benda: [${node.givesItem}]`, marginLeft + cardPadding, currentY + 2);
      currentY += 3.5;
    }

    if (node.unlocksBadge) {
      const badgeTitle = typeof node.unlocksBadge === 'string' ? node.unlocksBadge : node.unlocksBadge.title;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(147, 51, 234);
      doc.text(`Lencana PSE Terbuka: [${badgeTitle}]`, marginLeft + cardPadding, currentY + 2);
      currentY += 3.5;
    }

    // Border line below card
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(marginLeft, currentY + 2, pageWidth - marginRight, currentY + 2);
    currentY += 5;
  }

  // =========================================================================
  // COVER / DOCUMENT HEADER
  // =========================================================================
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 42, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(251, 191, 36);
  doc.text('LEMBAH NADA RASA — NASKAH LENGKAP GAME', pageWidth / 2, 16, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(226, 232, 240);
  doc.text('Transkrip Resmi Dialog Seluruh Warga, Opsi Pilihan Respon PSE & Interaksi Lingkungan', pageWidth / 2, 23, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  const dateStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(`Nama Karakter Utama: ${playerName} • Tanggal Ekspor: ${dateStr} • Panduan Kurikulum CASEL 5 Kompetensi`, pageWidth / 2, 30, { align: 'center' });

  doc.setFillColor(245, 158, 11);
  doc.rect(0, 42, pageWidth, 2.5, 'F');
  currentY = 50;

  // Introduction Summary Box
  doc.setFillColor(254, 252, 232);
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.4);
  doc.roundedRect(marginLeft, currentY, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(146, 64, 14);
  doc.text('PENGANTAR DOKUMEN & PEDOMAN PENDIDIKAN SOSIAL EMOSIONAL', marginLeft + 4, currentY + 5.5);

  writeWrapped(
    'Dokumen ini merangkum seluruh kalimat, naskah percakapan, gelembung batin emosional, pilihan respon pemain, serta interaksi benda dan satwa di permainan roleplay petualangan Lembah Nada Rasa. Setiap pilihan percakapan dirancang berdasarkan framework CASEL (Self-Awareness, Self-Management, Social Awareness, Relationship Skills, dan Responsible Decision-Making) untuk mengasah empati dan regulasi emosi anak.',
    marginLeft + 4,
    contentWidth - 8,
    7.5,
    'normal',
    [71, 85, 105],
    3.5
  );
  currentY = 78;

  // =========================================================================
  // BAB I: PROLOG & ALUR PEMBUKA CERITA DESA
  // =========================================================================
  drawSectionBanner('BAB I: PROLOG & AWAL PETUALANGAN LEMBAH', 'Kisah awal padamnya Menara Jam Harmoni dan penemuan Pusaka Kompas Hati', [180, 83, 9]);

  const prologueNodes = ['intro_start', 'intro_start_2', 'intro_start_3', 'kiki_wait'];
  prologueNodes.forEach((id) => {
    if (GAME_DIALOGUES[id]) {
      renderDialogueCard(GAME_DIALOGUES[id], 'Prolog Cerita');
    }
  });

  const questHints = [
    'ranu_locked_need_kiki',
    'bimo_locked_need_bridge',
    'tower_locked_need_gear',
    'tower_need_more_components',
    'tower_missing_hint',
    'tower_door_need_all_items',
    'kiki_remind_bridge',
    'ranu_remind_bimo',
    'bimo_remind_tower',
  ];
  drawSubsectionHeader('Petunjuk Perjalanan & Penghalang Alur Quest Utama', 'Transisi Antar Wilayah');
  questHints.forEach((id) => {
    if (GAME_DIALOGUES[id]) {
      renderDialogueCard(GAME_DIALOGUES[id], 'Petunjuk Alur');
    }
  });

  // =========================================================================
  // BAB II: DIALOG 12 WARGA DESA & KOMPONEN MENARA JAM
  // =========================================================================
  drawSectionBanner('BAB II: DIALOG 13 WARGA DESA & KOMPONEN JAM HARMONI', 'Seluruh naskah dilema emosional, gelembung pikiran, validasi empati, teknik regulasi, & dialog resolusi', [13, 148, 136]);

  // Ordered list of 13 key NPCs
  const npcDefinitions = [
    {
      id: 'kiki',
      name: 'Kiki',
      role: 'Tupai Pos Cilik Lembah',
      item: 'Pegas Detak Jam Menara',
      nodes: [
        'kiki_intro',
        'kiki_dismiss',
        'kiki_validate',
        'kiki_validate_options',
        'kiki_calm_options',
        'kiki_prep_breathing',
        'kiki_prep_grounding',
        'kiki_prep_stop',
        'kiki_prep_shakeout',
        'kiki_after_breathe',
        'kiki_after_breathing',
        'kiki_after_grounding',
        'kiki_after_stop',
        'kiki_after_shakeout',
        'kiki_reward',
        'kiki_resolved',
      ],
    },
    {
      id: 'kakek_ranu',
      name: 'Kakek Ranu',
      role: 'Tukang Kayu & Penjaga Jembatan',
      item: 'Poros Pengunci Jam Menara',
      nodes: ['ranu_intro', 'ranu_angry_rebuke', 'ranu_path_empathy', 'ranu_path_empathy_2', 'ranu_path_empathy_3', 'ranu_path_logic', 'ranu_path_logic_2', 'ranu_resolved'],
    },
    {
      id: 'bimo',
      name: 'Bimo',
      role: 'Murid Pembuat Jam (Kelas 4)',
      item: 'Roda Gigi Emas Jam Menara',
      nodes: ['bimo_intro', 'bimo_shame', 'bimo_ranu_praise', 'bimo_growth_mindset', 'bimo_growth_mindset_2', 'bimo_resolved'],
    },
    {
      id: 'prof_kotek',
      name: 'Prof. Kotek',
      role: 'Ayam Peneliti Emosi (Rahasia Lucu)',
      item: 'Pegas Tawa Jam Menara',
      nodes: ['kotek_intro', 'kotek_funny', 'kotek_fact', 'kotek_reward', 'kotek_resolved'],
    },
    {
      id: 'penjaga_kabut',
      name: 'Sosok Kabut / Nenek Wilis',
      role: 'Penjaga Menara & Pustakawan Desa',
      item: 'Inti Harmoni Lembah',
      nodes: ['tower_intro', 'tower_reveal', 'tower_empathy_twist', 'tower_twist_explanation', 'tower_final_choice', 'tower_resolved'],
    },
    {
      id: 'kak_citra',
      name: 'Kak Citra',
      role: 'Konselor Cilik Taman Bunga',
      item: 'Lensa Prisma Menara Jam',
      nodes: ['citra_intro', 'citra_zones_explain', 'citra_zones_red_ask', 'citra_zones_question', 'citra_quiz_wrong', 'citra_reward', 'citra_resolved'],
    },
    {
      id: 'kakek_damai',
      name: 'Kakek Damai',
      role: 'Praktisi Mindful & Pohon Bonsai',
      item: 'Bandul Keseimbangan Jam',
      nodes: ['damai_intro', 'damai_control_explain', 'damai_control_tips', 'damai_practice', 'damai_wrong', 'damai_reward', 'damai_resolved'],
    },
    {
      id: 'moka_cat',
      name: 'Moka',
      role: 'Kucing Pustakawan Lembut',
      item: 'Lonceng Resonansi Jam',
      nodes: ['moka_intro', 'moka_listen_explain', 'moka_cut_explain', 'moka_question', 'moka_wrong', 'moka_reward', 'moka_resolved'],
    },
    {
      id: 'pak_joko',
      name: 'Pak Joko',
      role: 'Petani Kebun Harapan',
      item: 'Minyak Pelumas Alami Jam',
      nodes: ['joko_intro', 'joko_lesson', 'joko_compliment', 'joko_question', 'joko_fixed_feedback', 'joko_growth_reward', 'joko_resolved', 'pak_joko_intro', 'pak_joko_resolved'],
    },
    {
      id: 'didi_scout',
      name: 'Didi',
      role: 'Pengelana Cilik Desa',
      item: 'Jarum Menit Jam',
      nodes: ['didi_intro', 'didi_lesson', 'didi_backpack', 'didi_question', 'didi_wrong', 'didi_reward', 'didi_resolved'],
    },
    {
      id: 'teguh_woodcutter',
      name: 'Pak Teguh',
      role: 'Penebang Pohon Hutan Bijak',
      item: 'Casing Kayu Pelindung Jam',
      nodes: ['teguh_intro', 'teguh_axe_reply', 'teguh_lesson', 'teguh_question', 'teguh_wrong', 'teguh_reward', 'teguh_resolved'],
    },
    {
      id: 'sari_fruit',
      name: 'Ibu Sari',
      role: 'Petani Kebun Buah Hutan',
      item: 'Sekrup Emas Jam',
      nodes: ['sari_intro', 'sari_taste_reply', 'sari_lesson', 'sari_question', 'sari_wrong', 'sari_reward', 'sari_resolved'],
    },
    {
      id: 'jala_fisher',
      name: 'Bung Jala',
      role: 'Pemancing Sabar Tepi Sungai',
      item: 'Tali Katrol Beban Jam',
      nodes: ['jala_intro', 'jala_bored_reply', 'jala_lesson', 'jala_question', 'jala_wrong', 'jala_reward', 'jala_resolved'],
    },
  ];

  npcDefinitions.forEach((npc, index) => {
    const guide = VILLAGER_GUIDE_DATA[npc.id];
    const initialNpc = INITIAL_NPCS.find((n) => n.id === npc.id);

    drawSubsectionHeader(
      `${index + 1}. ${npc.name} (${npc.role})`,
      `Komponen: ${npc.item}`
    );

    // Render NPC profile card if guide exists
    if (guide) {
      ensureSpace(18);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.2);
      doc.roundedRect(marginLeft, currentY, contentWidth, 14, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`Emosi Permukaan: ${guide.surfaceEmotion.label}  •  Emosi Mendalam: ${guide.deepEmotion.label}`, marginLeft + 3, currentY + 4);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text(`Pilar PSE: ${guide.selConcept.pillar} (${guide.selConcept.title})`, marginLeft + 3, currentY + 8);
      doc.text(`Teknik Regulasi: ${guide.calmTechnique.name} — ${guide.calmTechnique.summary}`, marginLeft + 3, currentY + 12);
      currentY += 17;
    } else if (initialNpc) {
      ensureSpace(12);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(marginLeft, currentY, contentWidth, 9, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`Emosi: ${initialNpc.emotionProfile.surfaceEmotion} / ${initialNpc.emotionProfile.deepEmotion}  •  Teknik: ${initialNpc.emotionProfile.calmTechnique}`, marginLeft + 3, currentY + 4);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text(`Wawasan: ${initialNpc.emotionProfile.selInsight}`, marginLeft + 3, currentY + 7.5);
      currentY += 12;
    }

    // Render each dialogue node in sequence
    npc.nodes.forEach((nodeId) => {
      const node = GAME_DIALOGUES[nodeId];
      if (node) {
        renderDialogueCard(node, nodeId);
      }
    });

    currentY += 3;
  });

  // =========================================================================
  // BAB III: INTERAKSI DENGAN BENDA, BANGUNAN & LANDMARK LINGKUNGAN
  // =========================================================================
  drawSectionBanner('BAB III: INTERAKSI BENDA, BANGUNAN & LANDMARK DESA', 'Seluruh teks observasi dan pesan refleksi saat memeriksa objek di peta dunia', [37, 99, 235]);

  const landmarkNodes = [
    { id: 'fountain_examine', name: 'Air Mancur Alun-Alun (Fountain of Reflection)' },
    { id: 'signpost_farm', name: 'Plang Kawasan Pertanian & Kebun Sayur' },
    { id: 'signpost_forest', name: 'Plang Petunjuk Arah Hutan Sunyi & Kabin' },
    { id: 'signpost_examine', name: 'Plang Persimpangan Desa' },
    { id: 'forest_cabin_examine', name: 'Pondok Kayu Hutan Pak Teguh (Pintu Masuk)' },
    { id: 'forest_cabin_philosophy', name: 'Filosofi Kayu Lapuk & Pohon Tumbuh di Kabin' },
    { id: 'forest_cabin_farewell', name: 'Pesan Perpisahan Kabin Hutan' },
    { id: 'tower_examine', name: 'Menara Jam Harmoni (Saat Macet Terkunci)' },
    { id: 'tower_examine_history', name: 'Sejarah Menara Jam & Detak Harmoni Zaman Dulu' },
    { id: 'tower_examine_mechanics', name: 'Mekanisme Roda Gigi & Keterhubungan Komponen Jam' },
    { id: 'tower_examine_bell', name: 'Lonceng Raksasa Puncak Menara' },
    { id: 'tower_examine_restored', name: 'Menara Jam Harmoni (Saat Menyala Pulih Sempurna)' },
    { id: 'secret_tree', name: 'Pohon Keramat Hutan (Sacred Ancient Oak Tree)' },
    { id: 'secret_tree_capsule', name: 'Kapsul Waktu Rahasia di Bawah Akar Pohon' },
    { id: 'free_roam_windmill', name: 'Kincir Angin Pedesaan & Ladang Gandum Emas' },
    { id: 'free_roam_river', name: 'Sungai Beriak Bening Lembah Nada Rasa' },
    { id: 'free_roam_waterfall', name: 'Air Terjun Sejuk & Percikan Air Harmoni' },
  ];

  landmarkNodes.forEach((landmark) => {
    const node = GAME_DIALOGUES[landmark.id];
    if (node) {
      renderDialogueCard(node, landmark.name);
    }
  });

  // =========================================================================
  // BAB IV: INTERAKSI DENGAN HEWAN & MAKHLUK ALAM BEBAS
  // =========================================================================
  drawSectionBanner('BAB IV: INTERAKSI SATWA & MAKHLUK HIDUP LEMBAH', 'Pesan rasa sayang satwa, ketenangan alam, dan koneksi ekologis di Mode Bebas', [22, 163, 74]);

  const animalNodes = [
    { id: 'free_roam_cow', name: 'Sapi Perah Padang Rumput (Holstein Cow)' },
    { id: 'free_roam_sheep', name: 'Domba Bulu Halus Padang Rumput (Pasture Sheep)' },
    { id: 'free_roam_lamb', name: 'Anak Domba Menggemaskan (Baby Lamb)' },
    { id: 'free_roam_deer', name: 'Rusa Tutul Hutan Bijak (Woodland Spotted Deer)' },
    { id: 'free_roam_rabbit', name: 'Kelinci-Kelinci Ceria Padang Rumput (Meadow Bunnies)' },
    { id: 'free_roam_squirrel', name: 'Tupai Liar Sahabat Alam (Woodland Squirrel)' },
    { id: 'free_roam_river', name: 'Kawanan Ikan Berenang Bebas di Aliran Sungai' },
  ];

  animalNodes.forEach((animal) => {
    const node = GAME_DIALOGUES[animal.id];
    if (node) {
      renderDialogueCard(node, animal.name);
    }
  });

  // =========================================================================
  // BAB V: PERCAKAPAN ANTAR WARGA DI MODE BEBAS (LIVING VILLAGE CHATS)
  // =========================================================================
  drawSectionBanner('BAB V: PERCAKAPAN ANTAR WARGA DI MODE BEBAS', 'Obrolan hangat dan persahabatan antar penduduk desa setelah Menara Jam Harmoni kembali berdetak', [124, 58, 237]);

  const villageChats = [
    { id: 'chat_citra_moka_citra', name: 'Kak Citra & Moka (Bagian 1: Zona Tenang)' },
    { id: 'chat_citra_moka_moka', name: 'Kak Citra & Moka (Bagian 2: Perpustakaan Batin)' },
    { id: 'chat_ranu_bimo_ranu', name: 'Kakek Ranu & Bimo (Bagian 1: Poros & Roda Gigi)' },
    { id: 'chat_ranu_bimo_bimo', name: 'Kakek Ranu & Bimo (Bagian 2: Belajar dari Kesalahan)' },
    { id: 'chat_teguh_sari_teguh', name: 'Pak Teguh & Ibu Sari (Bagian 1: Cerobong Kayu Cedar)' },
    { id: 'chat_teguh_sari_sari', name: 'Pak Teguh & Ibu Sari (Bagian 2: Keranjang Apel & Syukur)' },
    { id: 'chat_damai_jala_damai', name: 'Kakek Damai & Bung Jala (Bagian 1: Aliran Sungai & Pikiran)' },
    { id: 'chat_damai_jala_jala', name: 'Kakek Damai & Bung Jala (Bagian 2: Kesabaran Umpan)' },
    { id: 'chat_nenek_wilis', name: 'Nenek Wilis Menatap Lembah Penuh Kedamaian' },
    { id: 'prof_kotek_roaming', name: 'Prof. Kotek Patroli Tingkat Tawa Desa' },
    { id: 'kiki_roaming', name: 'Kiki Mengantar Surat Persahabatan' },
    { id: 'didi_roaming', name: 'Didi Mengelilingi Alur Harmoni Desa' },
  ];

  villageChats.forEach((chat) => {
    const node = GAME_DIALOGUES[chat.id];
    if (node) {
      renderDialogueCard(node, chat.name);
    }
  });

  // =========================================================================
  // BAB VI: EPILOG, ADEGAN PENUTUP & REFLEKSI AKHIR
  // =========================================================================
  drawSectionBanner('BAB VI: ADEGAN PENUTUP, RESOLUSI AKHIR & NILAI PSE', 'Adegan akhir cerita, pesan penutup Nenek Wilis, dan kesimpulan pembelajaran sosial-emosional', [219, 39, 119]);

  const endingNodes = [
    { id: 'ending_perfect_scene', name: 'Ending Sempurna: Cahaya Spektrum Emas Lembah' },
    { id: 'nenek_wilis_closing_perfect', name: 'Pesan Amanat Nenek Wilis (100% Harmoni)' },
    { id: 'ending_summary_perfect', name: 'Rangkuman Refleksi Moral Petualang Sempurna' },
    { id: 'ending_resilient_scene', name: 'Ending Ketangguhan: Detak Awal Harapan Lembah' },
    { id: 'nenek_wilis_closing_resilient', name: 'Pesan Amanat Nenek Wilis (Harapan Tangguh)' },
    { id: 'ending_summary_resilient', name: 'Rangkuman Refleksi Belajar Melangkah' },
  ];

  endingNodes.forEach((end) => {
    const node = GAME_DIALOGUES[end.id];
    if (node) {
      renderDialogueCard(node, end.name);
    }
  });

  // =========================================================================
  // CHECK FOR ANY REMAINING UNLISTED DIALOGUES (100% COVERAGE GUARANTEE)
  // =========================================================================
  const allRenderedIds = new Set<string>([
    ...prologueNodes,
    ...questHints,
    ...npcDefinitions.flatMap((n) => n.nodes),
    ...landmarkNodes.map((l) => l.id),
    ...animalNodes.map((a) => a.id),
    ...villageChats.map((c) => c.id),
    ...endingNodes.map((e) => e.id),
  ]);

  const remainingKeys = Object.keys(GAME_DIALOGUES).filter((k) => !allRenderedIds.has(k));
  if (remainingKeys.length > 0) {
    drawSectionBanner('LAMPIRAN: DIALOG TAMBAHAN LAINNYA', 'Seluruh naskah dialog pelengkap yang ada di dalam sistem permainan', [100, 116, 139]);
    remainingKeys.forEach((key) => {
      const node = GAME_DIALOGUES[key];
      if (node) {
        renderDialogueCard(node, `Kunci Sistem: ${key}`);
      }
    });
  }

  // =========================================================================
  // ADD RUNNING HEADERS & FOOTERS ACROSS ALL PAGES
  // =========================================================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Skip running header on cover page top banner area
    if (i > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(140, 140, 140);
      doc.text('Lembah Nada Rasa — Naskah Lengkap Dialog, Pilihan Moral PSE & Interaksi Game', marginLeft, 11);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.25);
      doc.line(marginLeft, 13.5, pageWidth - marginRight, 13.5);
    }

    // Running bottom footer on every page
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.line(marginLeft, pageHeight - 11, pageWidth - marginRight, pageHeight - 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('Kurikulum Pembelajaran Sosial Emosional (PSE / CASEL) • Lembah Nada Rasa', marginLeft, pageHeight - 7);
    doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - marginRight, pageHeight - 7, { align: 'right' });
  }

  // Trigger browser download
  const cleanPlayerName = playerName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Petualang';
  doc.save(`Naskah_Lengkap_Dialog_Interaksi_Lembah_Nada_Rasa_${cleanPlayerName}.pdf`);
}
