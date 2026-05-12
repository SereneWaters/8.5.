// --- State ---
let goals = JSON.parse(localStorage.getItem('glo_goals')) || [];
let rewards = JSON.parse(localStorage.getItem('glo_rewards')) || [];
let vision = JSON.parse(localStorage.getItem('glo_vision')) || Array(12).fill(null);
let viewDate = new Date();

// --- Goal Logic ---
window.createNewGoal = function(isActive) {
    const name = document.getElementById('new-goal-name').value;
    const duration = document.getElementById('new-goal-duration').value;
    const rewardId = document.getElementById('new-goal-reward').value;

    if (!name || !duration) return alert("Fill in name and duration! ✨");

    goals.push({
        id: Date.now().toString(),
        name: name,
        duration: parseInt(duration),
        rewardId: rewardId,
        status: isActive ? 'active' : 'future',
        logs: {} // format: {"YYYY-MM-DD": "success" | "fail"}
    });

    document.getElementById('new-goal-name').value = '';
    document.getElementById('new-goal-duration').value = '';
    saveAndRender();
};

window.activateGoal = function(id) {
    const goal = goals.find(g => g.id === id);
    if (goal) goal.status = 'active';
    saveAndRender();
};

window.promptStatusUpdate = function(goalId, dateStr) {
    const choice = prompt(`Update ${dateStr}:\n1: Success ✅\n2: Fail ❌\n0: Clear ⚪`);
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    if (choice === '1') goal.logs[dateStr] = 'success';
    else if (choice === '2') goal.logs[dateStr] = 'fail';
    else if (choice === '0') delete goal.logs[dateStr];

    checkGoalCompletion(goal);
    saveAndRender();
};

function checkGoalCompletion(goal) {
    const logEntries = Object.entries(goal.logs).sort(); // Sort by date
    let currentStreak = 0;
    let maxStreak = 0;

    // Logic for CONSECUTIVE success
    const successDates = Object.keys(goal.logs).filter(d => goal.logs[d] === 'success').sort();
    
    // Simple consecutive check
    let count = 0;
    if (successDates.length > 0) {
        for (let i = 0; i < successDates.length; i++) {
            if (i > 0) {
                const prev = new Date(successDates[i-1]);
                const curr = new Date(successDates[i]);
                const diff = (curr - prev) / (1000 * 60 * 60 * 24);
                if (diff === 1) count++;
                else count = 1;
            } else {
                count = 1;
            }
            if (count > maxStreak) maxStreak = count;
        }
    }

    if (maxStreak >= goal.duration) {
        const reward = rewards.find(r => r.id === goal.rewardId);
        const banner = document.getElementById('reward-banner');
        banner.innerHTML = `🏆 Goal Finished: ${goal.name}!<br>Claim Reward: ${reward ? reward.name : 'A big hug! ✨'}`;
        banner.classList.remove('hidden');
        setTimeout(() => banner.classList.add('hidden'), 10000);
    }
}

function renderGoals() {
    const activeContainer = document.getElementById('goals-list');
    const futureContainer = document.getElementById('future-goals-list');
    const rewardSelect = document.getElementById('new-goal-reward');
    
    activeContainer.innerHTML = '';
    futureContainer.innerHTML = '';
    rewardSelect.innerHTML = '<option value="">Optional Reward...</option>' + 
        rewards.map(r => `<option value="${r.id}">${r.name}</option>`).join('');

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = viewDate.toLocaleString('default', { month: 'long' });
    const todayStr = new Date().toISOString().split('T')[0];

    // Nav for Active Tracker
    activeContainer.innerHTML = `
        <div class="flex justify-between items-center mb-4 px-4 py-2 bg-white/50 rounded-xl text-purple-700 text-xs font-bold">
            <button onclick="changeMonth(-1)">⬅️</button>
            <span>${monthName.toUpperCase()} ${year}</span>
            <button onclick="changeMonth(1)">➡️</button>
        </div>`;

    goals.forEach(goal => {
        if (goal.status === 'active') {
            const reward = rewards.find(r => r.id === goal.rewardId);
            let dots = "";
            for (let d = 1; d <= daysInMonth; d++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const status = goal.logs[dateStr] || 'none';
                const color = status === 'success' ? 'bg-green-400 border-green-500' : 
                              status === 'fail' ? 'bg-red-400 border-red-500' : 
                              (dateStr === todayStr ? 'bg-purple-100 border-purple-300' : 'bg-white border-slate-200');
                dots += `<div onclick="promptStatusUpdate('${goal.id}', '${dateStr}')" class="w-7 h-7 shrink-0 rounded-lg border flex items-center justify-center text-[10px] cursor-pointer ${color}">${d}</div>`;
            }

            activeContainer.innerHTML += `
                <div class="glo-card p-4">
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="font-bold text-purple-900">${goal.name} <span class="text-[10px] opacity-40">(${goal.duration} days straight)</span></h3>
                        <button onclick="deleteGoal('${goal.id}')" class="text-xs opacity-20 hover:opacity-100">🗑️</button>
                    </div>
                    <div class="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">${dots}</div>
                    <p class="text-[10px] mt-1 text-pink-500 font-medium">🎁 Reward: ${reward ? reward.name : 'Pure Satisfaction'}</p>
                </div>`;
        } else {
            futureContainer.innerHTML += `
                <div class="flex justify-between items-center bg-white/60 p-3 rounded-xl border border-purple-50">
                    <div>
                        <p class="text-sm font-bold text-purple-800">${goal.name}</p>
                        <p class="text-[10px] opacity-50">${goal.duration} Days Target</p>
                    </div>
                    <button onclick="activateGoal('${goal.id}')" class="text-[10px] bg-purple-100 text-purple-700 px-3 py-1 rounded-lg font-bold hover:bg-purple-200">Activate</button>
                </div>`;
        }
    });
}

// --- Others ---
window.changeMonth = (offset) => { viewDate.setMonth(viewDate.getMonth() + offset); renderGoals(); };
window.addRewardPrompt = () => {
    const name = prompt("Reward Name (e.g., New Book, Pizza Night):");
    if (name) { rewards.push({ id: Date.now().toString(), name }); saveAndRender(); }
};
window.deleteGoal = (id) => { if(confirm("Delete?")) { goals = goals.filter(g => g.id !== id); saveAndRender(); } };
window.deleteReward = (id) => { rewards = rewards.filter(r => r.id !== id); saveAndRender(); };
window.updateVision = (i) => { const url = prompt("Image URL:"); if(url) { vision[i] = url; saveAndRender(); } };

function renderVisionBoard() {
    const grid = document.getElementById('vision-grid');
    if (grid) grid.innerHTML = vision.map((img, i) => `
        <div onclick="updateVision(${i})" class="vision-slot">
            ${img ? `<img src="${img}">` : `<span class="text-purple-200">✨</span>`}
        </div>`).join('');
}

function renderRewards() {
    document.getElementById('rewards-list').innerHTML = rewards.map(r => `
        <div class="glo-card flex justify-between items-center p-3">
            <span class="text-sm">🎀 ${r.name}</span>
            <button onclick="deleteReward('${r.id}')" class="text-[10px] text-red-300">Delete</button>
        </div>`).join('');
}

function saveAndRender() {
    localStorage.setItem('glo_goals', JSON.stringify(goals));
    localStorage.setItem('glo_rewards', JSON.stringify(rewards));
    localStorage.setItem('glo_vision', JSON.stringify(vision));
    renderGoals();
    renderVisionBoard();
    renderRewards();
}

window.onload = saveAndRender;
