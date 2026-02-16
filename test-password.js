const bcrypt = require('bcryptjs');

async function test() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Nouveau hash:', hash);
  
  // Test de comparaison
  const ok = await bcrypt.compare(password, hash);
  console.log('Comparaison réussie:', ok);
  
  // Test avec le hash existant
  const existingHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
  const ok2 = await bcrypt.compare(password, existingHash);
  console.log('Hash existant OK:', ok2);
}

test();