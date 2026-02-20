const next = require('eslint-config-next');

module.exports = [
  
  { ignores: ['**/lib/generated/prisma/**'] },
  
  ...next,
  
  {
    linterOptions: {
      
      reportUnusedDisableDirectives: false,
    },
    rules: {
      'react/no-unescaped-entities': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
    },
  },
];
