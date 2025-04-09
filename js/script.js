document.addEventListener('DOMContentLoaded', () => {
    const productosContainer = document.getElementById('catalogo-productos');
    const paginationContainer = document.getElementById('pagination');
    const carritoCountSpan = document.getElementById('carrito-count');
    const filtroEquipo = document.getElementById('filtro-equipo');
    const filtroPrecio = document.getElementById('filtro-precio');
    const carritoItemsContainer = document.getElementById('carrito-items');
    const totalPrecioSpan = document.getElementById('total-precio');
    const finalizarCompraBtn = document.querySelector('.finalizar-compra');

    const productosPorPagina = 6;
    let currentPage = 1;
    let allProductos = [];
    let carrito = localStorage.getItem('carrito') ? JSON.parse(localStorage.getItem('carrito')) : [];

    // Función para formatear el precio a COP
    function formatPrecioCOP(precio) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(precio);
    }

    // Función para renderizar los productos (solo en catalogo.html)
    function renderProductos(productos) {
        if (productosContainer) {
            productosContainer.innerHTML = '';
            productos.forEach(producto => {
                const productoCard = document.createElement('div');
                productoCard.classList.add('producto-card');
                productoCard.innerHTML = `
                    <img src="${producto.imagen}" alt="${producto.nombre}">
                    <h3>${producto.nombre}</h3>
                    <p class="precio">${formatPrecioCOP(parseFloat(producto.precio.replace('.', '')))}</p>
                    <button class="button agregar-carrito" data-id="${producto.id}">Agregar al Carrito</button>
                `;
                productosContainer.appendChild(productoCard);
            });

            // Añadir event listeners a los botones de "Agregar al Carrito"
            const botonesAgregar = document.querySelectorAll('.agregar-carrito');
            botonesAgregar.forEach(boton => {
                boton.addEventListener('click', function() {
                    const productoId = this.dataset.id;
                    agregarAlCarrito(productoId);
                });
            });
        }
    }

    // Función para renderizar la paginación (solo en catalogo.html)
    function renderPagination(totalProductos) {
        if (paginationContainer) {
            const totalPages = Math.ceil(totalProductos / productosPorPagina);
            paginationContainer.innerHTML = '';

            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement('a');
                pageButton.href = '#';
                pageButton.classList.add('pagination-boton');
                pageButton.textContent = i;
                if (i === currentPage) {
                    pageButton.classList.add('activo');
                }
                pageButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    currentPage = i;
                    renderPage(allProductos);
                });
                paginationContainer.appendChild(pageButton);
            }
        }
    }

    // Función para mostrar la página actual de productos (solo en catalogo.html)
    function renderPage(productos) {
        if (productosContainer) {
            const startIndex = (currentPage - 1) * productosPorPagina;
            const endIndex = startIndex + productosPorPagina;
            const productosPagina = productos.slice(startIndex, endIndex);
            renderProductos(productosPagina);
        }
    }

    // Función para filtrar productos (solo en catalogo.html)
    function filterProductos() {
        if (productosContainer) {
            const equipoSeleccionado = filtroEquipo.value;
            const precioSeleccionado = filtroPrecio.value;

            const productosFiltrados = allProductos.filter(producto => {
                let equipoCoincide = true;
                let precioCoincide = true;

                if (equipoSeleccionado && producto.equipo !== equipoSeleccionado) {
                    equipoCoincide = false;
                }

                const precioNumerico = parseFloat(producto.precio.replace('.', ''));
                if (precioSeleccionado === 'menor-50' && precioNumerico >= 50000) {
                    precioCoincide = false;
                } else if (precioSeleccionado === '50-100' && (precioNumerico < 50000 || precioNumerico > 100000)) {
                    precioCoincide = false;
                } else if (precioSeleccionado === 'mayor-100' && precioNumerico <= 100000) {
                    precioCoincide = false;
                }

                return equipoCoincide && precioCoincide;
            });

            currentPage = 1; // Resetear la página al filtrar
            renderPage(productosFiltrados);
            renderPagination(productosFiltrados.length);
        }
    }

    // --- Carrito ---
    function agregarAlCarrito(id) {
        const productoExistente = carrito.find(item => item.id === id);
        if (productoExistente) {
            productoExistente.cantidad++;
        } else {
            carrito.push({ id: id, cantidad: 1 });
        }
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarContadorCarrito();
        alert('Producto agregado al carrito!');
    }

    function actualizarContadorCarrito() {
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        const contadorSpan = document.getElementById('carrito-count');
        if (contadorSpan) {
            contadorSpan.textContent = totalItems;
        }
    }

    // Función para mostrar el carrito en la página del carrito (carrito.html)
    function mostrarCarritoEnPagina() {
        if (carritoItemsContainer) {
            carritoItemsContainer.innerHTML = '';
            let total = 0;

            if (carrito.length === 0) {
                carritoItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
                totalPrecioSpan.textContent = formatPrecioCOP(0);
                return;
            }

            if (allProductos.length > 0) {
                carrito.forEach(item => {
                    const producto = allProductos.find(p => p.id === item.id);
                    if (producto) {
                        const itemDiv = document.createElement('div');
                        itemDiv.classList.add('carrito-item');
                        itemDiv.innerHTML = `
                            <img src="${producto.imagen}" alt="${producto.nombre}">
                            <div class="item-info">
                                <h3>${producto.nombre}</h3>
                                <p>Precio: ${formatPrecioCOP(parseFloat(producto.precio.replace('.', '')))}</p>
                                <div class="cantidad-control">
                                    <button class="button disminuir-cantidad" data-id="${producto.id}">-</button>
                                    <span data-id="${producto.id}">${item.cantidad}</span>
                                    <button class="button aumentar-cantidad" data-id="${producto.id}">+</button>
                                </div>
                            </div>
                            <div class="item-actions">
                                <button class="button eliminar-item" data-id="${producto.id}">Eliminar</button>
                            </div>
                        `;
                        carritoItemsContainer.appendChild(itemDiv);
                        total += parseFloat(producto.precio.replace('.', '')) * item.cantidad;
                    }
                });
                totalPrecioSpan.textContent = formatPrecioCOP(total);

                // Añadir funcionalidad para eliminar items
                const botonesEliminar = document.querySelectorAll('.eliminar-item');
                botonesEliminar.forEach(boton => {
                    boton.addEventListener('click', function() {
                        const idEliminar = this.dataset.id;
                        carrito = carrito.filter(item => item.id !== idEliminar);
                        localStorage.setItem('carrito', JSON.stringify(carrito));
                        actualizarContadorCarrito();
                        mostrarCarritoEnPagina();
                    });
                });

                // Añadir funcionalidad para aumentar la cantidad
                const botonesAumentar = document.querySelectorAll('.aumentar-cantidad');
                botonesAumentar.forEach(boton => {
                    boton.addEventListener('click', function() {
                        const idAumentar = this.dataset.id;
                        cambiarCantidad(idAumentar, 1);
                    });
                });

                // Añadir funcionalidad para disminuir la cantidad
                const botonesDisminuir = document.querySelectorAll('.disminuir-cantidad');
                botonesDisminuir.forEach(boton => {
                    boton.addEventListener('click', function() {
                        const idDisminuir = this.dataset.id;
                        cambiarCantidad(idDisminuir, -1);
                    });
                });

            } else {
                carritoItemsContainer.innerHTML = '<p>Cargando información del carrito...</p>';
            }
        }
    }

    function cambiarCantidad(id, cambio) {
        const itemEnCarrito = carrito.find(item => item.id === id);
        if (itemEnCarrito) {
            itemEnCarrito.cantidad += cambio;
            if (itemEnCarrito.cantidad < 1) {
                carrito = carrito.filter(item => item.id !== id); // Eliminar si la cantidad es menor que 1
            }
            localStorage.setItem('carrito', JSON.stringify(carrito));
            actualizarContadorCarrito();
            mostrarCarritoEnPagina();
        }
    }

    // Event listener para el botón Finalizar Compra y enviar a WhatsApp
    if (finalizarCompraBtn) {
        finalizarCompraBtn.addEventListener('click', () => {
            if (carrito.length > 0 && allProductos.length > 0) {
                let mensaje = "¡Hola! Quiero realizar el siguiente pedido:\n\n";
                let totalPedido = 0;

                carrito.forEach(item => {
                    const producto = allProductos.find(p => p.id === item.id);
                    if (producto) {
                        const precioUnitario = parseFloat(producto.precio.replace('.', ''));
                        const precioTotalItem = precioUnitario * item.cantidad;
                        mensaje += `- ${producto.nombre} (Cantidad: ${item.cantidad}) - ${formatPrecioCOP(precioUnitario)} c/u - ${formatPrecioCOP(precioTotalItem)} total\n`;
                        totalPedido += precioTotalItem;
                    }
                });

                mensaje += `\nTotal del pedido: ${formatPrecioCOP(totalPedido)}\n\n`;
                mensaje += "Por favor, contáctenme para coordinar el pago y la entrega.\n";

                // Reemplaza 'NUMERO_DE_TELEFONO' con tu número de teléfono con el código de país (sin el +)
                const numeroTelefono = '573015044228'; // Ejemplo para Colombia
                const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${encodeURIComponent(mensaje)}`;

                window.open(urlWhatsApp, '_blank'); // Abre WhatsApp en una nueva pestaña

                // Opcional: Puedes limpiar el carrito después de redirigir a WhatsApp
                // localStorage.removeItem('carrito');
                // carrito = [];
                // actualizarContadorCarrito();
                // mostrarCarritoEnPagina();

            } else if (carrito.length === 0) {
                alert('Tu carrito está vacío. ¡Agrega algunos productos!');
            } else {
                alert('No se pudo generar el pedido. Asegúrate de que los productos se hayan cargado correctamente.');
            }
        });
    }

    // Cargar los productos iniciales
    fetch('assets/data/camisetas.json')
        .then(response => response.json())
        .then(data => {
            allProductos = data;
            // Renderizar solo si estamos en catalogo.html
            if (productosContainer) {
                renderPage(allProductos);
                renderPagination(allProductos.length);
            }
            actualizarContadorCarrito();
            mostrarCarritoEnPagina(); // Mostrar el carrito si estamos en carrito.html

            // Asegurar que el event listener del filtro de equipo esté adjuntado después de cargar los productos
            if (filtroEquipo) {
                filtroEquipo.addEventListener('change', filterProductos);
            }
            if (filtroPrecio) {
                filtroPrecio.addEventListener('change', filterProductos);
            }

        })
        .catch(error => console.error('Error al cargar los productos:', error));
});