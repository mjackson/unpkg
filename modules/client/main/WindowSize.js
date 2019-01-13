import React from 'react';
import PropTypes from 'prop-types';

import { addEvent, removeEvent } from '../utils/dom';

const resizeEvent = 'resize';

export default class WindowSize extends React.Component {
  handleWindowResize = () => {
    if (this.props.onChange) {
      this.props.onChange({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
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

if (process.env.NODE_ENV !== 'production') {
  WindowSize.propTypes = {
    onChange: PropTypes.func
  };
}
