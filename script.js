// script.js
// ===== Imports (Firebase v9 modular) =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app-check.js";

// ===== Highlight current page in nav =====
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.site-nav a').forEach(link => {
    if (link.href.split('#')[0] === window.location.href.split('#')[0]) {
      link.classList.add('active');
    }
  });
});

// ===== Firebase config (unchanged) =====
const firebaseConfig = {
  apiKey: "AIzaSyD7l1D_6-bupEzU20uJRE2OOREqs0UBHf0",
  authDomain: "voldt-fb.firebaseapp.com",
  projectId: "voldt-fb",
  storageBucket: "voldt-fb.firebasestorage.app",
  messagingSenderId: "903604332756",
  appId: "1:903604332756:web:4659bee01e72e7e41f3341",
  measurementId: "G-RXJGX0M7CT"
};

// ===== Init Firebase + App Check =====
const app = initializeApp(firebaseConfig);
initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6Lc6Pz4rAAAAADVQu-X0eNcV8ioy1o1olVuU-3hi'),
  isTokenAutoRefreshEnabled: true
});
const db = getDatabase(app);

// ===== Session-aware visit tracking =====
// one session per tab/window (resets when the tab is closed)
function getOrCreateSessionId() {
  let id = sessionStorage.getItem('voldtSessionId');
  if (!id) {
    // create a short random id
    const buf = new Uint8Array(8);
    crypto.getRandomValues(buf);
    id = Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem('voldtSessionId', id);
    sessionStorage.setItem('voldtSessionStart', String(Date.now()));
  }
  return id;
}

(async () => {
  try {
    const sessionId = getOrCreateSessionId();
    // ---throttle check ---
    const lastLog = Number(sessionStorage.getItem('voldtPvLast') || 0);
    if (Date.now() - lastLog < 60_000) { 
      return; // too soon, skip logging 
    }

    const visitData = {
      sessionId,
      sessionStart: Number(sessionStorage.getItem('voldtSessionStart')) || Date.now(),
      page: window.location.pathname || '/',
      referrer: document.referrer || null,
      userAgent: navigator.userAgent,
      timeStamp: Date.now(),
      lang: navigator.language||null,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone || null
    };
    await push(ref(db, 'visits'), visitData);
    // --- store last log time ---
    sessionStorage.setItem('voldtPvLast', String(Date.now()));
  } catch (err) {
    console.warn('Visit logging failed:', err);
  }
})();

// ===== Hero image auto-height (home page only) =====
const heroImg = document.querySelector('.hero-img');
if (heroImg) {
  function setHeroHeight() {
    heroImg.style.height = (window.innerHeight / 1.33) + 'px';
  }
  setHeroHeight();
  window.addEventListener('resize', setHeroHeight);
}

// ===== Contact form (services page only) =====
const form = document.querySelector('.contact-form');
if (form) {
  const fields = [
    { id: 'first-name', label: 'First name' },
    { id: 'last-name',  label: 'Last name'  },
    { id: 'email',      label: 'Email address', type: 'email' },
    { id: 'message',    label: 'Message' }
  ];

  function clearErrors() {
    fields.forEach(f => {
      const input = document.getElementById(f.id);
      if (!input) return;
      input.classList.remove('error');
      const errEl = document.getElementById(`err-${f.id}`);
      if (errEl) errEl.textContent = '';
    });
  }

  function showError(fieldId, msg) {
    const input = document.getElementById(fieldId);
    if (input) input.classList.add('error');
    const errEl = document.getElementById(`err-${fieldId}`);
    if (errEl) errEl.textContent = msg;
  }

  function validateForm() {
    clearErrors();
    let valid = true;

    fields.forEach(f => {
      const el = document.getElementById(f.id);
      if (!el) return;
      const val = el.value.trim();

      if (!val) {
        valid = false;
        showError(f.id, `${f.label} is required.`);
        return;
      }
      if (f.type === 'email') {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(val)) {
          valid = false;
          showError(f.id, `Please enter a valid email.`);
        }
      }
    });

    return valid;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = {
      firstName: document.getElementById('first-name')?.value || '',
      lastName:  document.getElementById('last-name')?.value || '',
      email:     document.getElementById('email')?.value || '',
      message:   document.getElementById('message')?.value || '',
      createdAt: Date.now()
    };

    try {
      await push(ref(db, 'contacts'), data);
      alert('Thanks! Your message was sent.');
      form.reset();
    } catch (err) {
      console.error(err);
      alert('Error submitting form: ' + err.message);
    }
  });
}
