// State
let applications = JSON.parse(localStorage.getItem('jobApplications')) || SAMPLE_APPLICATIONS;
let editingId = null;
let currentFilter = { status: '', source: '', search: '' };

// Save
const save = () => localStorage.setItem('jobApplications', JSON.stringify(applications));

// Notify
function notify(msg) {
  const el = document.getElementById('notification');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

// Navigate
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelector(`[data-page="${page}"]`).classList.add('active');
  document.getElementById('page-title').textContent = {
    dashboard: 'Dashboard', tracker: 'Job Tracker', sources: 'Sumber Lowongan',
    search: 'Cari Lowongan', profile: 'Profil Saya', recommend: '🤖 Rekomendasi AI'
  }[page];
  if (page === 'dashboard') renderDashboard();
  if (page === 'tracker') renderTracker();
  if (page === 'sources') renderSources();
  if (page === 'profile') renderProfilePage();
  if (page === 'recommend') renderRecommendations();
}

// Badge
function badge(status) {
  const map = { Applied: 'applied', Test: 'test', Interview: 'interview', Offer: 'offer', Rejected: 'rejected', Ghosted: 'ghosted' };
  return `<span class="badge badge-${map[status] || 'applied'}">${status}</span>`;
}

// Priority color
function priorityColor(p) {
  return { High: '#dc2626', Medium: '#d97706', Low: '#16a34a' }[p] || '#64748b';
}

// ===== DASHBOARD =====
function renderDashboard() {
  const total = applications.length;
  const byStatus = s => applications.filter(a => a.status === s).length;
  const applied = byStatus('Applied'), interview = byStatus('Interview');
  const offer = byStatus('Offer'), rejected = byStatus('Rejected');
  const test = byStatus('Test'), ghosted = byStatus('Ghosted');
  const rate = total ? Math.round((offer / total) * 100) : 0;

  // Stat cards — clickable
  const statCards = [
    { id: 'stat-total',     val: total,     filter: '',           label: 'Total Lamaran' },
    { id: 'stat-interview', val: interview, filter: 'Interview',  label: 'Interview' },
    { id: 'stat-offer',     val: offer,     filter: 'Offer',      label: 'Offer' },
    { id: 'stat-rejected',  val: rejected,  filter: 'Rejected',   label: 'Ditolak' },
  ];
  statCards.forEach(({ id, val, filter, label }) => {
    document.getElementById(id).textContent = val;
    const card = document.getElementById(id).closest('.stat-card');
    card.style.cursor = 'pointer';
    card.title = `Klik untuk lihat detail ${label}`;
    card.onclick = () => openDetailModal(filter || null, label);
  });
  document.getElementById('stat-rate').textContent = rate + '%';
  const rateCard = document.getElementById('stat-rate').closest('.stat-card');
  rateCard.style.cursor = 'pointer';
  rateCard.title = 'Klik untuk lihat detail Success Rate';
  rateCard.onclick = () => openDetailModal('rate', 'Success Rate');

  // Chart — bar clickable
  const chartData = [
    { label: 'Applied',  val: applied,   color: '#3b82f6', status: 'Applied' },
    { label: 'Test',     val: test,      color: '#8b5cf6', status: 'Test' },
    { label: 'Interview',val: interview, color: '#f59e0b', status: 'Interview' },
    { label: 'Offer',    val: offer,     color: '#10b981', status: 'Offer' },
    { label: 'Rejected', val: rejected,  color: '#ef4444', status: 'Rejected' },
    { label: 'Ghosted',  val: ghosted,   color: '#94a3b8', status: 'Ghosted' },
  ];
  const maxVal = Math.max(...chartData.map(d => d.val), 1);
  document.getElementById('chart').innerHTML = chartData.map(d => `
    <div class="bar-item" style="cursor:pointer" onclick="openDetailModal('${d.status}','${d.label}')" title="Lihat detail ${d.label}">
      <span class="bar-val">${d.val}</span>
      <div class="bar" style="height:${(d.val / maxVal) * 90}px;background:${d.color}"></div>
      <span class="bar-label">${d.label}</span>
    </div>`).join('');

  // Source breakdown — clickable
  const srcCount = {};
  applications.forEach(a => { srcCount[a.source] = (srcCount[a.source] || 0) + 1; });
  const srcHtml = Object.entries(srcCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([src, cnt]) => {
    const s = JOB_SOURCES.find(j => j.id === src);
    const pct = Math.round((cnt / total) * 100);
    return `<div style="margin-bottom:14px;cursor:pointer" onclick="openDetailModal('source:${src}','${s ? s.name : src}')" title="Lihat detail">
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px">
        <span>${s ? s.icon + ' ' + s.name : src}</span>
        <span style="color:var(--muted)">${cnt} lamaran (${pct}%) →</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');
  document.getElementById('source-breakdown').innerHTML = srcHtml || '<p style="color:var(--muted);font-size:13px">Belum ada data</p>';

  // Recent
  const recent = [...applications].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  document.getElementById('recent-list').innerHTML = recent.map(a => `
    <tr style="cursor:pointer" onclick="openAppDetail(${a.id})" title="Klik untuk lihat detail">
      <td><strong>${a.company}</strong><br><span style="font-size:12px;color:var(--muted)">${a.position}</span></td>
      <td>${badge(a.status)}</td>
      <td style="font-size:12px;color:var(--muted)">${a.date}</td>
      <td><span style="font-size:11px;color:${priorityColor(a.priority)};font-weight:600">${a.priority}</span></td>
    </tr>`).join('') || '<tr><td colspan="4" class="empty-state"><p>Belum ada lamaran</p></td></tr>';
}

// ===== DETAIL MODAL =====
function openDetailModal(filter, title) {
  let data = [];

  if (filter === 'rate') {
    // Tampilkan perbandingan semua status
    const total = applications.length;
    const groups = ['Applied','Test','Interview','Offer','Rejected','Ghosted'];
    const colors = { Applied:'#3b82f6', Test:'#8b5cf6', Interview:'#f59e0b', Offer:'#10b981', Rejected:'#ef4444', Ghosted:'#94a3b8' };
    const rows = groups.map(s => {
      const cnt = applications.filter(a => a.status === s).length;
      const pct = total ? Math.round((cnt / total) * 100) : 0;
      return `<tr>
        <td>${badge(s)}</td>
        <td style="font-weight:700">${cnt}</td>
        <td style="width:160px">
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${colors[s]}"></div></div>
        </td>
        <td style="font-size:12px;color:var(--muted)">${pct}%</td>
      </tr>`;
    }).join('');
    showDetailModal('📊 Ringkasan Success Rate', `
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:48px;font-weight:800;color:#0891b2">${total ? Math.round((applications.filter(a=>a.status==='Offer').length/total)*100) : 0}%</div>
        <div style="color:var(--muted);font-size:13px">Offer / Total Lamaran</div>
      </div>
      <table style="width:100%"><tbody>${rows}</tbody></table>`);
    return;
  }

  if (filter && filter.startsWith('source:')) {
    const srcId = filter.replace('source:', '');
    data = applications.filter(a => a.source === srcId);
  } else if (filter) {
    data = applications.filter(a => a.status === filter);
  } else {
    data = [...applications];
  }

  data = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));

  const rows = data.map(a => {
    const src = JOB_SOURCES.find(j => j.id === a.source);
    return `<tr style="cursor:pointer" onclick="closeDetailModal();openAppDetail(${a.id})">
      <td><strong>${a.company}</strong><br><span style="font-size:12px;color:var(--muted)">${a.position}</span></td>
      <td>${badge(a.status)}</td>
      <td style="font-size:12px;color:var(--muted)">${a.date}</td>
      <td style="font-size:12px">${src ? src.icon + ' ' + src.name : a.source}</td>
      <td><span style="font-size:11px;color:${priorityColor(a.priority)};font-weight:600">${a.priority}</span></td>
    </tr>`;
  }).join('');

  showDetailModal(
    `${title} <span style="font-size:14px;font-weight:400;color:var(--muted)">(${data.length} lamaran)</span>`,
    data.length
      ? `<div class="table-wrap"><table>
          <thead><tr><th>Perusahaan</th><th>Status</th><th>Tanggal</th><th>Sumber</th><th>Prioritas</th></tr></thead>
          <tbody>${rows}</tbody></table></div>`
      : `<div class="empty-state"><i>📭</i><p>Tidak ada lamaran di kategori ini.</p></div>`
  );
}

function openAppDetail(id) {
  const a = applications.find(x => x.id === id);
  if (!a) return;
  const src = JOB_SOURCES.find(j => j.id === a.source);
  showDetailModal(`🏢 ${a.company} — ${a.position}`, `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
      <div style="background:#f8fafc;border-radius:8px;padding:12px">
        <div style="font-size:11px;color:var(--muted);margin-bottom:4px">STATUS</div>
        <div>${badge(a.status)}</div>
      </div>
      <div style="background:#f8fafc;border-radius:8px;padding:12px">
        <div style="font-size:11px;color:var(--muted);margin-bottom:4px">PRIORITAS</div>
        <div style="font-weight:700;color:${priorityColor(a.priority)}">${a.priority}</div>
      </div>
      <div style="background:#f8fafc;border-radius:8px;padding:12px">
        <div style="font-size:11px;color:var(--muted);margin-bottom:4px">TANGGAL APPLY</div>
        <div style="font-size:13px;font-weight:600">${a.date}</div>
      </div>
      <div style="background:#f8fafc;border-radius:8px;padding:12px">
        <div style="font-size:11px;color:var(--muted);margin-bottom:4px">SUMBER</div>
        <div style="font-size:13px">${src ? src.icon + ' ' + src.name : a.source}</div>
      </div>
      <div style="background:#f8fafc;border-radius:8px;padding:12px">
        <div style="font-size:11px;color:var(--muted);margin-bottom:4px">GAJI</div>
        <div style="font-size:13px;font-weight:600">${a.salary || '-'}</div>
      </div>
      <div style="background:#f8fafc;border-radius:8px;padding:12px">
        <div style="font-size:11px;color:var(--muted);margin-bottom:4px">LOKASI</div>
        <div style="font-size:13px">${a.location || '-'}</div>
      </div>
    </div>
    ${a.notes ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px;margin-bottom:16px">
      <div style="font-size:11px;color:var(--muted);margin-bottom:4px">📝 CATATAN</div>
      <div style="font-size:13px;line-height:1.6">${a.notes}</div>
    </div>` : ''}
    ${a.url ? `<a href="${a.url}" target="_blank" class="btn btn-primary btn-sm">🔗 Buka Lowongan</a>` : ''}
    <button class="btn btn-outline btn-sm" style="margin-left:8px" onclick="closeDetailModal();openEdit(${a.id})">✏️ Edit</button>
    <button class="btn btn-danger btn-sm" style="margin-left:8px" onclick="closeDetailModal();deleteApp(${a.id})">🗑️ Hapus</button>
  `);
}

function showDetailModal(title, bodyHtml) {
  document.getElementById('detail-modal-title').innerHTML = title;
  document.getElementById('detail-modal-body').innerHTML = bodyHtml;
  document.getElementById('detail-modal').classList.add('open');
}

function closeDetailModal() {
  document.getElementById('detail-modal').classList.remove('open');
}

// ===== TRACKER =====
function renderTracker() {
  let data = [...applications];
  if (currentFilter.status) data = data.filter(a => a.status === currentFilter.status);
  if (currentFilter.source) data = data.filter(a => a.source === currentFilter.source);
  if (currentFilter.search) {
    const q = currentFilter.search.toLowerCase();
    data = data.filter(a => a.company.toLowerCase().includes(q) || a.position.toLowerCase().includes(q));
  }
  data.sort((a, b) => new Date(b.date) - new Date(a.date));

  document.getElementById('tracker-count').textContent = `${data.length} lamaran`;
  document.getElementById('tracker-table').innerHTML = data.length ? data.map(a => {
    const src = JOB_SOURCES.find(j => j.id === a.source);
    return `<tr>
      <td>
        <strong>${a.company}</strong><br>
        <span style="font-size:12px;color:var(--muted)">${a.position}</span>
      </td>
      <td>${badge(a.status)}</td>
      <td style="font-size:12px">${src ? src.icon + ' ' + src.name : a.source}</td>
      <td style="font-size:12px;color:var(--muted)">${a.date}</td>
      <td style="font-size:12px;color:var(--muted);max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.salary || '-'}</td>
      <td><span style="font-size:11px;color:${priorityColor(a.priority)};font-weight:600">${a.priority}</span></td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-outline btn-sm" onclick="openEdit(${a.id})">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="deleteApp(${a.id})">🗑️</button>
          ${a.url ? `<a href="${a.url}" target="_blank" class="btn btn-outline btn-sm">🔗</a>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('') : '<tr><td colspan="7"><div class="empty-state"><i>📭</i><p>Tidak ada lamaran ditemukan</p></div></td></tr>';
}

// ===== SOURCES =====
function renderSources() {
  document.getElementById('sources-grid').innerHTML = JOB_SOURCES.map(s => `
    <div class="source-card">
      <div class="source-header">
        <div class="source-icon" style="background:${s.bg}">${s.icon}</div>
        <div>
          <div class="source-name">${s.name}</div>
          <div style="font-size:11px;color:var(--muted)">${'⭐'.repeat(s.rating)}</div>
        </div>
      </div>
      <p class="source-desc">${s.desc}</p>
      <div class="source-tags">${s.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <div style="background:#f8fafc;border-radius:8px;padding:10px;margin-bottom:14px;font-size:12px;color:var(--muted)">
        💡 <em>${s.tips}</em>
      </div>
      <div style="display:flex;gap:8px">
        <a href="${s.url}" target="_blank" class="btn btn-primary btn-sm" style="flex:1;justify-content:center">Buka Platform</a>
        <button class="btn btn-outline btn-sm" onclick="searchOnSource('${s.id}')">🔍 Cari</button>
      </div>
    </div>`).join('');
}

function searchOnSource(sourceId) {
  const q = prompt('Masukkan kata kunci pencarian:');
  if (!q) return;
  const src = JOB_SOURCES.find(s => s.id === sourceId);
  if (src) window.open(src.searchUrl + encodeURIComponent(q), '_blank');
}

// ===== SEARCH PAGE =====
function renderSearchLinks() {
  const q = document.getElementById('global-search').value.trim();
  if (!q) { notify('Masukkan kata kunci terlebih dahulu'); return; }
  document.getElementById('search-results').innerHTML = `
    <div style="margin-bottom:16px;font-size:14px;color:var(--muted)">Hasil pencarian untuk: <strong>"${q}"</strong></div>
    <div class="sources-grid">
      ${JOB_SOURCES.map(s => `
        <a href="${s.searchUrl + encodeURIComponent(q)}" target="_blank" class="source-card" style="text-decoration:none;color:inherit;display:block">
          <div class="source-header">
            <div class="source-icon" style="background:${s.bg}">${s.icon}</div>
            <div>
              <div class="source-name">${s.name}</div>
              <div style="font-size:11px;color:var(--muted)">${'⭐'.repeat(s.rating)}</div>
            </div>
          </div>
          <p style="font-size:13px;color:var(--primary);font-weight:500">Cari "${q}" di ${s.name} →</p>
        </a>`).join('')}
    </div>`;
}

// ===== MODAL =====
function openAdd() {
  editingId = null;
  document.getElementById('modal-title').textContent = 'Tambah Lamaran';
  document.getElementById('app-form').reset();
  document.getElementById('app-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('modal').classList.add('open');
}

function openEdit(id) {
  const app = applications.find(a => a.id === id);
  if (!app) return;
  editingId = id;
  document.getElementById('modal-title').textContent = 'Edit Lamaran';
  document.getElementById('app-company').value = app.company;
  document.getElementById('app-position').value = app.position;
  document.getElementById('app-source').value = app.source;
  document.getElementById('app-status').value = app.status;
  document.getElementById('app-date').value = app.date;
  document.getElementById('app-salary').value = app.salary || '';
  document.getElementById('app-location').value = app.location || '';
  document.getElementById('app-priority').value = app.priority || 'Medium';
  document.getElementById('app-url').value = app.url || '';
  document.getElementById('app-notes').value = app.notes || '';
  document.getElementById('modal').classList.add('open');
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

function saveApp() {
  const company = document.getElementById('app-company').value.trim();
  const position = document.getElementById('app-position').value.trim();
  if (!company || !position) { notify('Nama perusahaan dan posisi wajib diisi!'); return; }

  const data = {
    company, position,
    source: document.getElementById('app-source').value,
    status: document.getElementById('app-status').value,
    date: document.getElementById('app-date').value,
    salary: document.getElementById('app-salary').value,
    location: document.getElementById('app-location').value,
    priority: document.getElementById('app-priority').value,
    url: document.getElementById('app-url').value,
    notes: document.getElementById('app-notes').value,
  };

  if (editingId) {
    const idx = applications.findIndex(a => a.id === editingId);
    applications[idx] = { ...applications[idx], ...data };
    notify('✅ Lamaran berhasil diperbarui!');
  } else {
    data.id = Date.now();
    applications.unshift(data);
    notify('✅ Lamaran berhasil ditambahkan!');
  }
  save();
  closeModal();
  renderTracker();
  renderDashboard();
}

function deleteApp(id) {
  if (!confirm('Hapus lamaran ini?')) return;
  applications = applications.filter(a => a.id !== id);
  save();
  renderTracker();
  renderDashboard();
  notify('🗑️ Lamaran dihapus');
}

// ===== FILTER =====
function applyFilter() {
  currentFilter.status = document.getElementById('filter-status').value;
  currentFilter.source = document.getElementById('filter-source').value;
  currentFilter.search = document.getElementById('filter-search').value;
  renderTracker();
}

// ===== EXPORT EXCEL =====
function exportCSV() {
  const headers = ['No','Perusahaan','Posisi','Sumber','Status','Tanggal Apply','Gaji','Lokasi','Prioritas','Catatan','Link'];

  const srcName = id => { const s = JOB_SOURCES.find(j => j.id === id); return s ? s.name : id; };

  const rows = applications.map((a, i) => [
    i + 1, a.company, a.position, srcName(a.source),
    a.status, a.date, a.salary || '', a.location || '',
    a.priority, a.notes || '', a.url || ''
  ]);

  // Buat HTML table — Excel bisa buka format ini langsung
  const toCell = (v, isHeader) => isHeader
    ? `<th style="background:#1e293b;color:#fff;padding:8px 12px;border:1px solid #334155;font-size:13px;white-space:nowrap">${v}</th>`
    : `<td style="padding:7px 12px;border:1px solid #e2e8f0;font-size:12px;vertical-align:middle">${v}</td>`;

  const statusColor = { Applied:'#dbeafe', Test:'#ede9fe', Interview:'#fef9c3', Offer:'#dcfce7', Rejected:'#fee2e2', Ghosted:'#f1f5f9' };
  const priorityColor = { High:'#fee2e2', Medium:'#fef9c3', Low:'#dcfce7' };

  const dataRows = rows.map((row, i) => {
    const status = row[4];
    const priority = row[8];
    const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
    const cells = row.map((v, ci) => {
      let cellStyle = `padding:7px 12px;border:1px solid #e2e8f0;font-size:12px;vertical-align:middle;background:${bg}`;
      if (ci === 4 && statusColor[v]) cellStyle += `;background:${statusColor[v]};font-weight:600`;
      if (ci === 8 && priorityColor[v]) cellStyle += `;background:${priorityColor[v]};font-weight:600`;
      return `<td style="${cellStyle}">${v}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  const now = new Date();
  const dateStr = `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}`;
  const total = applications.length;
  const offer = applications.filter(a => a.status === 'Offer').length;
  const interview = applications.filter(a => a.status === 'Interview').length;
  const rate = total ? Math.round((offer/total)*100) : 0;

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
    <x:Name>Job Applications</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
    </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
    <body>
      <table style="border-collapse:collapse;font-family:Arial,sans-serif;width:100%">
        <tr><td colspan="11" style="padding:16px 12px;background:#1e293b;color:#fff;font-size:16px;font-weight:700">🎯 JobTracker — Rekap Lamaran Kerja</td></tr>
        <tr>
          <td style="padding:6px 12px;background:#334155;color:#94a3b8;font-size:11px">Diekspor: ${dateStr}</td>
          <td style="padding:6px 12px;background:#334155;color:#94a3b8;font-size:11px">Total: ${total}</td>
          <td style="padding:6px 12px;background:#334155;color:#94a3b8;font-size:11px">Interview: ${interview}</td>
          <td style="padding:6px 12px;background:#334155;color:#94a3b8;font-size:11px">Offer: ${offer}</td>
          <td style="padding:6px 12px;background:#334155;color:#94a3b8;font-size:11px">Success Rate: ${rate}%</td>
          <td colspan="6" style="background:#334155"></td>
        </tr>
        <tr>${headers.map(h => toCell(h, true)).join('')}</tr>
        ${dataRows}
      </table>
    </body></html>`;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `JobTracker_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}.xls`;
  a.click();
  URL.revokeObjectURL(a.href);
  notify('📊 Data berhasil diekspor ke Excel!');
}

// Add skill helper
function addSkill(skill) {
  const el = document.getElementById('prof-skills');
  const current = el.value.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  if (!current.includes(skill.toLowerCase())) {
    el.value = current.length ? current.join(', ') + ', ' + skill : skill;
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // Populate source filter
  const srcFilter = document.getElementById('filter-source');
  JOB_SOURCES.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id; opt.textContent = s.name;
    srcFilter.appendChild(opt);
  });

  // Populate source select in form
  const srcSelect = document.getElementById('app-source');
  JOB_SOURCES.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id; opt.textContent = s.icon + ' ' + s.name;
    srcSelect.appendChild(opt);
  });

  // Nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => navigate(item.dataset.page));
  });

  // Filter events
  ['filter-status', 'filter-source', 'filter-search'].forEach(id => {
    document.getElementById(id).addEventListener('input', applyFilter);
    document.getElementById(id).addEventListener('change', applyFilter);
  });

  // Search enter
  document.getElementById('global-search').addEventListener('keydown', e => {
    if (e.key === 'Enter') renderSearchLinks();
  });

  // Render skill suggestion buttons
  const POPULAR_SKILLS = ['javascript','typescript','react','vue','angular','nodejs','python','java','php','golang','flutter','kotlin','swift','sql','mysql','postgresql','mongodb','docker','kubernetes','aws','figma','git','laravel','django','spring boot','machine learning','data analysis','product management','agile','scrum'];
  document.getElementById('skill-suggestions').innerHTML = POPULAR_SKILLS
    .map(s => `<button class="btn btn-outline btn-sm" onclick="addSkill('${s}')">${s}</button>`)
    .join('');

  navigate('dashboard');
});
