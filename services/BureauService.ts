import prisma from './prisma'
import type { Prisma } from '../lib/generated/prisma/client'

export const BureauService = {
  create:   async (data: Prisma.BureauCreateInput) => prisma.bureau.create({ data }),
  findById: async (id: number) => prisma.bureau.findUnique({ where: { id_bureau: id } }),
  findAll:  async () => prisma.bureau.findMany(),
  update:   async (id: number, data: Prisma.BureauUpdateInput) => prisma.bureau.update({ where: { id_bureau: id }, data }),
  delete:   async (id: number) => prisma.bureau.delete({ where: { id_bureau: id } }),

  addUser: async (bureauId: number, userId: number) => {
    return prisma.bureau.update({
      where: { id_bureau: bureauId },
      data: { users: { connect: { id_user: userId } } } as Prisma.BureauUpdateInput,
    })
  },
}

export default BureauService