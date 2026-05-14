import { Locale } from "../../i18n/config";
import { getDictionary } from "../../i18n/get-dictionary";
import { DrawerControl } from "../../../components/DrawerControl";
import { PatientSidebar } from "../../../components/PatientSidebar";

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
    <div className="drawer lg:drawer-open h-full">
      <DrawerControl />
      <div className="drawer-content flex flex-col h-full overflow-y-auto">
        {children}
      </div>
      <PatientSidebar dict={dict} lang={lang} />
    </div>
  );
}
