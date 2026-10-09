// ================== Firebase ==================
const firebaseConfig = {
    apiKey: "AIzaSyCVdy9XGQtsf30Ldxe8qT8fqtyNwSx3AB0",
    authDomain: "test-game-a885a.firebaseapp.com",
    databaseURL: "https://test-game-a885a-default-rtdb.firebaseio.com/",
    projectId: "test-game-a885a",
    storageBucket: "test-game-a885a.firebasestorage.app",
    messagingSenderId: "861341408127",
    appId: "1:861341408127:web:f9ca2e072997376e94584a"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// ================== Icons (Lucide) ==================
const ICONS = {
    settings: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>`,
    profile: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 21a8 8 0 0 1 10.821-7.487"/><path d="M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/><circle cx="10" cy="8" r="5"/></svg>`,
    missions: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg>`,
    logout: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg>`,
    x: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
    circle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`,
    dices: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/><path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/></svg>`,
    squiggle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3.5c5-2 7 2.5 3 4C1.5 10 2 15 5 16c5 2 9-10 14-7s.5 13.5-4 12c-5-2.5.5-11 6-2"/></svg>`,
    bolt: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>`,
    hand: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>`,
    pencil: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>`,
    swords: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m13 19 6-6"/><path d="M14.5 17.5 3.586 6.586A2 2 0 0 1 3 5.172V3h2.172a2 2 0 0 1 1.414.586L17.5 14.5"/><path d="m14.828 6.172 2.586-2.586A2 2 0 0 1 18.828 3H21v2.172a2 2 0 0 1-.586 1.414l-2.586 2.586"/><path d="m16 16 4 4"/><path d="m19 21 2-2"/><path d="m5 14 4 4"/><path d="m5 21-2-2"/><path d="M7.5 16.5 4 20"/></svg>`,
    ev: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0v-6.998a2 2 0 0 0-.59-1.42L18 5"/><path d="M14 21V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16"/><path d="M2 21h13"/><path d="M3 7h11"/><path d="m9 11-2 3h3l-2 3"/></svg>`,
    menu: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
    user: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>`,
    coin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 6v2m0 8v2"/></svg>`,
    trash: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
    edit: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>`,
    mail: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`
};

// ================== Games ==================
const GAMES = {
    tictactoe: { name: 'إكس-أو',       icon: ICONS.x + ICONS.circle, min: 2, max: 2, desc: 'لاعبين ضد بعض' },
    rps:       { name: 'حجرة ورقة مقص', icon: ICONS.hand,           min: 2, max: 2, desc: 'أفضل من 5 جولات' },
    reaction:  { name: 'رد الفعل',      icon: ICONS.bolt,           min: 2, max: 2, desc: 'الأسرع يفوز' },
    wordchain: { name: 'سلسلة الكلمات', icon: ICONS.pencil,         min: 2, max: 8, desc: 'كلمة تبدأ بآخر حرف' },
    connect4:  { name: 'Connect 4',     icon: ICONS.swords,         min: 2, max: 2, desc: '4 على التوالي' },
    guessnum:  { name: 'تخمين الرقم',    icon: ICONS.dices,          min: 2, max: 6, desc: 'رقم من 1-100' },
    typing:    { name: 'سباق الكتابة',   icon: ICONS.ev,             min: 2, max: 6, desc: 'الأسرع يفوز' },
    drawing:   { name: 'الرسم والتخمين', icon: ICONS.squiggle,       min: 2, max: 8, desc: 'فكرة: رشيد الهواري' }
};

// ================== User ==================
const User = {
    ref(uid) { return db.ref('users/' + uid); },
    async getOrCreate(user) {
        const snap = await this.ref(user.uid).once('value');
        if (snap.exists()) return snap.val();
        const profile = {
            uid: user.uid,
            name: getUserName(user),
            email: user.email || null,
            isGuest: user.isAnonymous,
            coins: 20, wins: 0, losses: 0, draws: 0, gamesPlayed: 0,
            createdAt: Date.now(), avatar: '🎮'
        };
        await this.ref(user.uid).set(profile);
        return profile;
    },
    async update(uid, data) { await this.ref(uid).update(data); },
    async addCoins(uid, amount) { await this.ref(uid).child('coins').transaction(c => (c || 0) + amount); },
    async addResult(uid, result) {
        const updates = {};
        if (result === 'win') updates.wins = firebase.database.ServerValue.increment(1);
        else if (result === 'loss') updates.losses = firebase.database.ServerValue.increment(1);
        else if (result === 'draw') updates.draws = firebase.database.ServerValue.increment(1);
        updates.gamesPlayed = firebase.database.ServerValue.increment(1);
        await this.ref(uid).update(updates);
    }
};

// ================== Auth ==================
const Auth = {
    signup: (email, pass) => auth.createUserWithEmailAndPassword(email, pass),
    login: (email, pass) => auth.signInWithEmailAndPassword(email, pass),
    google: () => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()),
    guest: () => auth.signInAnonymously(),
    logout: () => auth.signOut()
};

// ================== Rooms ==================
const Rooms = {
    async generateUniqueCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        while (true) {
            let code = '';
            for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
            const snap = await db.ref('usedCodes/' + code).once('value');
            if (!snap.exists()) return code;
        }
    },
    async create(gameType, user, playerName) {
        const code = await this.generateUniqueCode();
        const gameInfo = GAMES[gameType];
        await db.ref('usedCodes/' + code).set({ createdAt: Date.now() });
        await db.ref('rooms/' + code).set({
            gameType, host: user.uid, status: 'waiting', createdAt: Date.now(),
            minPlayers: gameInfo.min, maxPlayers: gameInfo.max,
            players: { [user.uid]: { name: playerName, ready: false, joinedAt: Date.now() } }
        });
        return code;
    },
    async join(code, user, playerName) {
        const ref = db.ref('rooms/' + code);
        const snap = await ref.once('value');
        if (!snap.exists()) throw new Error('الغرفة غير موجودة');
        const room = snap.val();
        const playerCount = Object.keys(room.players || {}).length;
        if (!room.players[user.uid] && playerCount >= room.maxPlayers) throw new Error('الغرفة ممتلئة');
        if (room.status === 'playing' && !room.players[user.uid]) throw new Error('اللعبة بدأت بالفعل');
        if (!room.players || !room.players[user.uid]) {
            await ref.child('players/' + user.uid).set({ name: playerName, ready: false, joinedAt: Date.now() });
        }
        return room;
    },
    async setReady(code, uid, ready) { await db.ref(`rooms/${code}/players/${uid}/ready`).set(ready); },
    async leave(code, uid) {
        const ref = db.ref('rooms/' + code);
        await ref.child('players/' + uid).remove();
        const snap = await ref.once('value');
        const room = snap.val();
        if (!room) return;
        const remaining = Object.keys(room.players || {});
        if (remaining.length === 0) {
            await ref.remove();
            await db.ref('usedCodes/' + code).remove();
        } else if (room.host === uid) {
            await ref.child('host').set(remaining[0]);
        }
    },
    get: (code) => db.ref('rooms/' + code),
    listen: (code, cb) => db.ref('rooms/' + code).on('value', cb)
};

// ================== Chat ==================
const Chat = {
    send(roomCode, user, name, text) {
        if (!text.trim()) return;
        db.ref(`rooms/${roomCode}/chat`).push({
            uid: user.uid, name, text: text.trim().slice(0, 200), at: Date.now()
        });
    },
    listen(roomCode, cb) {
        const ref = db.ref(`rooms/${roomCode}/chat`).limitToLast(50);
        ref.on('child_added', snap => cb({ id: snap.key, ...snap.val() }));
        return () => ref.off();
    }
};

function renderChat(container, roomCode, user, profile) {
    container.innerHTML = `
        <div class="chat-box">
            <div class="chat-messages" id="chatMessages"></div>
            <div class="chat-input-row">
                <input type="text" id="chatInput" placeholder="اكتب رسالة..." maxlength="200">
                <button class="btn btn-primary" id="chatSend" style="width:auto;">إرسال</button>
            </div>
        </div>
    `;
    const messagesEl = document.getElementById('chatMessages');
    const inputEl = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSend');
    const send = () => {
        const text = inputEl.value.trim();
        if (!text) return;
        Chat.send(roomCode, user, profile.name, text);
        inputEl.value = '';
        Missions.trackProgress(user.uid, 'messages', 1);
    };
    sendBtn.onclick = send;
    inputEl.onkeypress = e => { if (e.key === 'Enter') send(); };
    Chat.listen(roomCode, msg => {
        const div = document.createElement('div');
        div.className = 'chat-msg' + (msg.uid === user.uid ? ' mine' : '');
        div.innerHTML = `<span class="author">${escapeHtml(msg.name)}:</span><span>${escapeHtml(msg.text)}</span>`;
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    });
}

// ================== Missions ==================
const MissionTemplates = [
    { id: 'play3',    icon: 'play',     title: 'العب 3 ألعاب',         target: 3, reward: 5,  track: 'gamesPlayed' },
    { id: 'win2',     icon: 'trophy',   title: 'اربح مبارزتين',         target: 2, reward: 10, track: 'wins' },
    { id: 'playTTT',  icon: 'x',        title: 'العب إكس-أو مرة',        target: 1, reward: 5,  track: 'game_tictactoe' },
    { id: 'playRPS',  icon: 'hand',     title: 'العب حجرة ورقة مقص',     target: 1, reward: 5,  track: 'game_rps' },
    { id: 'playDraw', icon: 'squiggle', title: 'العب الرسم والتخمين',    target: 1, reward: 8,  track: 'game_drawing' },
    { id: 'playWord', icon: 'pencil',   title: 'العب سلسلة الكلمات',     target: 1, reward: 5,  track: 'game_wordchain' },
    { id: 'chat5',    icon: 'mail',     title: 'أرسل 5 رسائل دردشة',     target: 5, reward: 5,  track: 'messages' },
    { id: 'ready5',   icon: 'check',    title: 'كن جاهزاً في 5 ألعاب',   target: 5, reward: 5,  track: 'readyCount' }
];
const MissionIcons = {
    play: ICONS.ev, trophy: ICONS.missions, x: ICONS.x, hand: ICONS.hand,
    squiggle: ICONS.squiggle, pencil: ICONS.pencil, mail: ICONS.mail, check: ICONS.missions
};

const Missions = {
    today() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; },
    async getForUser(uid) {
        const today = this.today();
        const ref = db.ref(`users/${uid}/missions/${today}`);
        const snap = await ref.once('value');
        if (snap.exists()) return { date: today, data: snap.val(), ref };
        const shuffled = [...MissionTemplates].sort(() => Math.random() - 0.5);
        const picked = shuffled.slice(0, 3);
        const missions = {};
        picked.forEach(m => {
            missions[m.id] = {
                icon: m.icon, title: m.title, target: m.target, reward: m.reward,
                track: m.track, progress: 0, claimed: false
            };
        });
        await ref.set(missions);
        return { date: today, data: missions, ref };
    },
    async trackProgress(uid, trackKey, amount = 1) {
        const today = this.today();
        const ref = db.ref(`users/${uid}/missions/${today}`);
        const snap = await ref.once('value');
        if (!snap.exists()) return;
        const missions = snap.val();
        for (const [id, m] of Object.entries(missions)) {
            if (m.track === trackKey && !m.claimed && m.progress < m.target) {
                const newProgress = Math.min(m.progress + amount, m.target);
                await ref.child(id + '/progress').set(newProgress);
            }
        }
    },
    async claim(uid, missionId) {
        const today = this.today();
        const ref = db.ref(`users/${uid}/missions/${today}/${missionId}`);
        const snap = await ref.once('value');
        if (!snap.exists()) throw new Error('المهمة غير موجودة');
        const m = snap.val();
        if (m.claimed) throw new Error('تم استلامها مسبقاً');
        if (m.progress < m.target) throw new Error('لم تكتمل المهمة بعد');
        await ref.child('claimed').set(true);
        await User.addCoins(uid, m.reward);
        return m.reward;
    }
};

// ================== Theme ==================
(function() {
    const KEY = 'gameverse-theme';
    function get() { return localStorage.getItem(KEY) || 'light'; }
    function apply(mode) { document.documentElement.setAttribute('data-theme', mode); }
    function toggle() {
        const next = get() === 'dark' ? 'light' : 'dark';
        localStorage.setItem(KEY, next);
        apply(next);
    }
    apply(get());
    function createBtn() {
        if (document.getElementById('themeToggleCorner')) return;
        const btn = document.createElement('button');
        btn.id = 'themeToggleCorner';
        btn.className = 'theme-toggle-corner';
        btn.setAttribute('aria-label', 'تبديل الوضع');
        btn.innerHTML = `
            <svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            <svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
        `;
        btn.onclick = toggle;
        document.body.appendChild(btn);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', createBtn);
    else createBtn();
})();

// ================== Helpers ==================
function requireAuth(callback) {
    auth.onAuthStateChanged(async user => {
        if (!user) { window.location.href = 'index.html'; return; }
        const profile = await User.getOrCreate(user);
        window.__user = user;
        window.__profile = profile;
        callback(user, profile);
    });
}
function getUserName(user) {
    if (user.displayName) return user.displayName;
    if (user.email) return user.email.split('@')[0];
    return 'لاعب-' + user.uid.substr(0, 4);
}
function toast(msg, type = '') {
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => t.remove(), 300);
    }, 2500);
}
function updateCoinDisplay(coins) {
    const el = document.getElementById('coinDisplay');
    if (el) el.textContent = coins;
}
function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
}
function startPresence(uid) {
    const update = () => db.ref('users/' + uid + '/lastSeen').set(Date.now());
    update();
    setInterval(update, 15000);
}