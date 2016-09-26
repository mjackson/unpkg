import React, { PropTypes } from 'react'

class HomePage extends React.Component {
  static propTypes = {
    webpackManifest: PropTypes.object,
    styles: PropTypes.arrayOf(PropTypes.string),
    scripts: PropTypes.arrayOf(PropTypes.string),
    stats: PropTypes.object
  }

  static defaultProps = {
    webpackManifest: {},
    styles: [],
    scripts: [],
    stats: {}
  }

  render() {
    const { webpackManifest, styles, scripts, stats } = this.props

    return (
      <html>
        <head>
          <meta charSet="utf-8"/>
          <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
          <meta name="viewport" content="width=700,maximum-scale=1"/>
          <meta name="timestamp" content={(new Date).toISOString()}/>
          <link rel="icon" href="/favicon.ico?v2"/>
          <title>unpkg</title>
          <script dangerouslySetInnerHTML={{ __html: "window.Promise || document.write('\\x3Cscript src=\"/es6-promise.min.js\">\\x3C/script>\\x3Cscript>ES6Promise.polyfill()\\x3C/script>')" }}/>
          <script dangerouslySetInnerHTML={{ __html: "window.fetch || document.write('\\x3Cscript src=\"/fetch.min.js\">\\x3C/script>')" }}/>
          <script dangerouslySetInnerHTML={{ __html: "window.webpackManifest = " + JSON.stringify(webpackManifest) }}/>
          <script dangerouslySetInnerHTML={{ __html: "window.cloudFlareStats = " + JSON.stringify(stats) }}/>
          {styles.map(s => <link rel="stylesheet" key={s} href={s}/>)}
        </head>
        <body>
          <div id="app"/>
          {scripts.map(s => <script key={s} src={s}/>)}
        </body>
      </html>
    )
  }
}

export default HomePage
