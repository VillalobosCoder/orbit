# API

## Guardar usuarios

`DBUserRepository.save` crea un usuario y devuelve el ID generado por PostgreSQL.
Las actualizaciones se realizan por separado con `update`.

Para aplicar los cambios de columnas a una base de datos existente, ejecuta
`src/infrastructure/db/migrations/0001-user-registration.sql` contra esa base.
Los registros públicos no tienen un usuario autenticado que informar en
`userCreated`, y las columnas de correo y contraseña deben permitir sus tamaños
completos.

## Contraseñas

Las contraseñas se guardan con scrypt en un formato versionado que incluye sus
parámetros de costo. Al iniciar sesión, los hashes antiguos se verifican con sus
parámetros originales y se reemplazan por el formato actual solo después de una
verificación correcta. Las contraseñas pueden tener hasta 1024 bytes en UTF-8.
