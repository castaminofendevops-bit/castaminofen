import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { PaymentService } from './payment.service';
import { Auth, Public } from '../../common/decorators/auth.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { successResponse } from '../../common/utils/response.util';

class VerifyPaymentDto {
  @IsString()
  gatewayRef!: string;
}

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Public()
  @Get('plans')
  @ApiOperation({ summary: 'پلن‌های اشتراک' })
  async plans() {
    return successResponse(await this.paymentService.getPlans());
  }

  @Get('subscription')
  @Auth()
  @ApiOperation({ summary: 'وضعیت اشتراک' })
  async subscription(@CurrentUser('id') userId: string) {
    return successResponse(await this.paymentService.getSubscription(userId));
  }

  @Post('subscribe/:plan')
  @Auth()
  @ApiOperation({ summary: 'شروع خرید اشتراک' })
  async subscribe(@CurrentUser('id') userId: string, @Param('plan') plan: string) {
    return successResponse(await this.paymentService.initiateSubscription(userId, plan));
  }

  @Post('verify')
  @Auth()
  @ApiOperation({ summary: 'تأیید پرداخت' })
  async verify(@CurrentUser('id') userId: string, @Body() dto: VerifyPaymentDto) {
    return successResponse(await this.paymentService.verifyPayment(dto.gatewayRef, userId));
  }

  @Post('purchase/:contentId')
  @Auth()
  @ApiOperation({ summary: 'خرید تکی محتوا' })
  async purchase(@CurrentUser('id') userId: string, @Param('contentId') contentId: string) {
    return successResponse(await this.paymentService.initiatePurchase(userId, contentId));
  }

  @Post('purchase/verify')
  @Auth()
  @ApiOperation({ summary: 'تأیید خرید تکی' })
  async verifyPurchase(@CurrentUser('id') userId: string, @Body() dto: VerifyPaymentDto) {
    return successResponse(await this.paymentService.verifyPurchase(dto.gatewayRef, userId));
  }
}
