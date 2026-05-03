// === PROGRAMA DE CALCULADORA DE PRESUPUESTO PERSONAL === //

// --- Array que guarda las transacciones --- //
let registros = [];

// --- Cargar datos desde localStorage al iniciar --- //
function cargarDeLocalStorage() {
    const datos = localStorage.getItem('presupuesto_registros');
    if (datos) {
        registros = JSON.parse(datos);
    }
}

// --- Guardar datos en localStorage --- //
function guardarEnLocalStorage() {
    localStorage.setItem('presupuesto_registros', JSON.stringify(registros));
}

// --- Accedemos al botón y formulario --- //
const addBtn = document.getElementById('addTransactionBtn');
const form = document.getElementById('transactionForm');

// --- Manejamos el evento click en lugar de submit --- //
addBtn.addEventListener('click', function () {
    // Verificamos que el formulario sea válido
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // --- Accedemos a los datos del form --- //
    const nombre = document.querySelector(".transaction-form__input--text").value.trim();
    const montoCadena = document.querySelector(".transaction-form__input--number").value;
    const monto = Number(montoCadena);
    const tipo = document.querySelector(".transaction-form__select").value;

    if (!nombre || isNaN(monto) || monto <= 0) {
        alert('Por favor completa todos los campos correctamente.');
        return;
    }

    // --- Añadimos los datos al array --- //
    const nuevoRegistro = { id: Date.now(), tipo, monto, nombre };
    registros.push(nuevoRegistro);

    // --- Guardamos en localStorage --- //
    guardarEnLocalStorage();

    // --- Actualizamos la interfaz --- //
    actualizarInterfaz();

    // --- Limpiamos el formulario --- //
    form.reset();
});

// --- Actualizar toda la interfaz (resultados e historial) --- //
function actualizarInterfaz() {
    const ingresos = registros.filter(r => r.tipo === "ingreso");
    const gastos = registros.filter(r => r.tipo === "gasto");

    seccionCentral(gastos, ingresos);

    const historial = document.querySelector("#historial-list");
    const listaDeTransacciones = registros.map(r => {
        const claseTipo = r.tipo === 'ingreso' ? 'ingreso' : 'gasto';
        return `
        <div class="history__container" data-id="${r.id}">
            <div class="history__item">Descripción: <span>${r.nombre}</span></div>
            <div class="history__item">Monto: <span>S/ ${r.monto.toFixed(2)}</span></div>
            <div class="history__item">Tipo: <span class="tipo-${claseTipo}">${r.tipo}</span></div>
            <button class="delete-btn" data-id="${r.id}">Eliminar</button>
        </div>`;
    }).join('');

    historial.innerHTML = listaDeTransacciones;

    // Agregar event listeners a los botones de eliminar
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const id = Number(this.getAttribute('data-id'));
            eliminarTransaccion(id);
        });
    });
}

// --- Eliminar una transacción por ID --- //
function eliminarTransaccion(idEliminar) {
    registros = registros.filter(r => r.id !== idEliminar);
    guardarEnLocalStorage();
    actualizarInterfaz();
}

// --- Calcular y mostrar totales en la sección central --- //
function seccionCentral(perdidas, ganancias) {
    const etiquetaIngreso = document.querySelector(".stats-panel__value--ingreso");
    const etiquetaGasto = document.querySelector(".stats-panel__value--gasto");
    const etiquetaBalance = document.querySelector(".stats-panel__value--balance");

    // Calcular gastos (como valor negativo)
    const totalGastos = perdidas.reduce((sum, reg) => sum + reg.monto, 0);
    // Calcular ingresos
    const totalIngresos = ganancias.reduce((sum, reg) => sum + reg.monto, 0);
    // Balance
    const balance = totalIngresos - totalGastos;

    // Mostrar gastos (en negativo)
    etiquetaGasto.innerHTML = `S/ <span style="color: ${totalGastos > 0 ? '#d63031' : '#2d3436'};">${(totalGastos * -1).toFixed(2)}</span>`;

    // Mostrar ingresos
    etiquetaIngreso.innerHTML = `S/ <span style="color: ${totalIngresos > 0 ? '#00b894' : '#2d3436'};">${totalIngresos.toFixed(2)}</span>`;

    // Mostrar balance con color dinámico
    let colorBalance = '#2d3436';
    if (balance > 0) colorBalance = '#00b894';
    else if (balance < 0) colorBalance = '#d63031';
    
    etiquetaBalance.innerHTML = `S/ <span style="color: ${colorBalance};">${balance.toFixed(2)}</span>`;
}

// --- Inicializar la aplicación --- //
function init() {
    cargarDeLocalStorage();
    actualizarInterfaz();
}

// Arrancar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);