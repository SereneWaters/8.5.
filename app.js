let goals = JSON.parse(localStorage.getItem('glo_goals')) || [];
let rewards = JSON.parse(localStorage.getItem('glo_rewards')) || [];
let vision = JSON.parse(localStorage.getItem('glo_vision')) || Array(12).fill(null);
let viewDate = new Date();
let editingGoalId = null;

window.createNewGoal = function(isActive) {
    const name = document.getElementById('new-goal-name').value;
    const duration = document.getElementById('new-goal-duration').value;
    const rewardId = document.getElementById('new-goal-reward').value;
    if (!name || !duration) return alert("Please set a name and duration! ✨");
    goals.push({ id: Date.now().toString(), name, duration: parseInt(duration), rewardId, status: isActive ? 'active' : 'future', logs: {} });
    document.getElementById('new-goal-name').value = '';
    document.getElementById('new-goal-duration').value = '';
    saveAndRender();
};

window.activateGoal = (id) => {
    const goal = goals.find(g => g.id === id);
    if (goal) goal.status = 'active';
    saveAndRender();
};

window.enterEditMode = (id) => { editingGoalId = id; renderGoals(); };
window.cancelEdit = () => { editingGoalId = null; renderGoals(); };

window.saveEdit = (id) => {
    const goal = goals.find(g => g.id === id);
    goal.name = document.getElementById(`edit-name-${id}`).value;
    goal.duration = parseInt(document.getElementById(`edit-dur-${id}`).value);
    goal.rewardId = document.getElementById(`edit-rew-${id}`).value;
    editingGoalId = null;
    checkGoalCompletion(goal);
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
    const successDates = Object.keys(goal.logs).filter(d => goal.logs[d] === 'success').sort();
    let maxStreak = 0, currentStreak = 0;
    if (successDates.length > 0) {
        for (let i = 0; i < successDates.length; i++) {
            if (i > 0) {
                const prev = new Date(successDates[i-1]), curr = new Date(successDates[i]);
                if (Math.round((curr - prev) / 86400000) === 1) currentStreak++;
                else currentStreak = 1;
            } else currentStreak = 1;
            if (currentStreak > maxStreak) maxStreak = currentStreak;
        }
    }
    if (maxStreak >= goal.duration) {
        const reward = rewards.find(r => r.id === goal.rewardId);
        const banner = document.getElementById('reward-banner');
        banner.innerHTML = `🏆 Goal Finished: ${goal.name}!<br>Claim: ${reward ? reward.name : 'Pure Satisfaction ✨'}`;
        banner.classList.remove('hidden');
        setTimeout(() => banner.classList.add('hidden'), 8000);
    }
}

function renderGoals() {
    const activeContainer = document.getElementById('goals-list');
    const futureContainer = document.getElementById('future-goals-list');
    const rewardSelect = document.getElementById('new-goal-reward');
    activeContainer.innerHTML = ''; futureContainer.innerHTML = '';
    rewardSelect.innerHTML = '<option value="">Optional Reward...</option>' + 
        rewards.map(r => `<option value="${r.id}">${r.name}</option>`).join('');

    const year = viewDate.getFullYear(), month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = new Date().toISOString().split('T')[0];

    activeContainer.innerHTML = `<div class="flex justify-between items-center mb-6 px-4 py-3 bg-white/30 rounded-2xl text-purple-900 serif text-sm font-bold tracking-widest"><button onclick="changeMonth(-1)">←</button><span>${viewDate.toLocaleString('default',{month:'long'}).toUpperCase()} ${year}</span><button onclick="changeMonth(1)">→</button></div>`;

    goals.forEach(goal => {
        const isEditing = editingGoalId === goal.id;
        const reward = rewards.find(r => r.id === goal.rewardId);
        if (isEditing) {
            const editHTML = `<div class="glo-card p-6 border-2 border-purple-300"><input id="edit-name-${goal.id}" type="text" value="${goal.name}" class="w-full p-2 mb-2 border rounded serif"><div class="flex gap-2 mb-2"><input id="edit-dur-${goal.id}" type="number" value="${goal.duration}" class="w-20 p-2 border rounded"><select id="edit-rew-${goal.id}" class="flex-1 p-2 border rounded bg-white"><option value="">No Reward</option>${rewards.map(r => `<option value="${r.id}" ${r.id === goal.rewardId ? 'selected' : ''}>${r.name}</option>`).join('')}</select></div><div class="flex gap-2"><button onclick="saveEdit('${goal.id}')" class="flex-1 btn-primary py-2 rounded text-xs uppercase font-bold">Save</button><button onclick="cancelEdit()" class="flex-1 bg-gray-100 py-2 rounded text-xs uppercase">Cancel</button></div></div>`;
            goal.status === 'active' ? activeContainer.innerHTML += editHTML : futureContainer.innerHTML += editHTML;
            return;
        }

        if (goal.status === 'active') {
            let dots = "";
            for (let d = 1; d <= daysInMonth; d++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const status = goal.logs[dateStr] || 'none';
                let dotClass = "calendar-dot bg-white/40 border border-white/80 text-purple-900/40";
                if (status === 'success') dotClass += " success-dot";
                else if (status === 'fail') dotClass += " fail-dot";
                else if (dateStr === todayStr) dotClass += " today-dot";
                dots += `<div onclick="promptStatusUpdate('${goal.id}', '${dateStr}')" class="shrink-0 cursor-pointer ${dotClass}">${d}</div>`;
            }
            activeContainer.innerHTML += `<div class="glo-card p-6"><div class="flex justify-between items-start mb-4"><div><h3 class="serif font-semibold text-lg text-purple-900">${goal.name}</h3><button onclick="enterEditMode('${goal.id}')" class="text-[10px] uppercase tracking-widest text-purple-400 font-bold">Edit Detail</button></div><button onclick="deleteGoal('${goal.id}')" class="text-xs opacity-20">🗑️</button></div><div class="flex gap-2 overflow-x-auto pb-4 no-scrollbar">${dots}</div><div class="mt-2"><span class="text-[10px] uppercase tracking-widest bg-white/50 px-3 py-1 rounded-full text-pink-500 font-bold">🎁 Reward: ${reward ? reward.name : 'Pure Satisfaction ✨'}</span></div></div>`;
        } else {
            futureContainer.innerHTML += `<div class="flex justify-between items-center bg-white/40 p-4 rounded-2xl border border-white/60"><div><p class="serif font-semibold text-purple-800">${goal.name}</p><button onclick="enterEditMode('${goal.id}')" class="text-[10px] uppercase tracking-widest text-purple-300 font-bold">Edit</button></div><button onclick="activateGoal('${goal.id}')" class="text-[10px] bg-white text-purple-700 px-5 py-2 rounded-xl font-bold uppercase border border-purple-100">Activate</button></div>`;
        }
    });
}

window.changeMonth = (o) => { viewDate.setMonth(viewDate.getMonth() + o); renderGoals(); };
window.addRewardPrompt = () => { const n = prompt("Reward Name:"); if (n) { rewards.push({ id: Date.now().toString(), name: n }); saveAndRender(); } };
window.deleteGoal = (id) => { if(confirm("Delete?")) { goals = goals.filter(g => g.id !== id); saveAndRender(); } };
window.deleteReward = (id) => { rewards = rewards.filter(r => r.id !== id); saveAndRender(); };
window.updateVision = (i) => { const u = prompt("Image URL:"); if(u) { vision[i] = u; saveAndRender(); } };

function renderVisionBoard() {
    const grid = document.getElementById('vision-grid');
    if (grid) grid.innerHTML = vision.map((img, i) => `<div onclick="updateVision(${i})" class="vision-slot">${img ? `<img src="${img}">` : `<span class="text-purple-200">✨</span>`}</div>`).join('');
}

function renderRewards() {
    document.getElementById('rewards-list').innerHTML = rewards.map(r => `<div class="glo-card flex justify-between items-center p-4"><span class="serif text-sm font-medium">🎀 ${r.name}</span><button onclick="deleteReward('${r.id}')" class="text-[10px] text-red-300 uppercase">Remove</button></div>`).join('');
}

function saveAndRender() {
    localStorage.setItem('glo_goals', JSON.stringify(goals));
    localStorage.setItem('glo_rewards', JSON.stringify(rewards));
    localStorage.setItem('glo_vision', JSON.stringify(vision));
    renderGoals(); renderVisionBoard(); renderRewards();
}

window.onload = saveAndRender;
