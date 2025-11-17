export const authService = {
    logout: () => {
        console.log('Cerrando sesión...');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    }
};
