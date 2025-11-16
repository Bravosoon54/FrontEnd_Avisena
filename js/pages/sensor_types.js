import { tipoSensorService } from "../api/sensorType.service.js";
import { authService } from "../api/auth.service.js"; // Ajusta la ruta según tu proyecto

let modalInstance = null;
let createModalInstance = null;
let allSensorTypes = [];

function createSensorTypeRow(sensorType) {
  const tipoId = sensorType.id_tipo;
  
  // Mostrar botón editar solo si puede actualizar
  const canUpdate = authService.canUpdate();
  const editButton = canUpdate 
    ? `<button class="btn btn-sm btn-info btn-edit-sensor-type" data-tipo-id="${tipoId}">
         <i class="fa-regular fa-pen-to-square"></i>
       </button>`
    : '';
  
  // Mostrar switch solo si puede cambiar estado
  const canChangeStatus = authService.canChangeStatus();
  const statusCell = canChangeStatus
    ? `<div class="form-check form-switch d-inline-block">
         <input class="form-check-input sensor-type-status-switch" type="checkbox" 
           id="switch-${tipoId}" data-tipo-id="${tipoId}"
           ${sensorType.estado ? "checked" : ""}>
         <label class="form-check-label" for="switch-${tipoId}">
           ${sensorType.estado ? "Activo" : "Inactivo"}
         </label>
       </div>`
    : `<span class="badge ${sensorType.estado ? 'bg-success' : 'bg-secondary'}">
         ${sensorType.estado ? "Activo" : "Inactivo"}
       </span>`;

  return `
    <tr>
      <td class="cell">${sensorType.nombre}</td>
      <td class="cell">${sensorType.modelo}</td>
      <td class="cell">${sensorType.descripcion}</td>
      <td class="cell">${statusCell}</td>
      <td class="cell">${editButton}</td>
    </tr>
  `;
}

function filterSensorTypes(filterValue) {
  let filteredTypes = [];

  if (filterValue === "all") {
    filteredTypes = allSensorTypes;
  } else if (filterValue === "active") {
    filteredTypes = allSensorTypes.filter(t => t.estado === 1);
  } else if (filterValue === "inactive") {
    filteredTypes = allSensorTypes.filter(t => t.estado === 0);
  }

  const tableBody = document.getElementById("sensor-types-table-body");
  if (!tableBody) return;

  if (filteredTypes.length > 0) {
    tableBody.innerHTML = filteredTypes.map(createSensorTypeRow).join("");
  } else {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center">No hay tipos de sensores con ese filtro.</td>
      </tr>
    `;
  }
}

async function openEditModal(tipoId) {
  // Verificar permiso
  if (!authService.canUpdate()) {
    Swal.fire({
      icon: 'warning',
      title: 'Sin Permiso',
      text: 'No tienes permisos para editar.',
    });
    return;
  }

  const modalElement = document.getElementById("edit-sensor-type-modal");
  if (!modalInstance) {
    modalInstance = new bootstrap.Modal(modalElement);
  }
  try {
    const tipo = await tipoSensorService.getTipoSensorById(tipoId);
    document.getElementById("edit-sensor-type-id").value = tipo.id_tipo;
    document.getElementById("edit-nombre").value = tipo.nombre;
    document.getElementById("edit-modelo").value = tipo.modelo;
    document.getElementById("edit-descripcion").value = tipo.descripcion;
    modalInstance.show();
  } catch (error) {
    console.error("Error al obtener tipo de sensor:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudieron cargar los datos del tipo de sensor.",
    });
  }
}

async function handleUpdateSubmit(event) {
  event.preventDefault();

  const tipoId = document.getElementById("edit-sensor-type-id").value;
  const nombre = document.getElementById("edit-nombre").value.trim();
  const modelo = document.getElementById("edit-modelo").value.trim();
  const descripcion = document.getElementById("edit-descripcion").value.trim();

  if (descripcion.length < 10) {
    Swal.fire({
      icon: "warning",
      title: "Descripción Inválida",
      text: "La descripción debe tener al menos 10 caracteres.",
    });
    return;
  }

  const updatedData = {
    nombre,
    modelo,
    descripcion,
  };

  try {
    await tipoSensorService.updateTipoSensor(tipoId, updatedData);
    modalInstance.hide();

    Swal.fire({
      icon: "success",
      title: "Éxito",
      text: "Tipo de sensor actualizado exitosamente.",
    });

    init();
  } catch (error) {
    console.error("Error al actualizar tipo de sensor:", error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo actualizar el tipo de sensor.",
    });
  }
}

async function handleCreateSubmit(event) {
  event.preventDefault();

  const nombre = document.getElementById("create-nombre").value.trim();
  const modelo = document.getElementById("create-modelo").value.trim();
  const descripcion = document.getElementById("create-descripcion").value.trim();

  if (descripcion.length < 10) {
    Swal.fire({
      icon: "warning",
      title: "Descripción Inválida",
      text: "La descripción debe tener al menos 10 caracteres.",
    });
    return;
  }

  const newTypeData = {
    nombre,
    modelo,
    descripcion,
    estado: true,
  };

  try {
    await tipoSensorService.createTipoSensor(newTypeData);

    if (createModalInstance) createModalInstance.hide();
    document.getElementById("create-sensor-type-form").reset();

    Swal.fire({
      icon: "success",
      title: "Éxito",
      text: "Tipo de sensor creado exitosamente.",
    });

    init();
  } catch (error) {
    console.error("Error al crear tipo de sensor:", error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo crear el tipo de sensor.",
    });
  }
}

async function handleStatusSwitch(event) {
  const switchElement = event.target;
  if (!switchElement.classList.contains("sensor-type-status-switch")) return;

  const tipoId = switchElement.dataset.tipoId;
  const newStatus = switchElement.checked;

  Swal.fire({
    title: "¿Está seguro?",
    text: `¿Desea ${newStatus ? "activar" : "desactivar"} este tipo de sensor?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, confirmar",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await tipoSensorService.changeTipoSensorStatus(tipoId, newStatus);

        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: `El tipo de sensor ha sido ${newStatus ? "activado" : "desactivado"}.`,
        });

        init();
      } catch (error) {
        console.error("Error al cambiar estado:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cambiar el estado.",
        });
        switchElement.checked = !newStatus;
      }
    } else {
      switchElement.checked = !newStatus;
    }
  });
}

async function handleTableClick(event) {
  const editButton = event.target.closest(".btn-edit-sensor-type");
  if (editButton) {
    const tipoId = editButton.dataset.tipoId;
    openEditModal(tipoId);
    return;
  }
}

function handleFilterChange(event) {
  filterSensorTypes(event.target.value);
}

async function init() {
  // OCULTAR BOTÓN DE CREAR si no tiene permiso
  authService.hideIfNoPermission('[data-bs-target="#create-sensor-type-modal"]', authService.canCreate());

  const canUpdate = authService.canUpdate();
  if (!canUpdate) {
    // Ocultar el th de Acciones
    const thAcciones = document.querySelector('.accion');
    if (thAcciones) {
      thAcciones.style.display = 'none';
    }
  }
  const tableBody = document.getElementById("sensor-types-table-body");
  if (!tableBody) return;

  tableBody.innerHTML =
    '<tr><td colspan="5" class="text-center">Cargando tipos de sensores...</td></tr>';

  // Inicializar modal de creación
  const createModalElement = document.getElementById("create-sensor-type-modal");
  if (createModalElement && !createModalInstance) {
    createModalInstance = new bootstrap.Modal(createModalElement);
  }

  try {
    const types = await tipoSensorService.getTipoSensores();
    allSensorTypes = types || [];

    if (allSensorTypes.length > 0) {
      tableBody.innerHTML = allSensorTypes.map(createSensorTypeRow).join("");
    } else {
      tableBody.innerHTML =
        '<tr><td colspan="5" class="text-center">No hay tipos de sensores registrados.</td></tr>';
    }
  } catch (error) {
    console.error("Error al cargar tipos de sensores:", error);
    tableBody.innerHTML =
      '<tr><td colspan="5" class="text-center text-danger">Error al cargar datos.</td></tr>';
  }

  const editForm = document.getElementById("edit-sensor-type-form");
  const createForm = document.getElementById("create-sensor-type-form");
  const filterSelect = document.getElementById("filter-estado");

  tableBody.removeEventListener("click", handleTableClick);
  tableBody.addEventListener("click", handleTableClick);

  tableBody.removeEventListener("change", handleStatusSwitch);
  tableBody.addEventListener("change", handleStatusSwitch);

  editForm.removeEventListener("submit", handleUpdateSubmit);
  editForm.addEventListener("submit", handleUpdateSubmit);

  createForm.removeEventListener("submit", handleCreateSubmit);
  createForm.addEventListener("submit", handleCreateSubmit);

  if (filterSelect) {
    filterSelect.removeEventListener("change", handleFilterChange);
    filterSelect.addEventListener("change", handleFilterChange);
  }
}

export { init };