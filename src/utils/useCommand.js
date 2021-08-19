import {onUnmounted} from 'vue';
import {message} from "ant-design-vue";
import deepcopy from "deepcopy";
import {events} from "./events";

export function useCommand(data) {
  const state = {
    current: -1,    // 前进后退的索引值
    queue: [],      // 存放所有的操作命令
    commands: {},   // 制作命令和执行功能的一个映射表
    commandArr: [],  // 存放所有的命令
    destroyedArr: []
  }

  const registry = (command) => {
    state.commandArr.push(command);
    state.commands[command.name] = () => {  // 命令
      const {redo, undo} = command.excute();
      redo();
      if (!command.pushQueue) { // 不需要放在队列直接跳过即可
        return;
      }
      let {queue, current} = state;

      if (queue.length > 0) {
        queue.slice(0, current + 1);   // 可能在放置的过程中有撤销操作，所以根据当前最新的current值来计算最新的
        state.queue = queue;
      }

      queue.push({
        redo,
        undo
      }) // 保存之类的前进后退
      state.current = current + 1
    }
  }
  registry({
    name: 'redo',
    keyboard: 'ctrl+y/cmd+y',
    excute() {
      return {
        redo() {
          if (state.current === state.queue.length - 1) return message.error('没有可以重做的操作');
          let item = state.queue[state.current + 1];
          if (item) {
            item.redo && item.redo()
            state.current++;
            message.info('重做')
          }
        }
      }
    }
  })
  registry({
    name: 'undo',
    keyboard: 'ctrl+z/cmd+z',
    excute() {
      return {
        redo() {
          if (state.current === -1) return message.error('没有可以撤销的操作');
          let item = state.queue[state.current];
          if (item) {
            item.undo && item.undo()
            state.current--;
            message.info('撤销')
          }
        }
      }
    }
  })

  registry({ // 如果希望将操作放到队列中可以增加属性标识
    name: 'drag',
    pushQueue: true,
    init() { // 初始化操作
      this.before = null;
      const start = () => {
        this.before = deepcopy(data.value.blocks);
      }
      const end = () => {
        state.commands.drag()
      }
      events.on('start', start)
      events.on('end', end)
      return () => {
        events.off('start', start)
        events.off('end', end)
      }
    },
    excute() {
      let before = this.before
      let after = data.value.blocks;
      return {
        redo() {
          data.value = {...data.value, blocks: after}
        },
        undo() {
          data.value = {...data.value, blocks: before}
        }
      }
    }
  });

  const keyboardEvent = (() => {
    const keyCodes = {
      90: 'z',
      89: 'y',
    }
    const onKeydown = (e) => {
      const {ctrlKey, metaKey, keyCode} = e;
      let keyString = [];
      if (ctrlKey) keyString.push('ctrl');
      if (metaKey) keyString.push('cmd');
      keyString.push(keyCodes[keyCode]);
      keyString = keyString.join('+');
      state.commandArr.forEach(({keyboard, name}) => {
        if (!keyboard) return;
        let keyboards = keyboard.split('/')
        keyboards.forEach(key => {
          if (key === keyString) {
            state.commands[name]();
            e.preventDefault();
          }
        })
      })
    }
    const init = () => { // 初始化事件
      window.addEventListener('keydown', onKeydown)
      return () => { // 销毁事件
        window.removeEventListener('keydown', onKeydown)
      }
    }
    return init
  })();

  (() => {
    state.destroyedArr.push(keyboardEvent())
    state.commandArr.forEach(command => command.init && state.destroyedArr.push(command.init()))
  })();

  onUnmounted(() => {
    state.destroyedArr.forEach(fn => fn && fn());
  })
  return state;
}