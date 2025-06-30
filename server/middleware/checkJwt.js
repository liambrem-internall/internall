const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");

const authConfig = {
  domain: process.env.AUTH_CONFIG_DOMAIN,
  audience: process.env.AUTH_CONFIG_AUDIENCE,
};

console.log("HERE", authConfig.domain, authConfig.audience);

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ["RS256"],
});

module.exports = checkJwt;