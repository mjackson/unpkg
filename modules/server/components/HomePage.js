import React, { PropTypes } from 'react'

class HomePage extends React.Component {
  static propTypes = {
    styles: PropTypes.arrayOf(PropTypes.string),
    scripts: PropTypes.arrayOf(PropTypes.string),
    stats: PropTypes.object
  }

  static defaultProps = {
    styles: [],
    scripts: [],
    stats: {}
  }

  render = () => {
    const { styles, scripts, stats } = this.props

    return (
      <html>
        <head>
          <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
          <meta name="viewport" content="width=700,maximum-scale=1"/>
          <meta name="timestamp" content={(new Date).toISOString()}/>
          <title>npmcdn</title>
          {styles.map(style => <link key={style} rel="stylesheet" href={style}/>)}
          <script dangerouslySetInnerHTML={{ __html: `window.NPMCDN_STATS=${JSON.stringify(stats)}` }}/>
        </head>
        <body>
          <div id="app"/>
          {scripts.map(script => <script key={script} src={script}/>)}
        </body>
      </html>
    )
  }
}

export default HomePage
