import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/global.css'
/* 导入字体图标 */
import './assets/css/iconfont.css'
import TreeTable from 'vue-table-with-tree-grid'
/* 导入富文本编辑器 */
import VueQuillEditor from 'vue-quill-editor'
/* 导入NProgress包对应的JS和CSS */
import NProgress from 'nprogress'

import axios from 'axios'

/* 配置请求的根路径 */
axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'
/* 在request拦截器中展示进度条 */

/* 在挂载到原型对象之前先设置拦截器 NProgress.start()*/
axios.interceptors.request.use(config => {
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token');
  /* 最后必须返回config */
  return config;
})

/* 在response拦截器中隐藏进度条 NProgress.done()*/
axios.interceptors.response.use(
  config => {
    NProgress.done()
    return config
  }
)


Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)
/* 将富文本编辑器注册为全局可用的组件 */
Vue.use(VueQuillEditor)

/* 定义全局的时间过滤器 */
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
