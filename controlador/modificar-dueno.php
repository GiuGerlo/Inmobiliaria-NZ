<?php

if(!empty($_POST["btnModificar"])){
    $id = $_POST['txtId'];
    $nya = $_POST['txtNyA'];
    $cp = $_POST['txtCodP'];
    $tel = $_POST['txtTel'];
    $email = $_POST['txtEmail'];

    if (!empty($nya) && !empty($cp) && !empty($tel) && !empty($email)) {
        
    $modificar=$conexion->query("UPDATE dueno SET NYA_Dueno='$nya', CodP='$cp', Tel_Dueno='$tel', Email_Dueno='$email' WHERE ID_Dueno='$id'");
    if ($modificar==true) {
        echo "<div class='alert alert-success'>Dueño modificado</div>";
    } else {
        echo "<div class='alert alert-danger'>Error al modificar</div>";
    }
    

    } else {
        echo "<div class='alert alert-danger'>Faltan datos, inténtalo de nuevo</div>";
    } ?>

    <script>
        window.history.replaceState(null, null, window.location.pathname);
    </script>

<?php }
// if (!empty($_POST["btnModificar"])) {

//     $id = $_POST['txtID']; // El ID del dueño a modificar
//     $nya = $_POST['txtNYA'];
//     $cp = $_POST['txtCODP'];
//     $tel = $_POST['txtTEL'];
//     $email = $_POST['txtEMAIL'];

//     if (!empty($id) && !empty($nya) && !empty($cp) && !empty($tel) && !empty($email)) {
//         // Preparar la consulta de actualización para evitar inyecciones SQL
//         $stmt = $conexion->prepare("
//             UPDATE dueno 
//             SET NYA_Dueno = ?, CodP = ?, Tel_Dueno = ?, Email_Dueno = ? 
//             WHERE ID_Dueno = ?
//         ");
//         $stmt->bind_param("sssi", $nya, $cp, $tel, $email, $id);

//         if ($stmt->execute()) {
//             // Notificación de éxito
//             echo "
//                 <script>
//                     Toastify({
//                         text: 'Dueño modificado correctamente',
//                         duration: 3000,
//                         close: true,
//                         gravity: 'top',
//                         position: 'right',
//                         backgroundColor: '#28a745',
//                     }).showToast();
//                 </script>
//             ";
//         } else {
//             // Notificación de error en la base de datos
//             echo "
//                 <script>
//                     Toastify({
//                         text: 'Error al modificar el dueño',
//                         duration: 3000,
//                         close: true,
//                         gravity: 'top',
//                         position: 'right',
//                         backgroundColor: '#dc3545',
//                     }).showToast();
//                 </script>
//             ";
//         }
//         $stmt->close();
//     } else {
//         // Notificación de datos faltantes
//         echo "
//             <script>
//                 Toastify({
//                     text: 'Faltaron datos por ingresar, inténtalo de nuevo',
//                     duration: 3000,
//                     close: true,
//                     gravity: 'top',
//                     position: 'right',
//                     backgroundColor: '#ffc107',
//                 }).showToast();
//             </script>
//         ";
//     }

//     // Limpia el estado del formulario al recargar
//     echo "
//         <script>
//             window.history.replaceState(null, null, window.location.pathname);
//         </script>
//     ";

//     // Redirigir a la vista duenos.php
//     header("Location: http://localhost/Inmobiliaria-NZ/duenos.php");
//     exit();
// }