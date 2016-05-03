var config = {
    "ckan" : {
        //"host" : "http://192.168.2.138:5000"
        "host" : window.location.host.indexOf(':8080') > -1 ? 'http://192.168.1.23:5000' : window.location.protocol+'//'+window.location.host
    }
}

module.exports = config;
