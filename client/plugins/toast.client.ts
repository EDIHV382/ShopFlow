// Plugin: toast — client-side only notification system
import Toast, { type PluginOptions, POSITION } from 'vue-toastification';
import 'vue-toastification/dist/index.css';

export default defineNuxtPlugin((nuxtApp) => {
  const options: PluginOptions = {
    position: POSITION.BOTTOM_RIGHT,
    timeout: 3500,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: 'button',
    icon: true,
    rtl: false,
    transition: 'Vue-Toastification__fade',
    maxToasts: 5,
    newestOnTop: true,
  };
  nuxtApp.vueApp.use(Toast, options);
});
