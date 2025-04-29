# TrashTech

TrashTech — це монорепозиторій із двома частинами:

1. **Server** — REST‑API на Node.js + Express, з аутентифікацією, зберіганням даних у MongoDB та обробкою повідомлень MQTT.
2. **Client** — односторінковий додаток (SPA) на React + Vite, з Redux Toolkit, PWA‑підтримкою, сервіс‑воркером та маршрутизацією React Router.

---

## Основні можливості

- Реєстрація та вхід користувачів (JWT‑авторизація)
- CRUD для пристроїв користувача
- Показ історії та актуального рівня заповнення сміттєвих баків
- Реальний час через MQTT (HiveMQ)
- PWA: `manifest.json`, `service-worker.js`, кешування ресурсів
- Адаптивний інтерфейс та offline‑режим

---

## Технології

- Back-end
  - Node.js, Express.js
  - MongoDB (mongoose)
  - MQTT client (HiveMQ Cloud)
  - dotenv для керування налаштуваннями
- Front-end
  - React 19, Vite
  - Redux Toolkit, React‑Redux
  - React Router 7
  - Axios (з інтерцепторами для JWT)
  - PWA (Service Worker, Web App Manifest)
- Розгортання
  - Render.com (Web Service для моноліту: API + статика)

---

## Структура проєкту

```
/
├─ client/           # React + Vite SPA
│  ├─ public/        # статичні файли, manifest.json, icons/, service-worker.js
│  ├─ src/           # вихідний код React
│  ├─ dist/          # production‑збірка (після `npm run build`)
│  └─ package.json
└─ server/           # Node.js + Express API
   ├─ config/        # налаштування DB
   ├─ controllers/   # логіка маршрутів
   ├─ routes/        # оголошення роутів
   ├─ utils/         # DeviceStatusChecker, інші утиліти
   ├─ .env           # змінні оточення
   ├─ server.js      # точка входу
   └─ package.json
```

---

## Швидкий старт

### 1. Клонуємо та встановлюємо залежності
```bash
git clone <repo-url>
cd TrashTech
npm install          # встановити root‑скрипти (client+server)
```

### 2. Заповнюємо змінні оточення

#### server/.env
```properties
MONGODB_URI=...
PORT=3000
JWT_SECRET=...
MQTT_BROKER_URL=...
MQTT_USERNAME=...
MQTT_PASSWORD=...
NODE_ENV=development
CLIENT_URL=http://localhost:5173   # для CORS
DEVICE_SECRET=...
```

### 3. Розробка (development)

```bash
# Запуск серверу
cd server
npm start

# В іншій вкладці
cd client
npm run dev         # за замовчуванням http://localhost:5173
```

### 4. Збірка та продакшен

```bash
# В корені репо
npm run build       # виконає: встановить deps + зіб’є client
npm start           # запустить server, який обслуговує API + статику client/dist
```

На Render.com у Web Service достатньо вказати:
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Root Directory: можна залишити пустим

---

## Доступні скрипти

### кореневі (root)
- `npm install` — встановити залежності client+server
- `npm run build` — зібрати client (Vite → client/dist)
- `npm start` — запустити сервер (Express) з обслуговуванням статичних файлів

### в client/
- `npm install`
- `npm run dev` — старт dev‑сервера Vite
- `npm run build` — production‑збірка → client/dist
- `npm run preview` — локальний preview z dist

---

## API Endpoints (з базовим префіксом `/api`)

- POST   `/api/auth/register`  
- POST   `/api/auth/login`  
- GET    `/api/auth/checkAuth`  
- GET    `/api/users/devices-list`  
- PATCH  `/api/devices/device-add`  
- DELETE `/api/devices/device-delete`  
- GET    `/api/dashboard/device/:serialNumber/fillLevelHistory`  
- GET    `/api/dashboard/device/:serialNumber/fillLevel`  
- …та інші згідно `/server/routes`

---

## PWA

- `public/manifest.json` визначає іконки, start_url, display=standalone
- `public/service-worker.js` кешує базові ресурси та реалізує offline‑fetch
- Кнопка встановлення відображається при `beforeinstallprompt`

---

## Ліцензія

MIT License. Політика відкритого коду.