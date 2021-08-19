import {computed, defineComponent, inject, ref, onMounted} from "vue";

export default defineComponent({
  props: {
    block: {type: Object}
  },
  setup(props) {
    const block = computed(() => props.block)

    const blockStyles = computed(() => ({
      top: `${block.value.top}px`,
      left: `${block.value.left}px`,
      zIndex: block.value.zIndex
    }))

    // 子组件接受派发的config
    const config = inject('config');

    const blockRef = ref(null);

    onMounted(() => {
      let {offsetWidth, offsetHeight} = blockRef.value;
      if (block.value.alignCenter) { // 说明是拖拽松手的时候才渲染, 其他默认渲染页面的不需要居中
        block.value.left = block.value.left - offsetWidth / 2;
        block.value.top = block.value.top - offsetHeight / 2;
        block.value.alignCenter = false;
      }

      props.block.width = offsetWidth; // eslint-disable-line
      props.block.height = offsetHeight;// eslint-disable-line
    })

    return () => {
      const component = config.componentMap[block.value.key];

      const RenderComponent = component.render();

      return <div class="editor-block" style={blockStyles.value} ref={blockRef} >
        {RenderComponent}
      </div>
    }
  }
})