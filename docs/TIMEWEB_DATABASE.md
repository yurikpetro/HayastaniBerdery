# Timeweb PostgreSQL

Проект уже использует PostgreSQL через Prisma. Переключение между локальной и облачной БД делается только через `apps/api/.env`.

## Локальная БД

Для локального Docker Postgres используйте текущий пример:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
npm run docker:up
npm run db:push -w @hayastani/api
npm run db:seed -w @hayastani/api
npm run dev:all
```

## Timeweb Cloud

1. Установите корневой сертификат Timeweb:

```powershell
New-Item -ItemType Directory -Force -Path "$HOME\.cloud-certs" | Out-Null
Invoke-WebRequest -Uri "https://st.timeweb.com/cloud-static/ca.crt" -OutFile "$HOME\.cloud-certs\root.crt"
icacls "$HOME\.cloud-certs\root.crt" /inheritance:r /grant:r "$env:USERNAME`:R"
```

2. Скопируйте облачный пример окружения:

```powershell
Copy-Item apps/api/.env.timeweb.example apps/api/.env
```

3. В `apps/api/.env` замените:

- `REPLACE_WITH_TIMEWEB_PASSWORD` на пароль пользователя `gen_user`.
- `C:/Users/<WINDOWS_USER>/.cloud-certs/root.crt` на реальный путь к сертификату, например `C:/Users/Mi/.cloud-certs/root.crt`.

Итоговый `DATABASE_URL` должен указывать на:

```env
postgresql://gen_user:<password>@6f42a8c4aca7e2949bb24420.twc1.net:5432/HayBerd?schema=public&sslmode=verify-full&sslrootcert=C:/Users/Mi/.cloud-certs/root.crt
```

Если в пароле есть спецсимволы `@`, `:`, `/`, `?`, `#`, `&` или `=`, их нужно URL-encode, иначе строка подключения может разобраться неверно. Например, если Prisma пытается подключиться к `gen_user:5432`, значит пароль в `DATABASE_URL` не закодирован и URL оборвался на спецсимволе.

4. Примените схему Prisma к облачной БД:

```powershell
npm run db:push -w @hayastani/api
npm run db:seed -w @hayastani/api
npm run dev:all
```

Для проверки через `psql` можно использовать тот же сертификат:

```powershell
$env:PGSSLROOTCERT="$env:USERPROFILE\.cloud-certs\root.crt"
psql "postgresql://gen_user:<password>@6f42a8c4aca7e2949bb24420.twc1.net:5432/HayBerd?sslmode=verify-full"
```

## Права пользователя

Если `db:push` подключается к Timeweb, но падает с ошибкой `permission denied for schema public`, пользователю `gen_user` не хватает прав на создание таблиц, enum и индексов в схеме `public`.

Исправьте это в панели Timeweb, выдав пользователю `gen_user` полные права на базу `HayBerd`, или выполните от имени владельца БД:

```sql
GRANT ALL PRIVILEGES ON DATABASE "HayBerd" TO gen_user;
GRANT USAGE, CREATE ON SCHEMA public TO gen_user;
```

После выдачи прав повторите:

```powershell
npm run db:push -w @hayastani/api
npm run db:seed -w @hayastani/api
```
