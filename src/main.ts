import {createApp} from 'vue'
import App from './App.vue'

import 'ant-design-vue/dist/antd.css';

createApp(App).mount('#app')

// 1. 先构造假数据，能实现根据位置渲染内容

// 2. 配置组件对应的映射关系 data.key => component