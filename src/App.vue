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
import { auth } from '@/main'; // Firebase-Initialisierung

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
    checkAuthStatus() {
  auth.onAuthStateChanged(user => {
    this.isLoggedIn = !!user;
    if (!this.isLoggedIn && this.$route.path !== '/login' && this.$route.path !== '/register') {
      // Prüfen, ob der Benutzer nicht bereits auf der /login-Seite ist
      // Bevor wir zur /login-Seite weiterleiten
      this.$router.push('/login').catch(() => {});
    }
  });
}


  }
};
</script>
