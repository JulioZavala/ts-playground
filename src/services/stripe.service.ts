import { stripe } from "../lib/stripe";
import { prisma } from "../lib/prisma";

interface CreateCheckoutInput {
  orderId: number;
  userId: number;
  userEmail: string;
}

export class StripeService {
  async createCheckoutSession({
    orderId,
    userId,
    userEmail,
  }: CreateCheckoutInput) {
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        order_items: { include: { products: true } },
        users: { select: { id: true, email: true } },
      },
    });

    // verificar que la orden exista
    if (!order) throw new Error("Orden no encontrada.");
    // verificar que la orden este asociado a un usuario
    if (order.userId !== userId) throw new Error("No autorizado");
    if (order.status !== "PENDING") {
      throw new Error("Solo se puede pagar ordenes en estado PENDIENTE");
    }

    const lineItems = order.order_items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.products.name,
          description: item.products.name,
        },
        unit_amount: Math.round(Number(item.unitPrice) * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: userEmail,
      line_items: lineItems,
      metadata: {
        order_id: String(order.id),
        user_id: String(userId),
      },
      success_url: `${process.env.FRONT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONT_URL}/payment/cancel`,
    });

    await prisma.orders.update({
      where: { id: orderId },
      data: { stripeSessionId: session.id },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string,
      );
    } catch {
      throw new Error("Webhook signature invalido.");
    }

    if (event.type !== "checkout.session.completed") {
      return { recieved: true, processed: false };
    }

    const session = event.data.object;
    const orderId = Number(session.metadata?.order_id);

    if (!orderId || isNaN(orderId)) {
      throw new Error("Order Id invalido.");
    }

    const stripeStatus = session.payment_status;
    const orderStatus =
      stripeStatus === "paid"
        ? "COMPLETED"
        : stripeStatus === "unpaid"
          ? "CANCELLED"
          : "PENDING";

    await prisma.orders.update({
      where: { id: orderId },
      data: {
        status: orderStatus,
        stripeStatus: stripeStatus,
        stripePaymentId: session.payment_intent as string | null,
        stripeSessionId: session.id,
      },
    });

    return { orderId, stripeStatus, orderStatus };
  }
}