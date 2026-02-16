import prisma from './prisma'
import type { Prisma } from '../lib/generated/prisma/client'

export const DemandeService = {
	create: async (data: Prisma.DemandeCreateInput) => prisma.demande.create({ data }),
	findById: async (id: number) => prisma.demande.findUnique({ where: { id_demande: id } }),
	findAll: async () => prisma.demande.findMany(),
	update: async (id: number, data: Prisma.DemandeUpdateInput) => prisma.demande.update({ where: { id_demande: id }, data }),
	delete: async (id: number) => prisma.demande.delete({ where: { id_demande: id } }),

	findByUser: async (userId: number) => prisma.demande.findMany({ where: { userId } }),
	findByBureau: async (bureauId: number) => prisma.demande.findMany({ where: { bureauId } }),
}

export default DemandeService
