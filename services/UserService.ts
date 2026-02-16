import prisma from './prisma'
import type { Prisma } from '../lib/generated/prisma/client'
import { Role } from '../models/types'

export const UserService = {
	create: async (data: Prisma.UserCreateInput) => {
		return prisma.user.create({ data })
	},

	findByLogin: async (login: string) => {
		return prisma.user.findUnique({ where: { login } })
	},

	findById: async (id: number) => {
		return prisma.user.findUnique({ where: { id_user: id } })
	},

	findAll: async () => {
		return prisma.user.findMany()
	},

	update: async (id: number, data: Prisma.UserUpdateInput) => {
		return prisma.user.update({ where: { id_user: id }, data })
	},

	delete: async (id: number) => {
		return prisma.user.delete({ where: { id_user: id } })
	},

	envoyerDemande: async (userId: number, demandeData: Prisma.DemandeCreateInput) => {
		return prisma.demande.create({ data: { ...demandeData, user: { connect: { id_user: userId } } } })
	},

	ajouterBureau: async (userId: number, bureauId: number) => {
		return prisma.user.update({ where: { id_user: userId }, data: { bureaux: { connect: { id_bureau: bureauId } } } })
	},
}

export default UserService
