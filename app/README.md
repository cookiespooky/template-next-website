
# Course Shop Platform

Производственная платформа для продажи онлайн-курсов с интеграцией YooKassa для приема платежей.

## 🚀 Возможности

- **Каталог курсов** - Просмотр и поиск курсов по категориям
- **Система пользователей** - Регистрация, авторизация, профили
- **Корзина и заказы** - Добавление курсов в корзину и оформление заказов
- **Интеграция YooKassa** - Прием платежей через YooKassa
- **Записи на курсы** - Автоматическое зачисление после оплаты
- **Отзывы и рейтинги** - Система отзывов для курсов
- **Административная панель** - Управление курсами, пользователями, заказами
- **Адаптивный дизайн** - Работает на всех устройствах

## 🛠 Технологии

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **База данных**: PostgreSQL с поддержкой векторных полей
- **Аутентификация**: NextAuth.js
- **Платежи**: YooKassa API
- **UI компоненты**: Radix UI, Framer Motion
- **Стилизация**: Tailwind CSS, shadcn/ui

## 📋 Требования

- Node.js 18+
- PostgreSQL 12+
- Yarn или npm

## 🔧 Установка и настройка

### 1. Клонирование и установка зависимостей

```bash
cd course-shop-platform/app
yarn install
```

### 2. Настройка переменных окружения

Скопируйте файл `.env.example` в `.env` и заполните необходимые переменные:

```bash
cp .env.example .env
```

**Обязательные переменные для настройки:**

```env
# Database - уже настроена автоматически
DATABASE_URL="postgresql://role_12c5572c60:Dna1CkyE8o8u2bYiivB1gD8IepTETUvN@db-12c5572c60.db001.hosteddb.reai.io:5432/12c5572c60"

# NextAuth.js - замените на свои значения
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here-min-32-chars"

# YooKassa - ВАЖНО: замените на ваши реальные данные
YOOKASSA_SHOP_ID="YOUR_ACTUAL_SHOP_ID"
YOOKASSA_SECRET_KEY="YOUR_ACTUAL_SECRET_KEY"
```

### 3. Настройка базы данных

```bash
# Применить схему к базе данных
npx prisma db push

# Заполнить базу тестовыми данными
npx tsx scripts/seed.ts
```

### 4. Запуск приложения

```bash
# Режим разработки
yarn dev

# Сборка для продакшена
yarn build
yarn start
```

Приложение будет доступно по адресу: http://localhost:3000

## 🔑 Тестовые учетные записи

После выполнения seed скрипта будут созданы следующие аккаунты:

- **Администратор**: admin@platform-courses.ru / password123
- **Тестовый пользователь**: test@example.com / password123
- **Студент**: anna.petrova@example.com / password123

## 💳 Настройка YooKassa

### Получение учетных данных

1. Зарегистрируйтесь в [YooKassa](https://yookassa.ru/)
2. Создайте магазин в личном кабинете
3. Получите `shopId` и `secretKey` в разделе "Настройки" → "Данные для API"

### Настройка webhook'ов

В личном кабинете YooKassa настройте webhook для получения уведомлений о платежах:

- **URL**: `https://your-domain.com/api/payments/webhook`
- **События**: `payment.succeeded`, `payment.canceled`
- **HTTP метод**: POST

### Тестовые платежи

Для тестирования используйте тестовые карты YooKassa:
- **Успешная оплата**: 5555 5555 5555 4477
- **Отклоненная оплата**: 5555 5555 5555 4444

## 📁 Структура проекта

```
app/
├── app/                    # Next.js App Router
│   ├── api/               # API маршруты
│   ├── auth/              # Страницы аутентификации
│   ├── courses/           # Страницы курсов
│   ├── contacts/          # Страница контактов
│   ├── layout.tsx         # Основной layout
│   └── page.tsx           # Главная страница
├── components/            # React компоненты
│   ├── ui/               # UI компоненты (shadcn/ui)
│   ├── auth-provider.tsx  # Провайдер аутентификации
│   ├── cart-provider.tsx  # Провайдер корзины
│   ├── course-card.tsx    # Карточка курса
│   ├── header.tsx         # Шапка сайта
│   └── footer.tsx         # Подвал сайта
├── lib/                   # Утилиты и конфигурация
│   ├── auth.ts           # Настройка NextAuth
│   ├── db.ts             # Подключение к БД
│   ├── types.ts          # TypeScript типы
│   ├── utils.ts          # Вспомогательные функции
│   └── yookassa.ts       # Интеграция YooKassa
├── prisma/               # Схема базы данных
│   └── schema.prisma     # Prisma схема
└── scripts/              # Скрипты
    └── seed.ts           # Заполнение БД тестовыми данными
```

## 🔒 Безопасность

### Важные моменты для продакшена:

1. **Переменные окружения**: Никогда не коммитьте реальные API ключи
2. **NEXTAUTH_SECRET**: Используйте криптографически стойкий ключ (32+ символа)
3. **Webhook подпись**: Реализуйте проверку подписи webhook'ов YooKassa
4. **HTTPS**: Обязательно используйте HTTPS в продакшене
5. **Валидация**: Всегда валидируйте входящие данные

### Настройка webhook подписи

В файле `lib/yookassa.ts` реализуйте проверку подписи:

```typescript
verifyWebhookSignature(body: string, signature: string): boolean {
  // Реализуйте проверку подписи согласно документации YooKassa
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}
```

## 📊 База данных

Схема включает следующие основные таблицы:

- **users** - Пользователи системы
- **courses** - Курсы (с поддержкой векторных полей для поиска)
- **categories** - Категории курсов
- **instructors** - Преподаватели
- **orders** - Заказы
- **payments** - Платежи (интеграция с YooKassa)
- **enrollments** - Записи на курсы
- **reviews** - Отзывы о курсах
- **contact_forms** - Обращения пользователей

## 🚀 Деплой

### Vercel (рекомендуется)

1. Подключите репозиторий к Vercel
2. Настройте переменные окружения в панели Vercel
3. Деплой произойдет автоматически

### Docker

```bash
# Сборка образа
docker build -t course-shop-platform .

# Запуск контейнера
docker run -p 3000:3000 --env-file .env course-shop-platform
```

## 🤝 Поддержка

Если у вас возникли вопросы или проблемы:

1. Проверьте логи приложения
2. Убедитесь, что все переменные окружения настроены правильно
3. Проверьте подключение к базе данных
4. Для проблем с платежами - проверьте настройки YooKassa

## 📝 Лицензия

Этот проект создан для демонстрационных целей. Используйте на свой страх и риск.

---

**Важно**: Перед использованием в продакшене обязательно:
- Замените все тестовые ключи на реальные
- Настройте proper SSL/TLS
- Реализуйте проверку webhook подписей
- Проведите security audit
- Настройте мониторинг и логирование
