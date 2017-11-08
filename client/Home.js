import React from 'react'
import contentHTML from './Home.md'

const Home = () => (
  <div className="wrapper" dangerouslySetInnerHTML={{ __html: contentHTML }} />
)

export default Home
