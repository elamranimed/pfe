import 'dotenv/config'
import prisma from './services/prisma'
import { AuthService } from './services/AuthService'

async function createResponsableUser() {
  try {
    const login = 'respo1'
    const password = 'respo123'
    
    // Vérifier si cet utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { login },
    })

    const hashedPassword = await AuthService.hashPassword(password)

    if (existingUser) {
      console.log(`✅ L'utilisateur ${login} existe déjà. Mise à jour du mot de passe et rôle...`)
      await prisma.user.update({
        where: { login },
        data: { password: hashedPassword, role: 'responsable' }
      })
      console.log(`✅ Mot de passe mis à jour avec succès!`)
      console.log('Login:', login)
      console.log('Mot de passe:', password)
      return
    }

    // Création du responsable
    const responsable = await prisma.user.create({
      data: {
        nom: 'Responsable',
        prenom: 'Test',
        role: 'responsable',
        email: 'respo1@example.com',
        login: login,
        password: hashedPassword,
      },
    })

    console.log('✅ Utilisateur responsable créé avec succès!')
    console.log('Login:', responsable.login)
    console.log('Mot de passe:', password)
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createResponsableUser()
