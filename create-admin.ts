import 'dotenv/config'  
import prisma from './services/prisma'
import { AuthService } from './services/AuthService'

async function createAdminUser() {
  try {
    // Vérifier si un admin existe déjà
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' },
    })

    if (existingAdmin) {
      console.log('✅ Un utilisateur admin existe déjà:', existingAdmin.login)
      return
    }

    // Créer un nouvel admin
    const hashedPassword = await AuthService.hashPassword('admin123')
    
    const admin = await prisma.user.create({
      data: {
        nom: 'Admin',
        prenom: 'System',
        role: 'admin',
        email: 'admin@example.com',
        login: 'admin',
        password: hashedPassword,
      },
    })

    console.log('✅ Utilisateur admin créé avec succès!')
    console.log('Login:', admin.login)
    console.log('Mot de passe:', 'admin123')
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()