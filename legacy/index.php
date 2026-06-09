<?php
session_start();
if (!isset($_SESSION['admin'])) {
    header("Location:loginform.php");
    exit();
}

header("Location:admin.php");