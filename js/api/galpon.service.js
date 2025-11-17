import { request } from "./apiClient.js";

export const galponService = {
  /**
   * @param {object} galponData
   * @returns {Promise<object>}
   */
  createGalpon: (galponData) => {
    return request(`/sheds/crear-galpon`, {
      method: "POST",
      body: JSON.stringify(galponData),
    });
  },

  getGalponesActivos: () => {
    const endpoint = `/sensors/galpon/activos`;
    return request(endpoint);
  },
  /**
   * Obtiene un galpón por su ID
   * @param {number} shedId
   * @returns {Promise<object>}
   */
  getGalponById: (shedId) => {
    const endpoint = `/sheds/by-id/${shedId}`;
    return request(endpoint);
  },

  /**
   * Actualiza un galpón
   * @param {number} shedId
   * @param {object} galponData
   * @returns {Promise<object>}
   */
  updateGalpon: (shedId, galponData) => {
    return request(`/sheds/by-id/${shedId}`, {
      method: "PUT",
      body: JSON.stringify(galponData),
    });
  },

  /**
   * Obtiene todos los galpones
   * @returns {Promise<Array>}
   */
  getGalpones: () => {
    const endpoint = `/sheds/all`;
    return request(endpoint);
  },

  /**
   * Cambia el estado de un galpón
   * @param {number} shedId
   * @param {boolean} newStatus
   * @returns {Promise<object>}
   */
  changeGalponStatus: (shedId, newStatus) => {
    return request(
      `/sheds/cambiar-estado/${shedId}?nuevo_estado=${newStatus}`,
      {
        method: "PUT",
      }
    );
  },
};
