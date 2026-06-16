# Deployment

Инструкция для загрузки проекта на GitHub и запуска на сервере колледжа.

## 1. Что должно быть на сервере

- Git
- Docker
- Docker Compose

Проверка:

```bash
git --version
docker --version
docker compose version
```

## 2. Загрузка в GitHub

Репозиторий: `https://github.com/Arnyyyyyy/parking.git`

```bash
git init
git add .
git commit -m "Prepare smart parking project for deployment"
git branch -M main
git remote add origin https://github.com/Arnyyyyyy/parking.git
git push -u origin main
```

Если remote уже существует:

```bash
git remote set-url origin https://github.com/Arnyyyyyy/parking.git
git push -u origin main
```

## 3. Настройка backend/.env на сервере

Создайте файл:

```bash
cp backend/.env.example backend/.env
```

Минимально поменяйте:

```env
ENV=production
SECRET_KEY=replace_with_long_random_secret
BACKEND_CORS_ORIGINS=http://SERVER_IP:5173
```

Если будет домен, вместо `SERVER_IP` укажите домен.

## 4. Настройка переменных для Docker Compose

Создайте файл `.env` в корне проекта:

```bash
cp .env.example .env
```

И поменяйте значения под сервер:

```env
POSTGRES_DB=smart_parking
POSTGRES_USER=parking_user
POSTGRES_PASSWORD=replace_with_strong_db_password
BACKEND_PORT=8000
FRONTEND_PORT=5173
VITE_API_URL=http://SERVER_IP:8000
```

## 5. Запуск

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Проверка:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f backend
```

Адреса:

- Frontend: `http://SERVER_IP:5173`
- Backend docs: `http://SERVER_IP:8000/docs`

## 6. Обновление проекта на сервере

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## 7. Важно

- Не загружайте в GitHub `.env`, `node_modules`, `.venv`, локальную базу `*.db` и файлы из `backend/uploads`.
- Для реального production лучше поставить Nginx и HTTPS, но для демонстрации в колледже Docker Compose достаточно.
