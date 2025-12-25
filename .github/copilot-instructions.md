# GitHub Copilot Instructions

## Project Architecture Overview

This workspace contains multiple project types with distinct patterns:

### Main Project: Elizaveta Portfolio (`elizaveta-portfolio/`)

- **Architecture**: Modular vanilla JavaScript with ES6 classes
- **Structure**: Core module system with specialized handlers (animations, performance, gallery, forms)
- **Performance Focus**: Heavy emphasis on optimization, lazy loading, and Core Web Vitals
- **Testing**: Playwright for comprehensive cross-browser testing

### Key Patterns & Conventions

#### Modular JavaScript Architecture

- Each module exports a class with consistent patterns:
  ```javascript
  export class ModuleName {
    constructor() {
      this.initialized = false
      this.init()
    }

    init() {
      if (this.initialized) return
      // Setup logic
      this.initialized = true
      console.log('Module initialized')
    }
  }
  ```
- Use `modules/` directory for specialized functionality
- Main script (`script-enhanced.js`) orchestrates module interactions

#### Performance-First Development

- **Critical CSS**: Inline above-the-fold styles in `<head>`
- **Resource Preloading**: Use `preload` and `preconnect` strategically
- **Image Optimization**: Responsive images with `srcset` and lazy loading
- **Monitoring**: Built-in performance tracking via `modules/performance.js`
- **Bundle Analysis**: Use `npm run analyze` for webpack bundle inspection

#### Testing Strategy

- **Playwright Configuration**: Multi-browser testing with retry logic
- **Test Structure**: Located in `./tests/` with comprehensive reporting
- **Performance Testing**: Lighthouse integration via npm scripts
- **Base URL**: Tests expect `http://127.0.0.1:8000` (configure accordingly)

#### Development Workflow

**Starting Development:**

```bash
cd elizaveta-portfolio
npm run dev  # Live server with file watching
```

**Production Build:**

```bash
npm run build  # Minifies CSS/JS to dist/
```

**Testing:**

```bash
npm test        # Playwright tests
npm run test:ui # Interactive test UI
```

#### Code Quality Standards

- **ES Modules**: Use `import/export` syntax exclusively
- **Event Handling**: Centralized in respective modules with proper cleanup
- **Error Handling**: Console logging with emoji prefixes (⚡, ❌, ✅)
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Browser Support**: Modern browsers with graceful fallbacks

#### Project-Specific Conventions

- **Animation**: GSAP-based with performance monitoring
- **Media Handling**: Adaptive images with multiple breakpoints
- **Form Validation**: Custom validation in `modules/forms.js`
- **Gallery System**: Filter-based portfolio with category management
- **Theme System**: CSS custom properties with light/dark switching

### File Organization Patterns

```
elizaveta-portfolio/
├── modules/          # Feature modules (core.js, animations.js, etc.)
├── assets/images/    # Responsive image sets with naming convention
├── config/          # External library configurations
├── css/            # Modular stylesheets
└── tests/          # Playwright test suites
```

#### External Dependencies Management

- **CDN Libraries**: Configured via `config/libraries.js`
- **Performance Libraries**: GSAP, AOS, Swiper, Three.js, Particles.js
- **Loading Strategy**: Dynamic imports with fallback handling

### Multi-Language Support

- Russian documentation and comments for local development
- English metadata and public-facing content
- Consistent emoji-based logging across all modules

## Development Guidelines

### When Working on Portfolio Features

1. Add new functionality as modules in `modules/` directory
2. Follow the class-based pattern with initialization guards
3. Add performance tracking for resource-heavy features
4. Include Playwright tests for user interactions
5. Update responsive image sets when adding media

### When Adding External Libraries

1. Configure loading in `config/libraries.js`
2. Add error handling for CDN failures
3. Consider bundle size impact (use `npm run analyze`)
4. Test across different connection speeds

### Performance Considerations

- Always measure before/after with Lighthouse
- Use `IntersectionObserver` for scroll-based animations
- Implement proper image lazy loading with fallbacks
- Monitor memory usage for Three.js/WebGL features
