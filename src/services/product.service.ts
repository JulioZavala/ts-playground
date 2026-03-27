import { prisma } from "../lib/prisma";
import {
  productsCreateInput,
  productsUpdateInput,
} from "../generated/prisma/models";

export class ProductService {
  async getAll() {
    return await prisma.products.findMany({
      include: { categories: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async getById(id: number) {
    return await prisma.products.findUnique({
      where: { id },
      include: { categories: true },
    });
  }

  async create(data: productsCreateInput) {
    return await prisma.products.create({
      data,
      include: { categories: true },
    });
  }

  async update(id: number, data: productsUpdateInput) {
    return await prisma.products.update({
      where: { id },
      data,
      include: { categories: true },
    });
  }

  async destroy(id: number) {
    return await prisma.products.delete({ where: { id } });
  }
}