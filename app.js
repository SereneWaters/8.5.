// State Management
let goals = JSON.parse(localStorage.getItem('goals')) || [];
let rewards = JSON.parse(localStorage.getItem('rewards')) || [];
let vision = JSON.parse(localStorage.getItem('vision')) || Array(9).fill(null);

// Initialize Lucide Icons
lucide.createIcons();

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab'));
    document.getElementById(tabId).classList.add('active-tab');
    
    // Update Nav Colors
    document.querySelectorAll('nav button').forEach(btn => btn.classList.replace('text-blue-400', 'text-slate-400'));
    event.currentTarget.classList.replace('text-slate-400', 'text-blue-400');
}

// --- Goal Logic ---

function logActivity(goalId, dateString) {
    const goal = goals.find(g => g.id === goalId);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Simple Logic: If user misses a day (checks yesterday), reset counter.
    // In a full app, this would check the 'lastLogDate' gap.
    if (!goal.logs.includes(yesterday) && goal.logs.length > 0) {
        alert("Gap detected! Streak reset to zero.");
        goal.currentStreak = 0;
    }

    if (!goal.logs.includes(dateString)) {
        goal.logs.push(dateString);
        goal.currentStreak++;
        saveAndRender();
    }
}

function renderGoals() {
    const list = document.getElementById('goals-list');
    list.innerHTML = goals.map(goal => {
        const progress = (goal.currentStreak / goal.duration) * 100;
        const rewardName = rewards.find(r => r.id === goal.rewardId)?.name || "No Reward Set";
        
        return `
            <div class="glass p-4 rounded-xl">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h3 class="font-bold text-lg">${goal.name}</h3>
                        <p class="text-xs text-slate-400">${goal.desc}</p>
                    </div>
                    <span class="text-blue-400 font-mono">${goal.currentStreak}/${goal.duration}d</span>
                </div>
                
                <div class="w-full bg-slate-800 h-2 rounded-full mb-4">
                    <div class="progress-bar bg-blue-500 h-2 rounded-full" style="width: ${Math.min(progress, 100)}%"></div>
                </div>

                <div class="flex justify-between items-center">
                    <span class="text-xs text-yellow-500 flex items-center">
                        <i data-lucide="award" class="w-3 h-3 mr-1"></i> ${rewardName}
                    </span>
                    <div class="flex gap-2">
                        <button onclick="logActivity('${goal.id}', '${new Date().toISOString().split('T')[0]}')" class="text-xs bg-blue-600 px-3 py-1 rounded">Log Today</button>
                        <button onclick="logActivity('${goal.id}', '${new Date(Date.now() - 86400000).toISOString().split('T')[0]}')" class="text-xs bg-slate-700 px-3 py-1 rounded">Log Yesterday</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    lucide.createIcons();
}

// --- Vision Board Logic ---

function renderVision() {
    const grid = document.getElementById('vision-grid');
    grid.innerHTML = vision.map((img, index) => `
        <div onclick="setVisionImage(${index})" class="glass rounded overflow-hidden cursor-pointer flex items-center justify-center bg-slate-800">
            ${img ? `<img src="${img}" class="w-full h-full object-cover">` : `<i data-lucide="image-plus" class="text-slate-600"></i>`}
        </div>
    `).join('');
    lucide.createIcons();
}

function setVisionImage(index) {
    const url = prompt("Enter Image URL (Unsplash/Pinterest link):");
    if (url) {
        vision[index] = url;
        saveAndRender();
    }
}

// Helpers
function saveAndRender() {
    localStorage.setItem('goals', JSON.stringify(goals));
    localStorage.setItem('rewards', JSON.stringify(rewards));
    localStorage.setItem('vision', JSON.stringify(vision));
    renderGoals();
    renderVision();
}

// Initial Run
renderGoals();

// --- State Management ---
let goals = JSON.parse(localStorage.getItem('glo_goals')) || [];
let rewards = JSON.parse(localStorage.getItem('glo_rewards')) || [];
let vision = JSON.parse(localStorage.getItem('glo_vision')) || Array(9).fill(null);

// --- Core Goal Logic ---

/**
 * Logs activity for a specific date.
 * @param {string} goalId 
 * @param {string} dateStr - Format 'YYYY-MM-DD'
 */
function logGoal(goalId, dateStr) {
    const goal = goals.find(g => g.id === goalId);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // 1. Prevent double logging
    if (goal.logs.includes(dateStr)) return;

    // 2. The Reset Rule: 
    // If logging for today, but yesterday is missing and the streak wasn't 0
    if (dateStr === today && !goal.logs.includes(yesterday) && goal.currentStreak > 0) {
        alert("Oh no! The streak reset because yesterday was missed. ✨ Fresh start!");
        goal.currentStreak = 0;
    }

    // 3. Log the activity
    goal.logs.push(dateStr);
    goal.currentStreak++;

    // 4. Check for Completion
    if (goal.currentStreak >= goal.duration) {
        alert(`💖 Goal Met! Time to claim: ${getRewardName(goal.rewardId)}`);
    }

    saveAndRender();
}

/**
 * Explicitly marks a goal as failed for today, resetting the streak.
 */
function failGoal(goalId) {
    const goal = goals.find(g => g.id === goalId);
    if (confirm("Reset this streak to 0? You've got this, don't give up! ✨")) {
        goal.currentStreak = 0;
        saveAndRender();
    }
}

// --- Reward Mapping ---
function getRewardName(rewardId) {
    const reward = rewards.find(r => r.id === rewardId);
    return reward ? reward.name : "a little treat 🍬";
}

// --- Render Functions ---

function renderGoals() {
    const container = document.getElementById('goals-list');
    if (!container) return;

    container.innerHTML = goals.map(goal => {
        const progress = (goal.currentStreak / goal.duration) * 100;
        const today = new Date().toISOString().split('T')[0];
        const hasLoggedToday = goal.logs.includes(today);

        return `
            <div class="glo-card p-5 animate-in fade-in duration-500">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h3 class="font-bold text-lg text-purple-900">${goal.name}</h3>
                        <p class="text-xs opacity-60">${goal.desc || 'No description'}</p>
                    </div>
                    <div class="text-right">
                        <span class="text-sm font-bold text-purple-500">${goal.currentStreak}/${goal.duration} days</span>
                        <p class="text-[10px] uppercase tracking-widest opacity-50">${goal.frequency}</p>
                    </div>
                </div>

                <div class="w-full bg-purple-100 h-2.5 rounded-full mb-4 overflow-hidden border border-purple-50">
                    <div class="bg-gradient-to-right from-purple-400 to-pink-400 h-full rounded-full transition-all duration-1000" 
                         style="width: ${Math.min(progress, 100)}%"></div>
                </div>

                <div class="flex justify-between items-center">
                    <span class="text-xs font-medium text-pink-600 flex items-center gap-1">
                        🎁 ${getRewardName(goal.rewardId)}
                    </span>
                    
                    <div class="flex gap-2">
                        <button onclick="logGoal('${goal.id}', '${new Date(Date.now() - 86400000).toISOString().split('T')[0]}')" 
                                class="text-[10px] bg-white/50 px-2 py-1 rounded-lg border border-purple-100 hover:bg-white">
                            Log Yesterday
                        </button>
                        <button onclick="${hasLoggedToday ? '' : `logGoal('${goal.id}', '${today}')`}" 
                                class="${hasLoggedToday ? 'bg-green-400' : 'bg-purple-600'} text-white text-xs px-4 py-1.5 rounded-full shadow-md">
                            ${hasLoggedToday ? '✓ Done' : 'Complete Today'}
                        </button>
                        <button onclick="failGoal('${goal.id}')" class="bg-pink-100 text-pink-500 p-1.5 rounded-full">
                            ✕
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderVisionBoard() {
    const grid = document.getElementById('vision-grid');
    if (!grid) return;

    grid.innerHTML = vision.map((img, index) => `
        <div onclick="updateVision(${index})" class="vision-slot group relative cursor-pointer shadow-inner">
            ${img ? `<img src="${img}" class="w-full h-full object-cover">` : 
                    `<div class="w-full h-full flex items-center justify-center text-purple-200">✨</div>`}
            <div class="absolute inset-0 bg-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
                Edit
            </div>
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
}

// Initialize
window.onload = () => {
    renderGoals();
    renderVisionBoard();
};
renderVision();
