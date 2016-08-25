npmcdn is an [open source](https://github.com/mjackson/npmcdn) project built by me, [Michael Jackson](https://twitter.com/mjackson). I built it because, as an npm package author, it felt tedious for me to use existing, git-based CDNs to make my open source work available via CDN. Development was sponsored by my company, [React Training](https://reactjs-training.com).

<div class="about-logos">
  <div class="about-logo">
    <a href="https://reactjs-training.com"><img src="../ReactTrainingLogo.png"></a>
  </div>
</div>

We'd love to talk to you more about training your team on [React](https://facebook.github.io/react/). Please [get in touch](mailto:hello@reactjs-training.com) if interested.

### Sponsors

The fast, global infrastructure that powers npmcdn is graciously provided by [CloudFlare](https://www.cloudflare.com) and [Heroku](https://www.heroku.com).

<div class="about-logos">
  <div class="about-logo">
    <a href="https://www.cloudflare.com"><img src="../CloudFlareLogo.png"></a>
  </div>
  <div class="about-logo">
    <a href="https://www.heroku.com"><img src="../HerokuLogo.png"></a>
  </div>
</div>

These sponsors provide some of the most robust, reliable infrastructure available today and I'm happy to be able to partner with them on npmcdn.

### Cache Behavior

The CDN caches all files based on their permanent URL, which includes the npm package version. This works because npm does not allow package authors to overwrite a package that has already been published with a different one at the same version number.

URLs that do not specify a package version number redirect to one that does. This is the `latest` version when no version is specified, or the `maxSatisfying` version when a [semver version](https://github.com/npm/node-semver) is given. Redirects are cached for 5 minutes.

Browsers are instructed (via the `Cache-Control` header) to cache assets for 4 hours.

### Support

npmcdn is a free, best-effort service and cannot provide any uptime or support guarantees.

I do my best to keep it running, but sometimes things go wrong. Sometimes there are network or provider issues outside my control. Sometimes abusive traffic temporarily affects response times. Sometimes I break things by doing something dumb, but I try not to.

The goal of npmcdn is to provide a hassle-free CDN for npm package authors. It's also a great resource for people creating demos and instructional material. However, if you rely on it to serve files that are crucial to your business, you should probably pay for a host with well-supported infrastructure and uptime guarantees.

npmcdn is not affiliated with or supported by npm, Inc. in any way. Please do not contact npm for help with npmcdn.

### Abuse

npmcdn blacklists some packages to prevent abuse. If you find a malicious package on npm, please take a moment to add it to [our blacklist](https://github.com/mjackson/npmcdn/blob/master/modules/PackageBlacklist.json)!

### Feedback

If you think this is useful, I'd love to hear from you. Please reach out to [@mjackson](https://twitter.com/mjackson) with any questions/concerns.
