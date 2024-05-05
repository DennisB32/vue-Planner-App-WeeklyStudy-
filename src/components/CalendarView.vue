<template>
  <!-- Eine Zeile in einer Rasteranordnung -->
  <v-row>
    <v-col>
      <v-sheet height="64">
        <v-toolbar flat color="white">
          <!-- Schaltfläche zum Öffnen des Terminerstellungsdialogs -->
          <v-btn class="mr-4" x-large icon color="primary" dark @click.stop="dialog = true">
            <v-icon>mdi-calendar-plus</v-icon>
          </v-btn>
          <!-- Schaltfläche zum Zurücksetzen auf den heutigen Tag -->
          <v-btn outlined class="mr-4" @click="setToday">
            Heute
          </v-btn>
          <!-- Schaltflächen zum Navigieren durch die Termine -->
          <v-btn fab text small @click="prev">
            <v-icon small>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn fab text small @click="next">
            <v-icon small>mdi-chevron-right</v-icon>
          </v-btn>
          <!-- Titel des Kalenders -->
          <v-toolbar-title>{{ title }}</v-toolbar-title>
          <!-- Dropdown-Menü für die Ansicht des Kalenders -->
          <div class="flex-grow-1"></div>
          <v-menu bottom right>
            <template v-slot:activator="{ on }">
              <v-btn outlined v-on="on">
                <span>{{ typeToLabel[type] }}</span>
                <v-icon right>mdi-menu-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <!-- Optionen für die Kalenderansicht -->
              <v-list-item @click="type = 'day'">
                <v-list-item-title>Tag</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'week'">
                <v-list-item-title>Woche</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>Monat</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = '4day'">
                <v-list-item-title>4 Tage</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
      </v-sheet>

      <!-- Dialog zum Erstellen eines neuen Termins -->
      <v-dialog v-model="dialog" max-width="500">
        <v-card>
          <v-toolbar color="primary">
            <v-toolbar-title style="color:white">Termin Erstellen</v-toolbar-title>
          </v-toolbar>
          <v-container>
            <v-form @submit.prevent="addEvent">
              <!-- Eingabefelder für die Termininformationen -->
              <v-text-field v-model="name" type="text" label="Termin Name *"></v-text-field>
              <v-text-field v-model="details" type="text" label="Details"></v-text-field>
              <v-text-field v-model="teacher" type="text" label="Dozent"></v-text-field>
              <v-text-field v-model="place" type="text" label="Ort"></v-text-field>
              <v-text-field type="datetime-local" v-model="start" label="Start *"></v-text-field>
              <v-text-field type="datetime-local" v-model="end" label="Ende *"></v-text-field>
              <v-text-field v-model="color" type="color" label="Farbe (Klick um das Menü zu öffnen)"></v-text-field>
              <!-- Button zum Erstellen des Termins -->
              <v-btn type="submit" color="primary" class="mr-4" @click.stop="dialog = false">
                Termin Erstellen
              </v-btn>
            </v-form>
          </v-container>
        </v-card>
      </v-dialog>

      <!-- Darstellung des Kalenders -->
      <v-sheet fill-height>
        <v-calendar
          ref="calendar"
          v-model="focus"
          color="primary"
          :events="events"
          :event-color="getEventColor"
          :event-margin-bottom="3"
          :now="today"
          :type="type"
          @click:event="showEvent"
          @click:more="viewDay"
          @click:date="setDialogDate"
          @change="updateRange"
        ></v-calendar>

        <!-- Kontextmenü für ausgewählte Ereignisse -->
        <v-menu
          v-model="selectedOpen"
          :close-on-content-click="false"
          :activator="selectedElement"
          full-width
          offset-x
        >
          <v-card color="grey lighten-4" :width="350" flat>
            <v-toolbar :color="selectedEvent.color" dark>
              <!-- Schaltfläche zum Löschen des Ereignisses -->
              <v-btn @click="deleteEvent(selectedEvent.id)" icon>
                <v-icon>mdi-delete</v-icon>
              </v-btn>
              <!-- Titel des Ereignisses -->
              <v-toolbar-title>{{selectedEvent.name}}</v-toolbar-title>
              <div class="flex-grow-1"></div>
            </v-toolbar>

           <v-card-text>
              <!-- Anzeigen der Ereignisdetails oder Bearbeitungsfelder -->
              <form v-if="currentlyEditing !== selectedEvent.id">
                <h3>Details</h3>{{ selectedEvent.details }}
                <h3>Dozent</h3>{{ selectedEvent.teacher }}
                <h3>Ort</h3>{{ selectedEvent.place }}
                <h3>Start</h3>{{ selectedEvent.start }}
                <h3>Ende</h3>{{ selectedEvent.end }}
              </form>
              <!-- Bearbeitungsfelder für das ausgewählte Ereignis -->
              <form v-else>
                <h4 class="text-decoration-underline">Titel</h4>
                <input
                  v-model="selectedEvent.name"
                  type="text"
                  style="width: 100%; border: 1px solid rgba(0, 0, 0, 0.26); border-radius: 4px; padding: 8px;"
                  placeholder="Edit Titel"
                />
                <!-- Weitere Bearbeitungsfelder -->
                <h4 class="text-decoration-underline">Details</h4>
                <input
                  v-model="selectedEvent.details"
                  type="text"
                  style="width: 100%; border: 1px solid rgba(0, 0, 0, 0.26); border-radius: 4px; padding: 8px;"
                  placeholder="Edit Details"
                />
                <h4 class="text-decoration-underline">Dozent</h4>
                <input
                  v-model="selectedEvent.teacher"
                  type="text"
                  style="width: 100%; border: 1px solid rgba(0, 0, 0, 0.26); border-radius: 4px; padding: 8px;"
                  placeholder="Edit Dozent"
                />
                <h4 class="text-decoration-underline">Ort</h4>
                <input
                  v-model="selectedEvent.place"
                  type="text"
                  style="width: 100%; border: 1px solid rgba(0, 0, 0, 0.26); border-radius: 4px; padding: 8px;"
                  placeholder="Edit Ort"
                />
                <h4 class="text-decoration-underline">Farbe</h4>
                <input
                  v-model="selectedEvent.color"
                  type="color"
                  style="width: 100%; border: 1px solid rgba(0, 0, 0, 0.26); border-radius: 4px; padding: 8px;"
                  placeholder="Edit Farbe"
                />
              </form>
            </v-card-text>

            <v-card-actions>
              <!-- Schaltflächen zum Schließen oder Bearbeiten des Ereignisses -->
              <v-btn text color="secondary" @click="closeEvent">
                Schließen
              </v-btn>
              <v-btn v-if="currentlyEditing !== selectedEvent.id" text @click.prevent="editEvent(selectedEvent)">
                Bearbeiten
              </v-btn>
              <v-btn text v-else type="submit" @click.prevent="updateEvent(selectedEvent)">
                Speichern
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-sheet>
    </v-col>
  </v-row>
</template>

<script>
import { db, auth } from '@/main'
export default {
  data: () => ({
    // Initialisierung der Datenfelder
    today: new Date().toISOString().substr(0, 10),
    focus: new Date().toISOString().substr(0, 10),
    type: 'week',
    typeToLabel: {
      month: 'Monat',
      week: 'Woche',
      day: 'Tag',
      '4day': '4 Tage',
    },
    name: null,
    details: null,
    teacher: null,
    place: null,
    start: null,
    end: null,
    color: '#1976D2', // Standardfarbe für Ereignisse
    currentlyEditing: null,
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    events: [],
    dialog: false,
    dialogDate: false
  }),
  mounted () {
    // Beim Laden der Komponente Ereignisse abrufen
    this.getEvents()
  },
  computed: {
    // Dynamische Berechnung des Titels basierend auf dem gewählten Datumbereich und Typ
    title () {
      const { start, end } = this
      if (!start || !end) {
        return ''
      }
      const startMonth = this.monthFormatter(start)
      const endMonth = this.monthFormatter(end)
      const suffixMonth = startMonth === endMonth ? '' : endMonth
      const startYear = start.year
      const endYear = end.year
      const suffixYear = startYear === endYear ? '' : endYear
      const startDay = start.day
      const endDay = end.day 
      switch (this.type) {
        case 'month':
          return `${startMonth} ${startYear}`
        case 'week':
        case '4day':
          return `${startDay}.${startMonth} ${startYear} - ${endDay}.${suffixMonth} ${suffixYear}`
        case 'day':
          return `${startDay}.${startMonth} ${startYear}`
      }
      return ''
    },
    // Formatter für Monate
    monthFormatter () {
      return this.$refs.calendar.getFormatter({
        timeZone: 'UTC', month: 'long',
      })
    }
  },
  methods: {
    // Methode zum Abrufen der Ereignisse aus der Datenbank
    async getEvents () {
      try {
        const currentUserUid = auth.currentUser.uid;
        // Verwenden von `onSnapshot`, um automatisch Änderungen zu überwachen
        db.collection('calEvent').where('userId', '==', currentUserUid)
          .onSnapshot(snapshot => {
            const events = [];
            snapshot.forEach(doc => {
              let appData = doc.data();
              appData.id = doc.id;
              events.push(appData);
            });
            this.events = events;
          });
      } catch (error) {
        console.error(error);
      }
    },
    // Methode zum Festlegen des Datums für den Dialog
    setDialogDate( { date }) {
      this.dialogDate = true
      this.focus = date
    },
    // Methode zur Anzeige des Tages beim Klicken auf "Mehr" in einem Ereignis
    viewDay ({ date }) {
      this.focus = date
      this.type = 'day'
    },
    // Methode zur Rückgabe der Farbe eines Ereignisses
    getEventColor (event) {
      return event.color
    },
    // Methode zum Setzen des heutigen Datums
    setToday () {
      this.focus = this.today
    },
    // Methode zum Navigieren zum vorherigen Zeitraum
    prev () {
      this.$refs.calendar.prev()
    },
    // Methode zum Navigieren zum nächsten Zeitraum
    next () {
      this.$refs.calendar.next()
    },
    // Methode zum Hinzufügen eines Ereignisses
    async addEvent () {
      if (this.name && this.start && this.end) {
        await db.collection("calEvent").add({
          name: this.name,
          details: this.details,
          teacher: this.teacher,
          place: this.place,
          start: this.start,
          end: this.end,
          color: this.color,
          userId: auth.currentUser.uid // Hinzufügen der Benutzer-ID
        })
        // Aktualisieren der Ereignisliste und Zurücksetzen der Eingabefelder
        this.getEvents()
        this.name = '',
        this.details = '',
        this.teacher = '',
        this.place = '',
        this.start = '',
        this.end = '',
        this.color = ''
      } else {
        alert('You must enter event name, start, and end time')
      }
    },
    // Methode zum Bearbeiten eines Ereignisses
    editEvent (ev) {
      this.currentlyEditing = ev.id
    },
    // Methode zum Aktualisieren eines Ereignisses
    async updateEvent (ev) {
      await db.collection('calEvent').doc(this.currentlyEditing).update({
        name: ev.name,
        details: ev.details,
        teacher: ev.teacher,
        place: ev.place,
        color: ev.color,
      })
      // Schließen des Ereignisdialogs und Zurücksetzen der Bearbeitungsvariable
      this.selectedOpen = false,
      this.currentlyEditing = null
    },
    // Methode zum Löschen eines Ereignisses
    async deleteEvent (ev) {
      await db.collection("calEvent").doc(ev).delete()
      // Schließen des Ereignisdialogs und Aktualisieren der Ereignisliste
      this.selectedOpen = false,
      this.getEvents()
    },
    // Methode zum Anzeigen eines Ereignisses
    showEvent ({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event
        this.selectedElement = nativeEvent.target
        setTimeout(() => this.selectedOpen = true, 10)
      }
      if (this.selectedOpen) {
        this.selectedOpen = false
        setTimeout(open, 10)
      } else {
        open()
      }
      nativeEvent.stopPropagation()
    },
    // Methode zum Schließen des Ereignisdialogs
    closeEvent(){
      const currentUserUid = auth.currentUser.uid;
      this.selectedOpen = false
      this.currentlyEditing = null
      // Aktualisieren der Ereignisliste
      db.collection('calEvent').where('userId', '==', currentUserUid)
      .onSnapshot(snapshot => {
        const events = [];
        snapshot.forEach(doc => {
          let appData = doc.data();
          appData.id = doc.id;
          events.push(appData);
        });
        this.events = events;
      });
    },
    // Methode zum Aktualisieren des Datumsbereichs
    updateRange ({ start, end }) {
      this.start = start
      this.end = end
    },
    // Methode zur Ordinalzahl-Formatierung
    nth (d) {
      return d > 3 && d < 21
        ? 'th'
        : ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'][d % 10]
    },
  }
}
</script>
