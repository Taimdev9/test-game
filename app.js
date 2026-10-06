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

// ================== Game Definitions ==================
const GAMES = {
    tictactoe: { name: 'إكس-أو', icon: '❌⭕', min: 2, max: 2, desc: 'لاعبين ضد بعض' },
    rps:       { name: 'حجرة ورقة مقص', icon: '✊✋✌️', min: 2, max: 2, desc: 'أفضل من 5 جولات' },
    reaction:  { name: 'تحدي رد الفعل', icon: '⚡', min: 2, max: 2, desc: 'الأسرع يفوز' },
    wordchain: { name: 'سلسلة الكلمات', icon: '🔗', min: 2, max: 8, desc: 'كلمة تبدأ بآخر حرف' },
    connect4:  { name: 'Connect 4', icon: '🔴🟡', min: 2, max: 2, desc: '4 على التوالي' },
    guessnum:  { name: 'تخمين الرقم', icon: '🎲', min: 2, max: 6, desc: 'رقم من 1-100' },
    typing:    { name: 'سباق الكتابة', icon: '⌨️', min: 2, max: 6, desc: 'الأسرع يفوز' },
    drawing:   { name: 'الرسم والتخمين', icon: '🎨', min: 2, max: 8, desc: 'فكرة: رشيد الهواري' }
};

// ================== User / Profile ==================
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
            coins: 20,
            wins: 0, losses: 0, draws: 0,
            gamesPlayed: 0,
            createdAt: Date.now(),
            avatar: '🎮'
        };
        await this.ref(user.uid).set(profile);
        return profile;
    },
    
    async update(uid, data) {
        await this.ref(uid).update(data);
    },
    
    async addCoins(uid, amount) {
        await this.ref(uid).child('coins').transaction(c => (c || 0) + amount);
    },
    
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
            gameType,
            host: user.uid,
            status: 'waiting',
            createdAt: Date.now(),
            minPlayers: gameInfo.min,
            maxPlayers: gameInfo.max,
            players: {
                [user.uid]: { name: playerName, ready: false, joinedAt: Date.now() }
            }
        });
        return code;
    },

    async join(code, user, playerName) {
        const ref = db.ref('rooms/' + code);
        const snap = await ref.once('value');
        if (!snap.exists()) throw new Error('الغرفة غير موجودة');
        const room = snap.val();
        
        const playerCount = Object.keys(room.players || {}).length;
        if (!room.players[user.uid] && playerCount >= room.maxPlayers) {
            throw new Error('الغرفة ممتلئة');
        }
        if (room.status === 'playing' && !room.players[user.uid]) {
            throw new Error('اللعبة بدأت بالفعل');
        }
        
        if (!room.players || !room.players[user.uid]) {
            await ref.child('players/' + user.uid).set({ name: playerName, ready: false, joinedAt: Date.now() });
        }
        return room;
    },

    async setReady(code, uid, ready) {
        await db.ref(`rooms/${code}/players/${uid}/ready`).set(ready);
    },

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
            uid: user.uid,
            name,
            text: text.trim().slice(0, 200),
            at: Date.now()
        });
    },
    listen(roomCode, cb) {
        const ref = db.ref(`rooms/${roomCode}/chat`).limitToLast(50);
        ref.on('child_added', snap => cb({ id: snap.key, ...snap.val() }));
        return () => ref.off();
    }
};

// ================== Helpers ==================
function requireAuth(callback) {
    auth.onAuthStateChanged(async user => {
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
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

// Track online presence (updates lastSeen every 15 seconds)
function startPresence(uid) {
    const update = () => db.ref('users/' + uid + '/lastSeen').set(Date.now());
    update();
    setInterval(update, 15000);
}