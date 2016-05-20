export const addEvent = (node, type, handler) => {
  if (node.addEventListener) {
    node.addEventListener(type, handler, false)
  } else if (node.attachEvent) {
    node.attachEvent('on' + type, handler)
  }
}

export const removeEvent = (node, type, handler) => {
  if (node.removeEventListener) {
    node.removeEventListener(type, handler, false)
  } else if (node.detachEvent) {
    node.detachEvent('on' + type, handler)
  }
}
