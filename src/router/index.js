import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Tjzb from "../views/Tjzb.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/tjzb',
      name: 'tjzb',
      component: Tjzb
    },
  ]

})

export default router
