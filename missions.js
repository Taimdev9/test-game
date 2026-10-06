// ================== Daily Missions ==================
const MissionTemplates = [
    { id: 'play3',    icon: '🎮', title: 'العب 3 ألعاب',         target: 3,  reward: 5,  track: 'gamesPlayed' },
    { id: 'win2',     icon: '🏆', title: 'اربح مبارزتين',         target: 2,  reward: 10, track: 'wins' },
    { id: 'playTTT',  icon: '❌', title: 'العب إكس-أو مرة',        target: 1,  reward: 5,  track: 'game_tictactoe' },
    { id: 'playRPS',  icon: '✊', title: 'العب حجرة ورقة مقص',     target: 1,  reward: 5,  track: 'game_rps' },
    { id: 'playDraw', icon: '🎨', title: 'العب الرسم والتخمين',    target: 1,  reward: 8,  track: 'game_drawing' },
    { id: 'playWord', icon: '🔗', title: 'العب سلسلة الكلمات',     target: 1,  reward: 5,  track: 'game_wordchain' },
    { id: 'chat5',    icon: '💬', title: 'أرسل 5 رسائل دردشة',     target: 5,  reward: 5,  track: 'messages' },
    { id: 'ready5',   icon: '✅', title: 'كن جاهزاً في 5 ألعاب',   target: 5,  reward: 5,  track: 'readyCount' }
];

const Missions = {
    today() {
        const d = new Date();
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    },

    async getForUser(uid) {
        const today = this.today();
        const ref = db.ref(`users/${uid}/missions/${today}`);
        const snap = await ref.once('value');
        
        if (snap.exists()) return { date: today, data: snap.val(), ref };
        
        // توليد مهام جديدة لليوم
        const shuffled = [...MissionTemplates].sort(() => Math.random() - 0.5);
        const picked = shuffled.slice(0, 3);
        const missions = {};
        picked.forEach(m => {
            missions[m.id] = {
                icon: m.icon, title: m.title, target: m.target,
                reward: m.reward, track: m.track,
                progress: 0, claimed: false
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