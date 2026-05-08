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
renderVision();
