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


//fire base stuff
const firebaseConfig = {
  apiKey: "AIzaSyD7l1D_6-bupEzU20uJRE2OOREqs0UBHf0",
  authDomain: "voldt-fb.firebaseapp.com",
  databaseURL: "https://voldt-fb-default-rtdb.firebaseio.com",
  projectId: "voldt-fb",
};

//initialize app and check for access
const app = initializeApp(firebaseConfig);
initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6Lc6Pz4rAAAAADVQu-X0eNcV8ioy1o1olVuU-3hi'),
  isTokenAutoRefreshEnabled: true
});
const db  = getDatabase(app);

//writing to firebase
document.querySelector('.contact-form').addEventListener('submit', async e => {
  e.preventDefault();

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