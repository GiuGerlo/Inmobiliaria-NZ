# Sub-B — Schema + Migrations Laravel (design spec)

- **Sub-proyecto**: B
- **Fecha**: 2026-06-09
- **Estado**: aprobado
- **Branch**: `fase/B-schema-migrations`
- **Depende de**: sub-A (DONE)

## Contexto

La DB legacy fue hecha a mano (primera DB del autor): sin FKs, sin índices más allá de PKs, tipos cuestionables (`Mes_Rend` varchar con nombre del mes, `Certificacion` varchar(2) "Si"/"No", importes `decimal(15,0)`). Funciona en producción y el legacy PHP la sigue escribiendo.

**Principio rector de la fase**: el sistema debe funcionar **igual que antes** — mismos datos, mismas tablas, mismos nombres — pero con la capa Laravel bien estructurada encima: modelos limpios en inglés, integridad referencial verificada, factories/seeders para desarrollo y tests reproducibles.

Decisión marco que viene de sub-A: **DB única compartida** entre legacy y Laravel. El legacy no se toca; los nombres de tablas/columnas se preservan exactos.

## Decisiones de esta fase

| # | Decisión | Razón |
|---|---|---|
| 1 | Migrations **recrean todo el schema desde cero** (8 tablas legacy espejo exacto + tablas system Laravel) | PC nueva sin dump funciona; `RefreshDatabase` en tests funciona; el schema queda documentado como código. |
| 2 | En DB con dump ya importado: migrations legacy hacen `Schema::hasTable()` → skip (baseline) | No pisar datos reales. |
| 3 | **FKs + índices** en migration separada, gated por comando `legacy:check-orphans` | Integridad real de acá en adelante; el comando lista huérfanos antes de aplicar constraints sobre datos viejos. |
| 4 | Tipos legacy se **espejan exactos** (sin "mejorar" decimal/varchar ahora) | El legacy PHP sigue escribiendo estas tablas. Corregir tipos = sub-fase futura post-deprecate. |
| 5 | Modelos Eloquent **en inglés** con `$table`/`$primaryKey` apuntando a nombres legacy | Capa de traducción limpia; código nuevo lee bien sin romper la DB compartida. |
| 6 | Tests contra **MariaDB dedicada** (`inmobiliaria_test`, mismo container) | Paridad total de motor/charset/strict-mode. SQLite descartado por riesgo de falsos verdes. |
| 7 | Factories faker `es_AR`, **cero PII real**; `DemoSeeder` para datos de muestra | Regla de seguridad del proyecto. |
| 8 | ADR-0002 se cierra: **preservar nombres legacy** mientras el legacy viva | Consecuencia directa de DB compartida. Rename físico = posible fase futura. |

## Migrations

Orden por dependencias:

```
0001_create_ciudad_table          CodP varchar(8) PK, Nombre_Ciudad, Provincia
0002_create_dueno_table           ID_Dueno PK AI, CodP, NYA_Dueno, Tel_Dueno, Email_Dueno
0003_create_inquilino_table       ID_Inquilino PK AI, CodP, NYA_Inquilino, Tel_Inquilino, Email_Inquilino
0004_create_propiedad_table       ID_Propiedad PK AI, Dir_Propiedad, CodP, Tipo_Propiedad,
                                  Serv_Propiedad, Precio_Propiedad, Caract_Propiedad,
                                  Foto_Propiedad, Foto_Propiedad_GXI
0005_create_formadepago_table     ID_FP PK AI, Desc_FP
0006_create_contrato_table        ID_Contrato PK AI, ID_Dueno, ID_Inquilino, ID_Propiedad,
                                  F_Inicio, F_Fin, Saldo, Certificacion
0007_create_recibo_table          Nro_Recibo PK AI, ID_FP, ID_Contrato, F_Pago, Pago_Propiedad,
                                  Pago_Municipal, Pago_Agua, Honorarios, Mes_Rend, Ano_Rend,
                                  Pago_Electricidad, Pago_Gas, Arreglos, Sepelio, Comentarios
0008_create_users_table           ID_User PK AI, Nombre_User, Email_User unique, Pass_User
                                  + password (nullable, para bcrypt en sub-C)
0009_add_foreign_keys_and_indexes FKs + índices (ver abajo). Migration separada.
+ system Laravel                  cache, jobs, sessions, personal_access_tokens (default framework)
```

- Charset/collation: `utf8mb4` / `utf8mb4_general_ci` (igual al dump).
- Tipos espejo exacto del dump (`decimal(15,0)`, `smallint(6)`, varchars con mismos largos).
- Cada migration legacy arranca con `if (Schema::hasTable('...')) return;` — baseline en DB existente.
- `0008_users`: el dump trae `users` con `Pass_User varchar(35)` (MD5/plaintext). La migration agrega además columna `password` nullable para la transición a bcrypt en sub-C. En DB existente, una migration alter agrega solo la columna nueva.

### 0009 — FKs + índices

| Tabla | FK | On delete |
|---|---|---|
| dueno.CodP → ciudad.CodP | restrict |
| inquilino.CodP → ciudad.CodP | restrict |
| propiedad.CodP → ciudad.CodP | restrict |
| contrato.ID_Dueno → dueno | restrict |
| contrato.ID_Inquilino → inquilino | restrict |
| contrato.ID_Propiedad → propiedad | restrict |
| recibo.ID_Contrato → contrato | restrict |
| recibo.ID_FP → formadepago | restrict |

`restrict` en todo: nunca borrado en cascada de datos contables/contractuales.

Índices: todas las columnas FK + `recibo(Mes_Rend, Ano_Rend)` (query principal de rendición mensual).

## Comando `legacy:check-orphans`

`php artisan legacy:check-orphans`

- Cuenta y lista registros huérfanos por cada relación de la tabla de FKs.
- Exit code 0 = limpio; 1 = hay huérfanos (lista IDs, no aplica nada).
- Uso: después de importar dump real, antes de correr la migration 0009.
- En DB de test/fresca no hace falta (schema nace con FKs).

## Modelos Eloquent

| Modelo | Tabla | PK | Notas |
|---|---|---|---|
| `City` | ciudad | CodP (string, no AI) | `$keyType = 'string'`, `$incrementing = false` |
| `Owner` | dueno | ID_Dueno | |
| `Tenant` | inquilino | ID_Inquilino | |
| `Property` | propiedad | ID_Propiedad | |
| `Contract` | contrato | ID_Contrato | casts: F_Inicio/F_Fin date |
| `PaymentMethod` | formadepago | ID_FP | |
| `Receipt` | recibo | Nro_Recibo | casts: F_Pago date, importes decimal:0 |
| `User` | users | ID_User | extiende Authenticatable; auth real en sub-C |

Comunes a todos: `$timestamps = false` (legacy no tiene created_at/updated_at — agregar columnas rompería la paridad con el legacy que hace INSERT sin esas columnas).

### Relationships

```
City        hasMany Owner, Tenant, Property
Owner       belongsTo City; hasMany Contract
Tenant      belongsTo City; hasMany Contract
Property    belongsTo City; hasMany Contract
Contract    belongsTo Owner, Tenant, Property; hasMany Receipt
Receipt     belongsTo Contract, PaymentMethod
PaymentMethod hasMany Receipt
```

## Factories + Seeders

- Factory por modelo, faker locale `es_AR` (ya configurado en `.env`: `APP_FAKER_LOCALE=es_AR`).
- Datos con forma real: montos 50.000–500.000, meses en español ("Enero"…"Diciembre") como espera el legacy, `Certificacion` ∈ {"Si","No"}, CodP de 4 dígitos.
- **Cero datos reales** de personas. Ningún nombre/email/teléfono del dump.
- `DemoSeeder`: 5 ciudades, 10 dueños, 15 inquilinos, 15 propiedades, 12 contratos, 30 recibos.
- `DatabaseSeeder` llama a `DemoSeeder` solo en `local`.

## Test DB

- `inmobiliaria_test` creada por script en `docker-entrypoint-initdb.d/` (junto al dump opcional).
- `phpunit.xml`: `DB_DATABASE=inmobiliaria_test`, mismo host `mariadb`.
- Feature tests usan `RefreshDatabase`.

## Tests de la fase (DoD)

- [ ] `migrate:fresh` corre limpio en `inmobiliaria_test` (schema completo + FKs).
- [ ] 1 test por modelo: factory crea registro válido; relationships navegan (ej. `$receipt->contract->owner->city`).
- [ ] Test de `legacy:check-orphans`: con huérfano plantado detecta y exit 1; limpio exit 0.
- [ ] Seeders corren: `db:seed` produce el dataset demo.
- [ ] En DB dev con dump real: `migrate` no rompe nada (baseline skip) y `legacy:check-orphans` reporta estado.
- [ ] Suite completa verde: `docker compose exec php-fpm ./vendor/bin/pest`.

## Fuera de scope

- Corregir tipos (Mes_Rend a int, Certificacion a bool, decimales con centavos) — requiere migrar al legacy también; va post-deprecate.
- Auth/password rehash (sub-C).
- Endpoints API (sub-D).
- Borrar columnas muertas (`Foto_Propiedad_GXI`) — auditar uso real primero.

## ADRs

- **ADR-0002** (nuevo, aceptada): preservar nombres de tablas/columnas legacy mientras el legacy viva; modelos Eloquent en inglés como capa de traducción.

## Riesgos

- **Dump real con huérfanos** → la migration 0009 fallaría: por eso está gated por `legacy:check-orphans` y es separada; el resto del schema funciona sin ella.
- **Drift dump vs migrations** (si el legacy en prod cambia schema) → bajo: el legacy está congelado, nadie le agrega columnas.
- **AUTO_INCREMENT en tablas espejo**: el dump trae AI con valores avanzados; migrations en fresh empiezan de 1 — irrelevante para tests/demo.

## Referencias

- Snapshot del legacy: `docs/legacy/snapshot-php.md`.
- Dump real: fuera de git (`DB_DUMP_PATH`).
- Roadmap: `docs/roadmap.md`.
