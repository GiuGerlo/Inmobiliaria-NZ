<?php
require_once __DIR__ . '/../../config/config.php';

// Sólo admins autenticados; responde JSON 401 si no.
nz_require_admin_ajax();

header('Content-Type: application/json');

$resp = ['success' => false, 'message' => ''];

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }

    nz_csrf_require();

    $current = $_POST['current_password'] ?? '';
    $new     = $_POST['new_password']     ?? '';
    $confirm = $_POST['confirm_password'] ?? '';

    if ($current === '' || $new === '' || $confirm === '') {
        throw new Exception('Completá todos los campos.');
    }
    if ($new !== $confirm) {
        throw new Exception('La nueva contraseña y su confirmación no coinciden.');
    }
    if (strlen($new) < 8) {
        throw new Exception('La nueva contraseña debe tener al menos 8 caracteres.');
    }
    if ($new === $current) {
        throw new Exception('La nueva contraseña debe ser distinta a la actual.');
    }

    // Verificar password actual
    $stmt = $db->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->bind_param('i', $_SESSION['user_id']);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();

    if (!$row || !password_verify($current, $row['password'])) {
        // Mensaje genérico, sin distinguir "user no existe" vs "pass incorrecta".
        throw new Exception('La contraseña actual es incorrecta.');
    }

    // Persistir el nuevo hash
    $hash = password_hash($new, PASSWORD_DEFAULT);
    $stmt = $db->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt->bind_param('si', $hash, $_SESSION['user_id']);
    if (!$stmt->execute()) {
        throw new Exception('Error al actualizar la contraseña.');
    }

    // Regenerar sesión por buena higiene (no obligatorio, pero limpio)
    session_regenerate_id(true);

    $resp = [
        'success' => true,
        'message' => 'Contraseña actualizada correctamente.',
    ];
} catch (Exception $e) {
    $resp['message'] = $e->getMessage();
}

echo json_encode($resp);
