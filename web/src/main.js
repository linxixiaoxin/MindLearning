import { createApp } from 'vue'
import App from './App.vue'
import { getSupabaseClient } from './lib/auth.js'
import './app-bundle.css'
import './components/scene-entry-hub.css'

if (typeof window !== 'undefined') {
  window.__RED_BOOK_INITIAL_SEARCH__ = window.location.search
}

getSupabaseClient()
createApp(App).mount('#app')
