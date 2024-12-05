<?php
function convertirNumeroALetras($numero) {
    # arreglo con los nombres de los números del 0 al 19
    $numerosHastaDiecinueve = array(
        0 => 'un', 1 => 'uno', 2 => 'dos', 3 => 'tres', 4 => 'cuatro', 5 => 'cinco',
        6 => 'seis', 7 => 'siete', 8 => 'ocho', 9 => 'nueve', 10 => 'diez', 11 => 'once',
        12 => 'doce', 13 => 'trece', 14 => 'catorce', 15 => 'quince', 16 => 'dieciséis',
        17 => 'diecisiete', 18 => 'dieciocho', 19 => 'diecinueve'
    );

    # arreglo con los nombres de las decenas
    $decenas = array(
        20 => 'veinte', 30 => 'treinta', 40 => 'cuarenta', 50 => 'cincuenta',
        60 => 'sesenta', 70 => 'setenta', 80 => 'ochenta', 90 => 'noventa'
    );

    # arreglo con los nombres de las centenas
    $centenas_letras = array(
        100 => 'cien', 200=> 'docientos', 300=>'trecientos', 400=>'cuatrocientos', 500=>'quinientos',
        600=>'seicientos', 700=>'setecientos', 800=>'ochocientos', 900=>'novecientos', 1000 => 'mil'
    );


    if ($numero < 20) {
        # Si el número es menor que 20, se busca en el array de números hasta diecinueve
        if($numero == 00){
            #break;
        }else{
            return $numerosHastaDiecinueve[$numero];
        }
    }elseif ($numero < 100 ) {
        # Si el número es menor que 100, se descompone en decenas y unidades
        $decena = floor($numero / 10) * 10;
        $unidad = $numero % 10;
        $letra = $decenas[$decena];
        if ($unidad > 0) {
            $letra .= ' y ' . $numerosHastaDiecinueve[$unidad];
        }
        return $letra;
    } elseif ($numero < 1000) {
        # Si el número es menor que 1000, se descompone en centenas, decenas y unidades
        $centena = floor($numero / 100);
        $resto = $numero % 100;
        $centena = floor($numero / 100)*100;
        $decena = $numero - $centena;
        $letra = ($numero < 200 && $numero > 100) ? $centenas_letras[$centena].'to '.convertirNumeroALetras($decena) : $centenas_letras[$centena].' '.convertirNumeroALetras($decena);
        return $letra;
    } else {
        # Si el número es mayor o igual a 1000, se descompone en miles, centenas, decenas y unidades
        $millar = floor($numero / 1000);
        $resto = $numero % 1000;
        $letra = $millar == 1 ? $centenas_letras[1000] : convertirNumeroALetras($millar) . ' mil';
        # si el número es mayor de 100 y menor a los 102, ciento un mil ... y no ciento uno mil...
        if( ($millar >100 && $millar <102)){
            $letra = $centenas_letras[$millar-1].'to '.$numerosHastaDiecinueve[0].' mil ';
        }
        # validaciones para los 201, 301, 401, ... 901 los docientos ... un mil 
        if(($millar > 200 && $millar < 202) || ($millar > 300 && $millar < 302) || ($millar > 400 && $millar < 402) || ($millar > 500 && $millar < 502) || ($millar > 600 && $millar < 602) || ($millar > 700 && $millar < 702) || ($millar > 800 && $millar < 802) || ($millar > 900 && $millar < 902)){
            $letra = $centenas_letras[$millar-1].' '.$numerosHastaDiecinueve[0].' mil ';
        }
        if ($resto > 0) {
            $letra .= ' ' . convertirNumeroALetras($resto);
        }
        # si el número es menor o igual a 1'000,000, se descompone en los millares, miles, centenas, decenas y unidades.
        if ($numero == 1000000){
            $letra =  $numerosHastaDiecinueve[0].' millón';
        }elseif ($numero > 1000000){
            $millon = floor($numero / 1000000);
            $centimas = $numero - (1000000*$millon);
            if ($millon == 1){
                $letra = $numerosHastaDiecinueve[0].' millón '.convertirNumeroALetras($centimas);
            }else{
                $letra = convertirNumeroALetras($millon).' millones '.convertirNumeroALetras($centimas);
                #$letra = $centimas;
            }
        }
        return $letra;
    } 
}
?>