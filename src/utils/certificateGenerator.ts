/**
 * Certificate Generator for Lembah Nada Rasa
 * Generates official, high-resolution JPG / image certificates directly in the browser.
 * Perfect for children and parents to save directly to their photo gallery or computer
 * without dealing with complicated PDF printer dialogs.
 */

export interface CertificateData {
  recipientName: string;
  empathyScore: number;
  decisionPath?: string;
  dateStr?: string;
  isAllBadges?: boolean;
}

export function generateCertificateDataUrl(data: CertificateData): Promise<string> {
  return new Promise((resolve) => {
    const width = 1200;
    const height = 850;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve('');
      return;
    }

    // 1. Background Parchment
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#fffdf5');
    bgGradient.addColorStop(0.5, '#fef9e7');
    bgGradient.addColorStop(1, '#fef3c7');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle sunburst rays for prestige
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.035)';
    for (let i = 0; i < 24; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, width, (i * Math.PI) / 12, ((i + 0.5) * Math.PI) / 12);
      ctx.fill();
    }
    ctx.restore();

    // 2. Ornate Golden Borders
    // Outer border
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Gold inner ribbon border
    const goldGrad = ctx.createLinearGradient(35, 35, width - 70, height - 70);
    goldGrad.addColorStop(0, '#f59e0b');
    goldGrad.addColorStop(0.3, '#fef08a');
    goldGrad.addColorStop(0.5, '#d97706');
    goldGrad.addColorStop(0.7, '#fef08a');
    goldGrad.addColorStop(1, '#b45309');
    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 6;
    ctx.strokeRect(34, 34, width - 68, height - 68);

    // Fine inner border
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.strokeRect(46, 46, width - 92, height - 92);

    // Corner rosettes
    const drawCornerDeco = (cx: number, cy: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    drawCornerDeco(46, 46);
    drawCornerDeco(width - 46, 46);
    drawCornerDeco(46, height - 46);
    drawCornerDeco(width - 46, height - 46);

    // 3. Header Text
    ctx.textAlign = 'center';

    // Top Emblem / Mini Crown
    ctx.font = '28px sans-serif';
    ctx.fillStyle = '#d97706';
    ctx.fillText('🏆  ✨  🌿', width / 2, 90);

    // Ministry / World Sub-header
    ctx.font = 'bold 15px "Pixelify Sans", "Trebuchet MS", sans-serif';
    ctx.fillStyle = '#92400e';
    ctx.letterSpacing = '3px';
    ctx.fillText('LEMBAH NADA RASA • PENDIDIKAN SOSIAL EMOSIONAL (PSE)', width / 2, 122);

    // Certificate Title
    ctx.font = '900 38px "Pixelify Sans", "Georgia", serif';
    ctx.fillStyle = '#78350f';
    ctx.fillText('PIAGAM PENGHARGAAN DUTA EMPATI KELAS 4 SD', width / 2, 172);

    // Decorative underline banner
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 260, 188);
    ctx.lineTo(width / 2 + 260, 188);
    ctx.stroke();

    // Diamond at center
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(width / 2, 182);
    ctx.lineTo(width / 2 + 8, 188);
    ctx.lineTo(width / 2, 194);
    ctx.lineTo(width / 2 - 8, 188);
    ctx.fill();

    // Presentation text
    ctx.font = 'italic 20px "Georgia", serif';
    ctx.fillStyle = '#57534e';
    ctx.fillText('Dengan bangga dan penuh apresiasi dianugerahkan kepada:', width / 2, 235);

    // 4. Recipient Name Box
    const studentName = (data.recipientName || 'Ezzel').trim();
    ctx.font = '900 46px "Pixelify Sans", "Trebuchet MS", sans-serif';
    ctx.fillStyle = '#1e3a8a'; // Royal navy blue for student name
    ctx.fillText(studentName.toUpperCase(), width / 2, 298);

    // Underline for name
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 280, 314);
    ctx.lineTo(width / 2 + 280, 314);
    ctx.stroke();

    // 5. Achievement Description
    ctx.font = '17px "Trebuchet MS", "Segoe UI", sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText(
      'Atas dedikasi, keberanian, dan kematangan emosi dalam meredakan perselisihan,',
      width / 2,
      352
    );
    ctx.fillText(
      'memulihkan warna harmoni desa dari kabut prasangka, serta menjadi sahabat pendengar yang penuh empati.',
      width / 2,
      380
    );

    // 6. PSE 5 Core Pillars Box
    const boxY = 415;
    const boxH = 175;
    ctx.fillStyle = 'rgba(254, 243, 199, 0.65)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(140, boxY, width - 280, boxH, 16);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 15px "Trebuchet MS", sans-serif';
    ctx.fillStyle = '#92400e';
    ctx.fillText('✨ 5 PILAR KOMPETENSI SOSIAL EMOSIONAL YANG DIKUASAI ✨', width / 2, boxY + 30);

    const pillars = [
      '1. Kesadaran Diri (Self-Awareness & 4 Zona Emosi)',
      '2. Manajemen Regulasi Diri (Teknik Napas Balon & S.T.O.P)',
      '3. Kesadaran Sosial & Empati Aktif (Mendengar Hati)',
      '4. Keterampilan Relasi (Komunikasi Positif & Validasi)',
      '5. Keputusan Bertanggung Jawab (Lingkaran Kendali)',
    ];

    ctx.textAlign = 'left';
    ctx.font = 'bold 14px "Trebuchet MS", sans-serif';
    ctx.fillStyle = '#0f172a';

    // Left column
    ctx.fillText('✔ ' + pillars[0], 170, boxY + 68);
    ctx.fillText('✔ ' + pillars[1], 170, boxY + 102);
    ctx.fillText('✔ ' + pillars[2], 170, boxY + 136);

    // Right column
    ctx.fillText('✔ ' + pillars[3], 640, boxY + 68);
    ctx.fillText('✔ ' + pillars[4], 640, boxY + 102);

    // Score badge in box
    ctx.fillStyle = '#047857';
    ctx.fillText(
      `🏆 Nilai Resonansi Empati: ${data.empathyScore} Poin (Predikat Sempurna)`,
      640,
      boxY + 136
    );

    // 7. Golden Official Seal & Signatures
    // Left Signature
    ctx.textAlign = 'center';
    ctx.font = 'italic 20px "Brush Script MT", "Caveat", cursive, sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText('Nenek Wilis', 280, 680);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(180, 690);
    ctx.lineTo(380, 690);
    ctx.stroke();
    ctx.font = 'bold 13px "Trebuchet MS", sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('Nenek Wilis', 280, 712);
    ctx.font = '12px "Trebuchet MS", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Pustakawan Sepuh Lembah', 280, 730);

    // Center Gold Seal (Embossed Medallion)
    const sealX = width / 2;
    const sealY = 680;
    // Seal outer starburst
    ctx.save();
    ctx.translate(sealX, sealY);
    ctx.fillStyle = '#d97706';
    for (let i = 0; i < 16; i++) {
      ctx.rotate(Math.PI / 8);
      ctx.fillRect(-26, -26, 52, 52);
    }
    // Main seal circle
    const sealGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 42);
    sealGrad.addColorStop(0, '#fef08a');
    sealGrad.addColorStop(0.7, '#f59e0b');
    sealGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = sealGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = 'bold 10px "Pixelify Sans", sans-serif';
    ctx.fillStyle = '#78350f';
    ctx.textAlign = 'center';
    ctx.fillText('RESMI PSE', 0, -10);
    ctx.font = 'bold 14px "Pixelify Sans", sans-serif';
    ctx.fillStyle = '#451a03';
    ctx.fillText('★ 2026 ★', 0, 6);
    ctx.font = 'bold 9px "Pixelify Sans", sans-serif';
    ctx.fillStyle = '#78350f';
    ctx.fillText('LEMBAH NADA', 0, 20);
    ctx.restore();

    // Right Signature
    ctx.font = 'italic 20px "Brush Script MT", "Caveat", cursive, sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText('Kak Citra', width - 280, 680);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width - 380, 690);
    ctx.lineTo(width - 180, 690);
    ctx.stroke();
    ctx.font = 'bold 13px "Trebuchet MS", sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('Kak Citra, S.Psi', width - 280, 712);
    ctx.font = '12px "Trebuchet MS", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Konselor Ramah Anak', width - 280, 730);

    // Bottom Footer Watermark
    ctx.font = '11px "Trebuchet MS", sans-serif';
    ctx.fillStyle = '#94a3b8';
    const dateText =
      data.dateStr ||
      new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    ctx.fillText(
      `Diterbitkan pada: ${dateText} • Verifikasi Keaslian Permainan Lembah Nada Rasa`,
      width / 2,
      790
    );

    // Convert to JPG image
    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      resolve(dataUrl);
    } catch {
      resolve('');
    }
  });
}

/**
 * Downloads the certificate as a JPG image file directly to user device
 */
export async function downloadCertificateAsJpg(data: CertificateData): Promise<boolean> {
  try {
    const dataUrl = await generateCertificateDataUrl(data);
    if (!dataUrl) return false;

    const cleanName = (data.recipientName || 'Ezzel')
      .trim()
      .replace(/[^a-zA-Z0-9_\-]/g, '_');
    const filename = `Sertifikat_Empati_${cleanName}.jpg`;

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch (err) {
    console.error('Gagal mengunduh sertifikat:', err);
    return false;
  }
}
