import React from 'react'
import PropTypes from 'prop-types'
import { Motion, spring } from 'react-motion'
import { Switch, Route, Link, withRouter } from 'react-router-dom'
import WindowSize from './WindowSize'
import About from './About'
import Stats from './Stats'
import Home from './Home'

class Layout extends React.Component {
  static propTypes = {
    location: PropTypes.object,
    children: PropTypes.node
  }

  state = {
    underlineLeft: 0,
    underlineWidth: 0,
    useSpring: false,
    stats: null
  }

  adjustUnderline = (useSpring = false) => {
    let itemIndex
    switch (this.props.location.pathname) {
      case '/stats':
        itemIndex = 1
        break
      case '/about':
        itemIndex = 2
        break
      case '/':
      default:
        itemIndex = 0
    }

    const itemNodes = this.listNode.querySelectorAll('li')
    const currentNode = itemNodes[itemIndex]

    this.setState({
      underlineLeft: currentNode.offsetLeft,
      underlineWidth: currentNode.offsetWidth,
      useSpring
    })
  }

  componentDidMount() {
    this.adjustUnderline()

    fetch('/_stats/last-month')
      .then(res => res.json())
      .then(stats => this.setState({ stats }))

    if (window.localStorage) {
      const savedStats = window.localStorage.savedStats

      if (savedStats) this.setState({ stats: JSON.parse(savedStats) })

      window.onbeforeunload = () => {
        localStorage.savedStats = JSON.stringify(this.state.stats)
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname)
      this.adjustUnderline(true)
  }

  render() {
    const { underlineLeft, underlineWidth, useSpring } = this.state

    const style = {
      left: useSpring
        ? spring(underlineLeft, { stiffness: 220 })
        : underlineLeft,
      width: useSpring ? spring(underlineWidth) : underlineWidth
    }

    return (
      <div>
        <WindowSize onChange={this.adjustUnderline} />
        <div className="wrapper">
          <header>
            <h1 className="layout-title">unpkg</h1>
            <nav className="layout-nav">
              <ol
                className="layout-nav-list"
                ref={node => (this.listNode = node)}
              >
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/stats">Stats</Link>
                </li>
                <li>
                  <Link to="/about">About</Link>
                </li>
              </ol>
              <Motion
                defaultStyle={{ left: underlineLeft, width: underlineWidth }}
                style={style}
                children={style => (
                  <div
                    className="layout-nav-underline"
                    style={{
                      WebkitTransform: `translate3d(${style.left}px,0,0)`,
                      transform: `translate3d(${style.left}px,0,0)`,
                      width: style.width
                    }}
                  />
                )}
              />
            </nav>
          </header>
        </div>

        <Switch>
          <Route
            path="/stats"
            render={() => <Stats data={this.state.stats} />}
          />
          <Route path="/about" component={About} />
          <Route path="/" component={Home} />
        </Switch>
      </div>
    )
  }
}

export default withRouter(Layout)
