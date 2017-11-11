unpkg is an [open source](https://github.com/unpkg) project built and maintained by [Michael Jackson](https://twitter.com/mjackson).

### Sponsors

The fast, global infrastructure that powers unpkg is generously donated by [Cloudflare](https://www.cloudflare.com) and [Heroku](https://www.heroku.com).

<div class="about-logos">
  <div class="about-logo">
    <a href="https://www.cloudflare.com"><img src="./CloudflareLogo.png"></a>
  </div>
  <div class="about-logo">
    <a href="https://www.heroku.com"><img src="./HerokuLogo.png"></a>
  </div>
</div>

### Cache Behavior

The CDN caches all files based on their permanent URL, which includes the npm package version. This works because npm does not allow package authors to overwrite a package that has already been published with a different one at the same version number.

URLs that do not specify a package version number redirect to one that does. This is the `latest` version when no version is specified, or the `maxSatisfying` version when a [semver version](https://github.com/npm/node-semver) is given. Redirects are cached for 5 minutes.

Browsers are instructed (via the `Cache-Control` header) to cache assets for 4 hours.

### Support

unpkg is a free, best-effort service and cannot provide any uptime or support guarantees.

I do my best to keep it running, but sometimes things go wrong. Sometimes there are network or provider issues outside my control. Sometimes abusive traffic temporarily affects response times. Sometimes I break things by doing something dumb, but I try not to.

The goal of unpkg is to provide a hassle-free CDN for npm package authors. It's also a great resource for people creating demos and instructional material. However, if you rely on it to serve files that are crucial to your business, you should probably pay for a host with well-supported infrastructure and uptime guarantees.

unpkg is not affiliated with or supported by npm, Inc. in any way. Please do not contact npm for help with unpkg.

### Abuse

unpkg maintains of packages that are known to be malicious. If you find such a package on npm, please let us know!

### Feedback

If you think this is useful, I'd love to hear from you. Please reach out to [@mjackson](https://twitter.com/mjackson) with any questions/concerns.
