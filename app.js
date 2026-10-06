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

// ================== Auth ==================
const Auth = {
    signup: (email, pass) => auth.createUserWithEmailAndPassword(email, pass),
    login: (email, pass) => auth.signInWithEmailAndPassword(email, pass),
    google: () => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()),
    guest: () => auth.signInAnonymously(),
    logout: () => auth.signOut(),
    current: () => auth.currentUser
};

// ================== Rooms ==================
const Rooms = {
    async generateUniqueCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        while (true) {
            let code = '';
            for (let i = 0; i < 6; i++) {
                code += chars[Math.floor(Math.random() * chars.length)];
            }
            const snap = await db.ref('usedCodes/' + code).once('value');
            if (!snap.exists()) return code;
        }
    },

    async create(gameType, user) {
        const code = await this.generateUniqueCode();
        const name = getUserName(user);
        
        await db.ref('usedCodes/' + code).set({ createdAt: Date.now() });
        await db.ref('rooms/' + code).set({
            gameType: gameType,
            host: user.uid,
            status: 'waiting',
            createdAt: Date.now(),
            players: {
                [user.uid]: { name: name, score: 0 }
            }
        });
        return code;
    },

    async join(code, user) {
        const ref = db.ref('rooms/' + code);
        const snap = await ref.once('value');
        if (!snap.exists()) throw new Error('الكود غير موجود!');
        
        const room = snap.val();
        const name = getUserName(user);
        
        if (!room.players || !room.players[user.uid]) {
            await ref.child('players/' + user.uid).set({ name: name, score: 0 });
        }
        return room;
    },

    get: (code) => db.ref('rooms/' + code),
    listen: (code, cb) => db.ref('rooms/' + code).on('value', cb)
};

// ================== Games ==================
const GAMES = {
    tictactoe: { name: 'إكس-أو', icon: '❌⭕', players: 2, desc: 'لاعبين ضد بعض' },
    rps:       { name: 'حجرة ورقة مقص', icon: '✊✋✌️', players: 2, desc: 'أفضل من 5 جولات' },
    reaction:  { name: 'تحدي رد الفعل', icon: '⚡', players: 2, desc: 'الأسرع يفوز' },
    wordchain: { name: 'سلسلة الكلمات', icon: '🔗', players: 2, desc: 'كلمة تبدأ بآخر حرف' }
};

// ================== Helpers ==================
function requireAuth(callback) {
    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = 'index.html';
        } else {
            callback(user);
        }
    });
}

function getUserName(user) {
    if (user.displayName) return user.displayName;
    if (user.email) return user.email.split('@')[0];
    return 'زائر-' + user.uid.substr(0, 4);
}