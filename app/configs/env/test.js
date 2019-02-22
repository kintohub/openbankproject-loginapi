/**
 * Test
 */
const mongoTestAlias     = process.env.PYC_MONGO_TEST_ALIAS      || 'mongo';
const mongoTestDbAlias   = process.env.PYC_MONGO_TEST_DB_ALIAS   || 'paycoDbTest';

module.exports = {
    port: process.env.PORT || 5000,
};

