<?php
require_once __DIR__ . '/../../config/config.php';

// Guard: requiere sesión válida; responde JSON 401 si no.
nz_require_admin_ajax();

/**
 * Controlador para la gestión de categorías de propiedades
 */
class ControllerCategorias {
    private $db;
    private $resultado;

    public function __construct($db) {
        $this->db = $db;
        $this->resultado = [
            'estado' => '',
            'mensaje' => '',
            'data' => null
        ];
    }

    /**
     * Obtiene todas las categorías con el conteo de propiedades asociadas
     */
    public function obtenerCategorias() {
        try {
            $query = "SELECT t.*, COUNT(p.id) as total_propiedades 
                     FROM tipos_propiedad t 
                     LEFT JOIN propiedades p ON t.id = p.categoria 
                     GROUP BY t.id 
                     ORDER BY t.nombre_categoria";
            
            $categorias = $this->db->query($query);
            
            if ($categorias) {
                $this->resultado['estado'] = 'success';
                $this->resultado['data'] = $categorias;
            } else {
                $this->resultado['estado'] = 'error';
                $this->resultado['mensaje'] = 'Error al obtener las categorías: ' . $this->db->error;
            }
        } catch (Exception $e) {
            $this->resultado['estado'] = 'error';
            $this->resultado['mensaje'] = 'Error: ' . $e->getMessage();
        }
        
        return $this->resultado;
    }

    /**
     * Obtiene una categoría específica por su ID
     */
    public function obtenerCategoria($id) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM tipos_propiedad WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $categoria = $result->fetch_assoc();
            
            if ($categoria) {
                $this->resultado['estado'] = 'success';
                $this->resultado['data'] = $categoria;
            } else {
                $this->resultado['estado'] = 'error';
                $this->resultado['mensaje'] = 'No se encontró la categoría';
            }
        } catch (Exception $e) {
            $this->resultado['estado'] = 'error';
            $this->resultado['mensaje'] = 'Error: ' . $e->getMessage();
        }
        
        return $this->resultado;
    }

    /**
     * Crea una nueva categoría
     */
    public function crearCategoria($nombre_categoria) {
        try {
            // Validar datos
            if (empty($nombre_categoria)) {
                $this->resultado['estado'] = 'error';
                $this->resultado['mensaje'] = 'El nombre de la categoría es obligatorio';
                return $this->resultado;
            }
            
            // Crear nueva categoría
            $stmt = $this->db->prepare("INSERT INTO tipos_propiedad (nombre_categoria) VALUES (?)");
            $stmt->bind_param("s", $nombre_categoria);
            
            if ($stmt->execute()) {
                $this->resultado['estado'] = 'success';
                $this->resultado['mensaje'] = 'Categoría creada correctamente';
                $this->resultado['data'] = ['id' => $stmt->insert_id];
            } else {
                $this->resultado['estado'] = 'error';
                $this->resultado['mensaje'] = 'Error al crear la categoría: ' . $this->db->error;
            }
        } catch (Exception $e) {
            $this->resultado['estado'] = 'error';
            $this->resultado['mensaje'] = 'Error: ' . $e->getMessage();
        }
        
        return $this->resultado;
    }

    /**
     * Actualiza una categoría existente
     */
    public function actualizarCategoria($id, $nombre_categoria) {
        try {
            // Validar datos
            if (empty($nombre_categoria)) {
                $this->resultado['estado'] = 'error';
                $this->resultado['mensaje'] = 'El nombre de la categoría es obligatorio';
                return $this->resultado;
            }
            
            // Actualizar categoría
            $stmt = $this->db->prepare("UPDATE tipos_propiedad SET nombre_categoria = ? WHERE id = ?");
            $stmt->bind_param("si", $nombre_categoria, $id);
            
            if ($stmt->execute()) {
                $this->resultado['estado'] = 'success';
                $this->resultado['mensaje'] = 'Categoría actualizada correctamente';
            } else {
                $this->resultado['estado'] = 'error';
                $this->resultado['mensaje'] = 'Error al actualizar la categoría: ' . $this->db->error;
            }
        } catch (Exception $e) {
            $this->resultado['estado'] = 'error';
            $this->resultado['mensaje'] = 'Error: ' . $e->getMessage();
        }
        
        return $this->resultado;
    }

    /**
     * Elimina una categoría si no tiene propiedades asociadas
     */
    public function eliminarCategoria($id) {
        try {
            // Verificar si la categoría está en uso
            $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM propiedades WHERE categoria = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $enUso = $result->fetch_assoc()['total'] > 0;
            
            if ($enUso) {
                $this->resultado['estado'] = 'error';
                $this->resultado['mensaje'] = 'No se puede eliminar la categoría porque está siendo utilizada por propiedades';
                return $this->resultado;
            }
            
            // Eliminar categoría
            $stmt = $this->db->prepare("DELETE FROM tipos_propiedad WHERE id = ?");
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute()) {
                $this->resultado['estado'] = 'success';
                $this->resultado['mensaje'] = 'Categoría eliminada correctamente';
            } else {
                $this->resultado['estado'] = 'error';
                $this->resultado['mensaje'] = 'Error al eliminar la categoría: ' . $this->db->error;
            }
        } catch (Exception $e) {
            $this->resultado['estado'] = 'error';
            $this->resultado['mensaje'] = 'Error: ' . $e->getMessage();
        }
        
        return $this->resultado;
    }
}

// Procesamiento de solicitudes AJAX
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['accion'])) {
    // Verificar CSRF antes de cualquier mutación
    nz_csrf_require();

    $controller = new ControllerCategorias($db);
    $resultado = null;
    
    switch ($_POST['accion']) {
        case 'crear':
            $nombre_categoria = trim($_POST['nombre_categoria'] ?? '');
            $resultado = $controller->crearCategoria($nombre_categoria);
            break;
            
        case 'actualizar':
            $id = (int)$_POST['id'];
            $nombre_categoria = trim($_POST['nombre_categoria'] ?? '');
            $resultado = $controller->actualizarCategoria($id, $nombre_categoria);
            break;
            
        case 'eliminar':
            $id = (int)$_POST['id'];
            $resultado = $controller->eliminarCategoria($id);
            break;
            
        case 'obtener':
            $id = (int)$_POST['id'];
            $resultado = $controller->obtenerCategoria($id);
            break;
    }
    
    // Devolver respuesta en formato JSON
    header('Content-Type: application/json');
    echo json_encode($resultado);
    exit;
}
?>