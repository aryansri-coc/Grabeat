import { prisma } from '../config/db';

export class TagRepository {
  static async findOrCreateMany(names: string[]) {
    if (!names || names.length === 0) return [];
    
    // Normalize tag names to lowercase or capitalized to avoid duplicates
    const cleanNames = names.map((name) => name.trim().replace(/\s+/g, ' '));

    return prisma.$transaction(
      cleanNames.map((name) =>
        prisma.tag.upsert({
          where: { name },
          update: {},
          create: { name },
        })
      )
    );
  }

  static async listAll() {
    return prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
