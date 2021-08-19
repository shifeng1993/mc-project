import {reactive} from "vue";
import {events} from "./events";

export function useBlockDragger(focusData, lastSelectBlock, data) {

  let dragState = {
    startX: 0,
    startY: 0,
    dragging: false // 是否正在拖拽
  }
  let markLine = reactive({
    x: null,
    y: null,
  })
  const mousedown = (e) => {
    const {width: BWidth, height: BHeight} = lastSelectBlock.value;

    dragState = {
      startX: e.clientX,
      startY: e.clientY, // 记录每一个选中的位置
      startLeft: lastSelectBlock.value.left,
      startTop: lastSelectBlock.value.top,
      startPos: focusData.value.focus.map(({top, left}) => ({top, left})),
      dragging: false,
      lines: (() => {
        const {unfocused} = focusData.value;

        // 辅助线
        let lines = {x: [], y: []}; // 计算横线用y来存储，计算竖线用x来存储

        [...unfocused, {
          top: 0,
          left: 0,
          width: data.value.container.width,
          height: data.value.container.height,
        }].forEach((block) => {
          const {top: ATop, left: ALeft, width: AWidth, height: AHeight} = block;

          // showTop 是辅助线显示的位置  top是B->最后选择元素的top
          // 情况1 A顶 - B顶; showTop = ATop; top = ATop
          lines.y.push({showTop: ATop, top: ATop});

          // 情况2 A顶 - B底; showTop = ATop; top = ATop - BHeight
          lines.y.push({showTop: ATop, top: ATop - BHeight});

          // 情况3 A中 - B中; showTop = ATop + AHeight / 2; top = ATop + AHeight / 2 - BHeight / 2
          lines.y.push({showTop: ATop + AHeight / 2, top: ATop + AHeight / 2 - BHeight / 2});

          // 情况4 A底 - B顶; showTop = ATop + AHeight; top = ATop + AHeight
          lines.y.push({showTop: ATop + AHeight, top: ATop + AHeight});

          // 情况5 A底 - B底; showTop = ATop + AHeight; top = ATop + AHeight
          lines.y.push({showTop: ATop + AHeight, top: ATop - BHeight});

          // showLeft 是辅助线显示的位置  left是B->最后选择元素的left
          // 情况1 A左 - B左; showLeft = ALeft; left = ALeft
          lines.x.push({showLeft: ALeft, left: ALeft});

          // 情况2 A左 - B右; showLeft = ALeft; left = ALeft - BWidth
          lines.x.push({showLeft: ALeft, left: ALeft - BWidth});

          // 情况3 A中 - B中; showLeft = ALeft + AWidth / 2; left = ALeft + AWidth / 2 - BWidth / 2
          lines.x.push({showLeft: ALeft + AWidth / 2, left: ALeft + AWidth / 2 - BWidth / 2});

          // 情况4 A右 - B左; showLeft = ALeft + AWidth; left = ALeft + AWidth
          lines.x.push({showLeft: ALeft + AWidth, left: ALeft + AWidth});

          // 情况5 A右 - B右; showLeft = ALeft + AWidth; left = ALeft + AWidth
          lines.x.push({showLeft: ALeft + AWidth, left: ALeft - BWidth});

        })

        return lines;
      })()
    }
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup)
  }
  const mousemove = (e) => {
    let {clientX: moveX, clientY: moveY} = e;

    if (!dragState.dragging) {
      dragState.dragging = true;
      events.emit('start') // 触发事件就会记住拖拽前的位置
    }

    // 计算当前元素最新的left和top去线里面找,找到就显示
    // 鼠标移动后 - 鼠标移动前 + left
    let left = moveX - dragState.startX + dragState.startLeft;
    let top = moveY - dragState.startY + dragState.startTop;
    let y = null;
    let x = null;
    // 先计算横线，距离参照物还有5px就显示参照线
    for (let i = 0; i < dragState.lines.y.length; i++) {
      const {top: t, showTop: s} = dragState.lines.y[i];
      if (Math.abs(t - top) < 5) {
        y = s; // 线要显示的位置

        // 实现快速贴边
        moveY = dragState.startY - dragState.startTop + t;

        break;  // 找到一根线后就跳出循环
      }
    }

    // 先计算横线，距离参照物还有5px就显示参照线
    for (let i = 0; i < dragState.lines.x.length; i++) {
      const {left: l, showLeft: s} = dragState.lines.x[i];
      if (Math.abs(l - left) < 5) {
        x = s; // 线要显示的位置

        // 实现快速贴边
        moveX = dragState.startX - dragState.startLeft + l;

        break;  // 找到一根线后就跳出循环
      }
    }

    markLine.x = x; // markline是一个响应式数据，如果x，y更新，视图会更新
    markLine.y = y;

    let durX = moveX - dragState.startX;
    let durY = moveY - dragState.startY;
    focusData.value.focus.forEach((block, idx) => {
      block.top = dragState.startPos[idx].top + durY;
      block.left = dragState.startPos[idx].left + durX;
    })
  }
  const mouseup = (e) => {
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup)
    markLine.x = null; // markline是一个响应式数据，如果x，y更新，视图会更新
    markLine.y = null;
    if (dragState.dragging) {
      events.emit('end') // 触发事件就会记住拖拽前的位置
    }
  }

  return {
    markLine,
    mousedown
  }
}