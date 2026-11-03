import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Post,
} from "@nestjs/common";
import { PromotionsService } from "../../services/promotions.service";
import { CUSTOMER_ROUTES } from "../../routes/customer.routes";

interface PromotionPreviewInput {
  code: string;
  subtotal: number;
}

function parsePromotionPreviewInput(body: unknown): PromotionPreviewInput {
  if (typeof body !== "object" || body === null) {
    throw new BadRequestException("Dữ liệu mã giảm giá không hợp lệ");
  }

  const value = body as Record<string, unknown>;
  if (
    typeof value.code !== "string" ||
    value.code.trim().length === 0 ||
    !Number.isSafeInteger(value.subtotal) ||
    (value.subtotal as number) < 0
  ) {
    throw new BadRequestException("Mã giảm giá hoặc tạm tính không hợp lệ");
  }

  return { code: value.code, subtotal: value.subtotal as number };
}

@Controller(CUSTOMER_ROUTES.promotions.base)
export class PromotionsController {
  constructor(
    @Inject(PromotionsService) private readonly promotions: PromotionsService,
  ) {}

  @Post(CUSTOMER_ROUTES.promotions.validate)
  previewPromotion(@Body() body: unknown) {
    const input = parsePromotionPreviewInput(body);
    return this.promotions.previewPromotion(input.code, input.subtotal);
  }
}
