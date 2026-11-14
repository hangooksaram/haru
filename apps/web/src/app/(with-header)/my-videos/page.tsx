import { redirect } from "next/navigation";

import { MyVideosTabs } from "@/features/video/components/MyVideosTabs";
import { getEditingDrafts } from "@/features/video/service/get-editing-drafts";
import { getPendingOrders } from "@/features/video/service/get-pending-orders";
import { getPurchasedOrders } from "@/features/video/service/get-purchased-orders";
import { createServerClient } from "@/lib/supabase/server";

export default async function MyVideosPage() {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login?next=/my-videos");
  }

  const [editingDrafts, pendingOrders, purchasedOrders] = await Promise.all([
    getEditingDrafts(data.user.id),
    getPendingOrders(data.user.id),
    getPurchasedOrders(data.user.id),
  ]);

  return (
    <div className="flex flex-col gap-10 py-10">
      <h1 className="font-heading text-3xl font-extrabold tracking-tight">
        내 영상
      </h1>
      <MyVideosTabs
        editingDrafts={editingDrafts}
        pendingOrders={pendingOrders}
        purchasedOrders={purchasedOrders}
      />
    </div>
  );
}
