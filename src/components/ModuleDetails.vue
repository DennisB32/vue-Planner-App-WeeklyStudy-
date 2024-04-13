<template>
  <!-- Vue-App-Komponente starten -->
  <v-app>
    <!-- Haupt-Toolbar mit Modulnamen und Schaltflächen zum Erstellen von Notizen und Aufgaben -->
    <v-toolbar color="primary" dark max-height="64">
      <v-toolbar-title>{{ moduleName }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn @click="createNoteDialog" color="black" class="mr-4">Erstelle Notiz</v-btn>
      <v-btn @click="createTaskDialog" color="black">Erstelle Aufgabe</v-btn>
    </v-toolbar>

    <!-- Layout für Listen von Notizen und Aufgaben -->
    <v-layout class="d-flex justify-start">
      <!-- Liste von Notizen -->
      <v-list dense>
        <v-subheader>Notizen</v-subheader>
        <v-list-item-group color="primary" style="min-width: 900px;">
          <v-list-item v-for="note in notes" :key="note.id" @click="showNoteDialog(note)">
            <v-icon class="ma-4">mdi-file-document-edit-outline</v-icon>
            <v-list-item-content>
              <v-list-item-title><h3>{{ note.title }}</h3></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>

      <!-- Liste von Aufgaben -->
      <v-list dense>
        <v-subheader>Aufgaben</v-subheader>
        <v-list-item-group color="primary" style="min-width: 900px;">
          <v-list-item v-for="task in tasks" :key="task.id" @click.stop="showTaskDialog(task)">
            <v-icon class="ma-4">mdi-file-document-edit-outline</v-icon>
            <v-list-item-content>
              <v-list-item-title>
                <h3>{{ task.title }}</h3>
              </v-list-item-title>
              <v-list-item-subtitle>{{ formatDate(task.end) }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-layout>

    <!-- Dialog für die Bearbeitung von Notizen -->
    <v-dialog v-model="noteEditDialog" max-width="600">
      <v-card>
        <v-card-title>{{ editedNote.title }}</v-card-title>
        <v-card-text>
            <v-text-field v-model="editedNote.title" label="Notiz Titel"></v-text-field>
          <v-textarea v-model="editedNote.text" label="Notiz Text"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="saveEditedNote">Speichern</v-btn>
          <v-btn color="blue darken-1" text @click="closeNoteDialog">Abbrechen</v-btn>
          <v-btn color="blue darken-1" text @click="deleteNote">Löschen</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog für die Bearbeitung von Aufgaben -->
    <v-dialog v-model="taskEditDialog" max-width="600">
      <v-card>
        <v-card-title>{{ editedTask.title }}</v-card-title>
        <v-card-text>
            <v-text-field v-model="editedTask.title" label="Aufgaben Titel"></v-text-field>
          <v-textarea v-model="editedTask.text" label="Aufgaben Text"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="saveEditedTask">Speichern</v-btn>
          <v-btn color="blue darken-1" text @click="closeTaskDialog">Abbrechen</v-btn>
          <v-btn color="blue darken-1" text @click="deleteTask">Löschen</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog für das Erstellen von Notizen -->
    <v-dialog v-model="noteDialog" max-width="600">
      <v-card>
        <v-card-title>Notiz Erstellen</v-card-title>
        <v-card-text>
          <v-text-field v-model="editedNote.title" label="Notiz Titel"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="saveNote">Speichern</v-btn>
          <v-btn color="blue darken-1" text @click="closeNoteDialog">Abbrechen</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog für das Erstellen von Aufgaben -->
    <v-dialog v-model="taskDialog" max-width="600">
      <v-card>
        <v-card-title>Aufgabe Erstellen</v-card-title>
        <v-card-text>
          <v-text-field v-model="editedTask.title" label="Aufgaben Titel"></v-text-field>
          <h4>Bis wann?</h4>
          <v-date-picker v-model="editedTask.end" label="End Datum" scrollable full-width></v-date-picker>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="saveTask">Speichern</v-btn>
          <v-btn color="blue darken-1" text @click="closeTaskDialog">Abbrechen</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

  
<script>
// Import von Datenbank- und Authentifizierungsmodulen
import { db, auth } from '@/main';

export default {
name: 'ModuleDetails',
data() {
  return {
    // Initialisierung von Datenattributen
    moduleId: '',
    moduleName: '',
    notes: [],
    tasks: [],
    noteDialog: false,
    noteEditDialog: false,
    taskEditDialog: false,
    taskDialog: false,
    editedNote: {
      id: '',
      title: '',
      text: '',
    },
    editedTask: {
      moduleId: '',
      title: '',
      end: new Date().toISOString().substr(0, 10),
      text:'',
    },
  };
},
methods: {
  // Methode zum Abrufen von Moduldaten aus der Datenbank
  fetchModuleData(moduleId) {
    db.collection('modules').doc(moduleId).get().then(doc => {
      if (doc.exists) {
        this.moduleName = doc.data().name;
        this.fetchNotes(moduleId);
        this.fetchTasks(moduleId);
      } else {
        console.error('Modul nicht gefunden');
      }
    }).catch(error => {
      console.error('Fehler beim Abrufen der Moduldaten:', error);
    });
  },
  // Methode zum Abrufen von Notizen aus der Datenbank
  fetchNotes(moduleId) {
    const userId = auth.currentUser.uid;
    db.collection('notes').where('moduleId', '==', moduleId).where('userId', '==', userId).get().then(snapshot => {
      this.notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }).catch(error => {
      console.error('Fehler beim Abrufen von Notizen:', error);
    });
  },
  // Methode zum Abrufen von Aufgaben aus der Datenbank
  fetchTasks(moduleId) {
    const userId = auth.currentUser.uid;
    db.collection('tasks').where('moduleId', '==', moduleId).where('userId', '==', userId).get().then(snapshot => {
      this.tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }).catch(error => {
      console.error('Fehler beim Abrufen von Aufgaben:', error);
    });
  },
  // Methode zum Anzeigen des Dialogs zur Bearbeitung einer Notiz
  showNoteDialog(note) {
    this.editedNote = { ...note };
    this.noteEditDialog = true;
  },
  // Methode zum Anzeigen des Dialogs zur Bearbeitung einer Aufgabe
  showTaskDialog(task) {
    this.editedTask = { ...task };
    this.taskEditDialog = true;
  },
  // Methode zum Öffnen des Dialogs zur Erstellung einer Notiz
  createNoteDialog() {
    this.noteDialog = true;
    this.editedNote = { moduleId: String(this.moduleId), id: '', title: '', text: '' };
  },
  // Methode zum Öffnen des Dialogs zur Erstellung einer Aufgabe
  createTaskDialog() {
    this.taskDialog = true;
    this.editedTask = { moduleId: String(this.moduleId), title: '', end: new Date().toISOString().substr(0, 10) };
  },
  // Methode zum Aktualisieren des Status einer Aufgabe
  toggleTaskDisabled(task) {
    task.disabled = !task.disabled;
  },
  // Methode zum Löschen einer Notiz
  async deleteNote () {
    await db.collection('notes').doc(this.editedNote.id).delete()
    .then(() => {
      console.log('Notiz erfolgreich gelöscht');
      this.closeNoteDialog();
      window.location.reload();
    })
    .catch(error => {
      console.error('Fehler beim Löschen der Notiz:', error);
    });
  },
  // Methode zum Löschen einer Aufgabe
  async deleteTask () {
    await db.collection('tasks').doc(this.editedTask.id).delete()
    .then(() => {
      console.log('Aufgabe erfolgreich gelöscht');
      this.closeNoteDialog();
      window.location.reload();
    })
    .catch(error => {
      console.error('Fehler beim Löschen der Aufgabe:', error);
    });
  },
  // Methode zum Speichern der bearbeiteten Notiz
  saveEditedNote() {
    db.collection('notes').doc(this.editedNote.id).update({ text: this.editedNote.text, title: this.editedNote.title })
      .then(() => {
        console.log('Notiz erfolgreich aktualisiert');
        this.closeNoteDialog();
        window.location.reload();
      })
      .catch(error => {
        console.error('Fehler beim Aktualisieren der Notiz:', error);
      });
  },
  // Methode zum Speichern der bearbeiteten Aufgabe
  saveEditedTask() {
    db.collection('tasks').doc(this.editedTask.id).update({ 
      text: this.editedTask.text, 
      title: this.editedTask.title
    })
      .then(() => {
        console.log('Aufgabe erfolgreich aktualisiert');
        this.closeNoteDialog();
        window.location.reload();
      })
      .catch(error => {
        console.error('Fehler beim Aktualisieren der Aufgabe:', error);
      });
  },
  // Methode zum Speichern einer neuen Notiz
  saveNote() {
    const userId = auth.currentUser.uid;
    db.collection('notes').add({
      moduleId: this.editedNote.moduleId,
      userId: userId,
      title: this.editedNote.title,
      text: this.editedNote.text
    }).then(() => {
      console.log('Notiz erfolgreich hinzugefügt');
      this.closeNoteDialog();
      this.fetchNotes(this.moduleId); // Notizen erneut abrufen, um die Ansicht zu aktualisieren
    }).catch(error => {
      console.error('Fehler beim Hinzufügen der Notiz:', error);
    });
  },
  // Methode zum Speichern einer neuen Aufgabe
  saveTask() {
    const userId = auth.currentUser.uid;
    db.collection('tasks').add({
      moduleId: this.editedTask.moduleId,
      userId: userId,
      title: this.editedTask.title,
      end: this.editedTask.end,
    }).then(() => {
      console.log('Aufgabe erfolgreich hinzugefügt');
      this.closeTaskDialog();
      this.fetchTasks(this.moduleId); // Aufgaben erneut abrufen, um die Ansicht zu aktualisieren
    }).catch(error => {
      console.error('Fehler beim Hinzufügen der Aufgabe:', error);
    });
  },
  // Methode zum Schließen des Notizdialogs
  closeNoteDialog() {
    this.noteDialog = false;
    this.noteEditDialog = false;
  },
  // Methode zum Schließen des Aufgabendialogs
  closeTaskDialog() {
    this.taskDialog = false;
    this.taskEditDialog = false;
  },
  // Methode zum Formatieren eines Datumsstrings
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  },
},
// Methode zum Initialisieren der Komponente
created() {
  const routeParts = this.$route.path.split('/');
  const moduleIdIndex = routeParts.indexOf('modules') + 1;
  this.moduleId = routeParts[moduleIdIndex];
  this.fetchModuleData(this.moduleId);
  auth.onAuthStateChanged(user => {
    if (user) {
      this.fetchModuleData(this.moduleId);
    } else {
      console.error('Benutzer nicht angemeldet');
    }
  });
}
}
</script>

  