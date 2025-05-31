document.addEventListener('DOMContentLoaded', () => {
    const productosContainer = document.getElementById('catalogo-productos');
    const paginationContainer = document.getElementById('pagination');
    const carritoCountSpan = document.getElementById('carrito-count');
    const filtroEquipo = document.getElementById('filtro-equipo');
    const filtroPrecio = document.getElementById('filtro-precio');
    const filtroTalla = document.getElementById('filtro-talla'); // Cambiado de filtroTipo a filtroTalla
    const filtroAcabado = document.getElementById('filtro-acabado'); // Nuevo filtro para galleta o bordado
    const carritoItemsContainer = document.getElementById('carrito-items');
    const totalPrecioSpan = document.getElementById('total-precio');
    const finalizarCompraBtn = document.querySelector('.finalizar-compra');
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');

    const productosPorPagina = 12;
    let currentPage = 1;
    let allProductos = [];
    let carrito = localStorage.getItem('carrito') ? JSON.parse(localStorage.getItem('carrito')) : [];
    let filteredProductos = []; // Inicializar como un array vacío

    // --- MENÚ HAMBURGUESA ---
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }

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

            if (productos.length === 0) {
                const noProductosDiv = document.createElement('div');
                noProductosDiv.classList.add('no-productos-mensaje');
                noProductosDiv.innerHTML = `
                    <p>No se encontraron productos que coincidan con tu búsqueda.</p>
                    <p class="mensaje-contacto">¿No encuentras la camiseta que te gusta? Envíanos un mensaje para saber si la tenemos disponible.</p>
                    <a href="https://wa.me/573015044228" class="button contacto-btn" target="_blank">Contactar por WhatsApp</a>
                `;
                productosContainer.appendChild(noProductosDiv);
                return;
            }

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

            // Mover el mensaje aquí, después de los productos
            const mensajeContactoDiv = document.createElement('div');
            mensajeContactoDiv.classList.add('mensaje-contacto-container');
            mensajeContactoDiv.innerHTML = `
                <p class="mensaje-contacto">¿No encuentras la camiseta que te gusta? Envíanos un mensaje para saber si la tenemos disponible.</p>
                <a href="https://wa.me/573015044228" class="button contacto-btn" target="_blank">Contactar por WhatsApp</a>
            `;
            productosContainer.appendChild(mensajeContactoDiv);

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
    
            const maxVisiblePages = 3;
            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            // Add "First" button
            const firstButton = document.createElement('button');
            firstButton.classList.add('pagination-boton');
            firstButton.textContent = '«« Primera';
            firstButton.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = 1;
                renderPage(filteredProductos);
                renderPagination(filteredProductos.length);
            });
            paginationContainer.appendChild(firstButton);

            // Add "Previous" button
            if (startPage > 1) {
                const prevButton = document.createElement('button');
                prevButton.classList.add('pagination-boton');
                prevButton.textContent = '«';
                prevButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    currentPage = Math.max(1, currentPage - 1);
                    renderPage(filteredProductos);
                    renderPagination(filteredProductos.length);
                });
                paginationContainer.appendChild(prevButton);
            }

            for (let i = startPage; i <= endPage; i++) {
                const pageButton = document.createElement('button');
                pageButton.classList.add('pagination-boton');
                pageButton.textContent = i;
                if (i === currentPage) {
                    pageButton.classList.add('activo');
                }
                pageButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    currentPage = i;
                    renderPage(filteredProductos);
                    renderPagination(filteredProductos.length);
                });
                paginationContainer.appendChild(pageButton);
            }

            // Add "Next" button
            if (endPage < totalPages) {
                const nextButton = document.createElement('button');
                nextButton.classList.add('pagination-boton');
                nextButton.textContent = '»';
                nextButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    currentPage = Math.min(totalPages, currentPage + 1);
                    renderPage(filteredProductos);
                    renderPagination(filteredProductos.length);
                });
                paginationContainer.appendChild(nextButton);
            }

            // Add "Last" button
            const lastButton = document.createElement('button');
            lastButton.classList.add('pagination-boton');
            lastButton.textContent = 'Última »»';
            lastButton.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = totalPages;
                renderPage(filteredProductos);
                renderPagination(filteredProductos.length);
            });
            paginationContainer.appendChild(lastButton);

            // Add input for specific page number
            const pageInput = document.createElement('input');
            pageInput.type = 'number';
            pageInput.min = 1;
            pageInput.max = totalPages;
            pageInput.value = currentPage;
            pageInput.classList.add('pagination-input');
            pageInput.addEventListener('change', (e) => {
                const pageNumber = parseInt(e.target.value, 10);
                if (pageNumber >= 1 && pageNumber <= totalPages) {
                    currentPage = pageNumber;
                    renderPage(filteredProductos);
                    renderPagination(filteredProductos.length);
                }
            });
            paginationContainer.appendChild(pageInput);
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
            const tallaSeleccionada = filtroTalla ? filtroTalla.value : '';

            filteredProductos = allProductos.filter(producto => {
                let equipoCoincide = true;
                let precioCoincide = true;
                let tallaCoincide = true;

                // Filtro por equipo
                if (equipoSeleccionado && producto.equipo !== equipoSeleccionado) {
                    equipoCoincide = false;
                }

                // Filtro por precio
                const precioNumerico = parseFloat(producto.precio);
                if (precioSeleccionado === '90-100' && (precioNumerico < 90000 || precioNumerico > 100000)) {
                    precioCoincide = false;
                } else if (precioSeleccionado === 'mayor-100' && precioNumerico <= 100000) {
                    precioCoincide = false;
                }

                // Filtro por talla
                if (tallaSeleccionada && (!producto.talla || producto.talla.toLowerCase() !== tallaSeleccionada.toLowerCase())) {
                    tallaCoincide = false;
                }

                return equipoCoincide && precioCoincide && tallaCoincide;
            });

            currentPage = 1; // Resetear la página al filtrar
            renderPage(filteredProductos);
            renderPagination(filteredProductos.length);
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
                                <p>Talla: ${producto.talla || 'No especificada'}</p>
                                <p>Acabado: ${producto.acabado || 'No especificada'}</p>
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
            if (carrito.length > 0) {
                window.location.href = 'checkout.html';
            } else {
                alert('El carrito está vacío');
            }
        });
    }

    // Cargar los productos iniciales
    fetch('assets/data/camisetas.json')
        .then(response => response.json())
        .then(data => {
            allProductos = data;
            // Guardar productos en localStorage para uso en checkout
            localStorage.setItem('productos', JSON.stringify(allProductos));
            filteredProductos = [...allProductos];
            
            // Renderizar productos según la página actual
            if (productosContainer) {
                renderPage(filteredProductos);
                renderPagination(filteredProductos.length);
            }
            
            // Mostrar carrito si estamos en la página correspondiente
            mostrarCarritoEnPagina();

            // Asegurar que los event listeners de los filtros estén adjuntados después de cargar los productos
            if (filtroEquipo) {
                filtroEquipo.addEventListener('change', filterProductos);
            }
            if (filtroPrecio) {
                filtroPrecio.addEventListener('change', filterProductos);
            }
            if (filtroTalla) {
                filtroTalla.addEventListener('change', filterProductos);
            }
            if (filtroAcabado) {
                filtroAcabado.addEventListener('change', filterProductos);
            }
        })
        .catch(error => {
            console.error('Error cargando productos:', error);
            if (productosContainer) {
                productosContainer.innerHTML = '<p>Error al cargar los productos. Por favor, intenta más tarde.</p>';
            }
        });
});