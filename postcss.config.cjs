module.exports = {
  plugins: {
    'postcss-preset-env': {
      features: {
        'custom-properties': false // Disable CSS variable processing since we handle it in criticalStyles
      }
    },
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production'
      ? {
          cssnano: {
            preset: ['default', { discardComments: { removeAll: true } }]
          }
        }
      : {})
  }
}; 