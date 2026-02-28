import prisma from './prisma'
import type { Prisma } from '../lib/generated/prisma/client'

export const PaiementService = {
  create: async (data: Prisma.PaiementCreateInput) =>
    prisma.paiement.create({ data }),

  findById: async (id: number) =>
    prisma.paiement.findUnique({ where: { id_paiement: id } }),

  findAll: async () => prisma.paiement.findMany(),

  update: async (id: number, data: Prisma.PaiementUpdateInput) =>
    prisma.paiement.update({ where: { id_paiement: id }, data }),

  delete: async (id: number) =>
    prisma.paiement.delete({ where: { id_paiement: id } }),

  findByBureau: async (id_bureau: number) =>
    prisma.paiement.findMany({ where: { id_bureau } }),
}

export default PaiementService
