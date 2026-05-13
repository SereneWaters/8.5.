// ... State Management stays the same ...
let goals = JSON.parse(localStorage.getItem('glo_goals')) || [];
let rewards = JSON.parse(localStorage.getItem('glo_rewards')) || [];
let vision = JSON.parse(localStorage.getItem('glo_vision')) || Array(12).fill(null);
let viewDate = new Date();
let editingGoalId = null;

// ... Persistence functions stay the same ...

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

    activeContainer.innerHTML = `
        <div class="flex justify-between items-center mb-6 px-4 py-3 bg-white/30 rounded-2xl text-purple-900 serif text-sm font-bold tracking-widest">
            <button onclick="changeMonth(-1)" class="hover:scale-110 transition">←</button>
            <span>${viewDate.toLocaleString('default',{month:'long'}).toUpperCase()} ${year}</span>
            <button onclick="changeMonth(1)" class="hover:scale-110 transition">→</button>
        </div>`;

    goals.forEach(goal => {
        const isEditing = editingGoalId === goal.id;
        const reward = rewards.find(r => r.id === goal.rewardId);
        
        if (isEditing) {
            activeContainer.innerHTML += `
                <div class="glo-card p-6 border-2 border-purple-300">
                    <input id="edit-name-${goal.id}" type="text" value="${goal.name}" class="w-full bg-white/50 p-3 mb-3 border rounded-xl serif">
                    <div class="flex gap-3 mb-3">
                        <input id="edit-dur-${goal.id}" type="number" value="${goal.duration}" class="w-24 p-3 border rounded-xl bg-white/50">
                        <select id="edit-rew-${goal.id}" class="flex-1 p-3 border rounded-xl bg-white/50">
                            <option value="">No Reward</option>
                            ${rewards.map(r => `<option value="${r.id}" ${r.id === goal.rewardId ? 'selected' : ''}>${r.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="saveEdit('${goal.id}')" class="flex-1 btn-primary py-2 rounded-xl text-xs font-bold uppercase tracking-wider">Save</button>
                        <button onclick="cancelEdit()" class="flex-1 py-2 rounded-xl text-xs uppercase opacity-50">Cancel</button>
                    </div>
                </div>`;
            return;
        }

        if (goal.status === 'active') {
            let dots = "";
            for (let d = 1; d <= daysInMonth; d++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const status = goal.logs[dateStr] || 'none';
                let dotClass = "calendar-dot bg-white/40 border border-white/80 text-purple-900/40";
                
                if (status === 'success') dotClass = "calendar-dot success-dot";
                else if (status === 'fail') dotClass = "calendar-dot fail-dot";
                else if (dateStr === todayStr) dotClass = "calendar-dot today-dot";

                dots += `<div onclick="promptStatusUpdate('${goal.id}', '${dateStr}')" class="shrink-0 flex items-center justify-center cursor-pointer ${dotClass}">${d}</div>`;
            }

            activeContainer.innerHTML += `
                <div class="glo-card p-6 animate-in">
                    <div class="flex justify-between items-start mb-5">
                        <div>
                            <h3 class="serif font-semibold text-lg text-purple-900">${goal.name}</h3>
                            <div class="flex gap-4 items-center mt-1">
                                <button onclick="enterEditMode('${goal.id}')" class="text-[10px] uppercase tracking-widest text-purple-400 font-bold">Edit Detail</button>
                                <span class="text-[10px] uppercase tracking-widest text-purple-300 font-bold">${goal.duration} Day Streak Target</span>
                            </div>
                        </div>
                        <button onclick="deleteGoal('${goal.id}')" class="text-xs opacity-20 hover:opacity-100 transition-opacity">🗑️</button>
                    </div>
                    <div class="flex gap-2 overflow-x-auto pb-4 no-scrollbar">${dots}</div>
                    <div class="mt-2 flex items-center gap-2">
                        <span class="text-[10px] uppercase tracking-widest bg-white/50 px-3 py-1 rounded-full text-pink-500 font-bold border border-pink-100">🎁 Reward: ${reward ? reward.name : 'Pure Satisfaction ✨'}</span>
                    </div>
                </div>`;
        } else {
            futureContainer.innerHTML += `
                <div class="flex justify-between items-center bg-white/40 backdrop-blur-sm p-4 rounded-2xl border border-white/60">
                    <div>
                        <p class="serif font-semibold text-purple-800">${goal.name}</p>
                        <button onclick="enterEditMode('${goal.id}')" class="text-[10px] uppercase tracking-widest text-purple-300 font-bold">Edit</button>
                    </div>
                    <button onclick="activateGoal('${goal.id}')" class="text-[10px] bg-white text-purple-700 px-5 py-2 rounded-xl font-bold border border-purple-100 hover:bg-purple-50 uppercase tracking-widest">Activate</button>
                </div>`;
        }
    });
}

// All other functions (changeMonth, saveAndRender, etc.) remain the same as the previous version.
// ... (Include the rest of the JS logic from the previous turn) ...
