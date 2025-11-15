// Este archivo tendrá una única función request que se encargará de todo el trabajo estandar: 
// añadir la URL base, poner el token, y manejar los errores 401. Esto evita repetir código en cada servicio.

// La única función que necesitamos importar es la de logout.
// La importamos para usarla en caso de un error 401.
import { authService } from './auth.service.js';

const API_BASE_URL = 'https://avisena-backend.onrender.com';

/**
 * Cliente central para realizar todas las peticiones a la API.
 * @param {string} endpoint - El endpoint al que se llamará (ej. '/users/get-by-centro').
 * @param {object} [options={}] - Opciones para la petición fetch (method, headers, body).
 * @returns {Promise<any>} - La respuesta de la API en formato JSON.
 */                          
export async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('access_token');

    const headers = {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            Swal.fire({
              icon: 'error',
              title: 'Permiso',
              text: 'No tiene permiso',
              confirmButtonText: 'Aceptar'
            });
        }

        if (response.status === 403) {  
            Swal.fire({
              icon: 'error',
              title: 'Token Inválido',
              text: 'Token inválido',
              confirmButtonText: 'Aceptar'
            });
            authService.logout();
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Ocurrió un error en la petición.' }));
            // Mostrar el error completo para debugging
            console.error('Detalles del error:', errorData);
            throw new Error(JSON.stringify(errorData));  // Convertir a string para verlo bien
        }
        
        return response.status === 204 ? {} : await response.json();

    } catch (error) {
        console.error(`Error en la petición a ${endpoint}:`, error);
        throw error;
    }
}