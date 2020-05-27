module.exports = {
  purge: {
    enabled: process.env.NODE_ENV === 'production' ? true : false,
    content: [
      './**/*.html',
      './**/*.js'
    ],
  },
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
}
