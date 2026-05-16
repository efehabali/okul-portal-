export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1E3A8A',
          accent: '#2563EB'
        }
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
}
