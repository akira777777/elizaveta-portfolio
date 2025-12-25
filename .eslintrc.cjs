module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'no-undef': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-spacing': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': 'error',
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
    'comma-dangle': ['error', 'never'],
    quotes: ['error', 'single'],
    semi: ['error', 'always']
  },
  globals: {
    gsap: 'readonly',
    AOS: 'readonly',
    Swiper: 'readonly',
    particlesJS: 'readonly',
    Typed: 'readonly',
    LazyLoad: 'readonly',
    Chart: 'readonly',
    ProgressBar: 'readonly',
    CountUp: 'readonly',
    Rellax: 'readonly',
    sal: 'readonly',
    lightbox: 'readonly',
    Isotope: 'readonly',
    Masonry: 'readonly',
    imagesLoaded: 'readonly',
    moment: 'readonly',
    _: 'readonly',
    axios: 'readonly',
    emailjs: 'readonly',
    Cookies: 'readonly',
    validator: 'readonly',
    Swal: 'readonly',
    Toastify: 'readonly',
    tippy: 'readonly',
    VanillaTilt: 'readonly',
    Pace: 'readonly',
    $: 'readonly',
    jQuery: 'readonly'
  }
};
