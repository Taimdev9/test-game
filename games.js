function renderGame(area, room, roomCode, user, profile) {
    const renderers = {
        tictactoe: renderTicTacToe, rps: renderRPS, reaction: renderReaction,
        wordchain: renderWordChain, connect4: renderConnect4,
        guessnum: renderGuessNum, typing: renderTyping, uno: renderUNO
    };
    const fn = renderers[room.gameType];
    if (fn) fn(area, room, roomCode, user, profile);
}

// X-O
function renderTicTacToe(area, room, code, user) {
    const ids = Object.keys(room.players).sort();
    const roomRef = db.ref('rooms/' + code);
    if (!room.state) {
        roomRef.child('state').set({ board: Array(9).fill(''), turn: ids[0], winner: null });
        return;
    }
    const { board, turn, winner } = room.state;
    const mySymbol = ids.indexOf(user.uid) === 0 ? 'X' : 'O';
    const myTurn = turn === user.uid && !winner;
    setTurnIndicator(winner ? resultText(winner, user) : (myTurn ? '🎯 دورك!' : '⏳ دور الخصم...'), myTurn);
    let html = '<div class="ttt-board">';
    board.forEach((v, i) => {
        const cls = v === 'X' ? 'x filled' : v === 'O' ? 'o filled' : '';
        const display = v === 'X' ? ICONS.x : v === 'O' ? ICONS.circle : '';
        html += `<div class="ttt-cell ${cls}" data-i="${i}">${display}</div>`;
    });
    html += '</div>';
    area.innerHTML = html;
    area.querySelectorAll('.ttt-cell').forEach(cell => {
        cell.onclick = () => {
            const i = +cell.dataset.i;
            if (!myTurn || board[i] || winner) return;
            const nb = [...board]; nb[i] = mySymbol;
            const w = checkTTT(nb, room);
            const next = ids.find(id => id !== user.uid);
            roomRef.child('state').update({ board: nb, turn: next, winner: w });
            if (w) recordResult(user.uid, w, ids, room);
        };
    });
}
function checkTTT(b, room) {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    const ids = Object.keys(room.players).sort();
    for (const [a,c,d] of lines) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a] === 'X' ? ids[0] : ids[1];
    return b.every(x => x) ? 'draw' : null;
}

// RPS
function renderRPS(area, room, code, user) {
    const roomRef = db.ref('rooms/' + code);
    if (!room.state) { roomRef.child('state').set({ choices: {}, scores: {}, round: 1 }); return; }
    const s = room.state;
    const oppId = Object.keys(room.players).find(id => id !== user.uid);
    const myChoice = s.choices?.[user.uid];
    const oppChoice = s.choices?.[oppId];
    const bothChose = myChoice && oppChoice;
    let status = '🎯 اختر!';
    if (bothChose) {
        const r = rpsResult(myChoice, oppChoice);
        status = r === 'win' ? '🎉 فزت!' : r === 'lose' ? '😢 خسرت' : '🤝 تعادل';
    } else if (myChoice) status = '⏳ بانتظار الخصم...';
    const myScore = s.scores?.[user.uid] || 0, oppScore = s.scores?.[oppId] || 0;
    setTurnIndicator(`${status} — أنت ${myScore} : ${oppScore} الخصم`, !!myChoice && !bothChose);
    area.innerHTML = `<div class="rps-choices">
        <button class="rps-btn ${myChoice === 'rock' ? 'selected' : ''}" data-c="rock">✊</button>
        <button class="rps-btn ${myChoice === 'paper' ? 'selected' : ''}" data-c="paper">✋</button>
        <button class="rps-btn ${myChoice === 'scissors' ? 'selected' : ''}" data-c="scissors">✌️</button>
    </div>`;
    area.querySelectorAll('.rps-btn').forEach(btn => {
        btn.onclick = async () => {
            if (myChoice) return;
            await roomRef.child('state/choices/' + user.uid).set(btn.dataset.c);
            const snap = await roomRef.child('state/choices').once('value');
            const c = snap.val() || {};
            if (c[oppId] && c[user.uid]) {
                const r = rpsResult(c[user.uid], c[oppId]);
                if (r === 'win') await roomRef.child('state/scores/' + user.uid).transaction(v => (v || 0) + 1);
                else if (r === 'lose') await roomRef.child('state/scores/' + oppId).transaction(v => (v || 0) + 1);
                setTimeout(() => roomRef.child('state/choices').remove(), 2500);
            }
        };
    });
}
function rpsResult(a, b) {
    if (a === b) return 'draw';
    if ((a === 'rock' && b === 'scissors') || (a === 'paper' && b === 'rock') || (a === 'scissors' && b === 'paper')) return 'win';
    return 'lose';
}

// Reaction
function renderReaction(area, room, code, user) {
    const roomRef = db.ref('rooms/' + code);
    if (!room.state) { roomRef.child('state').set({ status: 'idle', winner: null }); return; }
    const s = room.state;
    const ids = Object.keys(room.players).sort();
    const isHost = user.uid === ids[0];
    let cls = 'reaction-idle', text = '';
    if (s.status === 'idle') text = isHost ? 'اضغط لبدء الجولة' : 'بانتظار المضيف...';
    else if (s.status === 'waiting') { cls = 'reaction-wait'; text = 'استعد...'; }
    else if (s.status === 'go') { cls = 'reaction-go'; text = 'اضغط الآن!'; }
    else if (s.status === 'done') {
        const wName = room.players[s.winner]?.name || '؟';
        text = s.winner === user.uid ? '🎉 فزت!' : `😢 فاز ${wName}`;
        cls = s.winner === user.uid ? 'reaction-go' : 'reaction-wait';
    }
    setTurnIndicator('تحدي رد الفعل', false);
    area.innerHTML = `<div class="reaction-area ${cls}" id="reactionBox">${text}</div>`;
    document.getElementById('reactionBox').onclick = async () => {
        if (s.status === 'idle' && isHost) {
            await roomRef.child('state').update({ status: 'waiting', winner: null });
            const delay = 2000 + Math.random() * 3000;
            setTimeout(() => roomRef.child('state/status').set('go'), delay);
        } else if (s.status === 'go') {
            await roomRef.child('state/winner').transaction(w => w === null ? user.uid : undefined);
            await roomRef.child('state/status').set('done');
        } else if (s.status === 'done' && isHost) {
            await roomRef.child('state').update({ status: 'idle', winner: null });
        }
    };
}

// Word Chain
function renderWordChain(area, room, code, user) {
    const roomRef = db.ref('rooms/' + code);
    const ids = Object.keys(room.players).sort();
    if (!room.state) { roomRef.child('state').set({ words: [], turn: ids[0] }); return; }
    const s = room.state;
    const isMyTurn = s.turn === user.uid;
    const last = s.words[s.words.length - 1];
    const lastLetter = last ? last.word.slice(-1) : null;
    setTurnIndicator(isMyTurn ? '🎯 دورك!' : '⏳ دور الخصم...', isMyTurn);
    area.innerHTML = `
        <div class="word-list">
            ${s.words.length === 0
                ? '<div style="text-align:center;color:var(--text-dim);padding:20px;">لا كلمات بعد</div>'
                : s.words.map(w => `<div class="word-item">👤 ${escapeHtml(room.players[w.by]?.name || '؟')}: <b>${escapeHtml(w.word)}</b></div>`).join('')}
        </div>
        <input type="text" id="wcInput" placeholder="${lastLetter ? 'كلمة تبدأ بـ ' + lastLetter : 'اكتب أول كلمة'}" ${!isMyTurn ? 'disabled' : ''}>
        <button class="btn btn-primary" id="wcSend" ${!isMyTurn ? 'disabled' : ''}>أرسل</button>
    `;
    const send = async () => {
        const w = document.getElementById('wcInput').value.trim();
        if (!w) return;
        if (lastLetter && w[0] !== lastLetter) return toast('يجب أن تبدأ بحرف ' + lastLetter, 'error');
        const newWords = [...s.words, { word: w, by: user.uid }];
        const next = ids[(ids.indexOf(user.uid) + 1) % ids.length];
        await roomRef.child('state').update({ words: newWords, turn: next });
        document.getElementById('wcInput').value = '';
    };
    const btn = document.getElementById('wcSend');
    if (btn) btn.onclick = send;
    const inp = document.getElementById('wcInput');
    if (inp) inp.onkeypress = e => { if (e.key === 'Enter') send(); };
}

// Connect 4
function renderConnect4(area, room, code, user) {
    const roomRef = db.ref('rooms/' + code);
    const ids = Object.keys(room.players).sort();
    if (!room.state) { roomRef.child('state').set({ board: Array(42).fill(''), turn: ids[0], winner: null }); return; }
    const { board, turn, winner } = room.state;
    const myColor = ids.indexOf(user.uid) === 0 ? 'red' : 'yellow';
    const myTurn = turn === user.uid && !winner;
    setTurnIndicator(winner ? (winner === 'draw' ? '🤝 تعادل!' : (winner === user.uid ? '🎉 فزت!' : '😢 خسرت')) : (myTurn ? '🎯 دورك!' : '⏳ دور الخصم...'), myTurn);
    let html = '<div class="c4-board">';
    for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) {
        const v = board[r * 7 + c] || '';
        html += `<div class="c4-cell ${v}" data-c="${c}"></div>`;
    }
    html += '</div>';
    area.innerHTML = html;
    area.querySelectorAll('.c4-cell').forEach(cell => {
        cell.onclick = () => {
            if (!myTurn) return;
            const col = +cell.dataset.c;
            let row = -1;
            for (let r = 5; r >= 0; r--) if (!board[r * 7 + col]) { row = r; break; }
            if (row < 0) return;
            const nb = [...board]; nb[row * 7 + col] = myColor;
            const w = checkC4(nb, room);
            const next = ids.find(id => id !== user.uid);
            roomRef.child('state').update({ board: nb, turn: next, winner: w });
            if (w) recordResult(user.uid, w, ids, room);
        };
    });
}
function checkC4(b, room) {
    const ids = Object.keys(room.players).sort();
    const get = (r, c) => (r >= 0 && r < 6 && c >= 0 && c < 7) ? b[r * 7 + c] : '';
    const dirs = [[0,1],[1,0],[1,1],[1,-1]];
    for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) {
        const v = get(r, c);
        if (!v) continue;
        for (const [dr, dc] of dirs) {
            let ok = true;
            for (let k = 1; k < 4; k++) if (get(r + dr * k, c + dc * k) !== v) { ok = false; break; }
            if (ok) return v === 'red' ? ids[0] : ids[1];
        }
    }
    return b.every(x => x) ? 'draw' : null;
}

// Guess Number
function renderGuessNum(area, room, code, user) {
    const roomRef = db.ref('rooms/' + code);
    if (!room.state) { roomRef.child('state').set({ secret: Math.floor(Math.random() * 100) + 1, guesses: {}, winner: null }); return; }
    const s = room.state;
    const winnerName = s.winner ? room.players[s.winner]?.name : null;
    setTurnIndicator(s.winner ? `🎉 فاز ${winnerName}!` : 'خمن رقم من 1 إلى 100', false);
    let history = '';
    Object.entries(s.guesses || {}).forEach(([uid, g]) => {
        const pName = room.players[uid]?.name || '؟';
        history += `<div class="word-item">👤 ${escapeHtml(pName)}: ${g.value} — ${g.hint}</div>`;
    });
    area.innerHTML = `
        <div class="word-list">${history || '<div style="text-align:center;color:var(--text-dim);padding:20px;">لا تخمينات بعد</div>'}</div>
        ${s.winner ? '' : `
            <input type="number" id="gnInput" min="1" max="100" placeholder="اكتب رقمك...">
            <button class="btn btn-primary" id="gnSend">خمن!</button>
        `}
    `;
    const send = async () => {
        const v = parseInt(document.getElementById('gnInput').value);
        if (!v || v < 1 || v > 100) return toast('أدخل رقم بين 1 و 100', 'error');
        if (v === s.secret) {
            await roomRef.child('state/winner').set(user.uid);
            await roomRef.child('state/guesses/' + user.uid).set({ value: v, hint: '✅ صحيح!' });
        } else {
            const hint = v < s.secret ? '⬆️ أعلى' : '⬇️ أقل';
            await roomRef.child('state/guesses/' + user.uid).set({ value: v, hint });
        }
        document.getElementById('gnInput').value = '';
    };
    const btn = document.getElementById('gnSend');
    if (btn) btn.onclick = send;
    const inp = document.getElementById('gnInput');
    if (inp) inp.onkeypress = e => { if (e.key === 'Enter') send(); };
}

// Typing
const TYPING_SENTENCES = [
    'اللغة العربية من أجمل لغات العالم', 'التكنولوجيا تغير حياتنا كل يوم',
    'الأصدقاء الحقيقيون كنز لا يفنى', 'العلم نور والجهل ظلام',
    'الصبر مفتاح الفرج', 'من جد وجد ومن زرع حصد',
    'الوقت كالسيف إن لم تقطعه قطعك', 'القراءة غذاء العقل والروح',
    'السعادة ليست في المال بل في القناعة', 'الأمل يبدأ عندما نقرر أن نحاول'
];
function renderTyping(area, room, code, user) {
    const roomRef = db.ref('rooms/' + code);
    if (!room.state) {
        const sentence = TYPING_SENTENCES[Math.floor(Math.random() * TYPING_SENTENCES.length)];
        roomRef.child('state').set({ sentence, finished: {}, winner: null });
        return;
    }
    const s = room.state;
    if (s.winner) setTurnIndicator(`🎉 فاز ${room.players[s.winner]?.name}!`, false);
    else setTurnIndicator('⌨️ اكتب الجملة بأسرع ما يمكن!', true);
    area.innerHTML = `
        <div style="background:var(--surface-2); border:1px solid var(--border); padding:18px; border-radius:12px; text-align:center; font-size:17px; font-weight:700; margin-bottom:14px;">
            ${escapeHtml(s.sentence)}
        </div>
        ${s.winner ? '' : `
            <input type="text" id="typeInput" placeholder="اكتب الجملة هنا...">
            <button class="btn btn-primary" id="typeSend">إرسال</button>
        `}
        <div class="word-list" style="max-height:150px;">
            ${Object.entries(s.finished || {}).map(([uid]) =>
                `<div class="word-item">✅ ${escapeHtml(room.players[uid]?.name || '؟')}</div>`
            ).join('') || '<div style="text-align:center;color:var(--text-dim);padding:10px;">لا منتهين بعد</div>'}
        </div>
    `;
    const send = async () => {
        const v = document.getElementById('typeInput').value.trim();
        if (v === s.sentence) {
            await roomRef.child('state/finished/' + user.uid).set(Date.now());
            await roomRef.child('state/winner').transaction(w => w === null ? user.uid : undefined);
        } else toast('غير مطابق!', 'error');
    };
    const btn = document.getElementById('typeSend');
    if (btn) btn.onclick = send;
    const inp = document.getElementById('typeInput');
    if (inp) inp.onkeypress = e => { if (e.key === 'Enter') send(); };
}

// Helpers
function setTurnIndicator(text, myTurn) {
    const el = document.getElementById('turnIndicator');
    if (!el) return;
    el.textContent = text;
    el.className = 'turn-indicator' + (myTurn ? ' my-turn' : '');
}
function resultText(winner, user) {
    if (winner === 'draw') return '🤝 تعادل!';
    return winner === user.uid ? '🎉 فزت!' : '😢 خسرت';
}
function recordResult(myUid, winner, ids, room) {
    const loserUid = ids.find(id => id !== myUid);
    if (winner === 'draw') { User.addResult(myUid, 'draw'); if (loserUid) User.addResult(loserUid, 'draw'); }
    else if (winner === myUid) { User.addResult(myUid, 'win'); if (loserUid) User.addResult(loserUid, 'loss'); }
    else { User.addResult(myUid, 'loss'); if (loserUid) User.addResult(loserUid, 'win'); }
    Missions.trackProgress(myUid, 'gamesPlayed', 1);
    Missions.trackProgress(myUid, 'game_' + room.gameType, 1);
    if (winner === myUid) Missions.trackProgress(myUid, 'wins', 1);
}