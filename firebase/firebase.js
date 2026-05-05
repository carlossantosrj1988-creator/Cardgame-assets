import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
  import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
  import { getDatabase, ref, set, get, update, push, remove, onValue, onDisconnect, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

  const firebaseConfig = {
    apiKey: "AIzaSyDTqgzbA5MiUA4LDClmye34I9TJkw4XXuM",
    authDomain: "patf-tcg.firebaseapp.com",
    databaseURL: "https://patf-tcg-default-rtdb.firebaseio.com",
    projectId: "patf-tcg",
    storageBucket: "patf-tcg.firebasestorage.app",
    messagingSenderId: "722038069279",
    appId: "1:722038069279:web:659e82e9a7ceb4c3b99d2a",
    measurementId: "G-CQ72ELNV6Y"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getDatabase(app);
  const provider = new GoogleAuthProvider();
  window._fbDb = db;
  window._fbRef = ref;
  window._fbGet = get;
  window._fbSet = set;
  window._fbPush = push;
  window._fbRemove = remove;
  window._fbOnValue = onValue;
  window._fbOnDisconnect = onDisconnect;
  window._fbServerTimestamp = serverTimestamp;
  window._fbUpdate = update;

  // Expõe funções globalmente para os botões HTML
  window.fbLogin = async function() {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = ref(db, 'jogadores/' + user.uid);
      const snapshot = await get(userRef);
      if (!snapshot.exists()) {
        await set(userRef, {
          nome: user.displayName,
          foto: user.photoURL,
          pontos: 0,
          roster: [],
          criadoEm: Date.now()
        });
      }
    } catch(e) {
      console.error('Erro no login:', e);
      alert('Erro ao fazer login. Tente novamente.');
    }
  };

  window.fbLogout = async function() {
    await signOut(auth);
  };

  // Monitora estado do login — com retry até os elementos estarem no DOM
  function updateLoginUI(user) {
    const btnLogin = document.getElementById('fb-btn-login');
    if (!btnLogin) { setTimeout(() => updateLoginUI(user), 400); return; }
    const btnLogout    = document.getElementById('fb-btn-logout');
    const userInfo     = document.getElementById('fb-user-info');
    const userName     = document.getElementById('fb-user-name');
    const userPhoto    = document.getElementById('fb-user-photo');
    const btnLobbyWrap = document.getElementById('btn-lobby-wrap');
    window._fbUser = user;
    // Hub account/login cards
    var hubAccCard = document.getElementById('hub-account-card');
    var hubLoginCard = document.getElementById('hub-login-card');
    if (user) {
      btnLogin.style.display     = 'none';
      btnLogout.style.display    = 'inline-flex';
      userInfo.style.display     = 'flex';
      userName.textContent       = user.displayName;
      userPhoto.src              = user.photoURL || '';
      if (btnLobbyWrap) btnLobbyWrap.style.display = 'block';
      if (hubAccCard) hubAccCard.style.display = 'flex';
      if (hubLoginCard) hubLoginCard.style.display = 'none';
      // Se jogo já foi iniciado (passou do start), vai pro lobby
      if (window._gameStarted) {
        if (window._onGameReady) window._onGameReady();
      }
    } else {
      btnLogin.style.display     = 'inline-flex';
      btnLogout.style.display    = 'none';
      userInfo.style.display     = 'none';
      if (btnLobbyWrap) btnLobbyWrap.style.display = 'none';
      if (hubAccCard) hubAccCard.style.display = 'none';
      if (hubLoginCard) hubLoginCard.style.display = 'flex';
    }
  }

  onAuthStateChanged(auth, (user) => updateLoginUI(user));
