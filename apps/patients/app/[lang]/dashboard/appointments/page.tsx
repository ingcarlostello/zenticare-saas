import { Locale } from "../../../i18n/config";
import { getDictionary } from "../../../i18n/get-dictionary";
import { AppointmentsClient } from "../../../../components/appointments/AppointmentsClient";

export default async function AppointmentsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return <AppointmentsClient dict={dict} lang={lang} />;
}
