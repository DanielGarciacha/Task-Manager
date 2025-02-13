document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadDashboardData();
});

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = '/';
        return;
    }
    document.getElementById('userName').textContent = user.name;
}

async function loadDashboardData() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await axios.get(`/api/tasks?user_id=${user.id}`);
        
        if (response.data.success) {
            updateTaskCounts(response.data.tasks);
            displayRecentTasks(response.data.tasks);
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function updateTaskCounts(tasks) {
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const completed = tasks.filter(t => t.status === 'completed').length;

    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('inProgressCount').textContent = inProgress;
    document.getElementById('completedCount').textContent = completed;
}

function displayRecentTasks(tasks) {
    const recentTasks = tasks.slice(0, 5); // Show only 5 most recent tasks
    const container = document.getElementById('recentTasks');
    container.innerHTML = '';

    recentTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'bg-gray-50 rounded-lg p-4';
        taskElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <h4 class="text-sm font-medium text-gray-900">${task.title}</h4>
                    <p class="text-sm text-gray-500">${task.description}</p>
                </div>
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-800'}">
                    ${task.status.replace('_', ' ')}
                </span>
            </div>
        `;
        container.appendChild(taskElement);
    });
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = '/';
}