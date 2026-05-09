// ===== RECOMMENDATION ENGINE =====

function getProfile() {
  return JSON.parse(localStorage.getItem('userProfile')) || DEFAULT_PROFILE;
}

function saveProfile(profile) {
  localStorage.setItem('userProfile', JSON.stringify(profile));
}

// Hitung match score 0-100
function calcMatchScore(job, profile) {
  if (!profile.skills.length && !profile.preferredRoles.length) return 0;

  let score = 0;
  const breakdown = {};

  // 1. Skill Match (bobot 40%)
  const userSkills = profile.skills.map(s => s.toLowerCase());
  const jobSkills = job.skills.map(s => s.toLowerCase());
  const matchedSkills = jobSkills.filter(s => userSkills.includes(s));
  const skillScore = jobSkills.length ? (matchedSkills.length / jobSkills.length) * 100 : 0;
  score += skillScore * 0.40;
  breakdown.skill = { score: Math.round(skillScore), matched: matchedSkills, total: jobSkills.length };

  // 2. Level Match (bobot 25%)
  let levelScore = 0;
  const exp = parseInt(profile.experience) || 0;
  if (profile.jobLevel === 'any' || job.level === 'any') {
    levelScore = 80;
  } else if (profile.jobLevel === job.level) {
    levelScore = 100;
  } else {
    // Toleransi 1 level
    const levels = ['fresh', 'junior', 'mid', 'senior'];
    const userIdx = levels.indexOf(profile.jobLevel);
    const jobIdx = levels.indexOf(job.level);
    if (Math.abs(userIdx - jobIdx) === 1) levelScore = 50;
  }
  // Validasi experience vs level
  if (job.level === 'fresh' && exp <= 1) levelScore = Math.max(levelScore, 90);
  if (job.level === 'junior' && exp >= 1 && exp <= 3) levelScore = Math.max(levelScore, 90);
  if (job.level === 'mid' && exp >= 2 && exp <= 6) levelScore = Math.max(levelScore, 90);
  if (job.level === 'senior' && exp >= 5) levelScore = Math.max(levelScore, 90);
  score += levelScore * 0.25;
  breakdown.level = Math.round(levelScore);

  // 3. Work Type Match (bobot 15%)
  let workScore = 0;
  if (profile.workType === 'any' || job.workType === 'any') workScore = 80;
  else if (profile.workType === job.workType) workScore = 100;
  else if (profile.workType === 'hybrid') workScore = 60;
  score += workScore * 0.15;
  breakdown.workType = Math.round(workScore);

  // 4. Salary Match (bobot 15%)
  let salaryScore = 0;
  if (!profile.preferredSalaryMin && !profile.preferredSalaryMax) {
    salaryScore = 70;
  } else {
    const userMin = parseInt(profile.preferredSalaryMin) || 0;
    const userMax = parseInt(profile.preferredSalaryMax) || 999;
    // Overlap range
    const overlapMin = Math.max(userMin, job.salaryMin);
    const overlapMax = Math.min(userMax, job.salaryMax);
    if (overlapMax >= overlapMin) {
      const overlap = overlapMax - overlapMin;
      const userRange = userMax - userMin || 1;
      salaryScore = Math.min(100, (overlap / userRange) * 100 + 40);
    } else if (job.salaryMax >= userMin * 0.8) {
      salaryScore = 40; // Mendekati range
    }
  }
  score += salaryScore * 0.15;
  breakdown.salary = Math.round(salaryScore);

  // 5. Location Match (bobot 5%)
  let locScore = 0;
  if (!profile.preferredLocations.length || job.workType === 'remote') {
    locScore = 80;
  } else {
    const userLocs = profile.preferredLocations.map(l => l.toLowerCase());
    if (userLocs.some(l => job.location.toLowerCase().includes(l))) locScore = 100;
    else locScore = 30;
  }
  score += locScore * 0.05;
  breakdown.location = Math.round(locScore);

  return { total: Math.round(Math.min(score, 100)), breakdown };
}

// Tentukan label kandidat
function getCandidateLabel(score) {
  if (score >= 85) return { label: '🏆 Kandidat Kuat', color: '#15803d', bg: '#dcfce7' };
  if (score >= 70) return { label: '✅ Cocok', color: '#1d4ed8', bg: '#dbeafe' };
  if (score >= 50) return { label: '🔶 Cukup Cocok', color: '#92400e', bg: '#fef3c7' };
  return { label: '📌 Perlu Persiapan', color: '#64748b', bg: '#f1f5f9' };
}

// Generate rekomendasi
function generateRecommendations(profile, limit = 20) {
  if (!profile.skills.length) return [];

  return JOB_DATABASE
    .map(job => {
      const match = calcMatchScore(job, profile);
      return { ...job, matchScore: match.total, breakdown: match.breakdown };
    })
    .filter(j => j.matchScore > 20)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

// Analisis profil & saran
function analyzeProfile(profile) {
  const suggestions = [];
  const strengths = [];

  if (!profile.skills.length) {
    suggestions.push('Tambahkan skill kamu agar sistem bisa memberikan rekomendasi yang akurat.');
    return { suggestions, strengths };
  }

  const userSkills = profile.skills.map(s => s.toLowerCase());
  const exp = parseInt(profile.experience) || 0;

  // Deteksi kategori skill dominan
  let maxCat = '', maxCount = 0;
  Object.entries(SKILL_CATEGORIES).forEach(([cat, skills]) => {
    const count = skills.filter(s => userSkills.includes(s)).length;
    if (count > maxCount) { maxCount = count; maxCat = cat; }
  });

  if (maxCat) strengths.push(`Skill dominan kamu di bidang ${maxCat.toUpperCase()}`);

  // Saran berdasarkan skill gap
  const catLabels = { frontend: 'Frontend', backend: 'Backend', mobile: 'Mobile', data: 'Data', devops: 'DevOps', design: 'Design', product: 'Product' };
  if (maxCat === 'frontend' && !userSkills.includes('typescript')) suggestions.push('Tambahkan TypeScript untuk meningkatkan peluang di posisi Frontend senior.');
  if (maxCat === 'backend' && !userSkills.includes('docker')) suggestions.push('Pelajari Docker/Kubernetes untuk posisi Backend yang lebih kompetitif.');
  if (maxCat === 'data' && !userSkills.includes('machine learning')) suggestions.push('Tambahkan Machine Learning untuk membuka peluang Data Scientist.');
  if (maxCat === 'frontend' && !userSkills.some(s => ['react','vue','angular'].includes(s))) suggestions.push('Kuasai salah satu framework (React/Vue/Angular) untuk meningkatkan daya saing.');

  // Saran level
  if (exp === 0 && profile.jobLevel === 'senior') suggestions.push('Level Senior biasanya membutuhkan 5+ tahun pengalaman. Pertimbangkan melamar posisi Junior/Mid terlebih dahulu.');
  if (exp >= 5 && profile.jobLevel === 'junior') suggestions.push('Dengan pengalaman ' + exp + ' tahun, kamu layak melamar posisi Senior atau Lead.');

  // Saran salary
  if (profile.preferredSalaryMin > 30 && exp < 3) suggestions.push('Range gaji yang diharapkan cukup tinggi untuk pengalaman ' + exp + ' tahun. Pertimbangkan menyesuaikan ekspektasi.');

  if (!suggestions.length) strengths.push('Profil kamu sudah sangat kompetitif!');

  return { suggestions, strengths };
}

// ===== RENDER PROFILE PAGE =====
function renderProfilePage() {
  const profile = getProfile();

  document.getElementById('prof-name').value = profile.name || '';
  document.getElementById('prof-title').value = profile.title || '';
  document.getElementById('prof-experience').value = profile.experience || 0;
  document.getElementById('prof-skills').value = profile.skills.join(', ');
  document.getElementById('prof-locations').value = profile.preferredLocations.join(', ');
  document.getElementById('prof-salary-min').value = profile.preferredSalaryMin || '';
  document.getElementById('prof-salary-max').value = profile.preferredSalaryMax || '';
  document.getElementById('prof-worktype').value = profile.workType || 'any';
  document.getElementById('prof-level').value = profile.jobLevel || 'any';

  renderRecommendations();
}

function saveProfileForm() {
  const skillsRaw = document.getElementById('prof-skills').value;
  const locsRaw = document.getElementById('prof-locations').value;

  const profile = {
    name: document.getElementById('prof-name').value.trim(),
    title: document.getElementById('prof-title').value.trim(),
    experience: parseInt(document.getElementById('prof-experience').value) || 0,
    skills: skillsRaw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
    preferredLocations: locsRaw.split(',').map(s => s.trim()).filter(Boolean),
    preferredSalaryMin: parseInt(document.getElementById('prof-salary-min').value) || 0,
    preferredSalaryMax: parseInt(document.getElementById('prof-salary-max').value) || 0,
    workType: document.getElementById('prof-worktype').value,
    jobLevel: document.getElementById('prof-level').value,
  };

  saveProfile(profile);
  notify('✅ Profil tersimpan! Rekomendasi diperbarui.');
  renderRecommendations();
  renderProfileAnalysis(profile);
}

function renderRecommendations() {
  const profile = getProfile();
  const recs = generateRecommendations(profile);
  const container = document.getElementById('rec-list');

  if (!profile.skills.length) {
    container.innerHTML = `<div class="empty-state"><i>🎯</i><p>Isi profil & skill kamu dulu untuk mendapatkan rekomendasi lowongan yang dipersonalisasi.</p></div>`;
    return;
  }

  if (!recs.length) {
    container.innerHTML = `<div class="empty-state"><i>🔍</i><p>Tidak ada lowongan yang cocok. Coba perbarui skill atau preferensi kamu.</p></div>`;
    return;
  }

  const srcMap = {};
  JOB_SOURCES.forEach(s => srcMap[s.id] = s);

  container.innerHTML = recs.map((job, i) => {
    const label = getCandidateLabel(job.matchScore);
    const src = srcMap[job.source];
    const scoreColor = job.matchScore >= 85 ? '#15803d' : job.matchScore >= 70 ? '#1d4ed8' : job.matchScore >= 50 ? '#d97706' : '#64748b';

    return `
    <div class="rec-card" style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:18px;margin-bottom:12px;transition:box-shadow .2s" onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,.08)'" onmouseout="this.style.boxShadow='none'">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span style="font-size:13px;font-weight:500;color:var(--muted)">#${i + 1}</span>
            ${job.hot ? '<span style="background:#fef3c7;color:#92400e;font-size:10px;padding:2px 7px;border-radius:99px;font-weight:600">🔥 HOT</span>' : ''}
            <span style="background:${label.bg};color:${label.color};font-size:11px;padding:2px 8px;border-radius:99px;font-weight:600">${label.label}</span>
          </div>
          <div style="font-size:16px;font-weight:700;margin-bottom:2px">${job.title}</div>
          <div style="font-size:13px;color:var(--muted);margin-bottom:8px">${job.company} · ${job.location} · ${job.workType}</div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px">
            ${job.skills.map(s => {
              const userSkills = profile.skills.map(x => x.toLowerCase());
              const matched = userSkills.includes(s.toLowerCase());
              return `<span style="font-size:11px;padding:2px 8px;border-radius:6px;background:${matched ? '#dcfce7' : '#f1f5f9'};color:${matched ? '#15803d' : '#64748b'};font-weight:${matched ? '600' : '400'}">${s}</span>`;
            }).join('')}
          </div>
          <div style="display:flex;gap:16px;font-size:12px;color:var(--muted)">
            <span>💰 ${job.salaryMin}-${job.salaryMax}jt</span>
            <span>📊 Level: ${job.level}</span>
            <span>${src ? src.icon + ' ' + src.name : job.source}</span>
          </div>
        </div>
        <div style="text-align:center;min-width:80px">
          <div style="font-size:28px;font-weight:800;color:${scoreColor};line-height:1">${job.matchScore}%</div>
          <div style="font-size:10px;color:var(--muted);margin-bottom:8px">Match Score</div>
          <div style="background:#f1f5f9;border-radius:99px;height:5px;overflow:hidden;margin-bottom:10px">
            <div style="height:100%;border-radius:99px;background:${scoreColor};width:${job.matchScore}%;transition:width .5s"></div>
          </div>
          <a href="${job.url}" target="_blank" class="btn btn-primary btn-sm" style="width:100%;justify-content:center;font-size:11px">Lamar →</a>
        </div>
      </div>
      <div style="margin-top:10px;padding-top:10px;border-top:1px solid #f1f5f9;display:flex;gap:16px;font-size:11px;color:var(--muted)">
        <span>🎯 Skill: <strong>${job.breakdown.skill.matched.length}/${job.breakdown.skill.total}</strong> cocok</span>
        <span>📈 Level: <strong>${job.breakdown.level}%</strong></span>
        <span>🏠 Work Type: <strong>${job.breakdown.workType}%</strong></span>
        <span>💵 Gaji: <strong>${job.breakdown.salary}%</strong></span>
      </div>
    </div>`;
  }).join('');

  renderProfileAnalysis(profile);
}

function renderProfileAnalysis(profile) {
  const { suggestions, strengths } = analyzeProfile(profile);
  const recs = generateRecommendations(profile);
  const strongCount = recs.filter(r => r.matchScore >= 85).length;
  const matchCount = recs.filter(r => r.matchScore >= 70).length;

  document.getElementById('analysis-box').innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:16px">
      <div style="background:#dcfce7;border-radius:10px;padding:14px;text-align:center">
        <div style="font-size:24px;font-weight:800;color:#15803d">${strongCount}</div>
        <div style="font-size:12px;color:#15803d">Kandidat Kuat</div>
      </div>
      <div style="background:#dbeafe;border-radius:10px;padding:14px;text-align:center">
        <div style="font-size:24px;font-weight:800;color:#1d4ed8">${matchCount}</div>
        <div style="font-size:12px;color:#1d4ed8">Lowongan Cocok</div>
      </div>
      <div style="background:#fef3c7;border-radius:10px;padding:14px;text-align:center">
        <div style="font-size:24px;font-weight:800;color:#92400e">${profile.skills.length}</div>
        <div style="font-size:12px;color:#92400e">Skill Terdaftar</div>
      </div>
    </div>
    ${strengths.length ? `<div style="margin-bottom:12px">${strengths.map(s => `<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:6px;font-size:13px"><span>💪</span><span>${s}</span></div>`).join('')}</div>` : ''}
    ${suggestions.length ? `<div style="background:#fff7ed;border-radius:8px;padding:12px"><div style="font-size:12px;font-weight:600;color:#92400e;margin-bottom:8px">💡 Saran untuk meningkatkan peluang:</div>${suggestions.map(s => `<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:6px;font-size:13px;color:#78350f"><span>→</span><span>${s}</span></div>`).join('')}</div>` : ''}
  `;
}
