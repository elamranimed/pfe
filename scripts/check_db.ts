import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  const users = await prisma.user.findMany();
  console.log('Users:', users.map(u => ({ login: u.login, role: u.role, password: u.password })));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
