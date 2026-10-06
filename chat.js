// ================== Chat Component ==================
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
        // تتبع المهمة
        Missions.trackProgress(user.uid, 'messages', 1);
    };
    
    sendBtn.onclick = send;
    inputEl.onkeypress = (e) => { if (e.key === 'Enter') send(); };
    
    Chat.listen(roomCode, msg => {
        const div = document.createElement('div');
        div.className = 'chat-msg' + (msg.uid === user.uid ? ' mine' : '');
        div.innerHTML = `<span class="author">${escapeHtml(msg.name)}:</span><span>${escapeHtml(msg.text)}</span>`;
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    });
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
}