//for firebase use
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { initializeAppCheck, ReCaptchaV3Provider }
  from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app-check.js";


// highlight current page
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.site-nav a').forEach(link => {
      if (link.href.split('#')[0] === window.location.href.split('#')[0]) {
        link.classList.add('active');
      }
    });
  });


//fire base form stuff------
const firebaseConfig = {
  apiKey: "AIzaSyD7l1D_6-bupEzU20uJRE2OOREqs0UBHf0",
  authDomain: "voldt-fb.firebaseapp.com",
  projectId: "voldt-fb",
  storageBucket: "voldt-fb.firebasestorage.app",
  messagingSenderId: "903604332756",
  appId: "1:903604332756:web:4659bee01e72e7e41f3341",
  measurementId: "G-RXJGX0M7CT"
};


//initialize app and check for access
const app = initializeApp(firebaseConfig);
initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6Lc6Pz4rAAAAADVQu-X0eNcV8ioy1o1olVuU-3hi'),
  isTokenAutoRefreshEnabled: true
});
const db  = getDatabase(app);

//check form validity
const form = document.querySelector('.contact-form');
const fields = [
  { id: 'first-name', label: 'First name' },
  { id: 'last-name',  label: 'Last name'  },
  { id: 'email',      label: 'Email address', type: 'email' },
  { id: 'message',    label: 'Message' }
];

function clearErrors() {
  fields.forEach(f => {
    const input = document.getElementById(f.id);
    input.classList.remove('error');
    document.getElementById(`err-${f.id}`).textContent = '';
  });
}

function showError(fieldId, msg) {
  const input = document.getElementById(fieldId);
  input.classList.add('error');
  document.getElementById(`err-${fieldId}`).textContent = msg;
}

function validateForm() {
  clearErrors();
  let valid = true;

  fields.forEach(f => {
    const el = document.getElementById(f.id);
    const val = el.value.trim();

    if (!val) {
      valid = false;
      showError(f.id, `${f.label} is required.`);
      return;
    }

    if (f.type === 'email') {
      // simple email regex; you can replace with your own
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(val)) {
        valid = false;
        showError(f.id, `Please enter a valid email.`);
      }
    }
  });

  return valid;
}


//writing to firebase
document.querySelector('.contact-form').addEventListener('submit', async e => {
  e.preventDefault();

  if(!validateForm()){
    return;
  }

  const data = {
    firstName: document.getElementById('first-name').value,
    lastName:  document.getElementById('last-name').value,
    email:     document.getElementById('email').value,
    message:   document.getElementById('message').value,
    createdAt: Date.now()
  };

  try {
    // this will write under /contacts/{generatedId}
    await push(ref(db, 'contacts'), data);
    alert('Thanks! Your message was sent.');
    e.target.reset();
  } catch (err) {
    console.error(err);
    alert('Error submitting form: ' + err.message);
  }
});

//end firebase-----