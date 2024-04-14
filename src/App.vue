<template>
  <v-app>
    <div id="app">
      <router-view style="margin-left: 200px;" />
      <Navbar v-if="isLoggedIn" />
    </div>
  </v-app>
</template>

<script>
import Navbar from '@/components/NavbarComponent.vue';
import { auth } from '@/main'; 

export default {
  name: 'App',
  components: {
    Navbar
  },
  data() {
    return {
      isLoggedIn: false
    };
  },
  created() {
    this.checkAuthStatus();
  },
  methods: {
    // Methode zum Überprüfen des Authentifizierungsstatus des Benutzers
    checkAuthStatus() {
      // Überwacht Änderungen im Authentifizierungsstatus
      auth.onAuthStateChanged(user => {
        // Setzt die Variable 'isLoggedIn' auf true, wenn ein Benutzer angemeldet ist, andernfalls auf false
        this.isLoggedIn = !!user;
        // Überprüft, ob der Benutzer nicht angemeldet ist und nicht auf der Login- oder Registrierungsseite ist
        if (!this.isLoggedIn && this.$route.path !== '/login' && this.$route.path !== '/register') {
          // Leitet den Benutzer zur Login-Seite weiter, falls er nicht angemeldet ist und sich nicht bereits auf der Login-Seite befindet
          this.$router.push('/login').catch(() => {});
        }
      });
    }
  }
};
</script>
