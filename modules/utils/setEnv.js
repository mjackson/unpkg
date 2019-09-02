const argv = require('minimist')(process.argv.slice(2));

const { _, ...flags } = argv;

Object.keys(flags || {}).map(key => {
	const value = flags[key];
	process.env[key] = value;
});

process.env.ENABLE_CLOUDFLARE =
	flags.ENABLE_CLOUDFLARE === 'true' ? true : false;

export default function() {
	return _;
}
