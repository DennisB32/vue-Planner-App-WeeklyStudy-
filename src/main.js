import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import VueTextareaAutosize from 'vue-textarea-autosize'
import firebase from 'firebase/compat/app'; 
import 'firebase/compat/firestore';
import router from './router'
import 'firebase/compat/auth';

Vue.use(VueTextareaAutosize);
Vue.config.productionTip = false;

// Firebase initialisieren mit den Projektinformationen
firebase.initializeApp({
  apiKey: "AIzaSyAYtDVGoLhZNZJDBtye2wBJwfEikRhGWc0",
  authDomain: "weeklystudy-51192.firebaseapp.com",
  projectId: "weeklystudy-51192",
  storageBucket: "weeklystudy-51192.appspot.com",
  messagingSenderId: "495934638654",
  appId: "1:495934638654:web:84d280eda332a992d0df6f"
})

// Exportiere das Firestore-Modul für die Verwendung in anderen Dateien
export const db = firebase.firestore()

// Exportiere das Authentifizierungsmodul für die Verwendung in anderen Dateien
export const auth = firebase.auth();

// Erstelle eine neue Vue-Instanz und binde sie an den DOM-Element '#app'
new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app')
