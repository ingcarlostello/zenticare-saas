import { Locale } from "../../i18n/config";
import { getDictionary } from "../../i18n/get-dictionary";
import { HomeClient } from "../../../components/home/HomeClient";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return <HomeClient dict={dict} lang={lang} />;
}
