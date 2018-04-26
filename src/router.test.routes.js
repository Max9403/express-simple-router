let testFunctions = {
    GET(req, res) {
        res.send({received: true})
    },
    POST(req, res) {
        res.send(req.body)
    },
};

module.exports = Object.assign({
    GET(req, res) {
        res.send({received: true})
    },
    POST(req, res) {
        res.send(req.body)
    },
    a: {
        dynamic: {
            '*': {
                GET(req, res) {
                    let path = req.path.toLowerCase().split('/').filter(function (n) {
                        return n;
                    }).splice(-1)[0];
                    res.send({path});
                },

                POST(req, res) {
                    let path = req.path.toLowerCase().split('/').filter(function (n) {
                        return n;
                    }).splice(-1)[0];
                    res.send(Object.assign({path}, req.body));
                }
            }
        },
        deep: {
            url: {
                in: {
                    the: {
                        website: testFunctions
                    }
                }
            }
        }
    }
}, testFunctions);