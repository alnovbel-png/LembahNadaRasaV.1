import { EmotionType } from '../types/game';

export interface VillagerGuideProfile {
  id: string;
  name: string;
  role: string;
  category: 'main' | 'educator' | 'secret';
  categoryLabel: string;
  zone: 'plaza' | 'bridge' | 'forest' | 'tower' | 'river';
  zoneName: string;
  locationCoordinates: { x: number; y: number };
  locationHint: string;
  personality: string;
  favoriteQuote: string;
  sprite: string;
  bio: string;
  surfaceEmotion: {
    type: EmotionType;
    label: string;
    description: string;
  };
  deepEmotion: {
    type: EmotionType;
    label: string;
    description: string;
  };
  storyReason: string;
  selConcept: {
    pillar:
      | 'Kesadaran Diri (Self-Awareness)'
      | 'Manajemen Diri (Self-Management)'
      | 'Kesadaran Sosial (Social Awareness)'
      | 'Keterampilan Relasi (Relationship Skills)'
      | 'Pengambilan Keputusan Bertanggung Jawab';
    title: string;
    insight: string;
  };
  calmTechnique: {
    name: string;
    icon: string;
    summary: string;
    steps: string[];
  };
  dialogueTips: {
    dos: string[];
    donts: string[];
  };
  associatedBadgeId?: string;
}

export const VILLAGER_GUIDE_DATA: Record<string, VillagerGuideProfile> = {
  kiki: {
    id: 'kiki',
    name: 'Kiki',
    role: 'Tupai Pos Cilik Lembah',
    category: 'main',
    categoryLabel: 'Kisah Utama',
    zone: 'plaza',
    zoneName: 'Alun-Alun Nada Rasa (Sebelah Air Mancur)',
    locationCoordinates: { x: 8, y: 13 },
    locationHint: 'Berada di sebelah barat air mancur alun-alun, di samping tiang lentera desa.',
    personality: 'Cekatan, penuh dedikasi, namun rentan dilanda panik bila rencana terganggu tiba-tiba.',
    favoriteQuote: '"Satu hembusan napas tenang bernilai seribu surat yang teratur kembali."',
    sprite: 'squirrel',
    bio: 'Kiki adalah kurir pos cilik yang mengantarkan surat persahabatan ke seluruh penjuru Lembah Nada Rasa. Ketika kabut abu-abu tiba dan angin kencang menerbangkan tas posnya, ia panik luar biasa.',
    surfaceEmotion: {
      type: 'cemas',
      label: 'Kecemasan / Panik Akut',
      description: 'Napas terengah-engah, berbicara dengan sangat cepat, dan cakar gemetar memunguti kertas yang berserakan.',
    },
    deepEmotion: {
      type: 'takut',
      label: 'Rasa Takut Mengecewakan Orang Lain',
      description: 'Takut dianggap tidak bertanggung jawab oleh penduduk desa yang menunggu kabar dari keluarga.',
    },
    storyReason: 'Surat-surat penting berhamburan saat kabut tebal menyergap alun-alun, membuatnya merasa gagal menjalankan tugas amanah.',
    selConcept: {
      pillar: 'Manajemen Diri (Self-Management)',
      title: 'Meredakan Amigdala dengan Fisiologi Napas',
      insight: 'Saat cemas, otak reptil (amigdala) membunyikan alarm bahaya palsu. Tarikan napas dalam menstimulasi saraf vagus untuk menurunkan detak jantung secara alami.',
    },
    calmTechnique: {
      name: 'Teknik Napas Balon Udara',
      icon: '🎈',
      summary: 'Latihan pernapasan diafragma 4-4-6 untuk menenangkan denyut nadi seketika.',
      steps: [
        'Tarik napas perlahan lewat hidung selama 4 detik, rasakan perut mengembang seperti balon.',
        'Tahan napas sejenak selama 4 detik dengan lembut dan rileks.',
        'Hembuskan perlahan lewat mulut selama 6 detik seolah menerbangkan balon udara ke langit biru.',
      ],
    },
    dialogueTips: {
      dos: [
        'Dekati dengan tempo bicara yang tenang dan tidak terburu-buru.',
        'Ajak Kiki menarik napas bersama sebelum membahas surat yang hilang.',
        'Tawarkan bantuan nyata untuk merapikan satu per satu kertas.',
      ],
      donts: [
        'Jangan memarahinya atau menyuruhnya "jangan lebay".',
        'Hindari menuntut hasil instan saat tubuhnya masih gemetar.',
      ],
    },
  },

  kakek_ranu: {
    id: 'kakek_ranu',
    name: 'Kakek Ranu',
    role: 'Tukang Kayu Sepuh & Penjaga Jembatan',
    category: 'main',
    categoryLabel: 'Kisah Utama',
    zone: 'bridge',
    zoneName: 'Jembatan Kayu Sungai Timur',
    locationCoordinates: { x: 20, y: 15 },
    locationHint: 'Berdiri di ujung barat jembatan kayu penghubung alun-alun menuju tebing menara.',
    personality: 'Tegas, pekerja keras, berhati lembut namun membangun tembok pertahanan saat merasa tidak dihargai.',
    favoriteQuote: '"Jembatan kayu bisa diperbaiki dengan paku, namun jembatan hati butuh pengakuan dan kehangatan."',
    sprite: 'old_man',
    bio: 'Kakek Ranu telah merawat jembatan kayu desa selama lebih dari empat puluh tahun. Saat palang jembatan mulai rapuh, beberapa orang menggerutu tanpa melihat betapa lelahnya tangan tua itu bekerja seorang diri.',
    surfaceEmotion: {
      type: 'marah',
      label: 'Kemarahan & Sikap Ketus',
      description: 'Suara meninggi, alis tertaut tajam, dan menutup akses jembatan agar orang lain tidak melintas.',
    },
    deepEmotion: {
      type: 'kecewa',
      label: 'Rasa Kecewa & Kesepian',
      description: 'Merasa jerih payahnya bertahun-tahun diabaikan dan dianggap tidak berguna lagi di masa tuanya.',
    },
    storyReason: 'Dituduh lalai merawat jembatan setelah kabut mengikis kayu penyangga, padahal ia bekerja siang malam tanpa ada yang menemani.',
    selConcept: {
      pillar: 'Kesadaran Sosial (Social Awareness)',
      title: 'Gunung Es Emosi: Amarah sebagai Lapisan Pelindung',
      insight: 'Kemarahan hampir selalu merupakan "emosi sekunder" yang bertugas melindungi luka emosi primer yang rapuh, seperti rasa kecewa, kesepian, atau merasa tidak dihargai.',
    },
    calmTechnique: {
      name: 'Validasi Rasa & Pengakuan Tulus',
      icon: '🤝',
      summary: 'Mengakui kelelahan dan menghargai kontribusi seseorang tanpa mendebat siapa yang benar.',
      steps: [
        'Dengarkan keluh kesahnya hingga selesai tanpa menyela atau membantah.',
        'Gunakan kalimat validasi: "Kakek pasti lelah sekali merawat jembatan ini sendirian."',
        'Ucapkan rasa terima kasih atas keamanan jembatan yang telah ia jaga selama puluhan tahun.',
      ],
    },
    dialogueTips: {
      dos: [
        'Gunakan panggilan yang penuh takzim dan hormati usianya.',
        'Fokus pada apresiasi kerja kerasnya sebelum meminta palang jembatan dibuka.',
        'Tunjukkan bahwa warga desa sangat rindu melewatinya dengan aman.',
      ],
      donts: [
        'Jangan mendebat dengan nada tinggi atau mengancam akan melapor.',
        'Jangan meremehkan usianya atau menyebutnya keras kepala.',
      ],
    },
  },

  bimo: {
    id: 'bimo',
    name: 'Bimo',
    role: 'Murid Pembuat Jam (Kelas 4)',
    category: 'main',
    categoryLabel: 'Kisah Utama',
    zone: 'forest',
    zoneName: 'Sudut Hutan Sunyi Barat Laut',
    locationCoordinates: { x: 7, y: 6 },
    locationHint: 'Bersembunyi di balik pohon pinus rindang dekat bebatuan lumut di hutan barat laut.',
    personality: 'Cerdas, teliti, pemalu, dan sangat keras menghukum diri sendiri ketika berbuat kekeliruan.',
    favoriteQuote: '"Kesalahan bukanlah tanda kita bodoh, melainkan bukti kita sedang berani mencoba."',
    sprite: 'boy_glasses',
    bio: 'Bimo adalah murid cilik pembuat jam yang tekun belajar pada Kakek Ranu. Karena salah paham setelah dibentak saat kakek sedang kelelahan, Bimo mengira dirinya dibenci dan lari bersembunyi ke hutan sambil mendekap erat Roda Gigi Menara Jam.',
    surfaceEmotion: {
      type: 'sedih',
      label: 'Kesedihan Mendalam & Menarik Diri',
      description: 'Menundukkan kepala, memeluk lututnya di balik pohon pinus, dan menolak bicara dengan orang lain.',
    },
    deepEmotion: {
      type: 'cemas',
      label: 'Kecemasan Takut Ditolak & Merasa Bersalah',
      description: 'Takut Kakek Ranu membencinya dan merasa dirinya adalah penyebab rusaknya menara jam desa.',
    },
    storyReason: 'Salah paham mengira Kakek Ranu membencinya setelah bentakan tadi pagi, sehingga ia kabur membawa Roda Gigi Menara karena malu dan takut.',
    selConcept: {
      pillar: 'Kesadaran Diri (Self-Awareness)',
      title: 'Reframing Kognitif: Memisahkan Diri dari Kesalahan',
      insight: 'Anak yang mengalami perfectionism butuh dibantu memahami bahwa kesalahan (mistake) adalah bagian alami proses belajar, bukan cerminan nilai diri (self-worth).',
    },
    calmTechnique: {
      name: 'Reframing Positif: Aku Masih Belajar',
      icon: '🌱',
      summary: 'Mengubah kalimat celaan diri menjadi afirmasi belajar yang sehat.',
      steps: [
        'Ganti ucapan "Kakek membenciku karena aku ceroboh" menjadi "Kakek membentak karena lelah, bukan karena membenciku."',
        'Pahami bahwa membuat kekeliruan saat belajar adalah wajar dan bisa diperbaiki bersama.',
        'Bangkit bersama sahabat untuk menyerahkan roda gigi jam dengan kepala tegak.',
      ],
    },
    dialogueTips: {
      dos: [
        'Duduk sejajar dengan tinggi matanya agar tidak terkesan mengintimidasi.',
        'Ceritakan bahwa kamu sendiri juga pernah melakukan kesalahan serupa.',
        'Fokus pada mencari solusi bersama daripada mengungkit kecerobohannya.',
      ],
      donts: [
        'Jangan mengejek ketakutannya atau menyebutnya penakut.',
        'Hindari nada bicara menghakimi seperti "Tuh kan, makanya hati-hati!"',
      ],
    },
  },

  penjaga_kabut: {
    id: 'penjaga_kabut',
    name: 'Sosok Kabut / Nenek Wilis',
    role: 'Penjaga Menara & Pustakawan Sepuh',
    category: 'main',
    categoryLabel: 'Kisah Utama',
    zone: 'tower',
    zoneName: 'Pelataran Puncak Menara Jam Harmoni',
    locationCoordinates: { x: 30, y: 8 },
    locationHint: 'Berdiri di depan gerbang menara jam tinggi di tebing timur laut lembah.',
    personality: 'Bijaksana, penuh welas asih, namun memendam duka mendalam saat persatuan warga terkoyak.',
    favoriteQuote: '"Harmoni bukanlah ketiadaan perbedaan nada, melainkan kerelaan untuk saling mendengarkan dalam simfoni."',
    sprite: 'spirit_elder',
    bio: 'Nenek Wilis adalah pustakawan sepuh yang menjaga denting jam harmoni. Merasa pilu melihat warga saling menyalahkan saat menghadapi kesulitan, ia menyelimuti menara dengan kabut agar warga merenungkan makna empati.',
    surfaceEmotion: {
      type: 'kecewa',
      label: 'Kekecewaan Mendalam & Ketertutupan',
      description: 'Menyelimuti diri dalam kabut kelabu tebal dan berbicara dengan nada penuh keraguan terhadap ketulusan manusia.',
    },
    deepEmotion: {
      type: 'sedih',
      label: 'Duka atas Hilangnya Kerukunan Desa',
      description: 'Merindukan tawa riang dan toleransi hangat yang dulu menyatukan semua warga Lembah Nada Rasa.',
    },
    storyReason: 'Warga desa melupakan Kompas Empati dan lebih sibuk membenarkan diri sendiri, membuat jam harmoni kehilangan ketukannya.',
    selConcept: {
      pillar: 'Pengambilan Keputusan Bertanggung Jawab',
      title: 'Restorasi Komunitas Melalui Rekonsiliasi Empatik',
      insight: 'Komunitas yang sehat dibangun atas kemampuan memperbaiki keretakan relasi (repairing rupture), di mana setiap pihak berani meminta maaf dan mendengarkan dengan hati terbuka.',
    },
    calmTechnique: {
      name: 'Simfoni Harmoni: Solusi Kolaboratif',
      icon: '🕰️',
      summary: 'Menghubungkan kembali benang empati antarwarga melalui aksi kebaikan nyata.',
      steps: [
        'Tunjukkan bukti bahwa warga desa telah kembali saling menyapa dan mendengarkan.',
        'Kembalikan roda gigi jam bersama Kiki, Kakek Ranu, dan Bimo sebagai satu kesatuan.',
        'Biarkan lonceng menara berdentang membubarkan kabut abu-abu menjadi pelangi warna-warni.',
      ],
    },
    dialogueTips: {
      dos: [
        'Bicaralah dengan rasa hormat mendalam kepada sejarah dan warisan desa.',
        'Sampaikan bahwa kamu telah mendengar cerita dari Kiki, Kakek Ranu, dan Bimo.',
        'Ajak beliau melihat perubahan ketulusan yang mulai bersemi di alun-alun.',
      ],
      donts: [
        'Jangan memaksa membongkar pintu menara dengan kekerasan.',
        'Hindari meremehkan duka yang dirasakannya.',
      ],
    },
  },

  kak_citra: {
    id: 'kak_citra',
    name: 'Kak Citra',
    role: 'Konselor Cilik Taman Bunga',
    category: 'educator',
    categoryLabel: 'Pembimbing PSE',
    zone: 'plaza',
    zoneName: 'Taman Bunga Regulasi (Selatan Alun-Alun)',
    locationCoordinates: { x: 14, y: 18 },
    locationHint: 'Di sebelah bedeng bunga warna-warni di dekat jalan setapak menuju kebun.',
    personality: 'Hangat, suportif, komunikatif, dan gemar menggunakan metafora alam untuk menjelaskan emosi.',
    favoriteQuote: '"Semua emosi adalah tamu terhormat, yang perlu kita atur adalah bagaimana cara kita meresponnya."',
    sprite: 'girl_counselor',
    bio: 'Kak Citra adalah konselor cilik yang mengedukasi anak-anak tentang 4 Zona Regulasi Emosi (Zones of Regulation) melalui warna kelopak bunga di taman desa.',
    surfaceEmotion: {
      type: 'tenang',
      label: 'Ketenangan Terfokus',
      description: 'Selalu tersenyum hangat, menyambut siapa saja dengan tangan terbuka dan pandangan teduh.',
    },
    deepEmotion: {
      type: 'gembira',
      label: 'Sukacita Menemani Tumbuh Kembang',
      description: 'Merasa bahagia setiap kali ada anak yang berhasil menamai perasaannya sendiri dengan tepat.',
    },
    storyReason: 'Mendedikasikan diri untuk memastikan tidak ada anak di lembah yang merasa malu saat merasa sedih atau marah.',
    selConcept: {
      pillar: 'Kesadaran Diri (Self-Awareness)',
      title: '4 Zona Regulasi Emosi (Zones of Regulation)',
      insight: 'Zona Hijau (fokus & tenang), Zona Kuning (cemas/terstimulasi), Zona Merah (marah/panik meledak), dan Zona Biru (lelah/lesu). Mengenal zona diri adalah langkah pertama regulasi.',
    },
    calmTechnique: {
      name: 'Identifikasi Zona & Reset Hijau',
      icon: '🌸',
      summary: 'Mengenali di zona mana tubuh kita berada saat ini dan memilih alat bantu yang pas.',
      steps: [
        'Tanyakan pada diri: "Warna zona apa yang sedang kurasakan saat ini?"',
        'Katakan pada diri: "Wajar berada di zona ini, dan aku punya cara untuk kembali tenang."',
        'Pilih aktivitas pemulih: minum air, cuci muka, atau berjalan pelan di udara terbuka.',
      ],
    },
    dialogueTips: {
      dos: [
        'Sapa dengan ceria dan tanyakan tentang warna-warni zona emosi.',
        'Dengarkan penjelasannya tentang cara mengatasi perasaan kewalahan.',
      ],
      donts: [
        'Jangan menganggap emosi negatif sebagai "dosa" atau sesuatu yang tabu.',
      ],
    },
    associatedBadgeId: 'badge_counselor_zones',
  },

  kakek_damai: {
    id: 'kakek_damai',
    name: 'Kakek Damai',
    role: 'Praktisi Mindful & Pohon Bonsai',
    category: 'educator',
    categoryLabel: 'Pembimbing PSE',
    zone: 'river',
    zoneName: 'Tepi Sungai & Taman Bonsai Ketenangan',
    locationCoordinates: { x: 27, y: 19 },
    locationHint: 'Duduk bersila di dekat bebatuan sungai timur di bawah naungan pohon rindang.',
    personality: 'Hening, reflektif, mendalam, dan memiliki suara lembut bak gemericik air sungai.',
    favoriteQuote: '"Kita tidak bisa menghentikan angin yang berhembus, tapi kita bisa mengarahkan layar perahu kita."',
    sprite: 'zen_master',
    bio: 'Kakek Damai telah bermeditasi di tepi sungai selama puluhan tahun. Ia mengajarkan rahasia Lingkaran Kendali (Circle of Control) untuk membebaskan jiwa dari beban hal-hal yang tak bisa diubah.',
    surfaceEmotion: {
      type: 'tenang',
      label: 'Ketenangan Murni (Equanimity)',
      description: 'Tatap matanya damai, ritme napasnya stabil, dan gestur tubuhnya sangat relaks.',
    },
    deepEmotion: {
      type: 'tenang',
      label: 'Kedamaian Batiniah Sejati',
      description: 'Menerima pasang surut kehidupan seperti aliran sungai yang tak pernah terhenti.',
    },
    storyReason: 'Ingin mewariskan ilmu ketenangan pikiran kepada generasi muda agar tidak gampang terbawa arus kecemasan masa depan.',
    selConcept: {
      pillar: 'Manajemen Diri (Self-Management)',
      title: 'Lingkaran Kendali (Circle of Control)',
      insight: 'Memisahkan hal di dalam kendali (respon, perkataan, usaha kita) vs di luar kendali (pikiran orang lain, cuaca, kejadian masa lalu) adalah kunci pencegah kelelahan mental.',
    },
    calmTechnique: {
      name: 'Teknik Pemilahan Lingkaran Kendali',
      icon: '🧘🏻‍♂️',
      summary: 'Menggambar dua lingkaran imajiner untuk melepaskan beban yang bukan urusan kita.',
      steps: [
        'Bayangkan lingkaran kecil di dadamu: ini adalah kata-katamu, usahamu, dan responmu.',
        'Bayangkan lingkaran besar di luar: ini adalah perkataan orang lain dan peristiwa yang terjadi.',
        'Tarik napas dan katakan: "Aku hanya bertanggung jawab atas lingkaranku sendiri."',
      ],
    },
    dialogueTips: {
      dos: [
        'Duduklah dengan tenang di sampingnya sebelum memulai obrolan.',
        'Tanyakan tentang cara menghadapi orang yang bersikap menyebalkan.',
      ],
      donts: [
        'Jangan berbicara terlalu keras atau tergesa-gesa.',
      ],
    },
    associatedBadgeId: 'badge_circle_of_control',
  },

  moka_cat: {
    id: 'moka_cat',
    name: 'Moka',
    role: 'Kucing Pustakawan Lembut',
    category: 'educator',
    categoryLabel: 'Pembimbing PSE',
    zone: 'plaza',
    zoneName: 'Gazebo Pustaka Lembut (Barat Daya Alun-Alun)',
    locationCoordinates: { x: 6, y: 15 },
    locationHint: 'Duduk manis di atas bangku kayu dekat tumpukan gulungan buku persahabatan.',
    personality: 'Sangat penyayang, sabar tiada batas, pendengar paling setia di seluruh lembah.',
    favoriteQuote: '"Terkadang, hadiah terindah yang bisa kamu berikan kepada sahabat hanyalah telinga yang mau mendengar tanpa menghakimi."',
    sprite: 'cat_librarian',
    bio: 'Moka adalah kucing berbulu beludru yang mengenakan syal pustakawan. Ia selalu siap duduk di samping siapa saja yang butuh menumpahkan isi hatinya tanpa takut diceramahi.',
    surfaceEmotion: {
      type: 'tenang',
      label: 'Kenyamanan & Penerimaan',
      description: 'Mendengkur lembut, menyipitkan mata dengan kasih sayang, dan mengibaskan ekor pelan.',
    },
    deepEmotion: {
      type: 'haru',
      label: 'Keharuan Kasih Sayang Murni',
      description: 'Menyimpan empati mendalam bagi setiap jiwa yang merasa kesepian di dunia ini.',
    },
    storyReason: 'Menyadari bahwa banyak orang terluka bukan karena kurang nasihat, melainkan karena tidak pernah ada yang mau mendengarkan sampai tuntas.',
    selConcept: {
      pillar: 'Keterampilan Relasi (Relationship Skills)',
      title: 'Mendengarkan Aktif (Active & Empathetic Listening)',
      insight: 'Mendengarkan secara aktif bukan sekadar menunggu giliran untuk berbicara, melainkan hadir secara penuh dengan mata, telinga, dan hati untuk memahami sudut pandang sahabat.',
    },
    calmTechnique: {
      name: 'Dengungan Kucing: Hadir Utuh',
      icon: '🐱',
      summary: 'Latihan 3 langkah menyimak cerita teman tanpa memotong kalimatnya.',
      steps: [
        'Arahkan pandangan mata dan condongkan badan sedikit ke arah lawan bicara.',
        'Tahan dorongan untuk langsung memberi nasihat atau bercerita tentang dirimu sendiri.',
        'Ulangi inti perasaannya: "Aku mengerti, kamu pasti merasa sedih sekali ya."',
      ],
    },
    dialogueTips: {
      dos: [
        'Elus bulunya dengan lembut dan sapa dengan ramah.',
        'Minta nasihat tentang cara menjadi sahabat yang baik untuk orang lain.',
      ],
      donts: [
        'Jangan memotong kalimat orang lain saat Moka sedang mengajarkan teknik mendengar.',
      ],
    },
    associatedBadgeId: 'badge_active_listening',
  },

  pak_joko: {
    id: 'pak_joko',
    name: 'Pak Joko',
    role: 'Petani Kebun Harapan',
    category: 'educator',
    categoryLabel: 'Pembimbing PSE',
    zone: 'plaza',
    zoneName: 'Ladang Kebun Harapan (Ujung Barat Daya)',
    locationCoordinates: { x: 8, y: 23 },
    locationHint: 'Di dekat pagar ladang jagung dan labu kuning di selatan desa.',
    personality: 'Pekerja keras, optimis, pantang menyerah, dan memiliki senyuman secerah matahari pagi.',
    favoriteQuote: '"Benih yang unggul sekalipun butuh waktu di dalam tanah gelap sebelum mekar menjadi bunga yang memesona."',
    sprite: 'farmer',
    bio: 'Pak Joko menggarap kebun sayur desa dengan tangan dinginnya. Ia meyakini bahwa bakat dan kemampuan manusia seperti tanaman: bisa bertumbuh pesat bila dipupuk dengan ketekunan dan kemauan belajar.',
    surfaceEmotion: {
      type: 'tenang',
      label: 'Ketenangan Ketekunan',
      description: 'Menyeka keringat dengan caping jerami sambil tersenyum menatap tunas-tunas hijau muda.',
    },
    deepEmotion: {
      type: 'gembira',
      label: 'Harapan dan Keyakinan Proses',
      description: 'Yakin bahwa setiap kegagalan panen adalah guru terbaik untuk musim tanam berikutnya.',
    },
    storyReason: 'Ingin mengikis rasa putus asa anak-anak desa yang sering merasa "aku tidak berbakat" hanya karena gagal sekali.',
    selConcept: {
      pillar: 'Kesadaran Diri (Self-Awareness)',
      title: 'Pola Pikir Berkembang (Growth Mindset)',
      insight: 'Growth Mindset mengajarkan bahwa kecerdasan dan karakter bukanlah hal permanen yang kaku, melainkan otot yang bisa dilatih semakin kuat lewat latihan dan evaluasi.',
    },
    calmTechnique: {
      name: 'Kekuatan Kata "BELUM" (The Power of Yet)',
      icon: '🌱',
      summary: 'Menambahkan kata "belum" pada kalimat kegagalan untuk menyalakan harapan.',
      steps: [
        'Saat merasa tidak bisa, ubah kalimat: "Aku tidak bisa melakukannya" menjadi "Aku BELUM bisa melakukannya."',
        'Sadari bahwa kesulitan adalah tanda otakmu sedang membentuk jalur saraf yang baru.',
        'Fokus pada kemajuan 1% setiap hari daripada kesempurnaan kilat.',
      ],
    },
    dialogueTips: {
      dos: [
        'Tanyakan tentang rahasia menyiram tanaman dan memupuk kesabaran batin.',
        'Diskusikan bagaimana cara bangkit saat nilai ulangan atau hasil karyamu belum memuaskan.',
      ],
      donts: [
        'Jangan mengejek pekerjaan mencangkul atau bertani.',
      ],
    },
    associatedBadgeId: 'badge_growth_mindset',
  },

  didi_scout: {
    id: 'didi_scout',
    name: 'Didi',
    role: 'Pengelana Cilik Desa',
    category: 'educator',
    categoryLabel: 'Pembimbing PSE',
    zone: 'plaza',
    zoneName: 'Jalur Penjelajah Alun-Alun Tengah',
    locationCoordinates: { x: 11, y: 17 },
    locationHint: 'Berdiri di persimpangan jalan batu alun-alun membawa ransel petualang.',
    personality: 'Energik, ramah pada semua orang, berjiwa petualang, dan tidak canggung menyapa orang asing.',
    favoriteQuote: '"Senyuman adalah bahasa universal yang paling cepat meruntuhkan dinding kecanggungan."',
    sprite: 'wandering_scout',
    bio: 'Didi adalah anak pengelana yang senang menjelajahi setiap sudut tersembunyi lembah. Baginya, setiap orang yang ia temui di jalan adalah calon sahabat baik yang belum sempat diajak berkenalan.',
    surfaceEmotion: {
      type: 'gembira',
      label: 'Kegembiraan Sosial',
      description: 'Melambaikan tangan dengan antusias, menyapa dengan riang gembira.',
    },
    deepEmotion: {
      type: 'tenang',
      label: 'Rasa Aman Berinteraksi Sosial',
      description: 'Percaya bahwa kebaikan yang kita pancarkan akan kembali menyinari langkah kaki kita.',
    },
    storyReason: 'Menyadari banyak warga yang merasa terasing hanya karena saling menunggu siapa yang menyapa duluan.',
    selConcept: {
      pillar: 'Keterampilan Relasi (Relationship Skills)',
      title: 'Inisiasi Relasi & Kehangatan Komunikasi Sosial',
      insight: 'Memulai sapaan ramah membutuhkan sedikit keberanian, namun secara instan memicu rasa aman (psychological safety) bagi lawan bicara di lingkungan kelompok.',
    },
    calmTechnique: {
      name: 'Tiga Detik Keberanian Menyapa',
      icon: '🌻',
      summary: 'Latihan kontak mata hangat, senyum ramah, dan sapaan tulus.',
      steps: [
        'Tatap mata kawan dengan lembut selama 2-3 detik.',
        'Tarik ujung bibir membentuk senyuman hangat yang tulus.',
        'Ucapkan sapaan sederhana: "Halo! Semoga harimu menyenangkan."',
      ],
    },
    dialogueTips: {
      dos: [
        'Balas lambaian tangannya dan tanyakan tempat menarik apa yang baru ia jelajahi.',
      ],
      donts: [
        'Jangan mengacuhkan sapaannya saat berpapasan di jalan.',
      ],
    },
    associatedBadgeId: 'badge_friendly_greeter',
  },

  teguh_woodcutter: {
    id: 'teguh_woodcutter',
    name: 'Pak Teguh',
    role: 'Penebang Pohon Hutan Bijak',
    category: 'educator',
    categoryLabel: 'Pembimbing PSE',
    zone: 'forest',
    zoneName: 'Pondok Hutan Pinus Utara',
    locationCoordinates: { x: 10, y: 5 },
    locationHint: 'Di sebelah tumpukan kayu gelondongan di utara hutan pinus rimbun.',
    personality: 'Kekar, bersahaja, berhati lapang, dan sangat berhati-hati dalam menjaga ucapannya saat emosi naik.',
    favoriteQuote: '"Satu ayunan kapak amarah yang serampangan bisa merobohkan pohon persahabatan yang dirawat puluhan tahun."',
    sprite: 'woodcutter',
    bio: 'Pak Teguh menebang hanya ranting-ranting pohon yang sudah rapuh agar tunas muda di bawahnya mendapat sinar matahari. Ia adalah ahli dalam mengelola letupan amarah sebelum merusak hubungan sosial.',
    surfaceEmotion: {
      type: 'tenang',
      label: 'Ketenangan Terkendali',
      description: 'Menyandarkan kapaknya dengan hati-hati, mengatur napas panjang saat merasa lelah.',
    },
    deepEmotion: {
      type: 'haru',
      label: 'Tanggung Jawab Menjaga Harmoni',
      description: 'Sangat menyayangi warga desa dan berjanji tidak akan pernah melukai siapa pun dengan kata-kata kasar.',
    },
    storyReason: 'Di masa mudanya pernah berselisih paham karena emosi mendidih, sehingga kini ia menguasai teknik jeda amarah.',
    selConcept: {
      pillar: 'Manajemen Diri (Self-Management)',
      title: 'Regulasi Letupan Emosi Marah (Anger Management)',
      insight: 'Amarah memicu aliran adrenalin yang menyempitkan rasio logika (amygdala hijack). Mengambil jeda waktu (time-out) selama 90 detik memungkinkan hormon stres terurai kembali.',
    },
    calmTechnique: {
      name: 'Jeda 90 Detik & Taruh Kapak',
      icon: '🪓',
      summary: 'Menghentikan respon verbal seketika saat dada mulai terasa panas mendidih.',
      steps: [
        'Katakan pada diri sendiri: "STOP! Dadaku sedang panas, jangan bicara apa-apa dulu."',
        'Mundurlah tiga langkah dari orang yang memancing emosimu.',
        'Minum segelas air putih dan hembuskan napas panjang hingga hitungan sepuluh.',
      ],
    },
    dialogueTips: {
      dos: [
        'Bicaralah dengan jujur dan lugas tanpa menyindir.',
        'Minta tips bagaimana caranya menahan diri saat kita sedang diejek teman.',
      ],
      donts: [
        'Jangan mengejutkannya dari belakang saat ia sedang memegang alat kerja.',
      ],
    },
    associatedBadgeId: 'badge_woodcutter_anger',
  },

  sari_fruit: {
    id: 'sari_fruit',
    name: 'Ibu Sari',
    role: 'Petani Kebun Buah Hutan',
    category: 'educator',
    categoryLabel: 'Pembimbing PSE',
    zone: 'forest',
    zoneName: 'Kebun Buah Rindang Hutan Utara',
    locationCoordinates: { x: 13, y: 7 },
    locationHint: 'Di samping pohon apel merah dan pohon jeruk manis di sebelah timur hutan.',
    personality: 'Murah senyum, dermawan, berjiwa keibuan, dan senantiasa bersyukur atas hal-hal kecil.',
    favoriteQuote: '"Sukacita bukanlah memiliki segalanya, melainkan menyadari betapa melimpahnya berkat yang sudah ada di tangan kita."',
    sprite: 'fruit_farmer',
    bio: 'Ibu Sari merawat kebun buah hutan yang manis. Setiap musim panen, ia tidak menjual buahnya untuk memperkaya diri, melainkan membagikannya ke seluruh tetangga desa untuk dirayakan bersama.',
    surfaceEmotion: {
      type: 'gembira',
      label: 'Kegembiraan Berbagi',
      description: 'Wajahnya berseri-seri menawarkan buah ranum kepada setiap pengelana yang melintas.',
    },
    deepEmotion: {
      type: 'haru',
      label: 'Rasa Syukur Mendalam (Gratitude)',
      description: 'Merasa terharu melihat senyuman anak-anak yang menikmati manisnya buah hasil rawatannya.',
    },
    storyReason: 'Ingin mengajarkan bahwa kebahagiaan sejati bertambah saat dibagi, bukan saat ditimbun sendirian.',
    selConcept: {
      pillar: 'Kesadaran Sosial (Social Awareness)',
      title: 'Latihan Rasa Syukur Harian (Daily Gratitude)',
      insight: 'Praktik bersyukur secara berkala terbukti secara neurosains memperkuat neurotransmiter dopamin dan serotonin, membuat pikiran lebih kebal terhadap iri hati dan prasangka negatif.',
    },
    calmTechnique: {
      name: 'Tiga Butir Apel Syukur',
      icon: '🍎',
      summary: 'Menyebutkan tiga hal sederhana yang disyukuri setiap malam sebelum tidur.',
      steps: [
        'Sebutkan 1 hal tentang tubuhmu yang sehat hari ini.',
        'Sebutkan 1 orang sahabat atau keluarga yang telah berbuat baik padamu.',
        'Sebutkan 1 berkah kecil yang menyenangkan (makanan enak, udara segar, permainan seru).',
      ],
    },
    dialogueTips: {
      dos: [
        'Cicipi buah yang ditawarkannya dan ucapkan terima kasih dengan tulus.',
        'Tanyakan bagaimana cara mengatasi rasa iri hati terhadap kepemilikan teman.',
      ],
      donts: [
        'Jangan mencela buah yang rasanya sedikit asam.',
      ],
    },
    associatedBadgeId: 'badge_fruit_gratitude',
  },

  jala_fisher: {
    id: 'jala_fisher',
    name: 'Bung Jala',
    role: 'Pemancing Sabar Tepi Sungai',
    category: 'educator',
    categoryLabel: 'Pembimbing PSE',
    zone: 'river',
    zoneName: 'Dermaga Kayu Tepi Sungai Timur',
    locationCoordinates: { x: 21, y: 19 },
    locationHint: 'Duduk di atas bantalan dermaga kayu memegang joran pancing menghadap aliran sungai.',
    personality: 'Sangat sabar, tenang, tidak mudah frustrasi, dan menikmati ketenangan alam.',
    favoriteQuote: '"Umpan yang terburu-buru ditarik takkan membawa ikan, seperti halnya impian yang butuh kesabaran waktu."',
    sprite: 'fisherman',
    bio: 'Bung Jala adalah pemancing yang bisa duduk berjam-jam di tepi sungai tanpa mengeluh bosan. Baginya, memancing bukanlah tentang seberapa banyak ikan yang didapat, melainkan melatih pikiran agar tidak impulsif.',
    surfaceEmotion: {
      type: 'tenang',
      label: 'Ketenangan Sabar Menanti',
      description: 'Mata terarah lembut ke riak air, kedua tangan rileks memegang gagang pancing.',
    },
    deepEmotion: {
      type: 'tenang',
      label: 'Penerimaan Alur Waktu (Delayed Gratification)',
      description: 'Menyadari bahwa segala hal berharga di dunia ini butuh waktu dan proses untuk matang.',
    },
    storyReason: 'Banyak anak-anak zaman sekarang terbiasa serba instan sehingga mudah frustrasi bila tidak langsung berhasil.',
    selConcept: {
      pillar: 'Manajemen Diri (Self-Management)',
      title: 'Menunda Kepuasan Sesaat (Delayed Gratification)',
      insight: 'Kemampuan bersabar menahan dorongan instan demi tujuan jangka panjang yang lebih besar adalah indikator terkuat keberhasilan akademis dan kedewasaan emosional anak.',
    },
    calmTechnique: {
      name: 'Riak Sungai: Menanti Tanpa Frustrasi',
      icon: '🎣',
      summary: 'Menerima jeda waktu tanpa menggerutu atau menyerah di tengah jalan.',
      steps: [
        'Saat merasa bosan atau jengkel karena menunggu, rasakan tarikan napas masuk dan keluar.',
        'Amati lingkungan sekitarmu: dengarkan suara burung, desir angin, atau aliran air.',
        'Katakan pada diri: "Hasil terbaik layak dinanti dengan sabar dan hati riang."',
      ],
    },
    dialogueTips: {
      dos: [
        'Duduklah di sampingnya tanpa mengganggu riak air pancingnya.',
        'Tanyakan cara agar tidak gampang menyerah saat belajar hal baru yang sulit.',
      ],
      donts: [
        'Jangan melempar batu ke sungai di dekat mata kailnya.',
      ],
    },
    associatedBadgeId: 'badge_fisherman_patience',
  },

  prof_kotek: {
    id: 'prof_kotek',
    name: 'Prof. Kotek',
    role: 'Ayam Peneliti Emosi (Rahasia Lucu)',
    category: 'secret',
    categoryLabel: 'Karakter Rahasia',
    zone: 'plaza',
    zoneName: 'Sudut Riset Rahasia Alun-Alun Selatan',
    locationCoordinates: { x: 16, y: 19 },
    locationHint: 'Bersembunyi di dekat semak bunga kuning di selatan alun-alun dengan jas lab putih, sarung tangan merah, dan tabung reaktor emosi di punggungnya.',
    personality: 'Eksentrik, jenaka, super cerdas, dan percaya bahwa tawa adalah teknologi pengurang stres tercanggih.',
    favoriteQuote: '"Kukuruyuuuk! Satu tawa sehat melepaskan triliunan molekul endorfin yang memusnahkan amukan amigdala!"',
    sprite: 'chicken_glasses',
    bio: 'Profesor Kotek adalah ayam cendekiawan jenius yang mengenakan jas laboratorium putih, ransel tabung reaktor emosi (cairan hijau dan oranye), serta sarung tangan penelitian merah. Ia meriset formula ilmiah bagaimana humor sehat dan senyuman mampu menstabilkan gelombang neurokimiawi hati secara instan.',
    surfaceEmotion: {
      type: 'gembira',
      label: 'Kegembiraan Intelektual Jenaka',
      description: 'Berkokok sambil membetulkan kacamatanya dan mencatat grafik tawa warga di buku mini.',
    },
    deepEmotion: {
      type: 'tenang',
      label: 'Ketenangan Hati yang Riang',
      description: 'Melihat hidup dari kacamata humor yang sehat dan tidak gampang tersinggung.',
    },
    storyReason: 'Menemukan bahwa banyak orang stres bukan karena masalah berat, melainkan karena lupa cara menertawakan hal konyol.',
    selConcept: {
      pillar: 'Manajemen Diri (Self-Management)',
      title: 'Humor Sehat sebagai Mekanisme Koping Adaptif',
      insight: 'Tawa merangsang sirkulasi darah dan relaksasi otot, menurunkan hormon kortisol serta memicu neurokimia endorfin yang meningkatkan ketahanan mental (resilience).',
    },
    calmTechnique: {
      name: 'Resep Tawa Kokok Profesor',
      icon: '🐔',
      summary: 'Melihat sisi lucu dari kejadian yang membuatmu kesal agar tidak terlalu tegang.',
      steps: [
        'Tarik napas, lalu hembuskan sambil membuat suara senyuman "Hi-hi-hi" atau "Ha-ha-ha".',
        'Bayangkan masalahmu disuarakan oleh ayam berkacamata yang sedang berkokok ceria.',
        'Rasakan ketegangan di bahumu runtuh dan berubah menjadi rasa geli yang melegakan.',
      ],
    },
    dialogueTips: {
      dos: [
        'Sapa dengan nada kagum dan ajak bercanda tentang penelitian ayamnya.',
        'Minta Profesor membagikan resep tawa endorfin.',
      ],
      donts: [
        'Jangan mencoba mengejar atau menangkap bulu ekornya.',
      ],
    },
    associatedBadgeId: 'badge_laughter_medicine',
  },
};
