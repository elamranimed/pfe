import prisma from './prisma'
import type { Prisma } from '../app/lib/generated/prisma/client'

export const PaiementService = {
	create: async (data: Prisma.PaiementCreateInput) => prisma.paiement.create({ data }),
	findById: async (id: number) => prisma.paiement.findUnique({ where: { id_paiement: id } }),
	findAll: async () => prisma.paiement.findMany(),
	update: async (id: number, data: Prisma.PaiementUpdateInput) => prisma.paiement.update({ where: { id_paiement: id }, data }),
	delete: async (id: number) => prisma.paiement.delete({ where: { id_paiement: id } }),

	findByUser: async (userId: number) => prisma.paiement.findMany({ where: { userId } }),
	findByBureau: async (bureauId: number) => prisma.paiement.findMany({ where: { bureauId } }),
}

export default PaiementService
