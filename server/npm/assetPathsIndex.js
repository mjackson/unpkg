/**
 * A hand-built index of paths in npm packages that use globals. The index is
 * not meant to contain *all* the global paths that a given package publishes,
 * but rather those that are probably most useful for someone who wants to put
 * a library on a page quickly in development.
 *
 * Each entry in the index is keyed by package name and contains a list of
 * [ versionRange, ...paths ] for that package. The list is traversed in order,
 * so version ranges that come sooner will match before those that come later.
 * The range `null` is a catch-all.
 */
module.exports = {
  angular: [['>=1.2.27', '/angular.min.js'], [null, '/lib/angular.min.js']],

  'angular-animate': [[null, '/angular-animate.min.js']],

  'angular-cookies': [[null, '/angular-cookies.min.js']],

  'angular-resource': [[null, '/angular-resource.min.js']],

  'angular-sanitize': [[null, '/angular-sanitize.min.js']],

  'angular-ui-bootstrap': [[null, '/dist/ui-bootstrap.js']],

  'animate.css': [[null, '/animate.min.css']],

  'babel-standalone': [[null, '/babel.min.js']],

  backbone: [[null, '/backbone-min.js']],

  bootstrap: [
    [null, '/dist/css/bootstrap.min.css', '/dist/js/bootstrap.min.js']
  ],

  'bootstrap-sass': [[null, '/assets/javascripts/bootstrap.min.js']],

  bulma: [[null, '/css/bulma.css']],

  'core.js': [[null, '/dist/core.min.js']],

  'create-react-class': [[null, '/create-react-class.min.js']],

  d3: [[null, '/build/d3.min.js']],

  'ember-source': [[null, '/dist/ember.min.js']],

  'foundation-sites': [
    [null, '/dist/css/foundation.min.css', '/dist/js/foundation.min.js']
  ],

  gsap: [[null, '/TweenMax.js']],

  handlebars: [[null, '/dist/handlebars.min.js']],

  jquery: [[null, '/dist/jquery.min.js']],

  fastclick: [[null, '/lib/fastclick.js']],

  lodash: [['<3', '/dist/lodash.min.js'], [null, '/lodash.min.js']],

  'masonry-layout': [[null, '/dist/masonry.pkgd.min.js']],

  'materialize-css': [[null, '/dist/css/materialize.min.css']],

  'ngx-bootstrap': [[null, '/bundles/ngx-bootstrap.umd.js']],

  react: [
    ['>=16.0.0-alpha.7', '/umd/react.production.min.js'],
    [null, '/dist/react.min.js']
  ],

  'react-bootstrap': [[null, '/dist/react-bootstrap.min.js']],

  'react-dom': [
    ['>=16.0.0-alpha.7', '/umd/react-dom.production.min.js'],
    [null, '/dist/react-dom.min.js']
  ],

  'react-router': [
    ['>=4.0.0', '/umd/react-router.min.js'],
    [null, '/umd/ReactRouter.min.js']
  ],

  redux: [[null, '/dist/redux.min.js']],

  'redux-saga': [[null, '/dist/redux-saga.min.js']],

  'redux-thunk': [[null, '/dist/redux-thunk.min.js']],

  snapsvg: [[null, '/snap.svg-min.js']],

  systemjs: [[null, '/dist/system.js']],

  three: [['<=0.77.0', '/three.min.js'], [null, '/build/three.min.js']],

  underscore: [[null, '/underscore-min.js']],

  vue: [[null, '/dist/vue.min.js']],

  zepto: [[null, '/dist/zepto.min.js']],

  zingchart: [[null, '/client/zingchart.min.js']],

  'zone.js': [[null, '/dist/zone.js']]
}
