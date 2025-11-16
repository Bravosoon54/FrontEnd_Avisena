import { request } from './apiClient.js';

export const tipoSensorService = {
    getTipoSensores: () => {
        const endpoint = `/sensor-types/tipo-sensor/all`;
        return request(endpoint);
    },

    getTipoSensorById: (tipoSensorId) => {
        const endpoint = `/sensor-types/tipo-sensor/by-id/${tipoSensorId}`;
        return request(endpoint);
    },

    createTipoSensor: (tipoSensorData) => {
        return request(`/sensor-types/tipo-sensor/crear`, {
            method: 'POST',
            body: JSON.stringify(tipoSensorData),
        });
    },

    updateTipoSensor: (tipoSensorId, tipoSensorData) => {
        return request(`/sensor-types/tipo-sensor/by-id/${tipoSensorId}`, {
            method: 'PUT',
            body: JSON.stringify(tipoSensorData),
        });
    },

    changeTipoSensorStatus: (tipoSensorId, newStatus) => {
        return request(`/sensor-types/tipo-sensor/cambiar-estado/${tipoSensorId}?nuevo_estado=${newStatus}`, {
            method: 'PUT',
        });
    },
};
