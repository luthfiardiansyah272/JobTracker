// ===== CV PARSER ENGINE =====

// Master skill dictionary untuk deteksi
const ALL_SKILLS = [
  // Frontend
  'html','css','javascript','typescript','react','vue','angular','nextjs','nuxt','svelte',
  'tailwind','bootstrap','sass','scss','less','webpack','vite','jquery','redux','zustand',
  'graphql','rest api','pwa','responsive design','figma','adobe xd','sketch',
  // Backend
  'nodejs','node.js','python','java','php','golang','go','ruby','rust','c#','c++','scala',
  'laravel','django','flask','fastapi','spring','spring boot','express','nestjs','rails',
  'microservices','grpc','websocket','oauth','jwt',
  // Mobile
  'flutter','dart','kotlin','android','swift','ios','react native','xamarin','ionic',
  // Database
  'mysql','postgresql','postgres','mongodb','redis','sqlite','firebase','supabase',
  'bigquery','elasticsearch','cassandra','dynamodb','oracle','sql server','mariadb',
  // DevOps & Cloud
  'docker','kubernetes','aws','gcp','azure','terraform','ansible','jenkins','gitlab ci',
  'github actions','ci/cd','linux','nginx','apache','bash','shell scripting',
  'cloudformation','heroku','vercel','netlify',
  // Data & AI
  'machine learning','deep learning','tensorflow','pytorch','keras','scikit-learn',
  'pandas','numpy','matplotlib','tableau','power bi','excel','r','spark','hadoop',
  'airflow','dbt','looker','data analysis','statistics','nlp','computer vision',
  // Tools & Others
  'git','github','gitlab','jira','confluence','trello','notion','slack','postman',
  'swagger','agile','scrum','kanban','tdd','unit testing','selenium','cypress',
  'product management','ux research','user research','design thinking','a/b testing',
  'seo','google analytics','digital marketing','content management',
];

// Pattern untuk deteksi pengalaman
const EXP_PATTERNS = [
  /(\d+)\s*\+?\s*tahun?\s*(pengalaman|bekerja|kerja|experience)/i,
  /(\d+)\s*\+?\s*year[s]?\s*(of\s*)?(experience|working)/i,
  /pengalaman\s*(\d+)\s*\+?\s*tahun/i,
  /experience[:\s]+(\d+)\s*\+?\s*year/i,
];

// Pattern untuk deteksi nama
const NAME_PATTERNS = [
  /^([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3})\s*$/m,
];

// Pattern untuk deteksi title/posisi
const TITLE_KEYWORDS = [
  'frontend developer','backend developer','full stack developer','fullstack developer',
  'software engineer','software developer','web developer','mobile developer',
  'data scientist','data analyst','data engineer','machine learning engineer',
  'ui/ux designer','product designer','graphic designer','ui designer','ux designer',
  'product manager','project manager','scrum master','business analyst',
  'devops engineer','cloud engineer','site reliability engineer','sre',
  'android developer','ios developer','flutter developer','react native developer',
  'qa engineer','quality assurance','test engineer','automation engineer',
  'system analyst','it consultant','network engineer','security engineer',
];

// Deteksi tahun dari teks (untuk hitung pengalaman dari riwayat kerja)
function detectExperienceYears(text) {
  // Coba pattern langsung
  for (const pattern of EXP_PATTERNS) {
    const match = text.match(pattern);
    if (match) return parseInt(match[1]);
  }

  // Hitung dari rentang tahun kerja (misal: 2020 - 2023)
  const yearRanges = text.matchAll(/20(\d{2})\s*[-–—]\s*(20(\d{2})|sekarang|present|now)/gi);
  let totalMonths = 0;
  const currentYear = new Date().getFullYear();
  for (const match of yearRanges) {
    const start = 2000 + parseInt(match[1]);
    const end = match[3] ? 2000 + parseInt(match[3]) : currentYear;
    if (start >= 2000 && end <= currentYear + 1 && end >= start) {
      totalMonths += (end - start) * 12;
    }
  }
  if (totalMonths > 0) return Math.round(totalMonths / 12);

  return 0;
}

// Deteksi skill dari teks
function detectSkills(text) {
  const lower = text.toLowerCase();
  const found = new Set();

  ALL_SKILLS.forEach(skill => {
    // Escape special chars untuk regex
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<![a-z])${escaped}(?![a-z])`, 'i');
    if (regex.test(lower)) found.add(skill);
  });

  return [...found];
}

// Deteksi title/posisi
function detectTitle(text) {
  const lower = text.toLowerCase();
  for (const title of TITLE_KEYWORDS) {
    if (lower.includes(title)) {
      return title.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }
  return '';
}

// Deteksi nama dari baris pertama CV
function detectName(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  // Cek 5 baris pertama untuk nama
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    // Nama biasanya 2-4 kata, huruf kapital, tidak ada angka
    if (/^[A-Za-z\s]{3,40}$/.test(line) && line.split(' ').length >= 2 && line.split(' ').length <= 5) {
      // Bukan keyword umum
      const lower = line.toLowerCase();
      if (!['curriculum vitae','resume','cv','daftar riwayat hidup','biodata'].includes(lower)) {
        return line.trim();
      }
    }
  }
  return '';
}

// Deteksi lokasi
function detectLocation(text) {
  const cities = ['jakarta','bandung','surabaya','yogyakarta','medan','semarang','bali','denpasar','malang','bekasi','depok','tangerang','bogor','makassar','palembang','remote'];
  const lower = text.toLowerCase();
  for (const city of cities) {
    if (lower.includes(city)) {
      return city.charAt(0).toUpperCase() + city.slice(1);
    }
  }
  return '';
}

// Main parser function
function parseCV(text) {
  const result = {
    name: detectName(text),
    title: detectTitle(text),
    experience: detectExperienceYears(text),
    skills: detectSkills(text),
    location: detectLocation(text),
    rawText: text.slice(0, 500) + (text.length > 500 ? '...' : ''),
  };
  return result;
}

// ===== FILE READER =====
async function handleCVUpload(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  showUploadStatus('loading', `Membaca file ${file.name}...`);

  try {
    let text = '';

    if (ext === 'txt') {
      text = await readAsText(file);
    } else if (ext === 'pdf') {
      text = await readPDF(file);
    } else if (ext === 'docx') {
      text = await readDOCX(file);
    } else {
      showUploadStatus('error', 'Format tidak didukung. Gunakan PDF, DOCX, atau TXT.');
      return;
    }

    if (!text || text.trim().length < 50) {
      showUploadStatus('error', 'Teks CV terlalu pendek atau tidak bisa dibaca. Coba format TXT.');
      return;
    }

    const parsed = parseCV(text);
    applyParsedCV(parsed);
    showUploadStatus('success', `✅ CV berhasil dianalisis! Ditemukan ${parsed.skills.length} skill.`);

  } catch (err) {
    console.error(err);
    showUploadStatus('error', 'Gagal membaca file. Coba format TXT atau DOCX.');
  }
}

function readAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file, 'UTF-8');
  });
}

async function readPDF(file) {
  // Gunakan PDF.js dari CDN
  if (!window.pdfjsLib) {
    showUploadStatus('loading', 'Memuat PDF reader...');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map(item => item.str).join(' ') + '\n';
  }

  return fullText;
}

async function readDOCX(file) {
  // Gunakan Mammoth.js dari CDN
  if (!window.mammoth) {
    showUploadStatus('loading', 'Memuat DOCX reader...');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
  }

  const arrayBuffer = await file.arrayBuffer();
  const result = await window.mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// Generate keyword terbaik dari hasil parsing CV
function generateSearchKeywords(parsed) {
  const keywords = [];

  // 1. Title/posisi sebagai keyword utama
  if (parsed.title) keywords.push(parsed.title);

  // 2. Skill paling relevan berdasarkan kategori dominan
  const skillsByCategory = {};
  Object.entries(SKILL_CATEGORIES).forEach(([cat, catSkills]) => {
    const matched = parsed.skills.filter(s => catSkills.includes(s.toLowerCase()));
    if (matched.length) skillsByCategory[cat] = matched;
  });

  // Ambil kategori dengan skill terbanyak
  const sorted = Object.entries(skillsByCategory).sort((a, b) => b[1].length - a[1].length);
  if (sorted.length) {
    const [topCat, topSkills] = sorted[0];
    // Keyword kombinasi: title + skill utama
    const mainSkill = topSkills[0];
    if (parsed.title && mainSkill) keywords.push(`${parsed.title} ${mainSkill}`);
    // Keyword skill saja (top 3)
    topSkills.slice(0, 3).forEach(s => keywords.push(s));
  }

  // 3. Keyword berdasarkan level
  const levelMap = { fresh: 'Fresh Graduate', junior: 'Junior', mid: '', senior: 'Senior' };
  const levelPrefix = levelMap[parsed.jobLevel] || '';
  if (levelPrefix && parsed.title) keywords.push(`${levelPrefix} ${parsed.title}`);

  // Deduplicate & bersihkan
  return [...new Set(keywords.filter(Boolean))].slice(0, 5);
}

// Apply hasil parsing ke form profil + auto search semua platform
function applyParsedCV(parsed) {
  if (parsed.name) document.getElementById('prof-name').value = parsed.name;
  if (parsed.title) document.getElementById('prof-title').value = parsed.title;
  if (parsed.experience > 0) document.getElementById('prof-experience').value = parsed.experience;
  if (parsed.skills.length) {
    const existing = document.getElementById('prof-skills').value
      .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const merged = [...new Set([...existing, ...parsed.skills])];
    document.getElementById('prof-skills').value = merged.join(', ');
  }

  // Auto set level
  const exp = parsed.experience;
  const levelEl = document.getElementById('prof-level');
  if (exp === 0) { levelEl.value = 'fresh'; parsed.jobLevel = 'fresh'; }
  else if (exp <= 2) { levelEl.value = 'junior'; parsed.jobLevel = 'junior'; }
  else if (exp <= 5) { levelEl.value = 'mid'; parsed.jobLevel = 'mid'; }
  else { levelEl.value = 'senior'; parsed.jobLevel = 'senior'; }

  // Generate keywords
  const keywords = generateSearchKeywords(parsed);
  const primaryKeyword = keywords[0] || parsed.title || (parsed.skills[0] || '');

  // Auto-save profil
  const profile = {
    name: parsed.name,
    title: parsed.title,
    experience: parsed.experience,
    skills: parsed.skills,
    preferredLocations: parsed.location ? [parsed.location] : [],
    preferredSalaryMin: 0,
    preferredSalaryMax: 0,
    workType: 'any',
    jobLevel: levelEl.value,
  };
  saveProfile(profile);

  // Tampilkan preview + hasil pencarian per platform
  document.getElementById('cv-preview').innerHTML = `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-top:12px">
      <div style="font-size:13px;font-weight:600;margin-bottom:10px;color:#1e293b">📄 Hasil Ekstraksi CV</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;font-size:13px;margin-bottom:12px">
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:10px">
          <div style="font-size:10px;color:var(--muted);margin-bottom:2px">NAMA</div>
          <div style="font-weight:600">${parsed.name || '-'}</div>
        </div>
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:10px">
          <div style="font-size:10px;color:var(--muted);margin-bottom:2px">POSISI</div>
          <div style="font-weight:600">${parsed.title || '-'}</div>
        </div>
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:10px">
          <div style="font-size:10px;color:var(--muted);margin-bottom:2px">PENGALAMAN</div>
          <div style="font-weight:600">${parsed.experience} tahun</div>
        </div>
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:10px">
          <div style="font-size:10px;color:var(--muted);margin-bottom:2px">SKILL</div>
          <div style="font-weight:600">${parsed.skills.length} terdeteksi</div>
        </div>
      </div>
      ${parsed.skills.length ? `
        <div style="margin-bottom:12px">
          <div style="font-size:11px;color:var(--muted);margin-bottom:6px">Skill terdeteksi:</div>
          <div style="display:flex;flex-wrap:wrap;gap:5px">
            ${parsed.skills.map(s => `<span style="background:#dbeafe;color:#1d4ed8;font-size:11px;padding:2px 8px;border-radius:6px">${s}</span>`).join('')}
          </div>
        </div>` : ''}
      <div style="margin-bottom:12px">
        <div style="font-size:11px;color:var(--muted);margin-bottom:6px">🔑 Keyword pencarian yang digunakan:</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${keywords.map((k, i) => `<span style="background:${i===0?'#2563eb':'#e2e8f0'};color:${i===0?'#fff':'#475569'};font-size:12px;padding:4px 10px;border-radius:6px;font-weight:600">${i===0?'⭐ ':''} ${k}</span>`).join('')}
        </div>
      </div>
    </div>
    <div id="platform-search-results"></div>`;

  // Render hasil pencarian per platform
  renderPlatformSearchResults(primaryKeyword, keywords, parsed);
}

function renderPlatformSearchResults(primaryKeyword, keywords, parsed) {
  const container = document.getElementById('platform-search-results');
  if (!primaryKeyword) { container.innerHTML = ''; return; }

  // Tentukan keyword terbaik per platform berdasarkan karakteristik platform
  const platformKeywords = {
    linkedin:   keywords.find(k => k.includes('Senior') || k.includes('Junior')) || primaryKeyword,
    jobstreet:  primaryKeyword,
    talentics:  parsed.skills.slice(0,2).join(' ') || primaryKeyword,
    glints:     keywords.find(k => k.length < 25) || primaryKeyword,
    kalibrr:    primaryKeyword,
    indeed:     primaryKeyword,
    techinasia: parsed.skills[0] || primaryKeyword,
    karir:      primaryKeyword,
    jobplanet:  primaryKeyword,
    urbanhire:  primaryKeyword,
    remote:     parsed.skills[0] || primaryKeyword,
    freelancer: parsed.skills[0] || primaryKeyword,
  };

  container.innerHTML = `
    <div style="margin-top:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div style="font-size:14px;font-weight:700;color:#1e293b">🚀 Hasil Pencarian Otomatis di Semua Platform</div>
        <span style="font-size:12px;color:var(--muted)">Keyword: "${primaryKeyword}"</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">
        ${JOB_SOURCES.map(src => {
          const kw = platformKeywords[src.id] || primaryKeyword;
          const searchUrl = src.searchUrl + encodeURIComponent(kw);
          const isTop = src.rating >= 5;
          return `
          <div style="background:#fff;border:1px solid ${isTop ? '#bfdbfe' : '#e2e8f0'};border-radius:12px;padding:16px;position:relative;transition:box-shadow .2s"
            onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,.08)'" onmouseout="this.style.boxShadow='none'">
            ${isTop ? '<span style="position:absolute;top:10px;right:10px;background:#fef3c7;color:#92400e;font-size:10px;padding:2px 7px;border-radius:99px;font-weight:600">⭐ TOP</span>' : ''}
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
              <div style="width:36px;height:36px;border-radius:8px;background:${src.bg};display:flex;align-items:center;justify-content:center;font-size:18px">${src.icon}</div>
              <div>
                <div style="font-weight:700;font-size:14px">${src.name}</div>
                <div style="font-size:11px;color:var(--muted)">${'⭐'.repeat(src.rating)}</div>
              </div>
            </div>
            <div style="background:#f8fafc;border-radius:6px;padding:8px;margin-bottom:12px">
              <div style="font-size:10px;color:var(--muted);margin-bottom:2px">KEYWORD YANG DIGUNAKAN</div>
              <div style="font-size:12px;font-weight:600;color:#2563eb">"${kw}"</div>
            </div>
            <a href="${searchUrl}" target="_blank"
              style="display:flex;align-items:center;justify-content:center;gap:6px;background:#2563eb;color:#fff;padding:9px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;transition:background .2s"
              onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">
              🔍 Cari di ${src.name}
            </a>
          </div>`;
        }).join('')}
      </div>
      <div style="margin-top:12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;font-size:12px;color:#15803d">
        ✅ Profil otomatis tersimpan. Klik <strong>🤖 Rekomendasi AI</strong> di sidebar untuk melihat skor kecocokan per lowongan.
      </div>
    </div>`;
}

function showUploadStatus(type, msg) {
  const el = document.getElementById('upload-status');
  const colors = { loading: '#1d4ed8', success: '#15803d', error: '#dc2626' };
  const icons = { loading: '⏳', success: '✅', error: '❌' };
  el.innerHTML = `<div style="font-size:13px;color:${colors[type]};padding:8px 0">${icons[type]} ${msg}</div>`;
}
