import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import VueTextareaAutosize from 'vue-textarea-autosize'
import firebase from 'firebase/compat/app'; // Hier wird nur das 'app' Modul importiert, das für die Initialisierung erforderlich ist
import 'firebase/compat/firestore'; // Import des Firestore-Moduls
import router from './router'
import 'firebase/compat/auth';

Vue.use(VueTextareaAutosize);
Vue.config.productionTip = false;

firebase.initializeApp({
  apiKey: "AIzaSyAYtDVGoLhZNZJDBtye2wBJwfEikRhGWc0",
  authDomain: "weeklystudy-51192.firebaseapp.com",
  projectId: "weeklystudy-51192",
  storageBucket: "weeklystudy-51192.appspot.com",
  messagingSenderId: "495934638654",
  appId: "1:495934638654:web:84d280eda332a992d0df6f"
})

export const db = firebase.firestore()
export const auth = firebase.auth();
new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app')
