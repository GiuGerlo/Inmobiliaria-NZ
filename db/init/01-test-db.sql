-- DB dedicada para tests Pest (RefreshDatabase). Se crea en el primer boot
-- del volumen mariadb. Para un volumen ya inicializado, correr manualmente:
--   docker compose exec mariadb sh -c 'mariadb -uroot -p"$MARIADB_ROOT_PASSWORD" < /docker-entrypoint-initdb.d/00-test-db.sql'
CREATE DATABASE IF NOT EXISTS `inmobiliaria_test`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
GRANT ALL PRIVILEGES ON `inmobiliaria_test`.* TO 'inmo'@'%';
FLUSH PRIVILEGES;
