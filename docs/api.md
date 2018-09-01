# Authentication

Some API methods require an authentication token. This token is a [JSON web token](https://en.wikipedia.org/wiki/JSON_Web_Token) that contains a list of "scopes" (i.e. permissions).

Once you obtain an API token ([see below](#post-api-auth)) you simply include it in the `Authorization` header of your request as a base-64 encoded string, i.e.

```
Authorization: base64(token)
```

### GET /api/publicKey

The [public key](https://en.wikipedia.org/wiki/Public-key_cryptography) unpkg uses to encrypt authentication tokens, as JSON. You can also find the key as plain text [on GitHub](https://github.com/unpkg/unpkg.com/blob/master/secret_key.pub).

This can be useful to verify a token was issued by unpkg.

Required scope: none

Query parameters: none

Example:

```log
> curl "https://unpkg.com/api/publicKey"
{
  "publicKey": "..."
}
```

### POST /api/auth

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
> curl -X POST "https://unpkg.com/api/auth"
{
  "token": "..."
}
```

Please reach out to @mjackson if you need a token with additional scopes.

### GET /api/auth

Verifies and returns the payload contained in the given auth token.

Required scope: none

Query parameters: none

Example:

```log
> curl -H "Authorization: $BASE_64_ENCODED_TOKEN" "https://unpkg.com/api/auth"
{
  "jti": "...",
  "iss": "https://unpkg.com",
  "iat": ...,
  "scopes": { ... }
}
```

# Blacklist

To protect unpkg users and prevent abuse, unpkg manages a blacklist of npm packages that are known to contain harmful code.

### GET /api/blacklist

Returns a list of all packages that are currently blacklisted.

Required scope: `blacklist.read`

Query parameters: none

Example:

```log
> curl -H "Authorization: $BASE_64_ENCODED_TOKEN" "https://unpkg.com/api/blacklist"
{
  "blacklist": [ ... ]
}
```

### POST /api/blacklist

Adds a package to the blacklist.

Required scope: `blacklist.add`

Body parameters:

* `packageName` - The package to add to the blacklist (required)

Example:

```log
> curl -H "Authorization: $BASE_64_ENCODED_TOKEN" -d '{"packageName":"bad-package"}' "https://unpkg.com/api/blacklist"
{
  "ok": true
}
```

### DELETE /api/blacklist

Removes a package from the blacklist.

Required scope: `blacklist.remove`

Body parameters:

* `packageName` - The package to remove from the blacklist (required)

Example:

```log
> curl -X DELETE -H "Authorization: $BASE_64_ENCODED_TOKEN" -d '{"packageName":"bad-package"}' "https://unpkg.com/api/blacklist"
{
  "ok": true
}
```

# Stats

### GET /api/stats

TODO
