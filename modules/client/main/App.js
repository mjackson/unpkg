import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Link, withRouter } from 'react-router-dom';
import { Motion, spring } from 'react-motion';

import WindowSize from './WindowSize';
import About from './About';
import Stats from './Stats';
import Home from './Home';

const styles = {
  title: {
    margin: 0,
    textTransform: 'uppercase',
    textAlign: 'center',
    fontSize: '5em'
  },
  nav: {
    margin: '0 0 3em'
  },
  navList: {
    margin: 0,
    padding: 0,
    display: 'flex',
    justifyContent: 'center'
  },
  navListItem: {
    flexBasis: 'auto',
    listStyleType: 'none',
    display: 'inline-block',
    fontSize: '1.1em',
    margin: '0 10px'
  },
  navLink: {
    textDecoration: 'none',
    color: 'black'
  },
  navUnderline: {
    height: 4,
    backgroundColor: 'black',
    position: 'absolute',
    left: 0
  }
};

class Layout extends React.Component {
  state = {
    underlineLeft: 0,
    underlineWidth: 0,
    useSpring: false,
    stats: null
  };

  adjustUnderline = (useSpring = false) => {
    let itemIndex;
    switch (this.props.location.pathname) {
      case '/stats':
        itemIndex = 1;
        break;
      case '/about':
        itemIndex = 2;
        break;
      case '/':
      default:
        itemIndex = 0;
    }

    const itemNodes = this.listNode.querySelectorAll('li');
    const currentNode = itemNodes[itemIndex];

    this.setState({
      underlineLeft: currentNode.offsetLeft,
      underlineWidth: currentNode.offsetWidth,
      useSpring
    });
  };

  componentDidMount() {
    this.adjustUnderline();

    fetch('/api/stats?period=last-month')
      .then(res => res.json())
      .then(stats => this.setState({ stats }));

    if (window.localStorage) {
      const savedStats = window.localStorage.savedStats;

      if (savedStats) this.setState({ stats: JSON.parse(savedStats) });

      window.onbeforeunload = () => {
        localStorage.savedStats = JSON.stringify(this.state.stats);
      };
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.adjustUnderline(true);
    }
  }

  render() {
    const { underlineLeft, underlineWidth, useSpring } = this.state;

    const style = {
      left: useSpring
        ? spring(underlineLeft, { stiffness: 220 })
        : underlineLeft,
      width: useSpring ? spring(underlineWidth) : underlineWidth
    };

    return (
      <div className="layout">
        <WindowSize onChange={this.adjustUnderline} />

        <div className="wrapper">
          <header>
            <h1 style={styles.title}>unpkg</h1>
            <nav style={styles.nav}>
              <ol style={styles.navList} ref={node => (this.listNode = node)}>
                <li style={styles.navListItem}>
                  <Link to="/" style={styles.navLink}>
                    Home
                  </Link>
                </li>
                <li style={styles.navListItem}>
                  <Link to="/stats" style={styles.navLink}>
                    Stats
                  </Link>
                </li>
                <li style={styles.navListItem}>
                  <Link to="/about" style={styles.navLink}>
                    About
                  </Link>
                </li>
              </ol>
              <Motion
                defaultStyle={{ left: underlineLeft, width: underlineWidth }}
                style={style}
                children={style => (
                  <div
                    style={{
                      ...styles.navUnderline,
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
    );
  }
}

if (process.env.NODE_ENV !== 'production') {
  Layout.propTypes = {
    location: PropTypes.object,
    children: PropTypes.node
  };
}

export default withRouter(Layout);
