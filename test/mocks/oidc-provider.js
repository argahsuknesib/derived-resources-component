class OidcProvider {
  use() {}
}

class Check {
  constructor() {}
}

class Prompt {
  constructor() {
    this.checks = { add() {} };
  }
}

const interactionPolicy = {
  Check,
  Prompt,
  base: () => ({
    add() {},
    get: () => ({ checks: { add() {} }}),
  }),
};

module.exports = OidcProvider;
module.exports.default = OidcProvider;
module.exports.interactionPolicy = interactionPolicy;
module.exports.errors = {};
