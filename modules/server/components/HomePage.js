import React, { PropTypes } from 'react'

const assetType = PropTypes.string

const HomePage = React.createClass({
  propTypes: {
    styles: PropTypes.arrayOf(assetType),
    scripts: PropTypes.arrayOf(assetType)
  },

  getDefaultProps() {
    return {
      styles: [],
      scripts: []
    }
  },

  render() {
    const { styles, scripts } = this.props

    return (
      <html>
        <head>
          <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
          <meta name="viewport" content="user-scalable=no,initial-scale=1.0,maximum-scale=1.0,width=device-width"/>
          <meta name="timestamp" content={(new Date).toISOString()}/>
          <title>npmcdn</title>
          {styles.map(style => <link key={style} rel="stylesheet" href={style}/>)}
        </head>
        <body>
          <div id="app"/>
          {scripts.map(script => <script key={script} src={script}/>)}
        </body>
      </html>
    )
  }
})

export default HomePage
