<?php
if (isset($_POST['btnlogin'])) {
    $txtEmail = $_POST['email'];
    $txtPassword = md5($_POST['password']);

    include "includes/conexion.php";

    $sql = "SELECT * FROM users WHERE Email_User='" . $txtEmail . "' AND Pass_User= '" . $txtPassword . "'";
    $result = $conexion->query($sql);

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        session_start();
        $_SESSION['admin'] = $user['name'];
        header("Location:admin.php");
        exit();
    } else {
        header("Location:loginform.php?error=1");
        exit();
    }
}
?>
