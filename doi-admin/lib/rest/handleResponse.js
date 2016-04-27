function handleResponse(callback) {
    return function(err, resp) {
        if( err ) {
            return callback({
                error : true,
                message : err
            });
        }
        
        if( !resp.body ) {
            return callback({
            error: true,
            message: 'Request Error',
            type : 'http',
            details: 'Server did not send a response'
            });
        }
        
        if( resp.body.error ) {
            return callback({
            error: true,
            message: 'Request Error',
            type : 'ckan',
            details: resp ? resp.body : ''
            });
        }

        if( resp.body.success && resp.body.result ) {
            callback(resp.body.result);
        } else {
            callback(resp.body);
        }
    }
}

module.exports = handleResponse;