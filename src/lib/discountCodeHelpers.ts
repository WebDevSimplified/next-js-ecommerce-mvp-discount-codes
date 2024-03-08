import db from "@/db/db"
import { DiscountCodeType, Prisma } from "@prisma/client"

export function usableDiscountCodeWhere(productId: string) {
  return {
    isActive: true,
    AND: [
      {
        OR: [{ allProducts: true }, { products: { some: { id: productId } } }],
      },
      { OR: [{ limit: null }, { limit: { gt: db.discountCode.fields.uses } }] },
      { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    ],
  } satisfies Prisma.DiscountCodeWhereInput
}

export function getDiscountedAmount(
  discountCode: { discountAmount: number; discountType: DiscountCodeType },
  priceInCents: number
) {
  switch (discountCode.discountType) {
    case "PERCENTAGE":
      return Math.max(
        1,
        Math.ceil(
          priceInCents - (priceInCents * discountCode.discountAmount) / 100
        )
      )
    case "FIXED":
      return Math.max(
        1,
        Math.ceil(priceInCents - discountCode.discountAmount * 100)
      )
    default:
      throw new Error(
        `Invalid discount type ${discountCode.discountType satisfies never}`
      )
  }
}
