import 'dotenv/config'
import prisma from './services/prisma'
import { AuthService } from './services/AuthService'

async function createResponsableUser() {
  try {
    // Vérifier si un responsable existe déjà
    const existingResponsable = await prisma.user.findFirst({
      where: { role: 'responsable' },
    })

    if (existingResponsable) {
      console.log('✅ Un utilisateur responsable existe déjà:', existingResponsable.login)
      return
    }

    // Hash du mot de passe par défaut
    const hashedPassword = await AuthService.hashPassword('responsable123')

    // Création du responsable
    const responsable = await prisma.user.create({
      data: {
        nom: 'Responsable',
        prenom: 'System',
        role: 'responsable',
        email: 'responsable@example.com',
        login: 'responsable',
        password: hashedPassword,
      },
    })

    console.log('✅ Utilisateur responsable créé avec succès!')
    console.log('Login:', responsable.login)
    console.log('Mot de passe:', 'responsable123')
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createResponsableUser()
