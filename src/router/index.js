import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/LandingPage.vue'
import ModuleDetails from '../components/ModuleDetails.vue'
import ModulesView from '../views/ModulesView.vue'
import LoginComponent from '../components/LoginComponent.vue';
import RegisterComponent from '../components/RegisterComponent.vue';

Vue.use(VueRouter)

const routes = [
  { path: '/login', 
    name: 'login',
   component: LoginComponent 
  },
  { path: '/register', 
  name: 'register',
   component: RegisterComponent 
  },
  {
    path: '/',
    name: 'calendar',
    component: HomeView
  },
  {
    path: '/modules/:id',
    name: 'ModuleDetails',
    component: ModuleDetails
  },
  {
    path: '/modules',
    name: 'ModulesView',
    component: ModulesView
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
