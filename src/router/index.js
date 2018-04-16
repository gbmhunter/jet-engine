import Vue from 'vue'
import Router from 'vue-router'
import JetEnginePIDControl from '@/components/JetEnginePIDControl'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'JetEnginePIDControl',
      component: JetEnginePIDControl
    }
  ]
})
