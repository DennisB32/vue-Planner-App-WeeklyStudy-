<template>
  <!-- Hauptvorlage für die Modulansicht -->
  <v-app>
    <v-card tile>
      <!-- Symbolleiste -->
      <v-toolbar color="">
        <v-toolbar-title>
          <h3>Module</h3>
        </v-toolbar-title>
        <!-- Schaltfläche zum Öffnen des Dialogfelds zum Erstellen eines Moduls -->
        <v-btn @click.stop="openCreateModuleDialog" class="ma-2" icon color="primary" large>
          <v-icon>mdi-folder-plus</v-icon>
        </v-btn>
      </v-toolbar>

      <!-- Liste der Module -->
      <v-list dense>
        <v-subheader>Module</v-subheader>
        <!-- Liste der Module -->
        <v-list-item-group v-model="selectedItem" color="primary">
          <v-list-item v-for="module in modules" :key="module.id" :to="'/modules/' + module.id">
            <v-icon class="ma-4">mdi-file</v-icon>
            <v-list-item-content>
              <v-list-item-title>
                <!-- Modulname -->
                <h3>{{ module?.name }}</h3>
                <!-- Überprüfen, ob das Modul definiert ist, bevor auf seine Eigenschaften zugegriffen wird -->
              </v-list-item-title>
            </v-list-item-content>
            <!-- Schaltfläche zum Bearbeiten des Modulnamens -->
            <v-btn @click.prevent="editModuleName(module)" class="ma-2" icon color="" small>
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-card>

    <!-- Dialogfeld zum Erstellen eines Moduls -->
    <v-dialog v-model="createModuleDialogVisible" max-width="500">
      <v-card>
        <v-container>
          <v-form @submit.prevent="createModule">
            <!-- Eingabefeld für den Modulnamen -->
            <v-text-field v-model="newModuleName" type="text" label="Modul Name"></v-text-field>
            <!-- Schaltflächen zum Erstellen und Abbrechen -->
            <v-btn type="submit" color="primary" class="mr-4">
              Erstellen
            </v-btn>
            <v-btn @click="cancelCreateModule">Abbrechen</v-btn>
          </v-form>
        </v-container>
      </v-card>
    </v-dialog>

    <!-- Dialogfeld zum Bearbeiten eines Moduls -->
    <v-dialog v-model="editModuleDialogVisible" max-width="500">
      <v-card>
        <v-container>
          <v-form @submit.prevent="updateModuleName">
            <!-- Eingabefeld für den Modulnamen -->
            <v-text-field v-model="editedModuleName" type="text" label="Modul Name (required)"></v-text-field>
            <!-- Schaltflächen zum Speichern, Abbrechen und Löschen -->
            <v-btn type="submit" color="primary" class="mr-4">
              Speichern
            </v-btn>
            <v-btn class="mr-4" @click="cancelEditModule">Abbrechen</v-btn>
            <v-btn class="mr-4" color="red" @click="deleteModule">Löschen</v-btn>
          </v-form>
        </v-container>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import { db, auth } from '@/main'; // Import der Firebase-Authentifizierungs- und Firestore-Datenbankmodule

export default {
  name: 'ModulesView',
  data() {
    return {
      modules: [],
      createModuleDialogVisible: false,
      editModuleDialogVisible: false,
      newModuleName: '',
      editedModuleId: null,
      editedModuleName: '',
    };
  },
  methods: {
    // Methode zum Öffnen des Dialogfelds zum Erstellen eines Moduls
    openCreateModuleDialog() {
      this.createModuleDialogVisible = true;
    },
    // Methode zum Abbrechen der Modulerstellung
    cancelCreateModule() {
      this.createModuleDialogVisible = false;
      this.newModuleName = '';
    },
    // Methode zum Erstellen eines neuen Moduls
    createModule() {
      const user = auth.currentUser;
      if (!user) {
        console.error('User not authenticated.');
        return;
      }
      const newModule = {
        name: this.newModuleName,
        userId: auth.currentUser.uid
        // andere Eigenschaften des Moduls
      };
      db.collection('modules').add(newModule).then(() => {
        this.cancelCreateModule();
        this.fetchModules();
      }).catch(error => {
        console.error('Error creating module:', error);
      });
    },
    // Methode zum Abrufen aller Module des Benutzers
    fetchModules() {
      const user = auth.currentUser;
      if (!user) {
        console.error('User not authenticated.');
        return;
      }
      db.collection('modules').where('userId', '==', user.uid).get().then(snapshot => {
        this.modules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }).catch(error => {
        console.error('Error fetching modules:', error);
      });
    },
    // Methode zum Bearbeiten des Modulnamens
    editModuleName(module) {
      this.editedModuleId = module.id;
      this.editedModuleName = module.name;
      this.editModuleDialogVisible = true;
    },
    // Methode zum Aktualisieren des Modulnamens
    updateModuleName() {
      db.collection('modules').doc(this.editedModuleId).update({ name: this.editedModuleName })
      .then(() => {
        this.cancelEditModule();
        this.fetchModules();
      })
      .catch(error => {
        console.error('Error updating module name:', error);
      });
    },
    // Methode zum Löschen eines Moduls
    async deleteModule() {
      if (!this.editedModuleId) {
        console.error('No module selected for deletion.');
        return;
      }

      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.error('User not authenticated.');
        return;
      }

      // Löschvorgang für Tasks
      const tasksQuerySnapshot = await db.collection('tasks').where('moduleId', '==', this.editedModuleId).where('userId', '==', currentUser.uid).get();
      tasksQuerySnapshot.forEach(async taskDoc => {
        await taskDoc.ref.delete();
      });

      // Löschvorgang für Notes
      const notesQuerySnapshot = await db.collection('notes').where('moduleId', '==', this.editedModuleId).where('userId', '==', currentUser.uid).get();
      notesQuerySnapshot.forEach(async noteDoc => {
        await noteDoc.ref.delete();
      });

      // Löschvorgang für das Modul und zugehörige Dokumente
      db.collection('modules').doc(this.editedModuleId).delete()
      .then(async () => {
        console.log('Module deleted successfully');

        // Aktualisieren der Modulliste nach dem Löschen
        this.fetchModules();

        this.editModuleDialogVisible = false;
        this.editedModuleId = null;
        this.editedModuleName = '';
        window.location.reload();
      })
      .catch(error => {
        console.error('Error deleting module:', error);
      });
    },
    // Methode zum Abbrechen des Bearbeitungsvorgangs für den Modulnamen
    cancelEditModule() {
      this.editModuleDialogVisible = false;
      this.editedModuleId = null;
      this.editedModuleName = '';
    }
  },
  created() {
    this.fetchModules();
  },
}
</script>
