import React from 'react'
import PropTypes from 'prop-types'
import { addEvent, removeEvent } from './DOMUtils'

const ResizeEvent = 'resize'

class WindowSize extends React.Component {
  static propTypes = {
    onChange: PropTypes.func
  }

  handleWindowResize = () => {
    if (this.props.onChange)
      this.props.onChange({
        width: window.innerWidth,
        height: window.innerHeight
      })
  }

  componentDidMount() {
    addEvent(window, ResizeEvent, this.handleWindowResize)
  }

  componentWillUnmount() {
    removeEvent(window, ResizeEvent, this.handleWindowResize)
  }

  render() {
    return null
  }
}

export default WindowSize
