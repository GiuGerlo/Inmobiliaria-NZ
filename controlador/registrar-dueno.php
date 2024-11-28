<?php

if (!empty($_POST['btnREGISTRAR'])) {
    
    $nya=$_POST['txtNYA'];
    $cp=$_POST['txtCODP'];
    $tel=$_POST['txtTEL'];
    $email=$_POST['textEMAIL'];

    if(!empty($_POST["txtNYA"]) and !empty($_POST['txtCODP']) and !empty($_POST['txtTEL']) and !empty($_POST['textEMAIL']) ) {

        $registrar = $conexion->query("INSERT INTO dueno( NYA_Dueno, CodP, Tel_Dueno, Email_Dueno) values('$nya','$cp','$tel', '$email') ");

        if ($registrar == true) {
            echo "<div>Dueño registrado</div>";
        } else{
            echo "<div>Dueño no se registro</div>";
        }

    } else{
        echo "<div>Faltaron datos por ingresar, inténtalo de nuevo</div>";
    }
?>

    <script>
        window.history.replaceState(null, null, window.location.pathname);
    </script>

<?php }
