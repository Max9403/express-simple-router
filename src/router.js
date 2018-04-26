const debug = require('debug')("express-simple-router");
const url = require('url');
const isFunction = require('lodash.isfunction');
const isError = require('lodash.iserror');
const isEmpty = require('lodash.isempty');

function printRoutes(routes, indent) {
    indent = indent || '';
    let entries = "";
    Object.entries(routes).forEach(function (kv) {
        let [key, value] = kv;
        if (key === key.toUpperCase() && key !== "*") {
            entries += '\n' + indent + key;
        } else {
            entries += '\n' + indent + '/' + key;
            if (!isFunction(value)) {
                entries += printRoutes(value, indent + '    ')
            }
        }

    });
    return entries;
}

module.exports = function (routes) {
    if (!routes) {
        throw new Error("Invalid routes");
    }
    debug(printRoutes(routes));
    let router = function (req, res, next) {
        let pathing = req.path.toLowerCase().split('/').filter(function (n) {
            return n;
        });
        let route = this.routes;

        while (pathing && !isFunction(route) && !Array.isArray(route) && pathing.length > 0) {
            let part = pathing[0];

            if (route[part] || route['*']) {
                route = route[part] || route['*'];
            } else {
                if (!isFunction(route)) {
                    route = undefined
                }
                break;
            }

            pathing.shift();
        }

        if (!route) {
            return next();
        }

        let backup;

        if (isFunction(route)) {
            backup = req.url;
            let silly = url.parse(req.url);
            silly.pathname = '/' + pathing.join('/');
            req.url = url.format(silly);
            route(req, res, function () {
                req.url = backup;
                next.apply(this, arguments);
            });
        } else if (isFunction(route[req.method.toUpperCase()])) {
            route = route[req.method.toUpperCase()];
            route(req, res, next);
        } else if (Array.isArray(route[req.method.toUpperCase()]) && !isEmpty(route[req.method.toUpperCase()])) {
            let wares = route[req.method.toUpperCase()];

            let walker = function (index) {
                if (isFunction(wares[index])) {
                    try {
                        wares[index](req, res, function (e) {
                            if (isError(e)) {
                                return next(e)
                            }
                            walker(index + 1)
                        })
                    } catch (e) {
                        next(e)
                    }
                }
            };

            walker(0)
        } else {
            return next();
        }
    };

    let body = {
        routes: routes
    };

    router = router.bind(body);

    router.body = body;

    router.unless = require('express-unless');

    return router;
};