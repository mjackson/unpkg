import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import { Motion, spring } from 'react-motion'
import { withRouter, Link } from 'react-router-dom'
import WindowSize from './WindowSize'

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

  componentDidMount() {
    this.adjustUnderline()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname)
      this.adjustUnderline(true)
  }

  render() {
    const { underlineLeft, underlineWidth, useSpring } = this.state

    const style = {
      left: useSpring ? spring(underlineLeft, { stiffness: 220 }) : underlineLeft,
      width: useSpring ? spring(underlineWidth) : underlineWidth
    }

    return (
      <div>
        <WindowSize onChange={this.adjustUnderline}/>
        <header>
          <h1>unpkg</h1>
          <nav>
            <ol className="underlist">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/stats">Stats</Link></li>
              <li><Link to="/about">About</Link></li>
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

export default withRouter(Layout)
