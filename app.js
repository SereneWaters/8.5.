// --- State Management ---
// Using 'glo_' prefix to ensure clean data for the new aesthetic version
let goals = JSON.parse(localStorage.getItem('glo_goals')) || [];
let rewards = JSON.parse(localStorage.getItem('glo_rewards')) || [];
let vision = JSON.parse(localStorage.getItem('glo_vision')) || Array(9).fill(null);

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

// --- Goal & Reward Logic ---

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
        currentStreak: 0,
        logs: [],
        frequency: 'daily'
    });
    
    saveAndRender();
    closeModal('goal-modal');
    // Clear inputs
    document.getElementById('goal-name').value = '';
    document.getElementById('goal-duration').value = '';
}

function saveReward() {
    const name = document.getElementById('reward-name').value;
    if(!name) return;
    
    rewards.push({ id: Date.now().toString(), name });
    saveAndRender();
    closeModal('reward-modal');
    document.getElementById('reward-name').value = '';
}

function updateGoalReward() {
    const goalId = document.getElementById('edit-reward-goal-id').value;
    const rewardId = document.getElementById('update-reward-select').value;
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
        goal.rewardId = rewardId;
        saveAndRender();
        closeModal('edit-reward-modal');
    }
}

function logCustomDate(goalId) {
    const dateInput = document.getElementById(`date-${goalId}`);
    const dateStr = dateInput.value;
    if(!dateStr) return alert("Select a date first! 🎀");
    
    const goal = goals.find(g => g.id === goalId);
    if(goal.logs.includes(dateStr)) return alert("Already logged for this day!");

    // Strict Reset Logic: 
    if (goal.logs.length > 0) {
        const sortedLogs = [...goal.logs].sort();
        const lastLogDate = new Date(sortedLogs[sortedLogs.length - 1]);
        const newLogDate = new Date(dateStr);
        
        const diffTime = newLogDate - lastLogDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        // If there's a gap of more than 1 day and the new log is in the future relative to last log
        if (diffDays > 1) {
            alert("Gap detected! Streak reset to 0. You've got this! ✨");
            goal.currentStreak = 0;
        }
    }

    goal.logs.push(dateStr);
    goal.currentStreak++;
    
    if (goal.currentStreak >= goal.duration) {
        alert(`🏆 Goal Finished! Time for your reward!`);
    }
    
    saveAndRender();
}

function deleteGoal(id) {
    if(confirm("Delete this goal?")) {
        goals = goals.filter(g => g.id !== id);
        saveAndRender();
    }
}

function deleteReward(id) {
    rewards = rewards.filter(r => r.id !== id);
    goals.forEach(g => { if(g.rewardId === id) g.rewardId = ""; });
    saveAndRender();
}

// --- Vision Board Logic ---

function updateVision(index) {
    const url = prompt("Paste Pinterest Image URL:");
    if (url) {
        vision[index] = url;
        saveAndRender();
    }
}

// --- Render Functions ---

function renderGoals() {
    const container = document.getElementById('goals-list');
    if (!container) return;

    container.innerHTML = goals.map(goal => {
        const progress = (goal.currentStreak / goal.duration) * 100;
        const reward = rewards.find(r => r.id === goal.rewardId)?.name || "Set Reward ✨";
        
        return `
            <div class="glo-card">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h3 class="font-bold text-lg text-purple-900">${goal.name}</h3>
                        <span onclick="openEditRewardUI('${goal.id}')" class="text-[10px] text-pink-500 cursor-pointer hover:underline">
                            🎁 ${reward}
                        </span>
                    </div>
                    <div class="text-right">
                        <span class="text-sm font-bold text-purple-500">${goal.currentStreak}/${goal.duration}d</span>
                    </div>
                </div>

                <div class="progress-bg mb-4">
                    <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                </div>

                <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                        <input type="date" id="date-${goal.id}" class="text-[10px] border rounded p-1 outline-none">
                        <button onclick="logCustomDate('${goal.id}')" class="bg-purple-600 text-white text-xs px-3 py-1 rounded-full shadow-sm">Log</button>
                    </div>
                    <button onclick="deleteGoal('${goal.id}')" class="opacity-30 hover:opacity-100 transition">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function openEditRewardUI(goalId) {
    const goal = goals.find(g => g.id === goalId);
    document.getElementById('edit-reward-goal-id').value = goalId;
    document.getElementById('edit-goal-name').innerText = `Goal: ${goal.name}`;
    openModal('edit-reward-modal');
}

function renderVisionBoard() {
    const grid = document.getElementById('vision-grid');
    if (!grid) return;

    grid.innerHTML = vision.map((img, index) => `
        <div onclick="updateVision(${index})" class="vision-slot">
            ${img ? `<img src="${img}" alt="vision">` : `<span class="text-purple-200">✨</span>`}
        </div>
    `).join('');
}

function renderRewards() {
    const container = document.getElementById('rewards-list');
    if (!container) return;

    container.innerHTML = rewards.map(r => `
        <div class="glo-card flex justify-between items-center py-3 px-5 mb-2">
            <span class="text-purple-800 font-medium">🎀 ${r.name}</span>
            <button onclick="deleteReward('${r.id}')" class="text-xs text-red-400 bg-red-50 px-2 py-1 rounded-lg">Delete</button>
        </div>
    `).join('');
}

// --- Persistence ---
function saveAndRender() {
    localStorage.setItem('glo_goals', JSON.stringify(goals));
    localStorage.setItem('glo_rewards', JSON.stringify(rewards));
    localStorage.setItem('glo_vision', JSON.stringify(vision));
    renderGoals();
    renderVisionBoard();
    renderRewards();
}

// --- Initialization ---
window.onload = () => {
    saveAndRender();
};
