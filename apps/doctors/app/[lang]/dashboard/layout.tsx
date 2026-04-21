import { currentUser } from "@clerk/nextjs/server";
import { Locale } from "../../i18n/config";
import { getDictionary } from "../../i18n/get-dictionary";
import { Sidebar } from "../../../components/Sidebar";
import { PLANS } from "../../../constants/pricing.const";
import { getPlanWeight } from "../../../lib/plans";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  const user = await currentUser();
  const userPlanKey = (user?.publicMetadata?.planKey as string) || PLANS.FREE;
  const showAsPro = getPlanWeight(userPlanKey) >= getPlanWeight(PLANS.PRO);

  return (
    <div className="drawer lg:drawer-open h-full">
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col h-full overflow-y-auto">
        {children}
      </div>
      <Sidebar dict={dict} lang={lang as Locale} showAsPro={showAsPro} />
    </div>
  );
}
