// --- State Management ---
// Using 'glo_' prefix for the aesthetic version data
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

    // Reset Logic: If logging a new date, check for a gap
    if (goal.logs.length > 0) {
        const sortedLogs = [...goal.logs].sort();
        const lastLogDate = new Date(sortedLogs[sortedLogs.length - 1]);
        const newLogDate = new Date(dateStr);
        
        const diffTime = newLogDate - lastLogDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        // If there's a gap of more than 1 day and the new log is after the last log
        if (diffDays > 1) {
            alert("Gap detected! Streak reset to 0. Discipline is key! ✨");
            goal.currentStreak = 0;
        }
    }

    goal.logs.push(dateStr);
    goal.currentStreak++;
    
    if (goal.currentStreak >= goal.duration) {
        const reward = rewards.find(r => r.id === goal.rewardId);
        alert(`🏆 Goal Finished! Time to enjoy: ${reward ? reward.name : 'your success'}! ✨`);
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
    // Remove from any goals using this reward
    goals.forEach(g => { if(g.rewardId === id) g.rewardId = ""; });
    saveAndRender();
}

// --- Vision Board Logic ---

function updateVision(index) {
    const url = prompt("Paste Pinterest/Image URL for this slot:");
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
        const rewardName = rewards.find(r => r.id === goal.rewardId)?.name || "Assign Reward ✨";
        
        // Visual Chart Logic: Create dots for the goal duration
        let calendarDots = "";
        for (let i = 1; i <= goal.duration; i++) {
            const isDone = i <= goal.currentStreak;
            calendarDots += `
                <div class="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-500
                    ${isDone ? 'bg-purple-500 text-white shadow-sm' : 'bg-purple-50 text-purple-200 border border-purple-100'}">
                    ${isDone ? '✨' : i}
                </div>
            `;
        }

        return `
            <div class="glo-card p-5 mb-4 animate-in fade-in">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h3 class="font-bold text-lg text-purple-900 leading-tight">${goal.name}</h3>
                        <span onclick="openEditRewardUI('${goal.id}')" class="text-[10px] text-pink-500 cursor-pointer hover:underline italic">
                            🎁 ${rewardName}
                        </span>
                    </div>
                    <div class="text-right">
                        <span class="text-xs font-bold text-purple-400 tracking-tighter">${goal.currentStreak}/${goal.duration}d</span>
                    </div>
                </div>

                <div class="flex flex-wrap gap-1.5 mb-4">
                    ${calendarDots}
                </div>

                <div class="progress-bg mb-4">
                    <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                </div>

                <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                        <input type="date" id="date-${goal.id}" class="text-[10px] border border-purple-100 rounded-lg p-1 outline-none">
                        <button onclick="logCustomDate('${goal.id}')" class="bg-purple-600 text-white text-xs px-4 py-1.5 rounded-full shadow-md hover:bg-purple-700 transition">Log Success</button>
                    </div>
                    <button onclick="deleteGoal('${goal.id}')" class="opacity-20 hover:opacity-100 transition-opacity">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function openEditRewardUI(goalId) {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    const goalNameEl = document.getElementById('edit-goal-name');
    const goalIdInput = document.getElementById('edit-reward-goal-id');
    
    if(goalNameEl) goalNameEl.innerText = `Goal: ${goal.name}`;
    if(goalIdInput) goalIdInput.value = goalId;
    
    openModal('edit-reward-modal');
}

function renderVisionBoard() {
    const grid = document.getElementById('vision-grid');
    if (!grid) return;

    grid.innerHTML = vision.map((img, index) => `
        <div onclick="updateVision(${index})" class="vision-slot shadow-sm group">
            ${img ? `<img src="${img}" alt="vision">` : `<span class="text-purple-200 group-hover:text-purple-400 transition">✨</span>`}
        </div>
    `).join('');
}

function renderRewards() {
    const container = document.getElementById('rewards-list');
    if (!container) return;

    container.innerHTML = rewards.map(r => `
        <div class="glo-card flex justify-between items-center py-3 px-5 mb-2">
            <span class="text-purple-800 font-medium">🎀 ${r.name}</span>
            <button onclick="deleteReward('${r.id}')" class="text-xs text-red-400 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition">Remove</button>
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
