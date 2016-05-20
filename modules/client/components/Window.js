import React, { PropTypes } from 'react'
import { addEvent, removeEvent } from '../DOMUtils'

const ResizeEvent = 'resize'

class Window extends React.Component {
  static propTypes = {
    onResize: PropTypes.func
  }

  handleWindowResize = () => {
    if (this.props.onResize)
      this.props.onResize()
  }

  componentDidMount = () =>
    addEvent(window, ResizeEvent, this.handleWindowResize)

  componentWillUnmount = () =>
    removeEvent(window, ResizeEvent, this.handleWindowResize)

  render = () =>
    null
}

export default Window
