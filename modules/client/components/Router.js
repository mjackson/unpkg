import React from 'react'
import history from '../history'
import Layout from './Layout'
import About from './About'
import Stats from './Stats'
import Home from './Home'

const findMatchingComponents = (location) => {
  let components
  switch (location.pathname) {
    case '/about':
      components = [ Layout, About ]
      break
    case '/stats':
      components = [ Layout, Stats ]
      break
    case '/':
    default:
      components = [ Layout, Home ]
  }

  return components
}

const renderNestedComponents = (components, props) =>
  components.reduceRight(
    (children, component) => React.createElement(component, { ...props, children }),
    undefined
  )

class Router extends React.Component {
  state = {
    location: history.getCurrentLocation()
  }

  componentDidMount = () =>
    this.unlisten = history.listen(location => {
      this.setState({ location })
    })

  componentWillUnmount = () =>
    this.unlisten()

  render = () => {
    const { location } = this.state
    const components = findMatchingComponents(location)
    return renderNestedComponents(components, { location })
  }
}

export default Router
