const next = require('eslint-config-next');

module.exports = [
  // Skip generated Prisma artifacts.
  { ignores: ['**/lib/generated/prisma/**'] },
  // Next.js base configs.
  ...next,
  // Relax a few noisy rules.
  {
    linterOptions: {
      // Don't warn about unused eslint-disable comments in generated files.
      reportUnusedDisableDirectives: false,
    },
    rules: {
      'react/no-unescaped-entities': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
    },
  },
];
