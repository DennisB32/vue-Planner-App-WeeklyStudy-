<template>
  <!-- Definiere ein Dialogfenster -->
  <v-dialog v-model="dialogVisible" fullscreen hide-overlay transition="dialog-bottom-transition">
    <v-card>
      <!-- Definiere den Titel des Dialogfensters -->
      <v-card-title class="headline">Account bearbeiten</v-card-title>
      <v-card-text>
        <!-- Textfeld für den Vornamen -->
        <v-text-field v-model="editedUser.firstName" label="First Name"></v-text-field>
        <!-- Textfeld für den Nachnamen -->
        <v-text-field v-model="editedUser.lastName" label="Last Name"></v-text-field>
        <!-- Textfeld für die E-Mail-Adresse (deaktiviert) -->
        <v-text-field v-model="email" label="Email" disabled></v-text-field>
        <!-- Textfeld für das neue Passwort -->
        <v-text-field type="password" v-model="newPassword" label="Neues Passwort"></v-text-field>
        <!-- Textfeld zur Bestätigung des neuen Passworts mit Fehlermeldungen -->
        <v-text-field type="password" v-model="confirmPassword" label="Neues Passwort bestätigen" :error-messages="confirmPasswordErrors"></v-text-field>
      </v-card-text>
      <v-card-actions>
        <!-- Button zum Speichern der Änderungen -->
        <v-btn color="blue darken-1" text @click="saveChanges">Speichern</v-btn>
        <!-- Button zum Abbrechen -->
        <v-btn color="blue darken-1" text @click="closeAccountDialog">Abbrechen</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { db, auth } from '@/main';
export default {
  props: {
    user: Object,
    accountDialog: Boolean
  },
  data() {
    return {
      // Initialisiere Datenfelder
      email: '',
      password: '',
      newPassword: '',
      confirmPassword: '',
      confirmPasswordErrors: [],
      editedUser: {
        firstName: '',
        lastName: ''
      },
      dialogVisible: false
    };
  },
  created() {
    // Beim Erstellen der Komponente Daten des aktuellen Benutzers abrufen
    this.getUserData();
  },
  watch: {
    // Beobachte die Eigenschaft accountDialog
    accountDialog(newVal) {
      // Aktualisiere dialogVisible, wenn sich accountDialog ändert
      this.dialogVisible = newVal;
    }
  },
  methods: {
    // Methode zum Abrufen der Benutzerdaten
    async getUserData() {
      // Aktuellen Benutzer abrufen
      const currentUser = auth.currentUser;
      if (currentUser) {
        // E-Mail-Adresse setzen
        this.email = currentUser.email;
        // Benutzerdokument aus der Datenbank abrufen
        const userDoc = await db.collection('user').doc(currentUser.uid).get();
        if (userDoc.exists) {
          // Benutzerdaten setzen, falls vorhanden
          const userData = userDoc.data();
          this.editedUser.firstName = userData.firstName;
          this.editedUser.lastName = userData.lastName;
        }
      }
    },
    // Methode zur Validierung der Passwörter
    validatePasswords() {
      // Fehlermeldungen zurücksetzen
      this.confirmPasswordErrors = [];
      // Überprüfe, ob die Passwörter übereinstimmen
      if (this.newPassword !== this.confirmPassword) {
        this.confirmPasswordErrors.push('Passwords do not match.');
      }
    },
    // Methode zum Speichern der Änderungen
    saveChanges() {
      // Passwörter validieren
      this.validatePasswords();

      // Benutzerdaten speichern
      this.saveUserData(this.editedUser.firstName, this.editedUser.lastName, this.newPassword);
    },
    // Methode zum Speichern der Benutzerdaten
    saveUserData(firstName, lastName, newPassword) {
      // Aktuellen Benutzer abrufen
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Benutzerdaten in der Datenbank aktualisieren
        db.collection('user').doc(currentUser.uid).update({
          firstName: firstName,
          lastName: lastName
        })
        .then(() => {
          console.log('Vor- und Nachname erfolgreich aktualisiert.');
          // Falls ein neues Passwort angegeben wurde, aktualisiere das Passwort
          if (newPassword) {
            currentUser.updatePassword(newPassword)
              .then(() => {
                console.log('Passwort erfolgreich aktualisiert.');
                alert('Passwort Erfolgreich aktualisiert!');
                // Schließe das Dialogfenster
                this.closeAccountDialog();
              })
              .catch(error => {
                console.error('Fehler beim Aktualisieren des Passworts:', error);
                alert('Passwort wurde nicht aktualisiert! Bitte Erneut einloggen oder Passwort zu kurz (min 6 Zeichen)!');
              });
          } else {
            console.log('Passwort nicht aktualisiert.');
            // Schließe das Dialogfenster
            this.closeAccountDialog();
            window.location.reload();
          }
        })
        .catch(error => {
          console.error('Fehler beim Aktualisieren von Vor- und Nachname:', error);
        });
      }
    },
    // Methode zum Schließen des Dialogfensters
    closeAccountDialog() {
      // Emitiere das Event 'close'
      this.$emit('close');
    }
  }
};
</script>
