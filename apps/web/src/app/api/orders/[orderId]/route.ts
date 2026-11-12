import { NextResponse } from "next/server";

import { OrderForbiddenError } from "@/features/order/errors";
import { getOrder } from "@/features/order/service/get-order";
import { createServerClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ orderId: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { orderId } = await params;
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return NextResponse.json({ error: "인증 정보가 없습니다." }, { status: 401 });
  }

  try {
    const order = await getOrder(orderId, data.user.id);

    if (!order) {
      return NextResponse.json(
        { error: "주문을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      order_number: order.orderNumber,
      template_name: order.templateName,
      price: order.price,
    });
  } catch (error) {
    if (error instanceof OrderForbiddenError) {
      return NextResponse.json(
        { error: "본인 주문이 아닙니다." },
        { status: 403 },
      );
    }

    throw error;
  }
}
