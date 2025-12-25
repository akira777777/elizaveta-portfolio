# Настройка отправки электронных писем

## Проблема
Форма обратной связи не отправляет письма, потому что не настроен сервис отправки.

## Решение
Добавлены три способа отправки писем с автоматическим fallback:

### 1. EmailJS (Рекомендуется)
**Бесплатный сервис для отправки писем через браузер**

#### Настройка:
1. Зарегистрируйтесь на https://www.emailjs.com/
2. Создайте Email Service (Gmail, Outlook и т.д.)
3. Создайте Email Template
4. Получите Public Key, Service ID и Template ID

#### Добавьте в `index.html` в форму:
```html
<form class="form" id="contact-form"
      data-service-id="YOUR_SERVICE_ID"
      data-template-id="YOUR_TEMPLATE_ID"
      data-public-key="YOUR_PUBLIC_KEY">
```

Или добавьте в `index.html` перед закрывающим `</body>`:
```html
<script>
  window.EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
</script>
```

### 2. Formspree (Альтернатива)
**Бесплатный сервис без регистрации EmailJS**

#### Настройка:
1. Зарегистрируйтесь на https://formspree.io/
2. Создайте новую форму
3. Получите Form ID (например: `xvgkqjwn`)

#### Добавьте в форму:
```html
<form class="form" id="contact-form"
      data-formspree-id="YOUR_FORMSPREE_ID">
```

Или добавьте в `index.html`:
```html
<script>
  window.FORMSPREE_ID = 'YOUR_FORMSPREE_ID';
</script>
```

### 3. Mailto (Fallback)
**Автоматически используется, если EmailJS и Formspree не настроены**

Открывает почтовый клиент пользователя с заполненным письмом.

## Текущая конфигурация

В `index.html` форма настроена для EmailJS:
```html
<form class="form" id="contact-form"
      data-service-id="service_contact"
      data-template-id="template_contact"
      data-public-key="">
```

**⚠️ ВАЖНО:** Замените пустые значения на реальные ID и ключи!

## Быстрый старт с Formspree

1. Перейдите на https://formspree.io/
2. Нажмите "Get Started" (бесплатно)
3. Создайте новую форму
4. Скопируйте Form ID
5. Добавьте в `index.html` перед `</body>`:
```html
<script>
  window.FORMSPREE_ID = 'ваш_form_id';
</script>
```

Готово! Форма будет отправлять письма на ваш email.

## Проверка работы

1. Откройте сайт
2. Заполните форму контактов
3. Отправьте сообщение
4. Проверьте консоль браузера (F12) на наличие ошибок
5. Проверьте ваш email (или Formspree dashboard)

## Отладка

Если письма не приходят:

1. **Проверьте консоль браузера** (F12 → Console)
   - Должны быть сообщения об инициализации EmailJS/Formspree
   - Проверьте наличие ошибок

2. **Проверьте Network tab** (F12 → Network)
   - При отправке должен быть запрос к EmailJS или Formspree
   - Проверьте статус ответа (должен быть 200)

3. **Проверьте настройки:**
   - Правильность Service ID, Template ID, Public Key (для EmailJS)
   - Правильность Form ID (для Formspree)
   - Email получателя в настройках сервиса

4. **Проверьте спам-папку** - письма могут попадать туда

## Примеры конфигурации

### EmailJS
```html
<!-- В index.html -->
<script>
  window.EMAILJS_PUBLIC_KEY = 'user_abc123xyz';
</script>

<!-- В форме -->
<form data-service-id="service_gmail"
      data-template-id="template_contact">
```

### Formspree
```html
<!-- В index.html -->
<script>
  window.FORMSPREE_ID = 'xvgkqjwn';
</script>
```

## Дополнительная информация

- EmailJS документация: https://www.emailjs.com/docs/
- Formspree документация: https://help.formspree.io/
- Лимиты:
  - EmailJS: 200 писем/месяц (бесплатно)
  - Formspree: 50 писем/месяц (бесплатно)
