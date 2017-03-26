import React from 'react'
import { HashRouter as Router, Switch, Route } from 'react-router-dom'
import Layout from './Layout'
import About from './About'
import Stats from './Stats'
import Home from './Home'

const App = () => (
  <Router>
    <Layout>
      <Switch>
        <Route path="/stats" component={Stats}/>
        <Route path="/about" component={About}/>
        <Route path="/" component={Home}/>
      </Switch>
    </Layout>
  </Router>
)

export default App
