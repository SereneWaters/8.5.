let goals = JSON.parse(localStorage.getItem('glo_goals')) || [];
let rewards = JSON.parse(localStorage.getItem('glo_rewards')) || [];
let vision = JSON.parse(localStorage.getItem('glo_vision')) || Array(12).fill(null);
let viewDate = new Date();

window.createNewGoal = function(isActive) {
    const name = document.getElementById('new-goal-name').value;
    const duration = document.getElementById('new-goal-duration').value;
    const rewardId = document.getElementById('new-goal-reward').value;
    if (!name || !duration) return alert("Give your goal a name! ✨");
    goals.push({ id: Date.now().toString(), name, duration: parseInt(duration), rewardId, status: isActive ? 'active' : 'future', logs: {} });
    document.getElementById('new-goal-name').value = '';
    document.getElementById('new-goal-duration').value = '';
    saveAndRender();
};

window.promptStatusUpdate = function(goalId, dateStr) {
    const choice = prompt(`Status for ${dateStr}:\n1: Done ✅\n2: Fail ❌\n0: Reset ⚪`);
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    if (choice === '1') goal.logs[dateStr] = 'success';
    else if (choice === '2') goal.logs[dateStr] = 'fail';
    else if (choice === '0') delete goal.logs[dateStr];
    saveAndRender();
};

function renderGoals() {
    const activeContainer = document.getElementById('goals-list');
    const futureContainer = document.getElementById('future-goals-list');
    const rewardSelect = document.getElementById('new-goal-reward');
    activeContainer.innerHTML = ''; futureContainer.innerHTML = '';
    rewardSelect.innerHTML = '<option value="">Assign Reward...</option>' + 
        rewards.map(r => `<option value="${r.id}">${r.name}</option>`).join('');

    const year = viewDate.getFullYear(), month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = new Date().toISOString().split('T')[0];

    activeContainer.innerHTML = `<div class="flex justify-between items-center mb-6 px-6 py-3 bg-white/20 rounded-2xl text-purple-900 font-bold text-xs"><button onclick="changeMonth(-1)">PREV</button><span class="serif uppercase">${viewDate.toLocaleString('default',{month:'long'})} ${year}</span><button onclick="changeMonth(1)">NEXT</button></div>`;

    goals.forEach(goal => {
        const reward = rewards.find(r => r.id === goal.rewardId);
        if (goal.status === 'active') {
            let dots = "";
            for (let d = 1; d <= daysInMonth; d++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const status = goal.logs[dateStr] || 'none';
                let dotClass = "calendar-dot bg-white/20 border border-white/40 text-purple-900/30";
                if (status === 'success') dotClass = "calendar-dot success-dot";
                else if (status === 'fail') dotClass = "calendar-dot fail-dot";
                else if (dateStr === todayStr) dotClass = "calendar-dot today-dot";
                dots += `<div onclick="promptStatusUpdate('${goal.id}', '${dateStr}')" class="shrink-0 cursor-pointer ${dotClass}">${d}</div>`;
            }
            activeContainer.innerHTML += `<div class="glo-card p-6 mb-4"><div class="flex justify-between mb-4"><div><h3 class="serif font-semibold text-lg text-purple-900">${goal.name}</h3></div><button onclick="deleteGoal('${goal.id}')" class="text-xs opacity-20">🗑️</button></div><div class="flex gap-2 overflow-x-auto pb-4 no-scrollbar">${dots}</div><div class="mt-2"><span class="text-[10px] uppercase tracking-widest bg-white/40 px-3 py-1 rounded-full text-pink-500 font-bold">🎁 Reward: ${reward ? reward.name : 'Success ✨'}</span></div></div>`;
        } else {
            futureContainer.innerHTML += `<div class="flex justify-between items-center bg-white/30 p-4 rounded-2xl mb-2"><span class="serif text-purple-800">${goal.name}</span><button onclick="activateGoal('${goal.id}')" class="text-[9px] bg-white text-purple-600 px-4 py-2 rounded-xl font-bold uppercase border border-purple-100">Activate</button></div>`;
        }
    });
}

window.changeMonth = (o) => { viewDate.setMonth(viewDate.getMonth() + o); renderGoals(); };
window.activateGoal = (id) => { const g = goals.find(x => x.id === id); if(g) g.status = 'active'; saveAndRender(); };
window.addRewardPrompt = () => { const n = prompt("Reward name?"); if(n) { rewards.push({id: Date.now().toString(), name: n}); saveAndRender(); } };
window.deleteGoal = (id) => { if(confirm("Delete?")) { goals = goals.filter(g => g.id !== id); saveAndRender(); } };
window.updateVision = (i) => { const u = prompt("Image URL?"); if(u) { vision[i] = u; saveAndRender(); } };

function renderVisionBoard() {
    const grid = document.getElementById('vision-grid');
    if (grid) grid.innerHTML = vision.map((img, i) => `<div onclick="updateVision(${i})" class="vision-slot cursor-pointer">${img ? `<img src="${img}">` : `<div class="w-full h-full flex items-center justify-center text-purple-200">✨</div>`}</div>`).join('');
}

function renderRewards() {
    document.getElementById('rewards-list').innerHTML = rewards.map(r => `<div class="glo-card flex justify-between items-center p-4 mb-2"><span class="serif text-sm">🎀 ${r.name}</span><button onclick="deleteReward('${r.id}')" class="text-[10px] text-red-300 font-bold">Remove</button></div>`).join('');
}

function saveAndRender() {
    localStorage.setItem('glo_goals', JSON.stringify(goals));
    localStorage.setItem('glo_rewards', JSON.stringify(rewards));
    localStorage.setItem('glo_vision', JSON.stringify(vision));
    renderGoals(); renderVisionBoard(); renderRewards();
}

window.onload = saveAndRender;
