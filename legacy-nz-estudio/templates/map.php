<?php
require_once 'config/config.php';

// Consulta para obtener todas las propiedades con coordenadas y su primera imagen
$query = "SELECT p.*, t.nombre_categoria, 
          (SELECT ruta_imagen FROM imagenes_propiedades WHERE id_propiedad = p.id ORDER BY orden ASC, id ASC LIMIT 1) as imagen
          FROM propiedades p 
          LEFT JOIN tipos_propiedad t ON p.categoria = t.id 
          WHERE p.latitud IS NOT NULL AND p.longitud IS NOT NULL 
          AND p.vendida = 0";
$resultado = $db->query($query);
?>

<!-- Bootstrap CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- Google Maps API y MarkerClusterer -->
<script src="https://maps.googleapis.com/maps/api/js?key=<?php echo GOOGLE_MAPS_API_KEY; ?>"></script>
<script src="https://unpkg.com/@googlemaps/markerclustererplus/dist/index.min.js"></script>

<style>
    .container-fluid,
    .container {
        width: 85%;
    }

    .container-map {
        padding: 12px;
        margin: 0 auto;
        max-width: 1200px;
    }

    .title-map {
        color: #2c3e50;
        font-size: 2.5rem;
        margin-bottom: 1.5rem;
        text-align: center;
        font-weight: 800;
    }

    .map-container {
        background: white;
        border-radius: 10px;
        box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
        padding: 10px;
        margin-bottom: 30px;
    }

    #map {
        height: 600px;
        width: 100%;
        border-radius: 8px;
    }

    .property-info {
        padding: 15px;
    }

    .property-info img {
        width: 100%;
        height: 150px;
        object-fit: cover;
        border-radius: 8px;
        margin-bottom: 10px;
    }

    .property-title {
        font-size: 1.2rem;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 8px;
        text-decoration: none;
    }

    .property-category {
        color: #666;
        font-size: 0.9rem;
        margin-bottom: 5px;
    }

    .property-location {
        color: #7f8c8d;
        font-size: 0.9rem;
        margin-bottom: 10px;
    }

    .property-link {
        margin-top: 12px;
    }

    .property-link a {
        text-decoration: none;
        width: 100%;
        text-align: center;
        background-color: #5F8697 !important;
        border-color: #5F8697 !important;
    }

    .property-link a:hover {
        background-color: #4a6b7a !important;
        border-color: #4a6b7a !important;
    }

    .info-window-content {
        max-width: 400px;
        padding: 5px;
    }

    .cluster {
        background-color: #5F8697;
        color: white;
        border-radius: 50%;
        padding: 10px;
        text-align: center;
        font-weight: bold;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    }

    /* Estilos para los clusters personalizados */
    .cluster,
    .gm-style .cluster,
    .marker-cluster {
        background: #5F8697 !important;
        border-radius: 50% !important;
        color: #fff !important;
        width: 36px !important;
        height: 36px !important;
        display: flex !important;
        align-items: center;
        justify-content: center;
        font-size: 16px !important;
        font-weight: 700 !important;
        border: 2px solid #fff !important;
        box-shadow: none !important;
        margin: 0 !important;
        padding: 0 !important;
        opacity: 0.95 !important;
    }

    .marker-cluster div {
        width: 100% !important;
        height: 100% !important;
        display: flex !important;
        align-items: center;
        justify-content: center;
    }

    /* Oculta la imagen de fondo por defecto de MarkerClusterer */
    .marker-cluster img {
        display: none !important;
    }

    @media (max-width: 768px) {
        .container {
            padding: 10px;
        }

        #map {
            height: 500px;
        }

        .title-map {
            font-size: 2rem;
        }

        .gm-style-iw,
        .gm-style-iw-c {
            max-width: 250px !important;
        }

    }
</style>
</div>
<div class="container-map">
    <h1 class="title-map">Mapa de Propiedades</h1>
    <div class="map-container">
        <div id="map"></div>
    </div>
</div>

<script>
    // Inicializar el mapa
    function initMap() {
        // Coordenadas iniciales (centro entre Rosario y Córdoba)
        const center = {
            lat: -32.94682,
            lng: -60.63932
        };

        // Crear el mapa
        const map = new google.maps.Map(document.getElementById("map"), {
            zoom: 7,
            center: center,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true
        });

        // Configuración del ícono personalizado
        const customIcon = {
            url: 'assets/img/marker.svg',
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 40)
        };

        // Array para almacenar los marcadores
        const markers = [];
        const bounds = new google.maps.LatLngBounds();

        // Obtener las propiedades del PHP
        const propiedades = <?php
                            $propiedades = [];
                            while ($propiedad = $resultado->fetch_assoc()) {
                                $propiedades[] = $propiedad;
                            }
                            echo json_encode($propiedades);
                            ?>;

        // Crear marcadores para cada propiedad
        propiedades.forEach(propiedad => {
            const position = {
                lat: parseFloat(propiedad.latitud),
                lng: parseFloat(propiedad.longitud)
            };

            // Crear el marcador con el ícono personalizado
            const marker = new google.maps.Marker({
                position: position,
                map: map,
                title: propiedad.titulo,
                animation: google.maps.Animation.DROP,
                icon: customIcon
            });

            // Crear el contenido del InfoWindow
            const contentString = `
                    <div class="info-window-content">
                        <div class="property-info">
                            ${propiedad.imagen ? `<img src="${propiedad.imagen}" alt="${propiedad.titulo}">` : ''}
                            <div class="property-title">${propiedad.titulo}</div>
                            <div class="property-category">${propiedad.nombre_categoria}</div>
                            <div class="property-location">${propiedad.localidad}</div>
                            <div class="property-link">
                                <a href="propiedad${propiedad.id}" class="btn btn-primary btn-sm w-100">Ver Detalles</a>
                            </div>
                        </div>
                    </div>
                `;

            // Crear el InfoWindow
            const infowindow = new google.maps.InfoWindow({
                content: contentString,
                maxWidth: 300
            });

            // Agregar evento click al marcador
            marker.addListener("click", () => {
                infowindow.open(map, marker);
            });

            // Agregar el marcador al array y ajustar los límites del mapa
            markers.push(marker);
            bounds.extend(position);
        });

        // Agrupar los marcadores usando MarkerClustererPlus con estilos personalizados
        const markerCluster = new MarkerClusterer(map, markers, {
            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
            styles: [{
                url: '', // No usar imagen, solo CSS
                height: 36,
                width: 36,
                textColor: '#fff',
                textSize: 16,
                backgroundPosition: 'center',
                anchorText: [0, 0],
                // El resto se maneja por CSS
            }]
        });

        // Ajustar el zoom para mostrar todos los marcadores
        if (markers.length > 0) {
            map.fitBounds(bounds);
        } else {
            // Si no hay marcadores, mantener el centro en la región
            map.setCenter(center);
            map.setZoom(7);
        }
    }

    // Inicializar el mapa cuando se carga la página
    window.onload = initMap;
</script>

<!-- Bootstrap JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>