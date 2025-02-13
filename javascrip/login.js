document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await axios.post('/api/login', {
                username: username,
                password: password
            });

            if (response.data.success) {
                // Guardar datos del usuario
                localStorage.setItem('user', JSON.stringify(response.data.user));
                // Redirigir al dashboard
                window.location.href = '/dashboard';
            } else {
                showError(response.data.message);
            }
        } catch (error) {
            showError('Error al iniciar sesión. Por favor, intenta de nuevo.');
            console.error('Error:', error);
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }
});