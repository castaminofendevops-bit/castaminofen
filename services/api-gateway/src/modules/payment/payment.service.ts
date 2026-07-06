import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SUBSCRIPTION_PLANS } from '@castaminofen/shared';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async getPlans() {
    return Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => ({
      id: key,
      name: plan.name,
      price: plan.price,
      currency: 'IRR',
    }));
  }

  async getSubscription(userId: string) {
    return this.prisma.subscription.findUnique({ where: { userId } });
  }

  async initiateSubscription(userId: string, plan: string) {
    const planConfig = SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS];
    if (!planConfig) throw new NotFoundException('Invalid plan');

    const gatewayRef = `SUB-${randomBytes(8).toString('hex')}`;

    // Stub: In production, call Zarinpal/IDPay API here
    return {
      gatewayRef,
      gatewayUrl: `https://sandbox.zarinpal.com/pg/StartPay/${gatewayRef}`,
      amount: planConfig.price,
      plan,
      message: 'Payment gateway stub — integrate Zarinpal in production',
    };
  }

  async verifyPayment(gatewayRef: string, userId: string) {
    // Stub verification — mark subscription active
    const plan = gatewayRef.startsWith('SUB-') ? 'PREMIUM' : null;

    if (plan) {
      await this.prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          plan: plan as never,
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        update: {
          plan: plan as never,
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    return { verified: true, gatewayRef };
  }

  async initiatePurchase(userId: string, contentId: string) {
    const content = await this.prisma.content.findUnique({ where: { id: contentId } });
    if (!content?.price) throw new NotFoundException('Content not purchasable');

    const gatewayRef = `BUY-${randomBytes(8).toString('hex')}`;

    const purchase = await this.prisma.purchase.create({
      data: {
        userId,
        contentId,
        amount: content.price,
        status: 'PENDING',
        gatewayRef,
        gatewayName: process.env.PAYMENT_GATEWAY || 'zarinpal',
      },
    });

    return {
      purchaseId: purchase.id,
      gatewayRef,
      gatewayUrl: `https://sandbox.zarinpal.com/pg/StartPay/${gatewayRef}`,
      amount: content.price,
      currency: 'IRR',
    };
  }

  async verifyPurchase(gatewayRef: string, userId: string) {
    const purchase = await this.prisma.purchase.findFirst({
      where: { gatewayRef, userId },
    });
    if (!purchase) throw new NotFoundException('Purchase not found');

    await this.prisma.purchase.update({
      where: { id: purchase.id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    return { verified: true, contentId: purchase.contentId };
  }
}
