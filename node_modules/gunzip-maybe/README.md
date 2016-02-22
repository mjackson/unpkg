# gunzip-maybe

Transform stream that gunzips its input if it is gzipped and just echoes it if not.

```
npm install gunzip-maybe
```

[![build status](http://img.shields.io/travis/mafintosh/gunzip-maybe.svg?style=flat)](http://travis-ci.org/mafintosh/gunzip-maybe)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

## Usage

Simply pipe a gzipped (or not gzipped) stream to `gunzip()` and read the unzipped content.

``` js
// this will gunzip gzippedStream
gzippedStream.pipe(gunzip()).pipe(process.stdout);

// this will just echo plainTextStream
plainTextStream.pipe(gunzip()).pipe(process.stdout);
```

## CLI usage

```
npm install -g gunzip-maybe
gunzip-maybe --help # will print out usage
```


## License

MIT
