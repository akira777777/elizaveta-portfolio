module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'variants', 'responsive', 'screen']
      }
    ],
    'declaration-block-trailing-semicolon': null,
    'no-descending-specificity': null,
    'length-zero-no-unit': true,
    'declaration-empty-line-before': null,
    'custom-property-empty-line-before': null,
    'comment-empty-line-before': null,
    'rule-empty-line-before': null,
    'block-no-empty': true,
    'color-no-invalid-hex': true,
    'font-family-no-duplicate-names': true,
    'function-calc-no-unspaced-operator': true,
    'keyframe-declaration-no-important': true,
    'property-no-unknown': [
      true,
      {
        // Разрешаем современные CSS свойства и HTML атрибуты
        ignoreProperties: [
          'mask-image',
          'mask-position',
          'mask-repeat',
          'backdrop-filter',
          'aspect-ratio',
          'inset',
          'inset-inline-start',
          'inset-inline-end',
          'margin-inline-start',
          'margin-inline-end',
          'padding-inline-start',
          'padding-inline-end',
          'padding-inline',
          'padding-block',
          'border-inline-start',
          'border-inline-end',
          'border-start-start-radius',
          'border-end-start-radius',
          'loading', // HTML атрибут для изображений
          'decoding' // HTML атрибут для изображений
        ]
      }
    ],
    'selector-pseudo-class-no-unknown': true,
    'selector-pseudo-element-no-unknown': true,
    'selector-type-no-unknown': true,
    'unit-no-unknown': true,
    // Отключаем проверки совместимости для современных браузеров
    'property-no-vendor-prefix': null,
    'value-no-vendor-prefix': null,

    // Разрешаем любые имена keyframes (не только kebab-case)
    'keyframes-name-pattern': null,

    // Убираем deprecated правило
    'string-quotes': null
  }
}
