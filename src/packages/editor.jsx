import {computed, defineComponent, ref, inject} from "vue";
import deepcopy from "deepcopy";
import EditorBlock from './editor-block';
import './editor.less';
import {useMenuDragger} from "../utils/useMenuDragger";
import {useFocus} from "../utils/useFocus";
import {useBlockDragger} from '../utils/useBlockDragger';
import {Button} from "ant-design-vue";
import {useCommand} from "../utils/useCommand";

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
    let {blockMousedown, focusData, containerMousedown, lastSelectBlock} = useFocus(data, (e) => {
      // 获取焦点后进行拖拽
      mousedown(e)
    });
    // 3.实现拖拽多个元素的功能
    let {mousedown, markLine} = useBlockDragger(focusData, lastSelectBlock, data);

    const {commands} = useCommand(data);

    const buttons = [
      {
        label: '撤销',
        type: 'default',
        handler: () => commands.undo()
      }, {
        label: '重做',
        type: 'default',
        handler: () => commands.redo()
      }
    ]



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
        {buttons.map((btn, index) => {
          return <Button type={btn.type} onClick={btn.handler}>{btn.label}</Button>
        })}
      </div>
      <div class="editor-right">
      </div>
      <div class="editor-container">
        <div class="editor-container-canvas">
          <div class="editor-container-canvas__content"
            ref={containerRef}
            style={containerStyles.value}
            onMousedown={containerMousedown}>
            {data.value.blocks.map((block, index) => (
              <EditorBlock
                class={block.focus ? 'editor-block-focus' : ''}
                block={block}
                onMousedown={(e) => blockMousedown(e, block, index)}>
              </EditorBlock>
            ))}
            {markLine.x !== null && <div class="line-x" style={{left: markLine.x + 'px'}}></div>}
            {markLine.y !== null && <div class="line-y" style={{top: markLine.y + 'px'}}></div>}
          </div>
        </div>
      </div>
    </div >
  }
})