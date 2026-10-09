const UNO_COLORS = ['red', 'blue', 'green', 'yellow'];

function createDeck() {
    const deck = [];
    UNO_COLORS.forEach(color => {
        deck.push({ color, value: '0' });
        for (let i = 0; i < 2; i++) {
            for (let v = 1; v <= 9; v++) deck.push({ color, value: String(v) });
            deck.push({ color, value: 'skip' });
            deck.push({ color, value: 'reverse' });
            deck.push({ color, value: 'draw2' });
        }
    });
    for (let i = 0; i < 4; i++) {
        deck.push({ color: 'wild', value: 'wild' });
        deck.push({ color: 'wild', value: 'wild4' });
    }
    return shuffle(deck);
}
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
function canPlay(card, topCard, currentColor) {
    if (card.color === 'wild') return true;
    if (card.color === currentColor) return true;
    if (card.value === topCard.value) return true;
    return false;
}
function cardDisplay(card) {
    if (card.value === 'wild' || card.value === 'wild4') {
        return `<span class="uno-card-value">${card.value === 'wild' ? '🌈' : '+4'}</span>`;
    }
    const symbols = { skip: '⊘', reverse: '⇄', draw2: '+2' };
    return `<span class="uno-card-value">${symbols[card.value] || card.value}</span>`;
}

function renderUNO(area, room, code, user, profile) {
    const roomRef = db.ref('rooms/' + code);
    if (!room.state) {
        const ids = Object.keys(room.players);
        const deck = createDeck();
        const hands = {};
        ids.forEach(uid => { hands[uid] = deck.splice(0, 7); });
        const topCard = deck.find(c => c.color !== 'wild') || deck[0];
        const topIndex = deck.indexOf(topCard);
        if (topIndex > -1) deck.splice(topIndex, 1);
        roomRef.child('state').set({
            deck, discard: [topCard], hands, turn: ids[0], direction: 1,
            currentColor: topCard.color, winner: null, unoCalled: {}
        });
        return;
    }
    const s = room.state;
    const ids = Object.keys(room.players).sort();
    const myHand = s.hands[user.uid] || [];
    const topCard = s.discard[s.discard.length - 1];
    const myTurn = s.turn === user.uid && !s.winner;

    if (s.winner) setTurnIndicator(`🎉 فاز ${room.players[s.winner]?.name}!`, false);
    else setTurnIndicator(myTurn ? '🎯 دورك!' : `⏳ دور ${room.players[s.turn]?.name}`, myTurn);

    let html = `
        <div class="uno-center">
            <div class="uno-card uno-${topCard.color}">${cardDisplay(topCard)}</div>
            <div style="color:var(--text-dim); font-size:13px; margin-top:8px;">
                الاتجاه: ${s.direction === 1 ? '⟳' : '⟲'} | اللون: <b>${s.currentColor || topCard.color}</b>
            </div>
        </div>
    `;
    html += '<h3 style="margin-top:16px;">أوراقك (' + myHand.length + ')</h3>';
    html += '<div class="uno-hand">';
    myHand.forEach((card, i) => {
        const playable = myTurn && canPlay(card, topCard, s.currentColor || topCard.color);
        html += `<div class="uno-card uno-${card.color} ${playable ? 'playable' : ''}" data-i="${i}">${cardDisplay(card)}</div>`;
    });
    html += '</div>';
    if (myTurn && !s.winner) html += `<button class="btn btn-outline" id="unoDraw">اسحب ورقة</button>`;
    area.innerHTML = html;

    area.querySelectorAll('.uno-card.playable').forEach(el => {
        el.onclick = async () => {
            const idx = +el.dataset.i;
            const card = myHand[idx];
            let chosenColor = null;
            if (card.color === 'wild') {
                chosenColor = prompt('اختر لوناً: red, blue, green, yellow');
                if (!chosenColor || !UNO_COLORS.includes(chosenColor)) return;
            }
            await playUNOCard(code, user, idx, chosenColor);
        };
    });
    const drawBtn = document.getElementById('unoDraw');
    if (drawBtn) drawBtn.onclick = () => drawUNOCard(code, user);
}

async function playUNOCard(code, user, cardIndex, chosenColor) {
    const roomRef = db.ref('rooms/' + code);
    const snap = await roomRef.once('value');
    const room = snap.val();
    const s = room.state;
    const ids = Object.keys(room.players).sort();
    const myHand = [...s.hands[user.uid]];
    const card = myHand[cardIndex];
    const topCard = s.discard[s.discard.length - 1];
    if (!canPlay(card, topCard, s.currentColor || topCard.color)) return;

    myHand.splice(cardIndex, 1);
    let nextIdx = ids.indexOf(user.uid) + s.direction;
    let drawStack = 0, skipNext = false, direction = s.direction;

    if (card.value === 'skip') skipNext = true;
    if (card.value === 'reverse') direction = -direction;
    if (card.value === 'draw2') drawStack = 2;
    if (card.value === 'wild4') drawStack = 4;
    if (skipNext) nextIdx += direction;
    nextIdx = ((nextIdx % ids.length) + ids.length) % ids.length;
    const nextUid = ids[nextIdx];
    const winner = myHand.length === 0 ? user.uid : null;

    const updates = {
        ['hands/' + user.uid]: myHand,
        discard: [...s.discard, card],
        turn: nextUid, direction,
        currentColor: chosenColor || (card.color === 'wild' ? 'wild' : card.color),
        winner
    };
    if (drawStack > 0) {
        const nextHand = [...(s.hands[nextUid] || [])];
        for (let i = 0; i < drawStack && i < s.deck.length; i++) nextHand.push(s.deck[i]);
        updates['hands/' + nextUid] = nextHand;
        updates.deck = s.deck.slice(drawStack);
        let afterIdx = ids.indexOf(nextUid) + direction;
        afterIdx = ((afterIdx % ids.length) + ids.length) % ids.length;
        updates.turn = ids[afterIdx];
    }
    await roomRef.child('state').update(updates);

    if (winner) {
        await User.addResult(user.uid, 'win');
        ids.filter(id => id !== user.uid).forEach(id => User.addResult(id, 'loss'));
        Missions.trackProgress(user.uid, 'gamesPlayed', 1);
        Missions.trackProgress(user.uid, 'game_uno', 1);
        Missions.trackProgress(user.uid, 'wins', 1);
        await User.addCoins(user.uid, 10);
    }
}

async function drawUNOCard(code, user) {
    const roomRef = db.ref('rooms/' + code);
    const snap = await roomRef.once('value');
    const s = snap.val().state;
    const ids = Object.keys(snap.val().players).sort();
    if (s.deck.length === 0) {
        const top = s.discard[s.discard.length - 1];
        const rest = s.discard.slice(0, -1);
        await roomRef.child('state').update({ deck: shuffle(rest), discard: [top] });
        return;
    }
    const card = s.deck[0];
    const myHand = [...(s.hands[user.uid] || []), card];
    const nextIdx = (ids.indexOf(user.uid) + s.direction + ids.length) % ids.length;
    await roomRef.child('state').update({
        deck: s.deck.slice(1),
        ['hands/' + user.uid]: myHand,
        turn: ids[nextIdx]
    });
}