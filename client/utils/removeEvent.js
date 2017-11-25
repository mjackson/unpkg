const removeEvent = (node, type, handler) => {
  if (node.removeEventListener) {
    node.removeEventListener(type, handler, false)
  } else if (node.detachEvent) {
    node.detachEvent("on" + type, handler)
  }
}

export default removeEvent
