import React from "react";
import PropTypes from "prop-types";

import addEvent from "../utils/addEvent";
import removeEvent from "../utils/removeEvent";

const resizeEvent = "resize";

class WindowSize extends React.Component {
  static propTypes = {
    onChange: PropTypes.func
  };

  handleWindowResize = () => {
    if (this.props.onChange)
      this.props.onChange({
        width: window.innerWidth,
        height: window.innerHeight
      });
  };

  componentDidMount() {
    addEvent(window, resizeEvent, this.handleWindowResize);
  }

  componentWillUnmount() {
    removeEvent(window, resizeEvent, this.handleWindowResize);
  }

  render() {
    return null;
  }
}

export default WindowSize;
