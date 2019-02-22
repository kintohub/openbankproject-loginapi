/**
* Express configuration
*/

'use strict';

import cors             from 'cors';
import bodyParser       from 'body-parser';

const { get_ip } = require('ipware')();

import compression   from 'compression';
import boolParser    from 'express-query-boolean';

import { logger }   from '~/app/configs/runtime/logger';
import config       from '~/app/configs/env';

export default (app) => {

    app.use(compression());

    // Parsers for POST data
    app.use(bodyParser.json({ limit: config.maxTotalUploadSize }));
    app.use(bodyParser.urlencoded({ limit: config.maxTotalUploadSize, extended: true }));
    app.use(boolParser());

    const corsOptionsDelegate = function (req, callback) {
        const { clientIp } = get_ip(req);
        logger.info(`Incoming connection _in: ${clientIp}`);
        logger.info(`METHOD: ${req.method}`);
        if (req.body) {
            logger.info("And there is a body");
        }
        return callback(null, true);
      };

    if (config.env !== 'test') {
        app.use('*', cors(corsOptionsDelegate));
    }

  return app;
};
