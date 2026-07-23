# Quiz for Anna — подборка новостроек

Конверсионный квиз для риелтора Анны Вечерининой.

## Запуск

```bash
npm install
npm run dev
```

Сборка:

```bash
npm run build
npm run preview
```

Готовые файлы появятся в папке `dist/` — их можно загрузить на любой хостинг (Netlify, Vercel, GitHub Pages, Timeweb и т.д.).

## Логика

1. Сколько комнат
2. Цель покупки
3. Способ оплаты
4. Телефон → экран «Спасибо!»

Заявка сохраняется в `localStorage` (`anna-quiz-lead`) и выводится в консоль браузера. Подключите CRM / Telegram / Google Sheets в обработчике `submit` в `src/main.js`.
