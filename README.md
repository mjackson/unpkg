# unpkg

[unpkg](https://unpkg.com) is a fast, global CDN for everything on [npm](https://www.npmjs.com/).

The project is sponsored by [Cloudflare](https://cloudflare.com) and [Heroku](https://heroku.com).

## Development

The website was built using [create-react-app](https://github.com/facebookincubator/create-react-app). This is the app you see when you run `yarn start`. However, none of the package links will work.

To start the backend, use `yarn run server`. This will start the backend so the website (which is really just a static HTML file) can serve as a proxy for package requests.
