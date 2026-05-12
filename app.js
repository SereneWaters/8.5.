// --- State Management ---
let goals = JSON.parse(localStorage.getItem('glo_goals')) || [];
let rewards = JSON.parse(localStorage.getItem('glo_rewards')) || [];
let vision = JSON.parse(localStorage.getItem('glo_vision')) || Array(9).fill(null);

let viewDate = new Date(); 

// --- UI Helpers ---
function openModal(id) { 
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active'); 
        if(id === 'goal-modal' || id === 'edit-reward-modal') updateRewardDropdowns();
    }
}

function closeModal(id) { 
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active'); 
}

function updateRewardDropdowns() {
    const selects = ['goal-reward', 'update-reward-select'];
    selects.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = '<option value="">Choose a reward...</option>' + 
                rewards.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
        }
    });
}

// --- Goal & Calendar Logic ---

function saveGoal() {
    const name = document.getElementById('goal-name').value;
    const duration = document.getElementById('goal-duration').value;
    const rewardId = document.getElementById('goal-reward').value;
    
    if(!name || !duration) return alert("Please fill in the name and duration! ✨");

    goals.push({
        id: Date.now().toString(),
        name,
        duration: parseInt(duration),
        rewardId,
        logs: {}, 
    });
    
    saveAndRender();
    closeModal('goal-modal');
}

function setDayStatus(goalId, dateStr, status) {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    if (status === 'none') {
        delete goal.logs[dateStr];
    } else {
        goal.logs[dateStr] = status;
    }
    saveAndRender();
}

function getStatusColor(status, isToday) {
    if (status === 'success') return 'bg-green-400 border-green-500 text-white';
    if (status === 'fail') return 'bg-red-400 border-red-500 text-white';
    if (isToday) return 'bg-purple-100 border-purple-400 text-purple-700 font-bold';
    return 'bg-white border-slate-200 text-slate-400';
}

function renderGoals() {
    const container = document.getElementById('goals-list');
    if (!container) return;

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = viewDate.toLocaleString('default', { month: 'long' });
    
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6 px-4 py-2 bg-purple-50 rounded-2xl text-purple-700 font-bold">
            <button onclick="changeMonth(-1)" class="hover:scale-125 transition">⬅️</button>
            <span class="tracking-wide uppercase text-xs">${monthName} ${year}</span>
            <button onclick="changeMonth(1)" class="hover:scale-125 transition">➡️</button>
        </div>
    ` + goals.map(goal => {
        const rewardName = rewards.find(r => r.id === goal.rewardId)?.name || "Assign Reward ✨";
        const totalSuccess = Object.values(goal.logs).filter(v => v === 'success').length;

        let dotStrip = "";
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const status = goal.logs[dateStr] || 'none';
            const isToday = dateStr === todayStr;
            
            dotStrip += `
                <div class="flex flex-col items-center gap-1">
                    <div onclick="promptStatusUpdate('${goal.id}', '${dateStr}')" 
                         class="w-7 h-7 rounded-lg border flex items-center justify-center cursor-pointer transition-all hover:shadow-md text-[10px] ${getStatusColor(status, isToday)}">
                        ${d}
                    </div>
                </div>
            `;
        }

        return `
            <div class="glo-card p-5 mb-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="font-bold text-purple-900 text-lg">${goal.name}</h3>
                        <span onclick="openEditRewardUI('${goal.id}')" class="text-[11px] text-pink-500 cursor-pointer hover:underline">
                            🎁 ${rewardName}
                        </span>
                    </div>
                    <div class="text-right flex flex-col items-end">
                        <span class="text-xs font-black text-purple-500 bg-purple-50 px-2 py-1 rounded-lg">${totalSuccess} SUCCESSES</span>
                    </div>
                </div>

                <div class="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                    ${dotStrip}
                </div>

                <div class="flex justify-end mt-2">
                    <button onclick="deleteGoal('${goal.id}')" class="text-[10px] opacity-20 hover:opacity-100 uppercase tracking-widest">Remove Goal 🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function promptStatusUpdate(goalId, dateStr) {
    const choice = prompt(`Update ${dateStr}:\n1: Success ✅\n2: Fail ❌\n0: Clear ⚪`);
    if (choice === '1') setDayStatus(goalId, dateStr, 'success');
    if (choice === '2') setDayStatus(goalId, dateStr, 'fail');
    if (choice === '0') setDayStatus(goalId, dateStr, 'none');
}

function changeMonth(offset) {
    viewDate.setMonth(viewDate.getMonth() + offset);
    saveAndRender();
}

// --- Rewards, Vision & Persistence ---

function saveReward() {
    const name = document.getElementById('reward-name').value;
    if(!name) return;
    rewards.push({ id: Date.now().toString(), name });
    saveAndRender();
    closeModal('reward-modal');
    document.getElementById('reward-name').value = '';
}

function openEditRewardUI(goalId) {
    const goal = goals.find(g => g.id === goalId);
    document.getElementById('edit-reward-goal-id').value = goalId;
    document.getElementById('edit-goal-name').innerText = `Goal: ${goal.name}`;
    openModal('edit-reward-modal');
}

function updateGoalReward() {
    const goalId = document.getElementById('edit-reward-goal-id').value;
    const rewardId = document.getElementById('update-reward-select').value;
    const goal = goals.find(g => g.id === goalId);
    if (goal) { goal.rewardId = rewardId; saveAndRender(); closeModal('edit-reward-modal'); }
}

function updateVision(index) {
    const url = prompt("Paste Pinterest Image URL:");
    if (url) { vision[index] = url; saveAndRender(); }
}

function renderVisionBoard() {
    const grid = document.getElementById('vision-grid');
    if (grid) grid.innerHTML = vision.map((img, index) => `
        <div onclick="updateVision(${index})" class="vision-slot border border-purple-50">
            ${img ? `<img src="${img}" alt="vision">` : `<span class="text-purple-200">✨</span>`}
        </div>
    `).join('');
}

function renderRewards() {
    const container = document.getElementById('rewards-list');
    if (container) container.innerHTML = rewards.map(r => `
        <div class="glo-card flex justify-between items-center py-4 px-6 mb-3">
            <span class="text-purple-800 font-bold text-sm">🎀 ${r.name}</span>
            <button onclick="deleteReward('${r.id}')" class="text-[10px] text-red-300 uppercase font-bold hover:text-red-500">Delete</button>
        </div>
    `).join('');
}

function deleteGoal(id) { if(confirm("Delete this goal?")) { goals = goals.filter(g => g.id !== id); saveAndRender(); } }
function deleteReward(id) { rewards = rewards.filter(r => r.id !== id); goals.forEach(g => { if(g.rewardId === id) g.rewardId = ""; }); saveAndRender(); }

function saveAndRender() {
    localStorage.setItem('glo_goals', JSON.stringify(goals));
    localStorage.setItem('glo_rewards', JSON.stringify(rewards));
    localStorage.setItem('glo_vision', JSON.stringify(vision));
    renderGoals();
    renderVisionBoard();
    renderRewards();
}

window.onload = () => { saveAndRender(); };
