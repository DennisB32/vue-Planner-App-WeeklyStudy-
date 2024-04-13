<template>

  <!-- Komponente für die Anordnung und Gestaltung des Login-Bereichs -->
  <v-content class="d-flex justify-center ma-0" style="height: 100vh;">
    <div class="d-flex justify-center">
    <img style="width: 500px; height: 300px; object-fit: cover; margin-right: 2%;" src='@/assets/WeeklyStudyTitle.gif'/>
  </div>
    <!-- Karte zur Darstellung des Login-Formulars -->
    <div class="d-flex justify-center">
    <v-card class="" style="min-width: 300px; margin: none;">
      <!-- Titel der Karte -->
      <v-card-title class="d-flex align-center justify-center" style="background-color: #448AFF; color: white"><h1>Willkommen</h1></v-card-title>
      <!-- Formular für den Login -->
      <v-form @submit.prevent="login">
        <!-- Eingabefeld für die Email -->
        <v-text-field class="ma-2" v-model="email" label="Email" type="email"></v-text-field>
        <!-- Eingabefeld für das Passwort -->
        <v-text-field class="ma-2" v-model="password" label="Password" type="password"></v-text-field>
        <!-- Fehlermeldung -->
        <div v-if="errorMessage" class="ma-2 text-center" style="color: red;">{{ errorMessage }}</div>
        <!-- Button zum Einreichen des Formulars -->
        <v-card flat class="d-flex justify-center">
          <v-btn class="ma-2" type="submit" color="primary">Login</v-btn>
        </v-card>
      </v-form>
      <!-- Trennlinie -->
      <v-divider></v-divider>
      <!-- Link zur Registrierungsseite -->
      <div class="d-flex justify-space-between" style="max-width: 230px;">
        <router-link to="/register">
          <v-btn class="ma-2" small color="blue" text >Register</v-btn>
        </router-link>
        <v-dialog v-model="dialog" persistent max-width="400px">
          <template v-slot:activator="{ on }">
            <v-btn class="ma-2" small icon link v-on="on">Passwort vergessen</v-btn>
          </template>
          <v-card>
            <v-card-title>Passwort vergessen</v-card-title>
            <v-card-text>
              <v-text-field v-model="forgotEmail" label="Email" type="email"></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="sendResetEmail">Absenden</v-btn>
              <v-btn @click="dialog = false">Abbrechen</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </v-card>
  </div>
  </v-content>
</template>

<script>
import { auth } from '@/main';

export default {
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '', // Zustand für Fehlermeldung
      dialog: false,
      forgotEmail: ''
    };
  },
  methods: {
    async login() {
      try {
        // Authentifizierung des Benutzers mit der angegebenen Email und Passwort
        await auth.signInWithEmailAndPassword(this.email, this.password);
        // Weiterleitung zur Hauptseite
        this.$router.push('/');
      } catch (error) {
        console.error(error);
        // Setzen der Fehlermeldung
        this.errorMessage = 'Ungültige Email oder Passwort. Bitte versuchen Sie es erneut.';
      }
    },
    async sendResetEmail() {
  try {
    // Überprüfen, ob die E-Mail-Adresse in der Datenbank vorhanden ist
    const userExists = await auth.fetchSignInMethodsForEmail(this.forgotEmail);

    if (userExists && userExists.length > 0) {
      // E-Mail zum Zurücksetzen des Passworts senden
      await auth.sendPasswordResetEmail(this.forgotEmail);
      // Erfolgsmeldung anzeigen oder Benutzer zu einer Erfolgsseite weiterleiten
      alert('Eine E-Mail zum Zurücksetzen Ihres Passworts wurde gesendet.');
      this.dialog = false; // Dialog schließen
    } else {
      // Fehlermeldung anzeigen, wenn die E-Mail-Adresse nicht gefunden wurde
      alert('Die angegebene E-Mail-Adresse ist nicht registriert.');
      
    }
  } catch (error) {
    console.error(error);
    // Fehlermeldung anzeigen
    alert('Fehler beim Senden der E-Mail zum Zurücksetzen des Passworts.');
  }
}

  }
};
</script>
