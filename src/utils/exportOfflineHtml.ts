// Generates a fully self-contained single .html game file that can be saved
// and played locally on any device without internet connection!

export function downloadOfflineGameHtml() {
  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Lembah Nada Rasa: Ekspedisi Kompas Hati (Versi Mandiri Offline)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body { background: #020617; color: #f8fafc; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; overflow: hidden; height: 100vh; display: flex; align-items: center; justify-content: center; }
    .font-pixel { font-family: 'Press Start 2P', monospace, cursive; }
    #wrapper { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
    #canvas-container { position: relative; width: 100%; height: 100%; max-width: 1080px; max-height: 85vh; display: flex; align-items: center; justify-content: center; background: #090d16; border-radius: 16px; border: 2px solid #1e293b; box-shadow: 0 0 50px rgba(0,0,0,0.85); overflow: hidden; }
    canvas { display: block; image-rendering: pixelated; width: 100%; height: 100%; object-fit: contain; cursor: pointer; }
    
    /* Top bar */
    .top-bar { position: absolute; top: 12px; left: 12px; right: 12px; display: flex; justify-content: space-between; align-items: center; z-index: 20; pointer-events: none; gap: 8px; }
    .title-tag { background: rgba(15, 23, 42, 0.95); border: 1px solid #334155; padding: 6px 10px; border-radius: 10px; font-family: 'Press Start 2P', monospace; font-size: 9px; color: #f59e0b; pointer-events: auto; }
    .btn-action { background: #d97706; color: #020617; border: none; padding: 6px 12px; border-radius: 10px; font-family: 'Press Start 2P', monospace; font-size: 8px; font-weight: bold; cursor: pointer; pointer-events: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
    .btn-action:hover { background: #f59e0b; }
    
    /* Quest Banner */
    .quest-banner { position: absolute; top: 52px; left: 50%; transform: translateX(-50%); width: 92%; max-width: 520px; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(245, 158, 11, 0.5); padding: 6px 12px; border-radius: 10px; z-index: 20; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.6); pointer-events: none; }
    .quest-chip { background: rgba(245, 158, 11, 0.2); border: 1px solid rgba(245, 158, 11, 0.4); color: #fde68a; font-family: 'Press Start 2P', monospace; font-size: 7px; padding: 3px 6px; border-radius: 4px; shrink-0; }
    .quest-text { font-size: 11px; color: #fef3c7; font-weight: 500; }

    /* Dialogue box */
    #dialogue-box { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); width: 94%; max-width: 650px; background: rgba(15, 23, 42, 0.96); border: 2px solid #f59e0b; border-radius: 14px; padding: 14px; z-index: 30; display: none; flex-direction: column; gap: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.9); }
    .speaker-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 8px; font-family: 'Press Start 2P', monospace; font-size: 10px; color: #fde68a; }
    .dialogue-text { font-family: 'Press Start 2P', monospace; font-size: 9px; line-height: 1.8; color: #f8fafc; min-height: 48px; }
    .choices-list { display: flex; flex-direction: column; gap: 6px; margin-top: 6px; }
    .choice-btn { background: #1e293b; border: 1px solid #475569; color: #f1f5f9; padding: 8px 12px; border-radius: 8px; font-size: 12px; text-align: left; cursor: pointer; transition: 0.15s; }
    .choice-btn:hover { background: #78350f; border-color: #f59e0b; color: #fef3c7; }
    .next-btn { align-self: flex-end; background: #f59e0b; color: #020617; font-family: 'Press Start 2P', monospace; font-size: 8px; font-weight: bold; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; }
    
    /* Mobile Controls */
    .mobile-controls { position: absolute; bottom: 16px; width: 100%; display: flex; justify-content: space-between; padding: 0 16px; z-index: 25; pointer-events: none; }
    .dpad { display: grid; grid-template-columns: repeat(3, 40px); grid-template-rows: repeat(3, 40px); gap: 4px; pointer-events: auto; }
    .dpad-btn { background: #1e293b; color: #fff; border: 1px solid #475569; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .dpad-btn:active { background: #f59e0b; color: #000; }
    .act-btns { display: flex; gap: 10px; align-items: center; pointer-events: auto; }
    .act-btn { width: 54px; height: 54px; border-radius: 50%; border: 2px solid #10b981; background: #059669; color: #fff; font-family: 'Press Start 2P', monospace; font-size: 7px; cursor: pointer; }
    .act-btn.compass { background: #d97706; border-color: #fef08a; }
    .act-btn:active { transform: scale(0.95); }

    /* Mini-Map */
    #minimap-card {
      position: absolute;
      bottom: 16px;
      right: 16px;
      background: rgba(2, 6, 23, 0.95);
      border: 2px solid rgba(245, 158, 11, 0.7);
      border-radius: 12px;
      padding: 6px 8px;
      z-index: 28;
      display: flex;
      flex-direction: column;
      gap: 5px;
      box-shadow: 0 0 20px rgba(0,0,0,0.85);
      font-family: 'Press Start 2P', monospace;
    }
    #minimap-header { display: flex; justify-content: space-between; align-items: center; font-size: 7px; color: #f59e0b; }
    #minimap-canvas { width: 144px; height: 112px; border: 1px solid #334155; border-radius: 4px; background: #0f172a; image-rendering: pixelated; }
    #minimap-footer { font-size: 6px; color: #34d399; display: flex; justify-content: space-between; }

    /* Breathing overlay */
    #breathing-box { position: absolute; inset: 0; background: rgba(2, 6, 23, 0.88); z-index: 40; display: none; flex-direction: column; align-items: center; justify-content: center; gap: 14px; text-align: center; }
    .breath-circle { width: 120px; height: 120px; border-radius: 50%; background: radial-gradient(circle, #06b6d4, #0284c7); display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold; transition: transform 1s ease-in-out; }
  </style>
</head>
<body>
  <div id="wrapper">
    <div id="canvas-container">
      <canvas id="game-canvas" width="640" height="480"></canvas>
      
      <div class="top-bar">
        <div class="title-tag">🧭 Lembah Nada Rasa</div>
        <div style="display:flex; gap:6px;">
          <button class="btn-action" id="btn-toggle-map" onclick="toggleMiniMap()">PETA [M]</button>
          <button class="btn-action" id="btn-toggle-compass" onclick="toggleCompass()">KOMPAS [Spasi]</button>
        </div>
      </div>

      <div class="quest-banner">
        <span class="quest-chip">MISI</span>
        <span class="quest-text" id="quest-tag">Dekati Kiki & Tekan [Spasi] Kompas Hati</span>
      </div>

      <!-- Mini-Map Card -->
      <div id="minimap-card">
        <div id="minimap-header">
          <span>🗺️ PETA LEMBAH</span>
          <button onclick="toggleMiniMap()" style="background:none; border:none; color:#94a3b8; cursor:pointer; font-size:9px; font-weight:bold;">✕</button>
        </div>
        <canvas id="minimap-canvas" width="144" height="112"></canvas>
        <div id="minimap-footer">
          <span id="mm-zone">📍 Alun-Alun</span>
          <span>[M]</span>
        </div>
      </div>

      <!-- Dialogue Box -->
      <div id="dialogue-box">
        <div class="speaker-row">
          <span id="dia-speaker">Kiki</span>
          <span id="dia-aura">Aura: CEMAS</span>
        </div>
        <div class="dialogue-text" id="dia-text">Teks dialog muncul di sini...</div>
        <div class="choices-list" id="dia-choices"></div>
        <button class="next-btn" id="dia-next" onclick="advanceDialogue()">Lanjut ▶</button>
      </div>

    <!-- Breathing Mini-Game -->
    <div id="breathing-box">
      <h3 style="color:#fef08a; font-size: 16px;">Bantu Kiki: Napas Balon 4-4-4</h3>
      <p style="color:#cbd5e1; font-size: 12px; max-width: 320px;">Tarik napas perlahan lewat hidung, tahan, dan hembuskan untuk menenangkan amigdala.</p>
      <div class="breath-circle" id="breath-ball">4</div>
      <div id="breath-label" style="color:#38bdf8; font-weight:bold; font-size:14px;">Tarik Napas...</div>
    </div>

    <!-- Opening Start Screen Overlay -->
    <div id="start-screen" style="position:absolute; inset:0; background:rgba(2,6,23,0.92); z-index:60; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:16px; text-align:center;">
      <div style="max-width:440px; width:92%; background:#0f172a; border:2px solid #f59e0b; border-radius:16px; padding:20px; box-shadow:0 0 35px rgba(245,158,11,0.3);">
        <div style="color:#fbbf24; font-family:'Press Start 2P',monospace; font-size:8px; margin-bottom:8px;">🧭 EDISI PETUALANGAN OFFLINE</div>
        <h1 style="color:#f59e0b; font-family:'Press Start 2P',monospace; font-size:15px; margin:6px 0 10px; line-height:1.4;">LEMBAH NADA RASA</h1>
        <p style="color:#cbd5e1; font-size:11.5px; line-height:1.6; margin-bottom:16px;">
          Gunakan Pusaka Kompas Hati untuk membaca resonansi emosi para sahabat lembah dan pulihkan harmoni desa!
        </p>
        <button id="btn-start-offline" onclick="startGameStory()" style="width:100%; background:linear-gradient(to right, #f59e0b, #fbbf24); color:#020617; font-family:'Press Start 2P',monospace; font-size:10px; padding:12px; border:none; border-radius:10px; font-weight:bold; cursor:pointer; box-shadow:0 0 15px rgba(245,158,11,0.4); margin-bottom:10px;">
          ▶ MULAI PETUALANGAN
        </button>
        <div style="font-size:10px; color:#94a3b8; line-height:1.5;">
          Kontrol: [WASD / Panah] Gerak • [Spasi] Kompas • [M] Peta
        </div>
      </div>
    </div>

    <!-- Mobile Controls -->
    <div class="mobile-controls">
      <div class="dpad">
        <div></div>
        <button class="dpad-btn" onmousedown="pressDir('up', true)" onmouseup="pressDir('up', false)" ontouchstart="pressDir('up', true)" ontouchend="pressDir('up', false)">▲</button>
        <div></div>
        <button class="dpad-btn" onmousedown="pressDir('left', true)" onmouseup="pressDir('left', false)" ontouchstart="pressDir('left', true)" ontouchend="pressDir('left', false)">◀</button>
        <div style="background:#0f172a; border-radius:4px;"></div>
        <button class="dpad-btn" onmousedown="pressDir('right', true)" onmouseup="pressDir('right', false)" ontouchstart="pressDir('right', true)" ontouchend="pressDir('right', false)">▶</button>
        <div></div>
        <button class="dpad-btn" onmousedown="pressDir('down', true)" onmouseup="pressDir('down', false)" ontouchstart="pressDir('down', true)" ontouchend="pressDir('down', false)">▼</button>
        <div></div>
      </div>

      <div class="act-btns">
        <button class="act-btn compass" onclick="toggleCompass()">HATI</button>
        <button class="act-btn" onclick="triggerInteract()">BICARA</button>
      </div>
    </div>
    </div>
  </div>

  <script>
    // Audio synthesis
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;
    function playTone(freq, duration = 0.1, type = 'sine') {
      try {
        if (!audioCtx) audioCtx = new AudioCtx();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch(e) {}
    }

    // Canvas & Game loop setup
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    let player = { x: 340, y: 440, vx: 0, vy: 0, facing: 'down' };
    let keys = { up: false, down: false, left: false, right: false };
    let targetPos = null;
    let isCompassActive = false;
    let currentDialogue = null;
    let zoneRestored = { plaza: false, bridge: false, forest: false, tower: false };
    let empathyScore = 10;

    const npcs = [
      { id: 'kiki', name: 'Kiki (Tupai)', x: 260, y: 420, surface: 'Cemas', deep: 'Takut Dimarahi', color: '#f59e0b', resolved: false },
      { id: 'ranu', name: 'Kakek Ranu', x: 640, y: 480, surface: 'Marah', deep: 'Merasa Tak Dihargai', color: '#ef4444', resolved: false },
      { id: 'bimo', name: 'Bimo (Murid)', x: 240, y: 190, surface: 'Sedih', deep: 'Malu & Takut Salah', color: '#3b82f6', resolved: false },
      { id: 'kotek', name: 'Prof. Kotek (Ayam)', x: 480, y: 580, surface: 'Gembira', deep: 'Suka Membantu', color: '#10b981', resolved: true },
      { id: 'wilis', name: 'Nenek Wilis', x: 880, y: 240, surface: 'Kecewa', deep: 'Kesepian di Menara', color: '#a855f7', resolved: false }
    ];

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const camX = player.x - canvas.width / 2;
      const camY = player.y - canvas.height / 2;
      const worldX = screenX + camX;
      const worldY = screenY + camY;

      for (let n of npcs) {
        if (Math.hypot(n.x - worldX, n.y - worldY) < 30) {
          if (Math.hypot(n.x - player.x, n.y - player.y) < 55) {
            startDialogueWith(n);
            targetPos = null;
          } else {
            targetPos = { x: n.x, y: n.y, npc: n };
          }
          return;
        }
      }
      targetPos = { x: worldX, y: worldY };
    });

    let isMiniMapOpen = true;
    function toggleMiniMap() {
      isMiniMapOpen = !isMiniMapOpen;
      document.getElementById('minimap-card').style.display = isMiniMapOpen ? 'flex' : 'none';
      playTone(isMiniMapOpen ? 523 : 392, 0.1, 'sine');
    }

    function toggleCompass() {
      isCompassActive = !isCompassActive;
      playTone(isCompassActive ? 659 : 330, 0.2, 'triangle');
      document.getElementById('btn-toggle-compass').innerText = isCompassActive ? '🌟 Kompas ON' : '🧭 Kompas [Spasi]';
    }

    function pressDir(dir, val) {
      keys[dir] = val;
    }

    let isStartScreenActive = true;
    function startGameStory() {
      isStartScreenActive = false;
      const scr = document.getElementById('start-screen');
      if (scr) scr.style.display = 'none';
      playTone(587, 0.25, 'triangle');
      setTimeout(() => playTone(880, 0.4, 'triangle'), 150);
      setTimeout(() => {
        startDialogueWith(npcs[0]);
      }, 300);
    }

    window.addEventListener('keydown', (e) => {
      if (isStartScreenActive && (e.key === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        startGameStory();
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.down = true;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
      if (e.code === 'Space') { e.preventDefault(); toggleCompass(); }
      if (e.key === 'm' || e.key === 'M') toggleMiniMap();
      if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') triggerInteract();
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.down = false;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    });

    function triggerInteract() {
      if (currentDialogue) { advanceDialogue(); return; }
      // find nearest NPC
      for (let n of npcs) {
        let dist = Math.hypot(n.x - player.x, n.y - player.y);
        if (dist < 50) {
          startDialogueWith(n);
          return;
        }
      }
    }

    function startDialogueWith(npc) {
      playTone(440, 0.1, 'square');
      let diaBox = document.getElementById('dialogue-box');
      diaBox.style.display = 'flex';
      document.getElementById('dia-speaker').innerText = npc.name;
      document.getElementById('dia-aura').innerText = isCompassActive ? ('AURA: ' + npc.surface + ' (Hati: ' + npc.deep + ')') : 'Aura: Tersembunyi (Nyalakan Kompas)';

      let choicesContainer = document.getElementById('dia-choices');
      choicesContainer.innerHTML = '';
      let nextBtn = document.getElementById('dia-next');

      if (npc.id === 'kiki') {
        document.getElementById('dia-text').innerText = 'Ciiit! Surat-surat desa berhamburan! Aku pasti dimarahi semua orang!';
        nextBtn.style.display = 'none';
        let b1 = document.createElement('button');
        b1.className = 'choice-btn';
        b1.innerText = '1. Kiki, mari lakukan Teknik Napas Balon bersama!';
        b1.onclick = () => { startBreathingGame(); };
        let b2 = document.createElement('button');
        b2.className = 'choice-btn';
        b2.innerText = '2. Wajar kamu merasa panik, kita bereskan bersama.';
        b2.onclick = () => { startBreathingGame(); };
        choicesContainer.appendChild(b1);
        choicesContainer.appendChild(b2);
      } else if (npc.id === 'ranu') {
        document.getElementById('dia-text').innerText = 'Jembatan ini KUTUTUP! Kalian anak-anak hanya tahu bikin masalah!';
        nextBtn.style.display = 'none';
        let b1 = document.createElement('button');
        b1.className = 'choice-btn';
        b1.innerText = 'Pilihan A: Validasi Rasa (Kakek pasti lelah... kami sangat berterima kasih atas jasamu).';
        b1.onclick = () => {
          npc.resolved = true;
          zoneRestored.bridge = true;
          document.getElementById('dia-text').innerText = 'Kakek Ranu terharu... "Kalian menghargaiku? Jembatan kubuka lebar-lebar!"';
          choicesContainer.innerHTML = '';
          nextBtn.style.display = 'block';
          playTone(587, 0.3, 'sine');
        };
        choicesContainer.appendChild(b1);
      } else if (npc.id === 'bimo') {
        document.getElementById('dia-text').innerText = 'Aku anak terburuk... Roda gigi jam jatuh gara-gara aku...';
        nextBtn.style.display = 'none';
        let b1 = document.createElement('button');
        b1.className = 'choice-btn';
        b1.innerText = 'Bimo, satu kesalahan tidak membuatmu jadi anak buruk. Kita belajar bersama!';
        b1.onclick = () => {
          npc.resolved = true;
          zoneRestored.forest = true;
          document.getElementById('dia-text').innerText = 'Bimo tersenyum: "Terima kasih! Ini Roda Gigi Emas untuk menara jam!"';
          choicesContainer.innerHTML = '';
          nextBtn.style.display = 'block';
          playTone(659, 0.4, 'sine');
        };
        choicesContainer.appendChild(b1);
      } else if (npc.id === 'wilis') {
        document.getElementById('dia-text').innerText = 'Aku Nenek Wilis. Kabut ini tercipta dari kata-kata pedas warga. Maukah kalian memulihkan harmoni desa?';
        nextBtn.style.display = 'none';
        let b1 = document.createElement('button');
        b1.className = 'choice-btn';
        b1.innerText = 'Ya! Pasang Roda Gigi dan deklarasikan Desa Saling Mendengar!';
        b1.onclick = () => {
          npc.resolved = true;
          zoneRestored.tower = true;
          document.getElementById('dia-text').innerText = 'LONCENG BERDENTANG! Seluruh Lembah Nada Rasa pulih penuh warna! Selamat, Ezzel! Kamu Lulus Duta Empati Emas!';
          choicesContainer.innerHTML = '';
          nextBtn.style.display = 'block';
          playTone(880, 0.6, 'triangle');
        };
        choicesContainer.appendChild(b1);
      } else {
        document.getElementById('dia-text').innerText = 'KUKU-RUYUK! Tawa adalah obat stres alami menurut sains! Lanjutkan petualanganmu!';
        nextBtn.style.display = 'block';
      }
    }

    function advanceDialogue() {
      document.getElementById('dialogue-box').style.display = 'none';
    }

    function startBreathingGame() {
      document.getElementById('dialogue-box').style.display = 'none';
      let bBox = document.getElementById('breathing-box');
      bBox.style.display = 'flex';
      let ball = document.getElementById('breath-ball');
      let lbl = document.getElementById('breath-label');
      let count = 4;
      
      let timer = setInterval(() => {
        count--;
        ball.innerText = count > 0 ? count : '✓';
        if (count === 3) {
          ball.style.transform = 'scale(1.4)';
          lbl.innerText = 'Tarik Napas Dalam-dalam (4 detik)...';
          playTone(330, 0.8, 'sine');
        } else if (count === 2) {
          lbl.innerText = 'Tahan Sebentar...';
        } else if (count === 1) {
          ball.style.transform = 'scale(1.0)';
          lbl.innerText = 'Hembuskan Perlahan...';
          playTone(260, 0.8, 'sine');
        } else if (count <= 0) {
          clearInterval(timer);
          setTimeout(() => {
            bBox.style.display = 'none';
            zoneRestored.plaza = true;
            npcs[0].resolved = true;
            document.getElementById('quest-tag').innerText = 'Misi: Seberangi Jembatan ke Timur & Bicara ke Kakek Ranu';
            playTone(880, 0.4, 'triangle');
          }, 800);
        }
      }, 1000);
    }

    // Main loop
    let tick = 0;
    function update() {
      tick++;
      let speed = 2.5;
      if (keys.up || keys.down || keys.left || keys.right) {
        targetPos = null;
        if (keys.up) player.y -= speed;
        if (keys.down) player.y += speed;
        if (keys.left) player.x -= speed;
        if (keys.right) player.x += speed;
      } else if (targetPos) {
        let dist = Math.hypot(targetPos.x - player.x, targetPos.y - player.y);
        if (dist <= 4) {
          if (targetPos.npc) startDialogueWith(targetPos.npc);
          targetPos = null;
        } else {
          let step = Math.min(speed, dist);
          player.x += ((targetPos.x - player.x) / dist) * step;
          player.y += ((targetPos.y - player.y) / dist) * step;
        }
      }

      // Render
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let camX = player.x - canvas.width / 2;
      let camY = player.y - canvas.height / 2;
      ctx.save();
      ctx.translate(-camX, -camY);

      // Draw destination target
      if (targetPos) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(targetPos.x, targetPos.y, 8 + Math.sin(tick * 0.2) * 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw ground
      ctx.fillStyle = zoneRestored.plaza ? '#2d5a27' : '#334155';
      ctx.fillRect(0, 0, 1100, 800);

      // River
      ctx.fillStyle = zoneRestored.bridge ? '#0284c7' : '#1e293b';
      ctx.fillRect(660, 0, 80, 800);

      // Bridge
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(640, 460, 120, 60);

      // Fountain
      ctx.fillStyle = zoneRestored.plaza ? '#38bdf8' : '#64748b';
      ctx.beginPath();
      ctx.arc(360, 440, 30, 0, Math.PI*2);
      ctx.fill();

      // NPCs
      npcs.forEach(n => {
        ctx.fillStyle = n.resolved ? '#4ade80' : n.color;
        ctx.fillRect(n.x - 12, n.y - 12, 24, 24);

        // Name tag
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(n.name, n.x, n.y - 18);

        // Aura pulse if compass on
        if (isCompassActive) {
          ctx.strokeStyle = n.color;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 22 + Math.sin(tick*0.1)*4, 0, Math.PI*2);
          ctx.stroke();
        }
      });

      // Player
      ctx.fillStyle = '#10b981';
      ctx.fillRect(player.x - 10, player.y - 10, 20, 20);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(player.x - 6, player.y - 12, 12, 4); // scarf
      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Ezzel', player.x, player.y - 16);

      ctx.restore();

      // Update Mini-Map
      if (isMiniMapOpen) {
        const mmCanvas = document.getElementById('minimap-canvas');
        if (mmCanvas) {
          const mctx = mmCanvas.getContext('2d');
          if (mctx) {
            mctx.fillStyle = zoneRestored.plaza ? '#15803d' : '#334155';
            mctx.fillRect(0, 0, 144, 112);

            // River
            mctx.fillStyle = zoneRestored.bridge ? '#2563eb' : '#1e293b';
            mctx.fillRect(86, 0, 12, 112);

            // Bridge
            mctx.fillStyle = '#b45309';
            mctx.fillRect(84, 64, 16, 8);

            // Fountain
            mctx.fillStyle = zoneRestored.plaza ? '#38bdf8' : '#64748b';
            mctx.beginPath();
            mctx.arc(47, 61, 4, 0, Math.PI * 2);
            mctx.fill();

            // NPCs
            npcs.forEach(n => {
              const nx = (n.x / 1100) * 144;
              const ny = (n.y / 800) * 112;
              mctx.fillStyle = n.resolved ? '#4ade80' : '#fbbf24';
              mctx.beginPath();
              mctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
              mctx.fill();
            });

            // Player on Mini-Map
            const px = (player.x / 1100) * 144;
            const py = (player.y / 800) * 112;

            // Radar pulse
            const pulse = (tick % 30) / 30;
            mctx.strokeStyle = 'rgba(52, 211, 153, ' + (1 - pulse) + ')';
            mctx.beginPath();
            mctx.arc(px, py, 2 + pulse * 6, 0, Math.PI * 2);
            mctx.stroke();

            // Player dot
            mctx.fillStyle = '#10b981';
            mctx.beginPath();
            mctx.arc(px, py, 3, 0, Math.PI * 2);
            mctx.fill();
            mctx.fillStyle = '#fff';
            mctx.beginPath();
            mctx.arc(px, py, 1, 0, Math.PI * 2);
            mctx.fill();

            // Update zone label
            const zLabel = document.getElementById('mm-zone');
            if (zLabel) {
              if (player.x > 750 && player.y < 350) zLabel.innerText = '📍 Menara Jam';
              else if (player.x < 350 && player.y < 350) zLabel.innerText = '📍 Hutan Sunyi';
              else if (player.x >= 640 && player.x <= 760) zLabel.innerText = '📍 Jembatan';
              else zLabel.innerText = '📍 Alun-Alun';
            }
          }
        }
      }

      requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Lembah_Nada_Rasa_PSE_Offline.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
