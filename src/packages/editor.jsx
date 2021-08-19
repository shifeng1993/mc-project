import {computed, defineComponent, ref, inject} from "vue";
import deepcopy from "deepcopy";
import EditorBlock from './editor-block';
import './editor.less';
import {useMenuDragger} from "../utils/useMenuDragger";
import {useFocus} from "../utils/useFocus";
import {useBlockDragger} from '../utils/useBlockDragger';

export default defineComponent({
  components: {
    EditorBlock
  },
  props: {
    modelValue: {
      type: Object
    },
  },
  emits: ['update:modelValue'],
  setup(props, ctx) {
    const data = computed({
      get() {
        return props.modelValue
      },
      set(newValue) {
        ctx.emit('update:modelValue', deepcopy(newValue));
      }
    })

    const containerStyles = computed(() => ({
      width: data.value.container.width + 'px',
      height: data.value.container.height + 'px'
    }))

    const config = inject('config')

    const containerRef = ref(null);

    // 1.菜单部分的拖拽
    const {dragstart, dragend} = useMenuDragger(containerRef, data)

    // 2.实现获取焦点
    let {blockMousedown, focusData, containerMousedown} = useFocus(data, (e) => {
      // 获取焦点后进行拖拽
      mousedown(e)
    });
    // 2.实现组件拖拽
    let {mousedown} = useBlockDragger(focusData);


    // 3.实现拖拽多个元素的功能


    return () => < div class="editor" >
      <div class="editor-left">
        {config.componentList.map(option => {
          return <div
            class="editor-left-item"
            draggable
            onDragstart={e => dragstart(e, option)}
            onDragend={e => dragend(e, option)}>
            <span class="editor-left-item__label">{option.label}</span>
            <div>{option.preview()}</div>
          </div>
        })}
      </div>
      <div class="editor-top">
      </div>
      <div class="editor-right">
      </div>
      <div class="editor-container">
        <div class="editor-container-canvas">
          <div class="editor-container-canvas__content"
            ref={containerRef}
            style={containerStyles.value}
            onMousedown={containerMousedown}>
            {data.value.blocks.map(block => (
              <EditorBlock
                class={block.focus ? 'editor-block-focus' : ''}
                block={block}
                onMousedown={(e) => blockMousedown(e, block)}>
              </EditorBlock>
            ))}
          </div>
        </div>
      </div>
    </div >
  }
})