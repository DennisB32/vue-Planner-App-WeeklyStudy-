<template>
  <div class="home">
    <Calendar />
  </div>
</template>

<script>
// @ ist ein alias zu /src
import Calendar from '@/components/CalendarView.vue'

export default {
  name: 'HomeView',
  components: {
    Calendar
  }
}
</script>
