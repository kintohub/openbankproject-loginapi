/**
 * Config
 */
require('dotenv').config();

/**
 * Detect env
 */

const env = process.env.NODE_ENV || 'dev';

/**
 * Set correct config
 */

const config = require(`./${env}`);

/**
 * Helpers
 */
config.env      = env;
config.prod     = env === 'prod';
config.dev      = env === 'dev';
config.test     = env === 'test';

config.secrets = {
    session:            process.env.SESSION_SECRET              || 'local session',
    token:              process.env.TOKEN_SECRET                || 'local token',
    verifyEmailToken:   process.env.VERIFY_EMAIL_TOKEN_SECRET   || 'local email_verify_token',
    inviteEmailToken:   process.env.INVITE_EMAIL_TOKEN_SECRET   || 'local email_invite_token',
    resetPasswordToken: process.env.RESET_PASSWORD_TOKEN_SECRET || 'local pwd_reset_token',
    removeEmailToken:   process.env.REMOVE_EMAIL_TOKEN_SECRET   || 'local email_remove_token',
};

config.consumerKey = process.env.CONSUMER_KEY;
config.consumerSecret = process.env.CONSUMER_SECRET;

config.baseApiUrl = process.env.BASE_API_URL;

config.expireTimes = {
    // in milliseconds
    token: process.env.TOKEN_EXPIRE_TIME || 7 * 24 * 60 * 60 * 1000,
};

/**
 * Expose
 */
exports = module.exports = config;
