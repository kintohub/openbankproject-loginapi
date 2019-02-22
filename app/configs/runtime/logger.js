import winston          from 'winston';
import rfs              from 'rotating-file-stream';
require('winston-daily-rotate-file');

const { colorize, combine, timestamp, label, splat, prettyPrint, printf } = winston.format;

import fs               from 'fs';
import path             from 'path';

import config       from '~/app/configs/env';

fs.mkdir('./logs', (err) => { /* no-op */ });

const logsRelativePath = '../../../logs';

let transports = [];
transports.push(new winston.transports.DailyRotateFile({
    name: 'file',
    datePattern: '.YYYY-MM-DD',
    filename: path.join(__dirname, logsRelativePath, 'log_file.log')
}), new winston.transports.Console({
    format: winston.format.simple()
}));

const myFormat = printf((info) => `${info.timestamp} ${info.level}: ${info.message}`);

export const logger = config.consoleLogsOnly ? console : winston.createLogger({
    format: combine(
        colorize({
            silly:      'magenta',
            verbose:    'cyan',
            debug:      'blue',
            error:      'red',
            data:       'grey',
            warn:       'yellow',
            info:       'green',
        }),
        timestamp(),
        splat(),
        prettyPrint(),
        myFormat
    ),
    transports
});

export default (app) => {
    const logDirectory = path.join(__dirname, logsRelativePath);

    // ensure log directory exists
    fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);


    function pad (num) {
        return (num > 9 ? '' : '0') + num;
    }

    function generator (time, index) {
        if (!time) {
 return 'requests.log';
}

        let month  = String(time.getFullYear()) + pad(time.getMonth() + 1);
        let day    = pad(time.getDate());
        let hour   = pad(time.getHours());
        let minute = pad(time.getMinutes());

        return `${month}/${month
            }${day}-${hour}${minute}-${index}-requests.log`;
    }

    // create a rotating write stream
    const accessLogStream = rfs(generator, {
      interval: '1d', // rotate daily
      path: logDirectory
    });

    return app;
};