import { createApp } from 'vue'
import App from './App.vue'
import './css/style.styl'
import 'remixicon/fonts/remixicon.css'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'



// import './demos/ipc'
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

const app = createApp(App)


const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)

app.mount('#app')
    .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
