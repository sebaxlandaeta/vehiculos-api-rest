"use strict";

const url = "https://api.restful-api.dev";
const apikey = '4afc721e-6d7e-4f15-852b-0af87bfec5d9';

// REQUERIMIENTO 1: Petición GET al cargar para obtener datos de la API y mostrarlos en la tabla
function getDatos(endpoint) {
  mostrarLoader();
  fetch(`${url}/${endpoint}`, {
    headers: {
      'x-api-key': apikey
    }
  })
    .then((resp) => {
      if (!resp.ok) {
        throw new Error(`Error, código de respuesta: ${resp.status}`);
      }
      return resp.json();
    })
    .then((json) => {
      ocultarLoader();
      if (Array.isArray(json) && json.length > 0) {
        renderizarTabla(json);
      } else {
        renderizarTablaVacia();
      }
    })
    .catch((error) => {
      ocultarLoader();
      showModal("error", "¡Error!", `${error.message}`);
      renderizarTablaVacia();
    });
}

// REQUERIMIENTO 2: Petición DELETE enviando como parámetro el ID del recurso de la fila
function deleteDatos(endpoint, id, buttonElement) {
  mostrarLoader();
  fetch(`${url}/${endpoint}/${id}`, {
    method: "DELETE",
    headers: {
      'x-api-key': apikey,
    },
  })
    .then((resp) => {
      if (!resp.ok) {
        throw new Error(`Error, código de respuesta: ${resp.status}`);
      }
      return resp.status !== 204 ? resp.json() : { success: true };
    })
    .then(() => {
      ocultarLoader();
      showModal("success", "¡Éxito!", "Producto eliminado correctamente");
      // REQUERIMIENTO 3: Si la eliminación fue exitosa, se elimina la fila de la tabla HTML
      rowRemove(buttonElement);
    })
    .catch((error) => {
      ocultarLoader();
      showModal("error", "¡Error!", `${error.message}`);
    });
}

// REQUERIMIENTO 4: Petición POST enviando los datos del formulario para un nuevo recurso
function postDatos(endpoint, producto) {
  mostrarLoader();
  fetch(`${url}/${endpoint}`, {
    method: "POST",
    headers: {
      'x-api-key': apikey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(producto),
  })
    .then((resp) => {
      if (!resp.ok) {
        throw new Error(`Error, código de respuesta: ${resp.status}`);
      }
      return resp.json();
    })
    .then((nuevoObjeto) => {
      ocultarLoader();
      showModal("success", "¡Éxito!", "Producto agregado correctamente");
      
      const tbody = document.querySelector("tbody");
      if (tbody.querySelector("#row-vacia")) {
        tbody.innerHTML = "";
      }
      
      // REQUERIMIENTO 5: Si la respuesta es exitosa, se agrega la nueva fila a la tabla con los datos enviados
      agregarFilaTabla(nuevoObjeto);
    })
    .catch((error) => {
      ocultarLoader();
      showModal("error", "¡Error!", `${error.message}`);
    });
}

function renderizarTabla(productos) {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";
  productos.forEach((p) => {
    agregarFilaTabla(p);
  });
}

function agregarFilaTabla(p) {
  const tbody = document.querySelector("tbody");
  const tr = document.createElement("tr");
  tr.className = "hover:bg-slate-800/50 transition-colors duration-150 group";
  tr.innerHTML = `
    <td class="px-6 py-4 text-slate-300">${p.data?.marca || "N/A"}</td>
    <td class="px-6 py-4 text-slate-300">${p.name || "Sin modelo"}</td>
    <td class="px-6 py-4 text-slate-300">${p.data?.color || "N/A"}</td>
    <td class="px-6 py-4 text-slate-300">${p.data?.año || "N/A"}</td>
    <td class="px-6 py-4 text-center">
      <button 
        onclick="deleteDatos('collections/vehiculos/objects', '${p.id}', this)" 
        title="Eliminar vehículo"
        class="inline-flex items-center justify-center p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all duration-200 cursor-pointer border border-rose-500/20 active:scale-95">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pointer-events-none">
          <path d="M10 11v6"/>
          <path d="M14 11v6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
          <path d="M3 6h18"/>
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </td>
  `;
  tbody.appendChild(tr);
}

// REQUERIMIENTO 4: Evento submit del formulario para capturar los datos ingresados
function validarFormulario() {
  const formulario = document.getElementById("form-producto");
  const inputMarca = document.getElementById("marca");
  const inputModelo = document.getElementById("modelo");
  const inputColor = document.getElementById("color");
  const inputAño = document.getElementById("año");

  formulario.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const esMarcaValida = validarInput(inputMarca, "error-marca", { esNumero: false });
    const esModeloValido = validarInput(inputModelo, "error-modelo", { esNumero: false });
    const esColorValido = validarInput(inputColor, "error-color", { esNumero: false });
    const esAñoValido = validarInput(inputAño, "error-año", { esNumero: true });

    if (esMarcaValida && esModeloValido && esColorValido && esAñoValido) {
      const nuevoVehiculo = {
        name: inputModelo.value.trim(),
        data: {
          marca: inputMarca.value.trim(),
          color: inputColor.value.trim(),
          año: inputAño.value.trim()
        },
      };

      postDatos("collections/vehiculos/objects", nuevoVehiculo);
      formulario.reset();
    }
  });
}

function validarInput(input, idSpanError, opciones = {}) {
  const errorElement = document.getElementById(idSpanError);
  const valor = input.value.trim();

  if (valor === "") {
    errorElement.innerText = "El campo no puede estar vacío.";
    errorElement.classList.remove("hidden");
    return false;
  }

  if (opciones.esNumero === false && !isNaN(valor)) {
    errorElement.innerText = "Este campo no puede ser solo números.";
    errorElement.classList.remove("hidden");
    return false;
  }

  if (opciones.esNumero === true && (isNaN(valor) || parseFloat(valor) <= 0)) {
    errorElement.innerText = "El valor ingresado debe ser un número válido mayor a 0.";
    errorElement.classList.remove("hidden");
    return false;
  }

  errorElement.classList.add("hidden");
  return true;
}

function renderizarTablaVacia() {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = `
    <tr id="row-vacia">
      <td colspan="5" class="px-6 py-8 text-center text-slate-400 font-medium italic">
        No hay ningún objeto guardado en la API.
      </td>
    </tr>
  `;
}

// REQUERIMIENTO 3: Eliminar dinámicamente el elemento `<tr>` de la tabla HTML
function rowRemove(buttonElement) {
  const row = buttonElement.closest("tr");
  if (row) {
    row.remove();
  }
  
  const tbody = document.querySelector("tbody");
  if (tbody.children.length === 0) {
    renderizarTablaVacia();
  }
}

function showModal(icon, title, message) {
  Swal.fire({
    icon: icon,
    title: title,
    text: message,
    background: '#0f172a',        
    color: '#f8fafc',             
    confirmButtonColor: '#0ea5e9',
    customClass: {
      popup: 'border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl',
      title: 'text-lg font-bold text-white',
      htmlContainer: 'text-sm text-slate-300',
      confirmButton: 'px-5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer'
    }
  });
}

function mostrarLoader() {
  const loader = document.getElementById("loading-overlay");
  if (loader) {
    loader.classList.remove("hidden");
    loader.classList.add("flex");
  }
}

function ocultarLoader() {
  const loader = document.getElementById("loading-overlay");
  if (loader) {
    loader.classList.add("hidden");
    loader.classList.remove("flex");
  }
}

// REQUERIMIENTO 1: Ejecución inicial al cargar el DOM para pedir los datos
document.addEventListener("DOMContentLoaded", () => {
  getDatos("collections/vehiculos/objects");
  validarFormulario();
});