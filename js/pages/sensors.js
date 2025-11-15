import { sensorService } from '../api/sensor.service.js';
import { tipoSensorService } from '../api/tipoSensor.service.js';
import { galponService } from '../api/galpon.service.js';

let modalInstance = null;
let createModalInstance = null;
let allSensors = [];

function createSensorRow(sensor) {
  const sensorId = sensor.id_sensor;

  return `
    <tr>
      <td class="cell">${sensor.nombre}</td>
      <td class="cell">${sensor.nombre_tipo} - ${sensor.modelo_tipo}</td>
      <td class="cell">${sensor.nombre_galpon}</td>
      <td class="cell">${sensor.descripcion}</td>
      <td class="cell">
        <div class="form-check form-switch d-inline-block">
          <input class="form-check-input sensor-status-switch" type="checkbox" role="switch" 
                 id="switch-${sensorId}" data-sensor-id="${sensorId}" 
                 ${sensor.estado ? 'checked' : ''}>
          <label class="form-check-label" for="switch-${sensorId}">
            ${sensor.estado ? 'Activo' : 'Inactivo'}
          </label>
        </div>
      </td>
      <td class="cell">
        <button class="btn btn-sm btn-info btn-edit-sensor" data-sensor-id="${sensorId}">
          <i class="fa-regular fa-pen-to-square"></i>
        </button>
      </td>
    </tr>
  `;
}

function filterSensors(filterValue) {
  let filteredSensors = [];

  if (filterValue === 'all') {
    filteredSensors = allSensors;
  } else if (filterValue === 'active') {
    filteredSensors = allSensors.filter(sensor => sensor.estado === true || sensor.estado === 1);
  } else if (filterValue === 'inactive') {
    filteredSensors = allSensors.filter(sensor => sensor.estado === false || sensor.estado === 0);
  }

  renderTable(filteredSensors);
}

function renderTable(sensors) {
  const tableBody = document.getElementById('sensors-table-body');
  if (!tableBody) return;

  if (sensors && sensors.length > 0) {
    tableBody.innerHTML = sensors.map(createSensorRow).join('');
  } else {
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay sensores con ese filtro.</td></tr>';
  }
}

async function cargarTiposSensores() {
  try {
    const tipos = await tipoSensorService.getTipoSensores();

    const normalizeTipo = (tipo) => {
      const id = tipo.id_tipo_sensor || tipo.id_tipo || tipo.id || tipo.idTipo || null;
      const nombre = tipo.nombre || tipo.name || '';
      const modelo = tipo.modelo || tipo.model || '';
      return { id, nombre, modelo };
    };

    const selectCrear = document.getElementById('create-id_tipo_sensor');
    if (selectCrear) {
      selectCrear.innerHTML = '<option value="" disabled selected>Seleccione un tipo</option>';
      tipos.forEach(tipoOrig => {
        const { id, nombre, modelo } = normalizeTipo(tipoOrig);
        // sólo añadir opciones válidas con id
        if (id !== null && id !== undefined) {
          selectCrear.innerHTML += `<option value="${id}">${nombre} - ${modelo}</option>`;
        }
      });
    }

    const selectEditar = document.getElementById('edit-id_tipo_sensor');
    if (selectEditar) {
      selectEditar.innerHTML = '<option value="" disabled selected>Seleccione un tipo...</option>';
      tipos.forEach(tipoOrig => {
        const { id, nombre, modelo } = normalizeTipo(tipoOrig);
        if (id !== null && id !== undefined) {
          selectEditar.innerHTML += `<option value="${id}">${nombre} - ${modelo}</option>`;
        }
      });
    }
  } catch (error) {
    console.error('Error al cargar tipos de sensores:', error);
  }
}

async function cargarGalpones() {
  try {
    const galpones = await galponService.getGalpones();
    
    const selectCrear = document.getElementById('create-id_galpon');
    selectCrear.innerHTML = '<option value="" disabled selected>Seleccione un galpón...</option>';
    galpones.forEach(galpon => {
      selectCrear.innerHTML += `<option value="${galpon.id_galpon}">${galpon.nombre}</option>`;
    });
    
    const selectEditar = document.getElementById('edit-id_galpon');
    selectEditar.innerHTML = '<option value="" disabled selected>Seleccione un galpón...</option>';
    galpones.forEach(galpon => {
      selectEditar.innerHTML += `<option value="${galpon.id_galpon}">${galpon.nombre}</option>`;
    });
  } catch (error) {
    console.error('Error al cargar galpones:', error);
  }
}

async function openEditModal(sensorId) {
  const modalElement = document.getElementById('edit-sensor-modal');
  if (!modalInstance) {
    modalInstance = new bootstrap.Modal(modalElement);
  }

  try {
    const sensor = await sensorService.getSensorById(sensorId);
    document.getElementById('edit-sensor-id').value = sensor.id_sensor;
    document.getElementById('edit-nombre').value = sensor.nombre;
    // Normalizar posibles nombres de campo que venga desde la API
    const sensorTipoId = sensor.id_tipo_sensor || sensor.id_tipo || sensor.idTipo || sensor.id || '';
    const sensorGalponId = sensor.id_galpon || sensor.id_galpono || sensor.id_galpon || sensor.id || '';
    document.getElementById('edit-id_tipo_sensor').value = sensorTipoId;
    document.getElementById('edit-id_galpon').value = sensorGalponId;
    document.getElementById('edit-descripcion').value = sensor.descripcion;
    modalInstance.show();
  } catch (error) {
    console.error('Error al obtener sensor:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudieron cargar los datos del sensor.',
      confirmButtonText: 'Aceptar'
    });
  }
}

async function handleUpdateSubmit(event) {
  event.preventDefault();

  const sensorId = document.getElementById('edit-sensor-id').value;
  const updatedData = {
    nombre: document.getElementById('edit-nombre').value,
    id_tipo_sensor: parseInt(document.getElementById('edit-id_tipo_sensor').value),
    id_galpon: parseInt(document.getElementById('edit-id_galpon').value),
    descripcion: document.getElementById('edit-descripcion').value
  };

  try {
    await sensorService.updateSensor(sensorId, updatedData);
    modalInstance.hide();
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Sensor actualizado exitosamente.',
      confirmButtonText: 'Aceptar'
    });
    init();
  } catch (error) {
    console.error('Error al actualizar sensor:', error);
    Swal.fire({
      icon: 'error',
      title: 'Actualizar',
      text: 'No se pudo actualizar el sensor.',
      confirmButtonText: 'Aceptar'
    });
  }
}

async function handleCreateSubmit(event) {
  event.preventDefault();
  const nombre = document.getElementById('create-nombre').value.trim();
  const idTipoValueRaw = document.getElementById('create-id_tipo_sensor').value;
  const idGalponValueRaw = document.getElementById('create-id_galpon').value;
  const descripcion = document.getElementById('create-descripcion').value.trim();

  // Normalizar y validar los valores del select (pueden venir con espacios o ser "undefined"/"null")
  const idTipoValue = idTipoValueRaw ? idTipoValueRaw.toString().trim() : '';
  const idGalponValue = idGalponValueRaw ? idGalponValueRaw.toString().trim() : '';

  const id_tipo_sensor = Number(idTipoValue);
  const id_galpon = Number(idGalponValue);

  // Debug: imprimir los valores para ayudar a rastrear problemas en runtime
  console.debug('handleCreateSubmit - idTipoValueRaw:', idTipoValueRaw, '-> normalized:', idTipoValue, 'parsed:', id_tipo_sensor);
  console.debug('handleCreateSubmit - idGalponValueRaw:', idGalponValueRaw, '-> normalized:', idGalponValue, 'parsed:', id_galpon);

  // Validaciones en frontend
  if (!nombre) {
    Swal.fire({
      icon: 'warning',
      title: 'Campo Requerido',
      text: 'El nombre es obligatorio.',
      confirmButtonText: 'Aceptar'
    });
    return;
  }
  if (!Number.isInteger(id_tipo_sensor) || id_tipo_sensor <= 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Selección Requerida',
      text: 'Por favor seleccione un tipo de sensor válido.',
      confirmButtonText: 'Aceptar'
    });
    return;
  }
  if (!Number.isInteger(id_galpon) || id_galpon <= 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Selección Requerida',
      text: 'Por favor seleccione un galpón válido.',
      confirmButtonText: 'Aceptar'
    });
    return;
  }
  if (descripcion.length < 10) {
    Swal.fire({
      icon: 'warning',
      title: 'Descripción Inválida',
      text: 'La descripción debe tener al menos 10 caracteres.',
      confirmButtonText: 'Aceptar'
    });
    return;
  }

  const newSensorData = {
    nombre,
    id_tipo_sensor,
    id_galpon,
    descripcion,
    estado: true
  };

  try {
    await sensorService.createSensor(newSensorData);
    if (createModalInstance) createModalInstance.hide();
    document.getElementById('create-sensor-form').reset();
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Sensor creado exitosamente.',
      confirmButtonText: 'Aceptar'
    });
    init();
  } catch (error) {
    console.error('Error al crear sensor:', error);
    // Si el backend devuelve detalles, intenta mostrarlos de forma legible
    try {
      const errObj = JSON.parse(error.message);
      console.error('Detalles del error:', errObj);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el sensor. Revise los campos y vuelva a intentarlo.',
        confirmButtonText: 'Aceptar'
      });
    } catch (parseErr) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el sensor.',
        confirmButtonText: 'Aceptar'
      });
    }
  }
}

async function handleStatusSwitch(event) {
  const switchElement = event.target;
  if (!switchElement.classList.contains('sensor-status-switch')) return;

  const sensorId = switchElement.dataset.sensorId;
  const newStatus = switchElement.checked;
  const actionText = newStatus ? 'activar' : 'desactivar';

  Swal.fire({
    title: '¿Está seguro?',
    text: `¿Desea ${actionText} este sensor?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, confirmar',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await sensorService.changeSensorStatus(sensorId, newStatus);
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: `El sensor ha sido ${newStatus ? 'activado' : 'desactivado'} exitosamente.`,
          confirmButtonText: 'Aceptar'
        });
        init();
      } catch (error) {
        console.error(`Error al ${actionText} el sensor:`, error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `No se pudo ${actionText} el sensor.`,
          confirmButtonText: 'Aceptar'
        });
        switchElement.checked = !newStatus;
      }
    } else {
      switchElement.checked = !newStatus;
    }
  });
}

async function handleTableClick(event) {
  const editButton = event.target.closest('.btn-edit-sensor');
  if (editButton) {
    const sensorId = editButton.dataset.sensorId;
    openEditModal(sensorId);
    return;
  }
}

function handleFilterChange(event) {
  const filterValue = event.target.value;
  filterSensors(filterValue);
}

async function init() {
  const tableBody = document.getElementById('sensors-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Cargando sensores...</td></tr>';

  await cargarTiposSensores();
  await cargarGalpones();

  try {
    const sensors = await sensorService.getSensors();
    allSensors = sensors || [];
    
    if (allSensors.length > 0) {
      renderTable(allSensors);
    } else {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay sensores registrados.</td></tr>';
    }
  } catch (error) {
    console.error('Error al cargar sensores:', error);
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error al cargar datos.</td></tr>';
  }

  const editForm = document.getElementById('edit-sensor-form');
  const createForm = document.getElementById('create-sensor-form');
  const filterSelect = document.getElementById('filter-estado');

  tableBody.removeEventListener('click', handleTableClick);
  tableBody.addEventListener('click', handleTableClick);
  
  tableBody.removeEventListener('change', handleStatusSwitch);
  tableBody.addEventListener('change', handleStatusSwitch);
  
  editForm.removeEventListener('submit', handleUpdateSubmit);
  editForm.addEventListener('submit', handleUpdateSubmit);
  
  createForm.removeEventListener('submit', handleCreateSubmit);
  createForm.addEventListener('submit', handleCreateSubmit);

  if (filterSelect) {
    filterSelect.removeEventListener('change', handleFilterChange);
    filterSelect.addEventListener('change', handleFilterChange);
  }
}

export { init };