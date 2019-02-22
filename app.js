/**
 * API entrypoint
 */

/**
 * Module dependencies
 */

import express          from 'express';
import { createServer } from 'http';

import routes           from './app/routes';
import { env, port }    from './app/configs/env';

import expressConfig    from './app/configs/runtime/express';
import loggerConfig, {logger}     from './app/configs/runtime/logger';

exports = module.exports = (async function() {
    /**
     * Init server
     */

    const app =
        await  expressConfig(
            await loggerConfig(
                await express()
        )
    );

    /**
     * Start server
     */

    const server = await createServer(app);

    app.use('/', routes);

    process.on('exit', function () {
        logger.info('About to exit.');
        server.closesrv();
    });

    server.closesrv = (done = () => {}) => {
        return new Promise((res,rej) => {
            logger.info('killing server.');
            connection.close(false, ()=> {
                logger.info('connection killed.');
            }, rej);
            return server.close(()=>done() && res());
        })

        return true;
    };

    return server.listen(port, () => {
        logger.info(`${env} server v-04 is listening on port ${port}`);
    });
})()



