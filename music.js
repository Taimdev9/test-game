// موسيقى مجانية بدون API - Pixabay
const MUSIC_TRACKS = [
    { name: 'Ambient', artist: 'Pixabay', url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3' },
    { name: 'Chill', artist: 'Pixabay', url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_c8c8a73467.mp3' },
    { name: 'Focus', artist: 'Pixabay', url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0c6ff1bab.mp3' },
    { name: 'Lofi', artist: 'Pixabay', url: 'https://cdn.pixabay.com/audio/2022/10/25/audio_946bc7eb0a.mp3' }
];

const MusicPlayer = {
    audio: null,
    currentIndex: 0,
    isPlaying: false,
    initialized: false,

    init() {
        if (this.initialized) return;
        this.initialized = true;
        this.audio = new Audio();
        this.audio.volume = 0.25;
        this.audio.addEventListener('ended', () => this.next());
        this.createButton();
        // استرجاع الحالة
        const saved = localStorage.getItem('gameverse-music');
        if (saved === 'on') {
            // يحتاج تفاعل المستخدم
            document.addEventListener('click', () => {
                if (!this.isPlaying && localStorage.getItem('gameverse-music') === 'on') {
                    this.play(0);
                }
            }, { once: true });
        }
    },

    play(index) {
        this.currentIndex = index;
        this.audio.src = MUSIC_TRACKS[index].url;
        this.audio.play().then(() => {
            this.isPlaying = true;
            this.updateUI();
        }).catch(() => { this.isPlaying = false; this.updateUI(); });
    },

    toggle() {
        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
            localStorage.setItem('gameverse-music', 'off');
        } else {
            if (!this.audio.src) this.play(0);
            else this.audio.play().then(() => { this.isPlaying = true; this.updateUI(); });
            this.isPlaying = true;
            localStorage.setItem('gameverse-music', 'on');
        }
        this.updateUI();
    },

    next() {
        this.currentIndex = (this.currentIndex + 1) % MUSIC_TRACKS.length;
        this.play(this.currentIndex);
    },

    updateUI() {
        const btn = document.getElementById('musicBtn');
        if (btn) btn.classList.toggle('playing', this.isPlaying);
    },

    createButton() {
        if (document.getElementById('musicBtn')) return;
        const btn = document.createElement('button');
        btn.id = 'musicBtn';
        btn.className = 'theme-toggle-corner music-btn';
        btn.style.top = '70px';
        btn.setAttribute('aria-label', 'الموسيقى');
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`;
        btn.onclick = () => this.toggle();
        document.body.appendChild(btn);
    }
};

MusicPlayer.init();