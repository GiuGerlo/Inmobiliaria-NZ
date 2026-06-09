# Snapshot del legacy — 2026-06-08

Foto del estado del proyecto justo antes de empezar la reformulación. Sirve como referencia para no perder funcionalidad y para entender qué se reemplaza.

## Stack actual

- PHP procedural (sin framework, sin Composer en la raíz).
- `mysqli` directo con conexión global en `includes/conexion.php`.
- Frontend: Bootstrap 5.3, DataTables, SweetAlert2, Toastify, Lineicons, Font Awesome — todo por CDN en `templates/inc.head.php`.
- PDFs con `dompdf` vendoreado en `dompdf/` (su `vendor/` está committed).
- Hosting: Apache compartido en Hostinger.

## Estructura de archivos

```
Inmobiliaria-NZ/
├── *.php                     # páginas top-level: index, admin, recibos, contratos,
│                             # propiedades, duenos, inquilinos, ciudades, pagos,
│                             # loginform, loginauth, logout
├── controlador/              # registrar-*, modificar-*, eliminar-* + generar-recibo, generar-rendicion
├── includes/conexion.php     # MySQLi global, switch local/prod por HTTP_HOST
├── templates/                # inc.head, sidebar, inc.footer, toast, utils
├── styles/                   # CSS custom
├── js/                       # main.js (init de DataTables y otros)
├── assets/                   # logos, firmas digitales
├── dompdf/                   # vendored
└── db/db.sql                 # dump de DB con datos reales (PII — no usar en seed)
```

## Patrón de página

1. La página top-level (ej. `recibos.php`) hace `include` del head + controladores + sidebar + toast.
2. Los controladores son archivos `controlador/<verbo>-<entidad>.php` que arrancan con `if (!empty($_POST['btn...']))` y ejecutan la mutación.
3. En éxito setean `$_SESSION['toast']` y redirigen (PRG pattern).
4. La página renderiza una tabla DataTables alimentada por una query inline.

## Schema de DB (legacy)

Convenciones legacy: snake_case en español con CamelCase mixto en columnas, IDs como `ID_<Entidad>`, smallint(6) en la mayoría.

### Tablas

- **ciudad**: `CodP` PK varchar(8), `Nombre_Ciudad`, `Provincia`.
- **dueno**: `ID_Dueno`, `CodP`, `NYA_Dueno`, `Tel_Dueno`, `Email_Dueno`.
- **inquilino**: `ID_Inquilino`, `CodP`, `NYA_Inquilino`, `Tel_Inquilino`, `Email_Inquilino`.
- **propiedad**: `ID_Propiedad`, `Dir_Propiedad`, `CodP`, `Tipo_Propiedad`, `Serv_Propiedad`, `Precio_Propiedad`, `Caract_Propiedad`, `Foto_Propiedad`, `Foto_Propiedad_GXI`.
- **contrato**: `ID_Contrato`, `ID_Dueno`, `ID_Inquilino`, `ID_Propiedad`, `F_Inicio`, `F_Fin`, `Saldo`, `Certificacion`.
- **formadepago**: `ID_FP`, `Desc_FP`.
- **recibo**: `Nro_Recibo`, `ID_FP`, `ID_Contrato`, `F_Pago`, `Pago_Propiedad`, `Pago_Municipal`, `Pago_Agua`, `Honorarios`, `Mes_Rend`, `Ano_Rend`, `Pago_Electricidad`, `Pago_Gas`, `Arreglos`, `Sepelio`, `Comentarios`.
- **users**: `ID_User`, `Nombre_User`, `Email_User`, `Pass_User` (MD5 sin salt).

### Notas del schema

- Sin FKs declaradas. Las relaciones existen por convención (`ID_Contrato`, `ID_Dueno`, etc.).
- `Saldo decimal(15,0)` y demás importes son enteros sin decimales → pesos sin centavos (verificar si querés mantener así o pasar a `decimal(15,2)`).
- `formadepago` con descripción libre (probablemente "Efectivo", "Transferencia", etc. — confirmar al migrar).
- `Mes_Rend` es varchar con el nombre del mes en español ("Enero", "Febrero"...) → reemplazar por entero 1–12 o ENUM en la nueva DB.
- `Certificacion` varchar(2) con valores "Si"/"No" — reemplazar por boolean.

## Funciones de negocio que NO se pueden perder

1. **CRUD** de ciudades, dueños, inquilinos, propiedades, contratos, recibos, formas de pago.
2. **Generación de recibo individual** (`controlador/generar-recibo.php`) — PDF con totales, número en letras (`templates/utils.php::convertirNumeroALetras`).
3. **Rendición mensual a dueños** (`pagos.php`) — lista contratos pagados vs no pagados de un mes/año + PDF para el dueño.
4. **Login simple** (un usuario admin).

## Problemas críticos identificados

- **SQL injection** en `loginauth.php`, `controlador/registrar-recibo.php` y otros: interpolación directa de `$_POST` en queries.
- **Passwords con MD5 sin salt** (`users.Pass_User`).
- **Credenciales productivas committed** en `includes/conexion.php`.
- **Sin CSRF**, sin headers de seguridad, sin rate limit en login.
- **Sin validación server-side**: todo viene de `$_POST` directo.
- **Sin tests, sin CI/CD**.
- **Mismo dump con PII real en repo** (`db/db.sql`) — emails, teléfonos, direcciones de inquilinos/dueños reales.

Estos puntos son insumo para el spec de cada sub-proyecto.
