import { getDictionary } from "../../i18n/get-dictionary";
import { currentUser } from "@clerk/nextjs/server";
import { getPlanWeight } from "../../../lib/plans";
import { PricingUI } from "./PricingUI";
import { PLANS } from "../../../constants/pricing.const";

export default async function PricingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const dict = await getDictionary(resolvedParams.lang as any);

  const user = await currentUser();
  const userId = user?.id;
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;

  const userPlanKey = (user?.publicMetadata?.planKey as string) || PLANS.FREE;
  const userPlanWeight = getPlanWeight(userPlanKey);
  const proPlanWeight = getPlanWeight(PLANS.PRO);

  return (
    <PricingUI
      dict={dict}
      lang={resolvedParams.lang}
      userId={userId}
      userEmail={userEmail}
      userPlanWeight={userPlanWeight}
      proPlanWeight={proPlanWeight}
    />
  );
}
