import { prisma } from "../lib/prisma";
import type { Roles } from "../types";

interface OrderItemInput {
  productId: number;
  quantity: number;
}

const orderInclude = {
  users: {
    select: {
      id: true,
      username: true,
      email: true,
    },
  },
  order_items: {
    include: { products: true },
  },
};

export class OrderService {
  async getAll(userId: number, rol: Roles) {
    const where =
      rol === "ADMIN" ? { deletedAt: null } : { userId, deletedAt: null };

    return await prisma.orders.findMany({
      where,
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  async getById(id: number, userId: number, rol: Roles) {
    const order = await prisma.orders.findUnique({
      where: { id },
      include: orderInclude,
    });

    if (!order || order.deletedAt !== null) {
      return null;
    }

    if (rol === "CUSTOMER" && order.userId !== userId) {
      return null;
    }

    return order;
  }

  async create(userId: number, items: OrderItemInput[]) {
    const products = await prisma.products.findMany({
      where: {
        id: { in: items.map((item) => item.productId) },
      },
    });

    let total = 0;

    for (let item of items) {
      const product = products.find((product) => product.id === item.productId);

      if (!product) {
        throw new Error(`Product ${item.productId} no existe.`);
      }

      total += Number(product.price) * item.quantity;
    }

    return await prisma.orders.create({
      data: {
        userId,
        total,
        order_items: {
          create: items.map((item) => {
            const product = products.find(
              (product) => product.id === item.productId,
            );

            return {
              quantity: item.quantity,
              unitPrice: product?.price ?? 0,
              products: {
                connect: { id: item.productId },
              },
            };
          }),
        },
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        order_items: {
          include: { products: true },
        },
      },
    });
  }

  async updateStatus(
    id: number,
    status: "PENDING" | "COMPLETED" | "CANCELLED",
  ) {
    return await prisma.orders.update({
      where: { id },
      data: { status },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        order_items: {
          include: { products: true },
        },
      },
    });
  }

  async cancelOrder(id: number, userId: number) {
    const order = await prisma.orders.findUnique({ where: { id } });

    if (!order || order.deletedAt !== null) {
      throw new Error("Orden no encontrada.");
    }

    if (order.userId !== userId) {
      throw new Error("No tiene permisos para cancelar la orden.");
    }

    if (order.status !== "PENDING") {
      throw new Error(
        `No se puede cancelar una orden con el estado ${order.status}`,
      );
    }

    return await prisma.orders.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: orderInclude,
    });
  }

  async softDelete(id: number) {
    const order = await prisma.orders.findUnique({ where: { id } });

    if (!order) {
      throw new Error("Orden no encontrada.");
    }

    return await prisma.orders.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: orderInclude,
    });
  }

  async getArchived() {
    return await prisma.orders.findMany({
      where: {
        deletedAt: { not: null },
      },
      include: orderInclude,
      orderBy: { deletedAt: "desc" },
    });
  }

  // async destroy(id: number) {
  //   await prisma.order_items.deleteMany({ where: { orderId: id } });
  //   return await prisma.orders.delete({ where: { id } });
  // }
}