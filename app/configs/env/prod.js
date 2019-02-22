/**
 * Prod
 */
const mongoProdAlias        = process.env.PYC_MONGO_PROD_ALIAS           || 'mongo-cluster';
const mongoDbNameProdAlias  = process.env.PYC_MONGO_DB_NAME_PROD_ALIAS   || 'paycoDbProd';

module.exports = {
    port: process.env.PORT || 5000,
};

