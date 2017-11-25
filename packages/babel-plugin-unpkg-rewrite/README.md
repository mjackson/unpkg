A [Babel](http://babeljs.io/) plugin that rewrites bare ES module specifiers as
[unpkg](https://unpkg.com) URLs.

## input

```jsx
import React from "react"
import router from "@angular/router"
import map from "lodash.map"
import fs from "pn/fs"
import cupcakes from "./cupcakes"
import shoelaces from "/shoelaces"
import something from "//something.com/whatevs"
import something from "http://something.com/whatevs"
let ReactDOM = require("react-dom")
export React from "react"
export { Component } from "react"
export * from "react"
export var message = "hello"
```

## output

```jsx
import React from "https://unpkg.com/react@15.6.1?module"
import router from "https://unpkg.com/@angular/router@4.3.5?module"
import map from "https://unpkg.com/lodash.map@4.6.0?module"
import fs from "https://unpkg.com/pn@1.0.0/fs?module"
import cupcakes from "./cupcakes?module"
import shoelaces from "/shoelaces?module"
import something from "//something.com/whatevs"
import something from "http://something.com/whatevs"
let ReactDOM = require("react-dom")
export React from "https://unpkg.com/react@15.6.1?module"
export { Component } from "https://unpkg.com/react@15.6.1?module"
export * from "https://unpkg.com/react@15.6.1?module"
export var message = "hello"
```
