import { Locale } from "../../i18n/config";
import { getDictionary } from "../../i18n/get-dictionary";
import { Sidebar } from "../../../components/Sidebar";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <div className="drawer lg:drawer-open flex-1">
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        {children}
      </div>
      <Sidebar dict={dict} lang={lang as Locale} />
    </div>
  );
}
