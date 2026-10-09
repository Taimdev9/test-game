const TRANSLATIONS = {
    ar: {
        welcome: 'مرحباً بك', welcomeSub: 'سجّل دخولك للمتابعة',
        google: 'المتابعة باستخدام Google', guest: 'المتابعة كزائر',
        or: 'أو', email: 'البريد الإلكتروني', password: 'كلمة السر',
        login: 'تسجيل الدخول', signup: 'إنشاء حساب جديد', forgot: 'نسيت كلمة السر؟',
        chooseGame: 'اختر لعبة', players: 'لاعبين',
        profile: 'الملف الشخصي', settings: 'الإعدادات', missions: 'المهام اليومية',
        logout: 'تسجيل خروج', leaderboard: 'المتصدرون',
        createRoom: 'إنشاء غرفة جديدة', joinRoom: 'دخول الغرفة',
        roomCode: 'كود الغرفة', copyLink: 'نسخ رابط الدعوة', players2: 'اللاعبون',
        ready: 'أنا جاهز', cancelReady: 'إلغاء الجاهزية', chat: 'الدردشة',
        send: 'إرسال', exitRoom: 'الخروج من الغرفة',
        stats: 'إحصائياتي', wins: 'فوز', losses: 'خسارة', draws: 'تعادل',
        games: 'مجموع الألعاب', winRate: 'نسبة الفوز', coins: 'العملات',
        todaysMissions: 'مهام اليوم', claim: 'استلم', back: 'العودة للرئيسية',
        name: 'الاسم', edit: 'تعديل', deleteAccount: 'حذف الحساب',
        language: 'اللغة', music: 'الموسيقى', on: 'تشغيل', off: 'إيقاف',
        avatar: 'الشكل'
    },
    en: {
        welcome: 'Welcome', welcomeSub: 'Sign in to continue',
        google: 'Continue with Google', guest: 'Continue as Guest',
        or: 'OR', email: 'Email', password: 'Password',
        login: 'Sign In', signup: 'Create Account', forgot: 'Forgot password?',
        chooseGame: 'Choose a Game', players: 'players',
        profile: 'Profile', settings: 'Settings', missions: 'Daily Missions',
        logout: 'Logout', leaderboard: 'Leaderboard',
        createRoom: 'Create New Room', joinRoom: 'Join Room',
        roomCode: 'Room Code', copyLink: 'Copy Invite Link', players2: 'Players',
        ready: 'I\'m Ready', cancelReady: 'Cancel Ready', chat: 'Chat',
        send: 'Send', exitRoom: 'Exit Room',
        stats: 'My Stats', wins: 'Wins', losses: 'Losses', draws: 'Draws',
        games: 'Total Games', winRate: 'Win Rate', coins: 'Coins',
        todaysMissions: 'Today\'s Missions', claim: 'Claim', back: 'Back to Home',
        name: 'Name', edit: 'Edit', deleteAccount: 'Delete Account',
        language: 'Language', music: 'Music', on: 'On', off: 'Off',
        avatar: 'Avatar'
    }
};

const I18n = {
    current: localStorage.getItem('gameverse-lang') || 'ar',
    init() {
        document.documentElement.lang = this.current;
        document.documentElement.dir = this.current === 'ar' ? 'rtl' : 'ltr';
        this.apply();
    },
    t(key) { return TRANSLATIONS[this.current][key] || key; },
    set(lang) {
        this.current = lang;
        localStorage.setItem('gameverse-lang', lang);
        this.init();
    },
    apply() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const t = this.t(key);
            if (t) el.textContent = t;
        });
    }
};
I18n.init();