import React from 'react'
import contentHTML from './About.md'

class About extends React.Component {
  render = () =>
    <div className="wrapper" dangerouslySetInnerHTML={{ __html: contentHTML }}/>
}

export default About
