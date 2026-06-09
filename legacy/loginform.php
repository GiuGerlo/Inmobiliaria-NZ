<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NZ Estudio Jurídico-Inmobiliario</title>
    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- SweetAlert -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <style>
        body {
            background-color: #d5e7ff;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
        }
        .login-container {
            background: white;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
            text-align: center;
        }
        .login-logo img {
            width: 200px;
            margin-bottom: 1rem;
        }
        .btn-login {
            background-color: #0d6efd;
            color: white;
            transition: background-color 0.3s ease;
        }
        .btn-login:hover {
            background-color: #0a58ca;
        }
        .form-control:focus {
            border-color: #0d6efd;
            box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-logo">
            <img src="./assets/logo-nadina.jpg" alt="Logo de la Empresa">
        </div>
        <form action="./loginauth.php" method="POST">
            <div class="mb-3">
                <label for="email" class="form-label">Correo electrónico</label>
                <input type="email" name="email" id="email" class="form-control" placeholder="Ingresa tu correo" required>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Contraseña</label>
                <input type="password" name="password" id="password" class="form-control" placeholder="Ingresa tu contraseña" required>
            </div>
            <div class="d-grid">
                <button type="submit" name="btnlogin" class="btn btn-login">Acceder</button>
            </div>
        </form>
    </div>
    <!-- Mostrar SweetAlert si hay error -->
    <script>
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('error')) {
            Swal.fire({
                icon: 'error',
                title: 'Credenciales incorrectas',
                text: 'Por favor verifica tu correo y contraseña.',
            });
        }
    </script>
</body>
</html>
