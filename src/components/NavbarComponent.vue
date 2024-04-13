<template>
  <!-- Layout für die Hauptansicht -->
  <v-layout class="rounded rounded-md">
    <v-card>
      <!-- Seitennavigation -->
      <v-navigation-drawer
        permanent
        app
        style="max-width: 200px;"
      >
        <!-- Benutzerinformationen und Logo -->
        <v-list>
          <v-list-item  class="d-flex justify-center" style="object-fit: cover">
            <v-img src='@/assets/WeeklyStudyLogo.png' style="object-fit: cover; height: 90px; margin-right: 10%;" ></v-img>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="text-h6 text-center">
                {{ user.firstName }} {{ user.lastName }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-center">{{ user.email }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-divider></v-divider>

        <!-- Hauptnavigation -->
        <v-list nav dense>
          <!-- Verlinkung zur Kalenderseite -->
          <router-link to="/" class="text-decoration-none" style="color: black">
            <v-list-item link>
              <v-list-item-icon>
                <v-icon>mdi-home</v-icon>
              </v-list-item-icon>
              <v-list-item-title><h3>Kalender</h3></v-list-item-title>
            </v-list-item>
          </router-link>
          <!-- Verlinkung zur Modulseite -->
          <router-link to="/modules" class="text-decoration-none" style="color: black">
            <v-list-item link>
              <v-list-item-icon>
                <v-icon>mdi-folder</v-icon>
              </v-list-item-icon>
              <v-list-item-title><h3>Module</h3></v-list-item-title>
            </v-list-item>
          </router-link>
          <!-- Option zum Öffnen des Accountdialogs -->
          <v-list-item @click="openAccountDialog">
            <v-list-item-icon>
              <v-icon>mdi-account</v-icon>
            </v-list-item-icon>
            <v-list-item-title><h3>Account</h3></v-list-item-title>
          </v-list-item>
        </v-list>
        <v-divider></v-divider>
        <!-- Liste der nächsten Aufgaben -->
        <div style="min-height: 530px;">
          <!-- Nachricht bei leerer Aufgabenliste -->
          <v-subheader class="d-flex justify-center" v-if="slicedTasks.length === 0" style="margin-top: 100px;">Keine Aufgaben</v-subheader>
          <v-list-item-group>
            <!-- Iteration über die Aufgabenliste -->
            <v-list-item v-for="(task, index) in slicedTasks" :key="task.id" @click="showTaskDialog(task)" :style="{ backgroundColor: `rgba(255, 171, 64, ${1 - index * 0.125})`}">
              <v-list-item-icon>
                <v-icon>mdi-file-document-alert-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>
                  {{ task.title }}
                  <v-list-item-subtitle>{{ task.moduleName }}</v-list-item-subtitle>
                  <v-list-item-subtitle class="red--text">{{ formatDate(task.endDate) }}</v-list-item-subtitle>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </div>
        <v-divider></v-divider>

        <!-- Abmeldeoption -->
        <v-list dense>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>
                <v-btn @click="logout" color="red" :to="'/login/'" block>Ausloggen</v-btn>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
    </v-card>

    <!-- Dialog für die Detailansicht einer Aufgabe -->
    <v-dialog v-model="taskDialog" max-width="500px">
      <v-card>
        <v-card-title>{{ selectedTask.title }}</v-card-title>
        <v-card-text>
          {{ selectedTask.text }}
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="closeTaskDialog">Schließen</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Accountformular -->
    <AccountForm
      :user="user"
      :accountDialog="accountDialog"
      @save="saveChanges"
      @close="closeAccountDialog"
    />
  </v-layout>
</template>

<script>
import { auth, db } from '@/main'; // Import von Firebase
import AccountForm from '@/components/AccountForm.vue'; // Import der AccountForm-Komponente

export default {
  components: {
    AccountForm
  },
  data() {
    return {
      // Daten für den aktuellen Benutzer und die Aufgabenliste
      user: {
        firstName: '',
        lastName: '',
        email: '',
      },
      tasks: [],
      // Steuervariable für den Aufgaben-Dialog
      taskDialog: false,
      // Ausgewählte Aufgabe im Dialog
      selectedTask: {
        title: '',
        text: ''
      },
      // Steuervariable für den Account-Dialog
      accountDialog: false
    };
  },
  computed: {
    // Sortierte Liste der Aufgaben nach Enddatum
    sortedTasks() {
      return this.tasks.slice().sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
    },
    // Die ersten 8 Aufgaben aus der sortierten Liste
    slicedTasks() {
      return this.sortedTasks.slice(0, 8);
    }
  },
  created() {
    // Benutzerdaten und Aufgaben beim Laden der Komponente abrufen
    this.getUserData();
    this.getTasks();
  },
  methods: {
    // Benutzerdaten abrufen
    async getUserData() {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await db.collection('user').doc(currentUser.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          this.user.firstName = userData.firstName;
          this.user.lastName = userData.lastName;
          this.user.email = userData.email;
        }
      }
    },
    // Aufgaben des Benutzers abrufen
    async getTasks() {
      const currentUser = auth.currentUser;
      if (currentUser) {
        db.collection('tasks')
          .where('userId', '==', currentUser.uid)
          .onSnapshot(snapshot => {
            this.tasks = [];
            snapshot.forEach(async doc => {
              const taskData = doc.data();
              const moduleDoc = await db.collection('modules').doc(taskData.moduleId).get();
              if (moduleDoc.exists) {
                const moduleData = moduleDoc.data();
                if (moduleData && moduleData.name !== undefined) {
                  this.tasks.push({
                    id: doc.id,
                    title: taskData.title,
                    text: taskData.text,
                    endDate: new Date(taskData.end),
                    moduleId: taskData.moduleId,
                    moduleName: moduleData.name
                  });
                } else {
                  console.error(`Das Modul für den Task mit der ID ${doc.id} hat keine gültigen Daten oder keinen Namen.`);
                }
              } else {
                console.error(`Das Modul für den Task mit der ID ${doc.id} existiert nicht mehr.`);
              }
            });
          });
      }
    },
    // Datum formatieren
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('de-DE', options);
    },
    // Benutzer ausloggen
    logout() {
      auth.signOut().then(() => {}).catch(error => {
        console.error('Fehler beim Ausloggen:', error);
      });
    },
    // Aufgabendialog öffnen
    showTaskDialog(task) {
      this.selectedTask = task;
      this.taskDialog = true;
    },
    // Aufgabendialog schließen
    closeTaskDialog() {
      this.selectedTask = { title: '', text: '' };
      this.taskDialog = false;
    },
    // Account-Dialog öffnen
    openAccountDialog() {
      this.accountDialog = true;
    },
    // Account-Dialog schließen
    closeAccountDialog() {
      this.accountDialog = false;
    },
  }
};
</script>
