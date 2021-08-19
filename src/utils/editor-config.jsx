import {Button} from 'ant-design-vue';

function createEditorConfig() {
  const componentList = [];
  const componentMap = {};
  return {
    componentList,
    componentMap,
    register: (options) => {
      componentList.push(options);
      componentMap[options.key] = options;
    }
  }
}
let registerConfig = createEditorConfig();

registerConfig.register({
  label: '文本',
  preview: () => '预览文本',
  render: () => '渲染文本',
  key: 'text'
})

registerConfig.register({
  label: '按钮',
  preview: () => <Button >预览按钮</Button>,
  render: () => <Button>渲染按钮</Button>,
  key: 'Button'
})

export default registerConfig;