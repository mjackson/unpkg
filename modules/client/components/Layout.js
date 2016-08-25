import React, { PropTypes } from 'react'
import { Motion, spring } from 'react-motion'
import { findDOMNode } from 'react-dom'
import Window from './Window'

class Layout extends React.Component {
  static propTypes = {
    location: PropTypes.object,
    children: PropTypes.node
  }

  state = {
    underlineLeft: 0,
    underlineWidth: 0,
    useSpring: false
  }

  adjustUnderline = (useSpring = false) => {
    let itemIndex
    switch (this.props.location.pathname) {
      case '/about':
        itemIndex = 2
        break
      case '/stats':
        itemIndex = 1
        break
      case '/':
      default:
        itemIndex = 0
    }

    const itemNodes = findDOMNode(this).querySelectorAll('.underlist > li')
    const currentNode = itemNodes[itemIndex]

    this.setState({
      underlineLeft: currentNode.offsetLeft,
      underlineWidth: currentNode.offsetWidth,
      useSpring
    })
  }

  componentDidMount = () =>
    this.adjustUnderline()

  componentDidUpdate = (prevProps) => {
    if (prevProps.location.pathname !== this.props.location.pathname)
      this.adjustUnderline(true)
  }

  render = () => {
    const { underlineLeft, underlineWidth, useSpring } = this.state

    const style = {
      left: useSpring ? spring(underlineLeft, { stiffness: 220 }) : underlineLeft,
      width: useSpring ? spring(underlineWidth) : underlineWidth
    }

    return (
      <div>
        <Window onResize={this.adjustUnderline}/>
        <header>
          <h1>unpkg</h1>
          <nav>
            <ol className="underlist">
              <li><a href="#/">Home</a></li>
              <li><a href="#/stats">Stats</a></li>
              <li><a href="#/about">About</a></li>
            </ol>
            <Motion defaultStyle={{ left: underlineLeft, width: underlineWidth }} style={style}>
              {s => (
                <div
                  className="underlist-underline"
                  style={{
                    WebkitTransform: `translate3d(${s.left}px,0,0)`,
                    transform: `translate3d(${s.left}px,0,0)`,
                    width: s.width
                  }}
                />
              )}
            </Motion>
          </nav>
        </header>
        {this.props.children}
      </div>
    )
  }
}

export default Layout
