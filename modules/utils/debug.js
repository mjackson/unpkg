const debug = process.env.DEBUG ? console.log.bind(console) : () => {};
export default debug;
