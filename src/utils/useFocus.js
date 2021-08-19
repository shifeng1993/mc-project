import {computed} from 'vue';

export function useFocus(data, callback) {
  const focusData = computed(() => {
    let focus = [];
    let unfocused = [];
    data.value.blocks.forEach((block) => (block.focus ? focus : unfocused).push(block));
    return {focus, unfocused};
  })

  const clearBlockFocus = () => {
    data.value.blocks.forEach((block) => block.focus = false);
  }
  const blockMousedown = (e, block) => {
    e.preventDefault();
    e.stopPropagation();
    // block规划一个focus， 获取焦点后focus变为true
    if (e.shiftKey) {
      if (focusData.value.focus.length <= 1) {
        block.focus = true; // 要清空其他人foucs属性
      } else {
        block.focus = !block.focus;
      }
    } else {
      if (!block.focus) {
        clearBlockFocus();
        block.focus = true; // 要清空其他人foucs属性
      }
    }
    callback(e);
  }
  const containerMousedown = () => {
    clearBlockFocus()
  }

  return {
    focusData,
    blockMousedown,
    clearBlockFocus,
    containerMousedown
  }
}