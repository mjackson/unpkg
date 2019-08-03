function noop() {}

export const debug = process.env.DEBUG ? console.log.bind(console) : noop;
export const info = console.log.bind(console);
export const error = console.error.bind(console);
