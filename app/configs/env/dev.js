/**
 * Development
 */

const mongoDevAlias     = process.env.PYC_MONGO_DEV_ALIAS      || 'localhost';
const mongoDevDbAlias   = process.env.PYC_MONGO_DEV_DB_ALIAS   || 'paycoDbDev';

module.exports = {
    port: process.env.PORT || 5000,
};

