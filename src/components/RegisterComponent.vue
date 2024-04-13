<template>
  <!-- Hauptvorlage für die Registrierungsseite -->
  <v-content class="d-flex justify-center ma-0" style="height: 100vh;">
    <div class="d-flex justify-center">
      <img style="width: 500px; height: 300px; object-fit: cover; margin-right: 2%;" src='@/assets/WeeklyStudyTitle.gif'/>
    </div>
    <!-- Zentrierter Inhalt -->
    <div class="d-flex justify-center">
      <!-- Kartencontainer für das Registrierungsformular -->
      <v-card class="" style="min-width: 300px; margin: none;">
        <!-- Kartenüberschrift für das Registrierungsformular -->
        <v-card-title class="d-flex align-center justify-center" style="background-color: #448AFF; color: white"><h1>Register</h1></v-card-title>
        <!-- Registrierungsformular -->
        <v-form @submit.prevent="register">
          <!-- Eingabefelder für Vorname, Nachname, E-Mail, Passwort und Passwortbestätigung -->
          <v-text-field class="ma-2" v-model="firstName" label="First Name *" :error-messages="nameErrors"></v-text-field>
          <v-text-field class="ma-2" v-model="lastName" label="Last Name *" :error-messages="nameErrors"></v-text-field>
          <v-text-field class="ma-2" v-model="email" label="Email *" type="email" :error-messages="emailErrors"></v-text-field>
          <v-text-field class="ma-2" v-model="password" label="Password *" type="password"></v-text-field>
          <v-text-field class="ma-2" v-model="confirmPassword" label="Confirm Password *" type="password" :error-messages="confirmPasswordErrors"></v-text-field>
          <!-- Schaltflächen zum Registrieren und Zurückkehren -->
          <v-card flat class="d-flex justify-space-between">
            <v-btn class="ma-2" type="submit" color="primary">Registrieren</v-btn>
            <v-btn class="ma-2" @click="backButton" color="secondary" inline>Zurück</v-btn>
          </v-card>
        </v-form>
      </v-card>
    </div>
  </v-content>
</template>

<script>
import { auth, db } from '@/main'; // Import der Firebase-Authentifizierungs- und Firestore-Datenbankmodule

export default {
  data() {
    return {
      // Daten für die Registrierungsformularfelder und Fehlermeldungen
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      emailErrors: [],
      confirmPasswordErrors: [],
      nameErrors: [] // Fehlermeldungen für Vorname und Nachname
    };
  },
  methods: {
    async register() {
      // Registrierungsmethode
      this.validateName();
      this.validateEmail();
      this.validatePasswords();

      // Überprüfung auf Validierungsfehler
      if (this.emailErrors.length === 0 && this.confirmPasswordErrors.length === 0 && this.nameErrors.length === 0) {
        try {
          // Benutzer in Firebase Auth erstellen
          const userCredential = await auth.createUserWithEmailAndPassword(this.email, this.password);
          // Benutzerdetails zur Firestore-Sammlung 'user' hinzufügen
          await db.collection('user').doc(userCredential.user.uid).set({
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email
          });
          // Neue Firestore-Datenbank für diesen Benutzer erstellen
          await this.createUserDataBase(userCredential.user.uid);
          // Weiterleitung zur Login-Seite
          this.$router.push('/');
        } catch (error) {
          console.error(error);
          // Fehlerbehandlung bei der Registrierung
        }
      }
    },
    validateName() {
      // Validierung von Vorname und Nachname
      const nameRegex = /[a-zA-Z]+/;
      this.nameErrors = [];
      if (!this.firstName.match(nameRegex)) {
        this.nameErrors.push('First Name must contain at least one letter.');
      }
      if (!this.lastName.match(nameRegex)) {
        this.nameErrors.push('Last Name must contain at least one letter.');
      }
    },
    validateEmail() {
      // Validierung der E-Mail-Adresse
      this.emailErrors = [];
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.email.match(emailRegex)) {
        this.emailErrors.push('Invalid email format.');
      }
    },
    validatePasswords() {
      // Validierung der Passwörter
      this.confirmPasswordErrors = [];
      if (this.password !== this.confirmPassword) {
        this.confirmPasswordErrors.push('Passwords do not match.');
      }
    },
    async createUserDataBase(userId) {
      // Neue Firestore-Datenbank für diesen Benutzer erstellen
      // Hier können Datenstrukturen in der Datenbank erstellt werden
      await db.collection('userData').doc(userId).set({
        // Weitere Benutzerdaten können hier hinzugefügt werden
      });
    },
    backButton() {
      // Zurück zur Login-Seite
      this.$router.push({ name: 'login' });
    },
  }
};
</script>
