# Authentication

Some API methods require an authentication token. This token is a [JSON web token](https://en.wikipedia.org/wiki/JSON_Web_Token) that contains a list of "scopes" (i.e. permissions).

Once you obtain an API token (see below) you can pass it to the server in one of two ways:

* For GET/HEAD requests, use the `?token` query parameter
* For all other requests, use the `{token}` parameter as part of the JSON in the request body

### POST /\_auth

Creates and returns a new auth token. By default, auth tokens have the following scopes:

```json
{
  "blacklist": {
    "read": true
  }
}
```

Required scope: none

Body parameters: none

Example:

```log
> curl -X POST "https://unpkg.com/_auth"
{
  "token": "eyJhbGciOiJS..."
}
```

### GET /\_auth

Verifies and returns the payload contained in the given auth token.

Required scope: none

Query parameters:

* `token` - The auth token to verify and decode

Example:

```log
> curl "https://unpkg.com/_auth?token=$TOKEN"
{
  "jti": "...",
  "iss": "https://unpkg.com",
  "iat": ...,
  "scopes": { ... }
}
```

### GET /\_publicKey

The [public key](https://en.wikipedia.org/wiki/Public-key_cryptography) unpkg uses to encrypt authentication tokens, as JSON. You can also find the key as plain text [on GitHub](https://github.com/unpkg/unpkg/blob/master/public.key).

This can be useful to verify a token was issued by unpkg.

Required scope: none

Query parameters: none

Example:

```log
> curl "https://unpkg.com/_publicKey"
{
  "publicKey": "..."
}
```

# Blacklist

To protect unpkg users and prevent abuse, unpkg manages a blacklist of npm packages that are known to contain harmful code.

### GET /\_blacklist

Returns a list of all packages that are currently blacklisted.

Required scope: `blacklist.read`

Query parameters: none

Example:

```log
> curl "https://unpkg.com/_blacklist?token=$TOKEN"
{
  "blacklist": [ ... ]
}
```

### POST /\_blacklist

Adds a package to the blacklist.

Required scope: `blacklist.add`

Body parameters:

* `token` - The auth token
* `packageName` - The package to add to the blacklist

Example:

```log
> curl https://unpkg.com/_blacklist -d '{"token": "$TOKEN", "packageName": "bad-package"}'
{
  "ok": true
}
```

### DELETE /\_blacklist/:packageName

Removes a package from the blacklist.

Required scope: `blacklist.remove`

Body parameters:

* `token` - The auth token

Example:

```log
> curl -X DELETE https://unpkg.com/_blacklist/bad-package -d '{"token": "$TOKEN"}'
{
  "ok": true
}
```

# Stats

### GET /\_stats

TODO
