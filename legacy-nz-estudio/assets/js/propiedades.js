// JAVASCRIPT - PROPIEDADES
document.addEventListener('DOMContentLoaded', function() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const categoryContainers = document.querySelectorAll('.category-section');
    const noResultsMessage = document.querySelector('.no-results-message');
    const categoryNameSpan = document.querySelector('.category-name');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Actualizar botones
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.dataset.filter;

            // Filtrar categorías
            categoryContainers.forEach(container => {
                if (filterValue === 'all') {
                    container.style.display = '';
                } else if (container.dataset.category === filterValue) {
                    container.style.display = '';
                } else {
                    container.style.display = 'none';
                }
            });

            // Mostrar/ocultar mensaje de no resultados
            const visibleCategories = Array.from(categoryContainers).filter(
                container => container.style.display !== 'none'
            );

            if (visibleCategories.length === 0 && filterValue !== 'all') {
                categoryNameSpan.textContent = btn.dataset.categoryName;
                noResultsMessage.style.display = 'block';
            } else {
                noResultsMessage.style.display = 'none';
            }
        });
    });

    // Activar filtro por hash en la URL (ej: #cat-3)
    function activarFiltroPorHash() {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#cat-')) {
            const catId = hash.replace('#cat-', '');
            const btn = document.querySelector('.filter-btn[data-filter="' + catId + '"]');
            if (btn) btn.click();
        } else {
            // Si no hay hash o no es válido, mostrar todas
            const btn = document.querySelector('.filter-btn[data-filter="all"]');
            if (btn) btn.click();
        }
    }

    activarFiltroPorHash();

    // Opcional: si el usuario cambia el hash manualmente
    window.addEventListener('hashchange', activarFiltroPorHash);

    // Lazy loading para imágenes
    const images = document.querySelectorAll('.property-image img');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // Ocultar barra de filtros al hacer scroll hacia abajo, mostrar al subir
    let lastScrollTop = 0;
    const filtersContainer = document.querySelector('.filters-container');
    let ticking = false;

    function handleScroll() {
        if (!filtersContainer) return;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scroll hacia abajo
            filtersContainer.style.transform = 'translateY(-120%)';
            filtersContainer.style.transition = 'transform 0.3s';
        } else {
            // Scroll hacia arriba
            filtersContainer.style.transform = 'translateY(0)';
            filtersContainer.style.transition = 'transform 0.3s';
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(handleScroll);
            ticking = true;
        }
    });

    // Funcionalidad del buscador avanzado
    const searchInput = document.getElementById('propertySearch');
    const searchResults = document.getElementById('searchResults');
    let searchTimeout;

    // Función para normalizar texto (eliminar acentos)
    function normalizeText(text) {
        return text.normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase();
    }

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const searchTerm = normalizeText(this.value.trim());
            
            if (searchTerm.length < 2) {
                searchResults.classList.remove('active');
                return;
            }

            searchTimeout = setTimeout(() => {
                // Obtener todas las propiedades
                const propertyCards = document.querySelectorAll('.property-card');
                let results = [];

                propertyCards.forEach(card => {
                    const title = normalizeText(card.querySelector('.property-title').textContent);
                    const location = normalizeText(card.querySelector('.info-item span')?.textContent || '');
                    const category = normalizeText(card.closest('.category-section').querySelector('.category-title').textContent);
                    
                    if (title.includes(searchTerm) || location.includes(searchTerm) || category.includes(searchTerm)) {
                        const propertyId = card.querySelector('.btn-view-property').href.split('propiedad')[1];
                        const image = card.querySelector('.property-image img').src;
                        results.push({
                            id: propertyId,
                            title: card.querySelector('.property-title').textContent,
                            category: card.closest('.category-section').querySelector('.category-title').textContent,
                            image: image
                        });
                    }
                });

                // Mostrar resultados
                if (results.length > 0) {
                    searchResults.innerHTML = results.map(prop => `
                        <div class="search-result-item" onclick="window.location.href='propiedad${prop.id}'">
                            <img src="${prop.image}" alt="${prop.title}" class="search-result-image">
                            <div class="search-result-content">
                                <div class="search-result-title">${prop.title}</div>
                                <div class="search-result-category">${prop.category}</div>
                            </div>
                        </div>
                    `).join('');
                } else {
                    searchResults.innerHTML = `
                        <div class="no-results-found">
                            <i class="bi bi-search me-2"></i>
                            No se encontraron propiedades que coincidan con tu búsqueda
                        </div>
                    `;
                }

                searchResults.classList.add('active');
            }, 300);
        });

        // Cerrar resultados al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.remove('active');
            }
        });

        // Manejar navegación con teclado
        searchInput.addEventListener('keydown', function(e) {
            const results = searchResults.querySelectorAll('.search-result-item');
            const activeResult = searchResults.querySelector('.search-result-item:hover');
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!activeResult) {
                    results[0]?.classList.add('hover');
                } else {
                    const nextResult = activeResult.nextElementSibling;
                    if (nextResult) {
                        activeResult.classList.remove('hover');
                        nextResult.classList.add('hover');
                    }
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (activeResult) {
                    const prevResult = activeResult.previousElementSibling;
                    if (prevResult) {
                        activeResult.classList.remove('hover');
                        prevResult.classList.add('hover');
                    }
                }
            } else if (e.key === 'Enter') {
                const hoveredResult = searchResults.querySelector('.search-result-item.hover');
                if (hoveredResult) {
                    window.location.href = hoveredResult.onclick.toString().match(/propiedad\d+/)[0];
                }
            }
        });
    }
});