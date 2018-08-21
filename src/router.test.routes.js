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
	params: {
		'*': {
			_PARAM: "test",
			GET(req, res) {
				res.send({param: req.locals.params.test});
			}
		}
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
    },
	middleware(req, res, next) {
		res.send({middleware: true});
		next();
	},
	stack: {
		valid: {
			GET: [
				(req, res, next) => {
					req.middleware = { array: true, middleware: true};
					next();
				},
				(req, res) => {
					res.send(req.middleware);
				}
			]
		},
		invalid: {
			throw: {
				GET: [
					(req, res, next) => {
						throw new Exception("Test exception handler");						
					}
				]
			},			
			pass: {
				GET: [
					(req, res, next) => {
						next(new Error("Test exception handler"));
					}
				]
			}

		}
	}
}, testFunctions);