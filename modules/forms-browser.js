/**
 * Forms Module - Browser Compatible Version
 * Обработка форм для старых браузеров (без ES6 imports)
 */

(function () {
  'use strict';

  class PortfolioForms {
    constructor() {
      this.forms = [];
      this.isInitialized = false;
    }

    async init() {
      if (this.isInitialized) return;

      try {
        console.log('📝 Initializing Portfolio Forms...');

        // Инициализируем контактную форму
        this.initContactForm();

        this.isInitialized = true;
        console.log('✅ Portfolio Forms initialized');

        // Уведомляем о загрузке модуля
        if (typeof window.moduleLoadProgress === 'function') {
          window.moduleLoadProgress('forms');
        }
      } catch (error) {
        console.error('❌ Forms initialization error:', error);
      }
    }

    initContactForm() {
      const contactForm = document.getElementById('contact-form');
      if (!contactForm) {
        console.warn('⚠️ Contact form not found');
        return;
      }

      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit(contactForm);
      });

      // Валидация в реальном времени
      const inputs = contactForm.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        input.addEventListener('blur', () => {
          this.validateField(input);
        });

        input.addEventListener('input', () => {
          if (input.classList.contains('error')) {
            this.validateField(input);
          }
        });
      });
    }

    validateField(field) {
      const value = field.value.trim();
      let isValid = true;
      let errorMessage = '';

      // Убираем предыдущие ошибки
      field.classList.remove('error');
      const existingError = field.parentElement.querySelector('.error-message');
      if (existingError) {
        existingError.remove();
      }

      // Валидация по типу поля
      if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
      } else if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid email address';
        }
      }

      // Показываем ошибку
      if (!isValid) {
        field.classList.add('error');
        const errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        errorElement.textContent = errorMessage;
        field.parentElement.appendChild(errorElement);
      }

      return isValid;
    }

    async handleFormSubmit(form) {
      // Валидация всех полей
      const inputs = form.querySelectorAll('input[required], textarea[required]');
      let isFormValid = true;

      inputs.forEach(input => {
        if (!this.validateField(input)) {
          isFormValid = false;
        }
      });

      if (!isFormValid) {
        this.showMessage('Please fill in all required fields correctly', 'error');
        return;
      }

      // Получаем данные формы
      const formData = new FormData(form);
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
      };

      // Показываем индикатор загрузки
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';

      try {
        // Пробуем отправить через EmailJS
        if (window.emailjs && window.EMAILJS_PUBLIC_KEY) {
          await this.sendViaEmailJS(form, data);
        }
        // Пробуем отправить через Formspree
        else if (window.FORMSPREE_ID) {
          await this.sendViaFormspree(form, data);
        }
        // Fallback: mailto
        else {
          this.sendViaMailto(data);
        }
      } catch (error) {
        console.error('Form submission error:', error);
        this.showMessage('Failed to send message. Please try again later.', 'error');
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    }

    async sendViaEmailJS(form, data) {
      const serviceId = form.getAttribute('data-service-id') || 'service_contact';
      const templateId = form.getAttribute('data-template-id') || 'template_contact';
      const publicKey = window.EMAILJS_PUBLIC_KEY;

      if (!publicKey) {
        throw new Error('EmailJS public key not configured');
      }

      // Инициализируем EmailJS
      if (!window.emailjs.init) {
        window.emailjs.init(publicKey);
      }

      const templateParams = {
        from_name: data.name,
        from_email: data.email,
        subject: data.subject,
        message: data.message
      };

      await window.emailjs.send(serviceId, templateId, templateParams);

      this.showMessage('Message sent successfully!', 'success');
      form.reset();
    }

    async sendViaFormspree(form, data) {
      const formId = window.FORMSPREE_ID;
      const url = `https://formspree.io/f/${formId}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Form submission failed');
      }

      this.showMessage('Message sent successfully!', 'success');
      form.reset();
    }

    sendViaMailto(data) {
      const subject = encodeURIComponent(data.subject || 'Contact from Portfolio');
      const body = encodeURIComponent(
        `Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`
      );
      const mailtoLink = `mailto:magic4jellyfish@gmail.com?subject=${subject}&body=${body}`;

      window.location.href = mailtoLink;
      this.showMessage('Opening email client...', 'info');
    }

    showMessage(message, type = 'info') {
      // Удаляем предыдущее сообщение, если есть
      const existingMessage = document.querySelector('.form-message');
      if (existingMessage) {
        existingMessage.remove();
      }

      // Создаем новое сообщение
      const messageElement = document.createElement('div');
      messageElement.className = `form-message form-message-${type}`;
      messageElement.textContent = message;

      // Добавляем стили, если их еще нет
      if (!document.getElementById('form-message-styles')) {
        const styles = document.createElement('style');
        styles.id = 'form-message-styles';
        styles.textContent = `
          .form-message {
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 4px;
            animation: slideDown 0.3s ease;
          }
          .form-message-success {
            background: #4caf50;
            color: white;
          }
          .form-message-error {
            background: #f44336;
            color: white;
          }
          .form-message-info {
            background: #2196f3;
            color: white;
          }
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `;
        document.head.appendChild(styles);
      }

      // Вставляем сообщение перед формой
      const form = document.getElementById('contact-form');
      if (form) {
        form.parentElement.insertBefore(messageElement, form);
      } else {
        document.body.appendChild(messageElement);
      }

      // Автоматически удаляем сообщение через 5 секунд
      if (type === 'success' || type === 'info') {
        setTimeout(() => {
          messageElement.style.animation = 'slideUp 0.3s ease';
          setTimeout(() => {
            if (messageElement.parentElement) {
              messageElement.parentElement.removeChild(messageElement);
            }
          }, 300);
        }, 5000);
      }
    }
  }

  // Экспортируем класс в глобальную область
  window.PortfolioForms = PortfolioForms;
})();
