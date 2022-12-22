/* eslint-disable no-undef */
// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        day14Sample: resolve(__dirname, '/day-14-sample-input.html'),
        day14: resolve(__dirname, '/day-14.html'),
        day18: resolve(__dirname, '/day-18.html'),
      },
    },
  },
})
