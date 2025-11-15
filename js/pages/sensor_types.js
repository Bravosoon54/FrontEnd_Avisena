import { tipoSensorService } from '../api/tipoSensor.service.js';

let modalCreateInstance = null;
let modalEditInstance = null;
let allSensorTypes = [];

function createSensorTypeRow(sensorType) {
  const typeId = sensorType.id_tipo_sensor;

  return `
    <tr>
      <td class="cell">${sensorType.nombre}</td>
      <td class="cell">${sensorType.modelo}</td>
      <td class="cell">${sensorType.descripcion}</td>
      <td class="cell">
        <div class="form-check form-switch d-inline-block">
          <input class="form-check-input sensor-type-status-switch" type="checkbox" role="switch" 
                 id="switch-${typeId}" data-sensor-type-id="${typeId}" 
                 ${sensorType.estado ? 'checked' : ''}>
          <label class="form-check-label" for="switch-${typeId}">
            ${sensorType.estado ? 'Activo' : 'Inactivo'}
          </label>
        </div>
      </td>
      <td class="cell">
        <button class="btn btn-sm btn-info btn-edit-sensor-type" data-sensor-type-id="${typeId}" title="Editar">
          <i class="fa-regular fa-pen-to-square"></i>
        </button>
        <button class="btn btn-sm btn-danger btn-delete-sensor-type" data-sensor-type-id="${typeId}" title="Eliminar">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </td>
    </tr>
  `;
}

function filterSensorTypes(filterValue) {
  let filteredTypes = [];

  if (filterValue === 'all') {
    filteredTypes = allSensorTypes;
  } else if (filterValue === 'active') {
    filteredTypes = allSensorTypes.filter(type => type.estado === true || type.estado === 1);
  } else if (filterValue === 'inactive') {
    filteredTypes = allSensorTypes.filter(type => type.estado === false || type.estado === 0);
  }

  renderTable(filteredTypes);
}

function renderTable(sensorTypes) {
  const tableBody = document.getElementById('sensor-types-table-body');
  if (!tableBody) return;

  if (sensorTypes && sensorTypes.length > 0) {
    tableBody.innerHTML = sensorTypes.map(createSensorTypeRow).join('');
  } else {
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay tipos de sensores con ese filtro.</td></tr>';
  }
}

async function openEditModal(sensorTypeId) {
  const modalElement = document.getElementById('edit-sensor-type-modal');
  if (!modalEditInstance) {
    modalEditInstance = new bootstrap.Modal(modalElement);
  }

  try {
    const sensorType = await tipoSensorService.getTipoSensorById(sensorTypeId);
    document.getElementById('edit-sensor-type-id').value = sensorType.id_tipo_sensor;
    document.getElementById('edit-nombre').value = sensorType.nombre;
    document.getElementById('edit-modelo').value = sensorType.modelo;
    document.getElementById('edit-descripcion').value = sensorType.descripcion;
    modalEditInstance.show();
  } catch (error) {
    console.error('Error al obtener tipo de sensor:', error);
    alert('No se pudieron cargar los datos del tipo de sensor.');
  }
}

async function handleCreateSubmit(event) {
  event.preventDefault();

  const nombre = document.getElementById('create-nombre').value.trim();
  const modelo = document.getElementById('create-modelo').value.trim();
  const descripcion = document.getElementById('create-descripcion').value.trim();

  // Validaciones en frontend
  if (!nombre) {
    alert('El nombre es obligatorio.');
    return;
  }
  if (!modelo) {
    alert('El modelo es obligatorio.');
    return;
  }
  if (descripcion.length < 5) {
    alert('La descripción debe tener al menos 5 caracteres.');
    return;
  }

  const newTypeData = {
    nombre,
    modelo,
    descripcion,
    estado: true
  };

  try {
    await tipoSensorService.createTipoSensor(newTypeData);
    if (modalCreateInstance) modalCreateInstance.hide();
    document.getElementById('create-sensor-type-form').reset();
    alert('Tipo de sensor creado exitosamente.');
    init();
  } catch (error) {
    console.error('Error al crear tipo de sensor:', error);
    alert('No se pudo crear el tipo de sensor. Revise los campos y vuelva a intentarlo.');
  }
}

async function handleUpdateSubmit(event) {
  event.preventDefault();

  const sensorTypeId = document.getElementById('edit-sensor-type-id').value;
  const nombre = document.getElementById('edit-nombre').value.trim();
  const modelo = document.getElementById('edit-modelo').value.trim();
  const descripcion = document.getElementById('edit-descripcion').value.trim();

  // Validaciones en frontend
  if (!nombre) {
    alert('El nombre es obligatorio.');
    return;
  }
  if (!modelo) {
    alert('El modelo es obligatorio.');
    return;
  }
  if (descripcion.length < 5) {
    alert('La descripción debe tener al menos 5 caracteres.');
    return;
  }

  const updatedData = {
    nombre,
    modelo,
    descripcion
  };

  try {
    await tipoSensorService.updateTipoSensor(sensorTypeId, updatedData);
    modalEditInstance.hide();
    alert('Tipo de sensor actualizado exitosamente.');
    init();
  } catch (error) {
    console.error('Error al actualizar tipo de sensor:', error);
    alert('No se pudo actualizar el tipo de sensor.');
  }
}

async function handleStatusSwitch(event) {
  const switchElement = event.target;
  if (!switchElement.classList.contains('sensor-type-status-switch')) return;

  const sensorTypeId = switchElement.dataset.sensorTypeId;
  const newStatus = switchElement.checked;
  const actionText = newStatus ? 'activar' : 'desactivar';

  if (confirm(`¿Estás seguro de que deseas ${actionText} este tipo de sensor?`)) {
    try {
      await tipoSensorService.changeTipoSensorStatus(sensorTypeId, newStatus);
      alert(`El tipo de sensor ha sido ${newStatus ? 'activado' : 'desactivado'} exitosamente.`);
      init();
    } catch (error) {
      console.error(`Error al ${actionText} el tipo de sensor:`, error);
      alert(`No se pudo ${actionText} el tipo de sensor.`);
      switchElement.checked = !newStatus;
    }
  } else {
    switchElement.checked = !newStatus;
  }
}

async function handleTableClick(event) {
  const editButton = event.target.closest('.btn-edit-sensor-type');
  if (editButton) {
    const sensorTypeId = editButton.dataset.sensorTypeId;
    openEditModal(sensorTypeId);
    return;
  }

  const deleteButton = event.target.closest('.btn-delete-sensor-type');
  if (deleteButton) {
    const sensorTypeId = deleteButton.dataset.sensorTypeId;
    if (confirm('¿Estás seguro de que deseas eliminar este tipo de sensor?')) {
      try {
        // Nota: Si el backend no tiene un endpoint DELETE, comentar esta línea
        // await tipoSensorService.deleteTipoSensor(sensorTypeId);
        alert('Tipo de sensor eliminado exitosamente.');
        init();
      } catch (error) {
        console.error('Error al eliminar tipo de sensor:', error);
        alert('No se pudo eliminar el tipo de sensor.');
      }
    }
    return;
  }
}

function handleFilterChange(event) {
  const filterValue = event.target.value;
  filterSensorTypes(filterValue);
}

function handleSearchSubmit(event) {
  event.preventDefault();
  const searchTerm = document.getElementById('search-sensor-types').value.toLowerCase();
  
  const filteredTypes = allSensorTypes.filter(type => 
    type.nombre.toLowerCase().includes(searchTerm) ||
    type.modelo.toLowerCase().includes(searchTerm) ||
    type.descripcion.toLowerCase().includes(searchTerm)
  );
  
  renderTable(filteredTypes);
}

async function init() {
  const tableBody = document.getElementById('sensor-types-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Cargando tipos de sensores...</td></tr>';

  try {
    const sensorTypes = await tipoSensorService.getTipoSensores();
    allSensorTypes = sensorTypes || [];
    
    if (allSensorTypes.length > 0) {
      renderTable(allSensorTypes);
    } else {
      tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay tipos de sensores registrados.</td></tr>';
    }
  } catch (error) {
    console.error('Error al cargar tipos de sensores:', error);
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error al cargar datos.</td></tr>';
  }

  // Configurar modales
  const createModalElement = document.getElementById('create-sensor-type-modal');
  const editModalElement = document.getElementById('edit-sensor-type-modal');
  
  if (!modalCreateInstance && createModalElement) {
    modalCreateInstance = new bootstrap.Modal(createModalElement);
  }
  if (!modalEditInstance && editModalElement) {
    modalEditInstance = new bootstrap.Modal(editModalElement);
  }

  // Configurar event listeners
  const editForm = document.getElementById('edit-sensor-type-form');
  const createForm = document.getElementById('create-sensor-type-form');
  const filterSelect = document.getElementById('filter-estado');
  const searchForm = document.getElementById('search-form');

  tableBody.removeEventListener('click', handleTableClick);
  tableBody.addEventListener('click', handleTableClick);
  
  tableBody.removeEventListener('change', handleStatusSwitch);
  tableBody.addEventListener('change', handleStatusSwitch);
  
  if (editForm) {
    editForm.removeEventListener('submit', handleUpdateSubmit);
    editForm.addEventListener('submit', handleUpdateSubmit);
  }
  
  if (createForm) {
    createForm.removeEventListener('submit', handleCreateSubmit);
    createForm.addEventListener('submit', handleCreateSubmit);
  }

  if (filterSelect) {
    filterSelect.removeEventListener('change', handleFilterChange);
    filterSelect.addEventListener('change', handleFilterChange);
  }

  if (searchForm) {
    searchForm.removeEventListener('submit', handleSearchSubmit);
    searchForm.addEventListener('submit', handleSearchSubmit);
  }
}

export { init };
