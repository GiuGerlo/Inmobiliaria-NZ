<?php
require_once 'config/config.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }

    // Verificar token CSRF antes de cualquier procesamiento
    nz_csrf_require();

    $email    = strtolower(trim((string)filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL)));
    $password = $_POST['password'] ?? '';
    $ip       = nz_client_ip();

    if ($email === '' || $password === '') {
        throw new Exception('Completá email y contraseña.');
    }

    // Rate-limit
    $check = nz_login_attempts_check($db, $ip, $email);
    if ($check['blocked']) {
        $mins = (int)ceil($check['retry_after'] / 60);
        http_response_code(429);
        header('Retry-After: ' . $check['retry_after']);
        $response['message']     = "Demasiados intentos. Esperá ~{$mins} minuto(s) y volvé a intentar.";
        $response['retry_after'] = $check['retry_after'];
        echo json_encode($response);
        exit;
    }

    // Lookup usuario
    $stmt = $db->prepare("SELECT id, email, password FROM users WHERE email = ?");
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();

    $ok = ($user && password_verify($password, $user['password']));

    // Registrar intento (éxito o fallo) — incluso fallos por email inexistente,
    // para que el rate-limit cuente esos casos también.
    nz_login_attempts_record($db, $ip, $email, $ok);
    nz_login_attempts_gc($db);

    if (!$ok) {
        // Mensaje genérico: no revelar si el email existe.
        throw new Exception('Email o contraseña incorrectos.');
    }

    // Login válido: regenerar ID de sesión para evitar fixation
    session_regenerate_id(true);

    $_SESSION['user_id']       = $user['id'];
    $_SESSION['user_email']    = $user['email'];
    $_SESSION['last_activity'] = time();

    $response = [
        'success' => true,
        'message' => 'Inicio de sesión exitoso'
    ];
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
