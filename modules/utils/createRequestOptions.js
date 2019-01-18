function createRequestOptions(options, npmrc) {
    
    // if there is an npmrc token, append it
    // as bearer authentication header to request options
    if (npmrc) {
        options.headers = {
            Authorization: `Bearer ${npmrc}`
        }
    }
    return options;
}

module.exports = createRequestOptions;