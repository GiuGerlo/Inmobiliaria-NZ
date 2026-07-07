<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Document root del sitio público (Hostinger)
    |--------------------------------------------------------------------------
    |
    | Ruta ABSOLUTA al docroot del sitio público en el server. Al activar el modo
    | mantenimiento, Laravel escribe ahí un bloque en el .htaccess que deja pasar
    | solo la IP permitida (mismo filesystem/cuenta que el admin). Vacío o inexistente
    | (ej. local en Docker, donde el público es otro container) → no se toca nada.
    |
    */

    'public_docroot' => env('PUBLIC_DOCROOT_PATH'),

];
