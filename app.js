// --- State Management ---
let goals = JSON.parse(localStorage.getItem('glo_goals')) || [];
let rewards = JSON.parse(localStorage.getItem('glo_rewards')) || [];
let vision = JSON.parse(localStorage.getItem('glo_vision')) || Array(9).fill(null);

// Get current viewing month for the calendar strips
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
        logs: {}, // Format: {"2023-10-25": "success" | "fail"}
    });
    
    saveAndRender();
    closeModal('goal-modal');
}

// Toggle status of a specific date
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

function getStatusColor(status) {
    if (status === 'success') return 'bg-green-400 border-green-500 shadow-sm';
    if (status === 'fail') return 'bg-red-400 border-red-500 shadow-sm';
    return 'bg-slate-200 border-slate-300';
}

function renderGoals() {
    const container = document.getElementById('goals-list');
    if (!container) return;

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = viewDate.toLocaleString('default', { month: 'long' });

    container.innerHTML = `
        <div class="flex justify-between items-center mb-4 px-2 text-sm font-bold text-purple-400">
            <button onclick="changeMonth(-1)">⬅️</button>
            <span>${monthName} ${year}</span>
            <button onclick="changeMonth(1)">➡️</button>
        </div>
    ` + goals.map(goal => {
        const rewardName = rewards.find(r => r.id === goal.rewardId)?.name || "Assign Reward ✨";
        
        // Count total successes for this goal overall
        const totalSuccess = Object.values(goal.logs).filter(v => v === 'success').length;

        // Generate the dot strip
        let dotStrip = "";
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const status = goal.logs[dateStr] || 'none';
            
            dotStrip += `
                <div class="group relative flex flex-col items-center">
                    <div onclick="promptStatusUpdate('${goal.id}', '${dateStr}')" 
                         class="w-3.5 h-3.5 rounded-full border cursor-pointer transition-all hover:scale-125 ${getStatusColor(status)}">
                    </div>
                    <span class="text-[7px] opacity-0 group-hover:opacity-100 absolute -bottom-3">${d}</span>
                </div>
            `;
        }

        return `
            <div class="glo-card p-4 mb-4">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h3 class="font-bold text-purple-900 leading-tight">${goal.name}</h3>
                        <span onclick="openEditRewardUI('${goal.id}')" class="text-[10px] text-pink-500 cursor-pointer italic">
                            🎁 ${rewardName}
                        </span>
                    </div>
                    <div class="text-right">
                        <span class="text-xs font-bold text-purple-400">${totalSuccess} Total ✨</span>
                    </div>
                </div>

                <div class="flex gap-1 overflow-x-auto pb-4 no-scrollbar">
                    ${dotStrip}
                </div>

                <div class="flex justify-end">
                    <button onclick="deleteGoal('${goal.id}')" class="opacity-20 hover:opacity-100 text-xs">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function promptStatusUpdate(goalId, dateStr) {
    const choice = prompt(`Update ${dateStr}:\nType '1' for Success ✅\nType '2' for Fail ❌\nType '0' to Clear ⚪`);
    if (choice === '1') setDayStatus(goalId, dateStr, 'success');
    if (choice === '2') setDayStatus(goalId, dateStr, 'fail');
    if (choice === '0') setDayStatus(goalId, dateStr, 'none');
}

function changeMonth(offset) {
    viewDate.setMonth(viewDate.getMonth() + offset);
    saveAndRender();
}

// --- Reward, Vision, & Persistence ---

function saveReward() {
    const name = document.getElementById('reward-name').value;
    if(!name) return;
    rewards.push({ id: Date.now().toString(), name });
    saveAndRender();
    closeModal('reward-modal');
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
        <div onclick="updateVision(${index})" class="vision-slot shadow-sm border border-purple-100">
            ${img ? `<img src="${img}" alt="vision">` : `<span class="text-purple-200">✨</span>`}
        </div>
    `).join('');
}

function renderRewards() {
    const container = document.getElementById('rewards-list');
    if (container) container.innerHTML = rewards.map(r => `
        <div class="glo-card flex justify-between items-center py-3 px-5 mb-2">
            <span class="text-purple-800 font-medium">🎀 ${r.name}</span>
            <button onclick="deleteReward('${r.id}')" class="text-xs text-red-400">Delete</button>
        </div>
    `).join('');
}

function deleteGoal(id) { if(confirm("Delete goal?")) { goals = goals.filter(g => g.id !== id); saveAndRender(); } }
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
