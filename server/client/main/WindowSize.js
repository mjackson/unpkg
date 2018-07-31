const React = require("react");
const PropTypes = require("prop-types");

const addEvent = require("../utils/addEvent");
const removeEvent = require("../utils/removeEvent");

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

module.exports = WindowSize;
