// ================== Theme Manager ==================
const Theme = {
    KEY: 'gameverse-theme',
    
    get() {
        return localStorage.getItem(this.KEY) || 'dark';
    },
    
    set(mode) {
        localStorage.setItem(this.KEY, mode);
        this.apply(mode);
    },
    
    toggle() {
        const next = this.get() === 'dark' ? 'light' : 'dark';
        this.set(next);
        return next;
    },
    
    apply(mode) {
        document.documentElement.setAttribute('data-theme', mode);
        // تحديث الـ checkbox إذا موجود
        const cb = document.getElementById('themeCheckbox');
        if (cb) cb.checked = (mode === 'dark');
    },
    
    init() {
        this.apply(this.get());
        // انتظر تحميل الصفحة قبل ربط الزر
        document.addEventListener('DOMContentLoaded', () => {
            const cb = document.getElementById('themeCheckbox');
            if (cb) {
                cb.checked = (this.get() === 'dark');
                cb.addEventListener('change', () => {
                    this.set(cb.checked ? 'dark' : 'light');
                });
            }
        });
    }
};

Theme.init();