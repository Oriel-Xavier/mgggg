let soundEnabled = true;
const clickSound = document.getElementById('clickSound');
const successSound = document.getElementById('successSound');
const soundToggle = document.getElementById('soundToggle');
const soundIcon = document.getElementById('soundIcon');
const toast = document.getElementById('toast');

function play(sound) {
  if (!soundEnabled || !sound) return;
  sound.currentTime = 0;
  sound.volume = 0.32;
  sound.play().catch(() => {});
}

document.querySelectorAll('.sound-trigger').forEach(el => {
  el.addEventListener('click', () => play(clickSound));
});

soundToggle.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.13 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.nav-link')];
window.addEventListener('scroll', () => {
  let current = 'portfolio';
  sections.forEach(section => {
    if (scrollY >= section.offsetTop - 180) current = section.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
});

const glow = document.getElementById('cursorGlow');
window.addEventListener('pointermove', e => {
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
});

document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${y * -7}deg) translateY(-5px)`;
  });
  card.addEventListener('mouseleave', () => card.style.transform = '');
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      showToast('Nomor berhasil disalin!');
      play(successSound);
    } catch {
      showToast('Gagal menyalin. Salin secara manual.');
    }
  });
});

const fileInput = document.getElementById('fileInput');
const chooseFile = document.getElementById('chooseFile');
const dropZone = document.getElementById('dropZone');
const fileList = document.getElementById('fileList');
const clearFiles = document.getElementById('clearFiles');
let savedFiles = JSON.parse(localStorage.getItem('orielnessFiles') || '[]');

chooseFile.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => addFiles([...fileInput.files]));

['dragenter','dragover'].forEach(type => dropZone.addEventListener(type, e => {
  e.preventDefault();
  dropZone.classList.add('dragging');
}));
['dragleave','drop'].forEach(type => dropZone.addEventListener(type, e => {
  e.preventDefault();
  dropZone.classList.remove('dragging');
}));
dropZone.addEventListener('drop', e => addFiles([...e.dataTransfer.files]));

function addFiles(files) {
  if (!files.length) return;
  const mapped = files.map(file => ({
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random(),
    name: file.name,
    size: file.size,
    type: file.type || 'unknown',
    addedAt: new Date().toLocaleString('id-ID')
  }));
  savedFiles = [...mapped, ...savedFiles].slice(0, 50);
  localStorage.setItem('orielnessFiles', JSON.stringify(savedFiles));
  renderFiles();
  showToast(`${files.length} file ditambahkan`);
  play(successSound);
  fileInput.value = '';
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

function renderFiles() {
  if (!savedFiles.length) {
    fileList.innerHTML = '<div class="empty-state"><span>◇</span><p>Belum ada file tersimpan.</p></div>';
    return;
  }
  fileList.innerHTML = savedFiles.map(file => {
    const ext = file.name.includes('.') ? file.name.split('.').pop().slice(0,4).toUpperCase() : 'FILE';
    return `<div class="file-item">
      <div class="file-icon">${ext}</div>
      <div class="file-meta">
        <strong title="${file.name.replaceAll('"','&quot;')}">${file.name}</strong>
        <span>${formatSize(file.size)} · ${file.addedAt}</span>
      </div>
      <button class="delete-file" data-id="${file.id}" aria-label="Hapus file">✕</button>
    </div>`;
  }).join('');

  document.querySelectorAll('.delete-file').forEach(btn => {
    btn.addEventListener('click', () => {
      savedFiles = savedFiles.filter(file => String(file.id) !== btn.dataset.id);
      localStorage.setItem('orielnessFiles', JSON.stringify(savedFiles));
      renderFiles();
      showToast('File dihapus dari daftar');
      play(clickSound);
    });
  });
}

clearFiles.addEventListener('click', () => {
  savedFiles = [];
  localStorage.removeItem('orielnessFiles');
  renderFiles();
  showToast('Semua file telah dihapus');
});

renderFiles();
