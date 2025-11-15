import { request } from './apiClient.js';

export const tipoSensorService = {
    /**
     * Obtiene todos los tipos de sensores
     * @returns {Promise<Array>}
     */
    getTipoSensores: () => {
        const endpoint = `/sensor-types/tipo-sensor/all`;
        return request(endpoint);
    },

    /**
     * Obtiene un tipo de sensor por su ID
     * @param {number} tipoSensorId
     * @returns {Promise<object>}
     */
    getTipoSensorById: (tipoSensorId) => {
        const endpoint = `/sensor-types/tipo-sensor/by-id/${tipoSensorId}`;
        return request(endpoint);
    },

    /**
     * Crea un nuevo tipo de sensor
     * @param {object} tipoSensorData
     * @returns {Promise<object>}
     */
    createTipoSensor: (tipoSensorData) => {
        return request(`/sensor-types/tipo-sensor/crear`, {
            method: 'POST',
            body: JSON.stringify(tipoSensorData),
        });
    },

    /**
     * Actualiza un tipo de sensor
     * @param {number} tipoSensorId
     * @param {object} tipoSensorData
     * @returns {Promise<object>}
     */
    updateTipoSensor: (tipoSensorId, tipoSensorData) => {
        return request(`/sensor-types/tipo-sensor/by-id/${tipoSensorId}`, {
            method: 'PUT',
            body: JSON.stringify(tipoSensorData),
        });
    },

    /**
     * Cambia el estado de un tipo de sensor
     * @param {number} tipoSensorId
     * @param {boolean} newStatus
     * @returns {Promise<object>}
     */
    changeTipoSensorStatus: (tipoSensorId, newStatus) => {
        return request(`/sensor-types/tipo-sensor/cambiar-estado/${tipoSensorId}?nuevo_estado=${newStatus}`, {
            method: 'PUT',
        });
    },
};
