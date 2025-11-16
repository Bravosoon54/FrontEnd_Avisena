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
    },

    getUserRole: () => {
        const user = authService.getCurrentUser();
        return user ? user.id_rol : null;
    },

    canCreate: () => {
        const role = authService.getUserRole();
        return role === 1 || role === 2 || role === 3;
    },

    canUpdate: () => {
        const role = authService.getUserRole();
        return role === 1 || role === 2 || role === 3;
    },

    canDelete: () => {
        const role = authService.getUserRole();
        return role === 1;
    },

    canChangeStatus: () => {
        const role = authService.getUserRole();
        return role === 1 || role === 2 || role === 3;
    },

    hideIfNoPermission: (selector, canDo) => {
        if (!canDo) {
            const element = document.querySelector(selector);
            if (element) {
                element.style.display = 'none';
            }
        }
    }
};