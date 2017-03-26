import React from 'react'
import contentHTML from './Home.md'

class Home extends React.Component {
  render() {
    return (
      <div className="wrapper" dangerouslySetInnerHTML={{ __html: contentHTML }}/>
    )
  }
}

export default Home
