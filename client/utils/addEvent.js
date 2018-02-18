const addEvent = (node, type, handler) => {
  if (node.addEventListener) {
    node.addEventListener(type, handler, false);
  } else if (node.attachEvent) {
    node.attachEvent("on" + type, handler);
  }
};

export default addEvent;
