# Smart Parking System — дипломный fullstack проект

Полноценная демо-система управления и мониторинга городских парковочных пространств.

## Стек

### Backend
- Python 3.11+
- FastAPI
- SQLAlchemy 2
- PostgreSQL / SQLite
- JWT access + refresh tokens
- bcrypt password hashing
- WebSocket realtime
- QR-код бронирования

### Frontend
- React + Vite
- Tailwind CSS
- React Router
- Axios
- Leaflet / OpenStreetMap
- Chart.js
- Светлая / тёмная тема

## Функции

- Регистрация и вход
- Роли: USER, ADMIN, MODERATOR
- Защищённые страницы
- Интерактивная карта парковок Алматы
- Выбор зоны и конкретного места
- Бронирование с расчётом стоимости
- Демо-оплата Kaspi / Halyk / Card / QR
- QR-билет после оплаты
- Личный кабинет пользователя
- Админ-панель
- CRUD парковочных зон
- Управление статусами мест
- Аналитика дохода, загрузки и популярных зон
- WebSocket realtime обновления
- Демонстрационные данные

## Быстрый запуск через Docker

```bash
cd smart-parking-fullstack
cp backend/.env.example backend/.env
docker compose up --build
```

Frontend: http://localhost:5173  
Backend API: http://localhost:8000/docs

## Ручной запуск backend

```bash
cd backend
py -m venv .venv
.venv\Scripts\activate
py -m pip install -r requirements.txt
copy .env.example .env
py -m uvicorn app.main:app --reload
```

Для Windows PowerShell вместо `copy` можно:

```powershell
Copy-Item .env.example .env
```

## Ручной запуск frontend

```bash
cd frontend
npm install
npm run dev
```

## Демо-аккаунты

После первого запуска автоматически создаются:

### Admin
- email: `admin@parking.kz`
- password: `Admin12345`

### User
- email: `user@parking.kz`
- password: `User12345`

## Главные страницы

- `/` — главная
- `/login` — вход
- `/register` — регистрация
- `/map` — карта парковок
- `/profile` — личный кабинет
- `/admin` — админ-панель

## Что показывать на защите

1. Главную страницу.
2. Регистрацию нового пользователя.
3. Вход.
4. Карту парковок.
5. Выбор парковки и места.
6. Бронирование.
7. Демо-оплату.
8. QR-билет.
9. Личный кабинет.
10. Админ-панель.
11. Аналитику.
12. Realtime изменение статуса места.
13. Swagger API: `/docs`.

## Важно

Это учебно-дипломный MVP. Для настоящей городской эксплуатации нужно подключать реальные платёжные API, камеры, официальные парковочные данные, аудит безопасности и production-хостинг.
