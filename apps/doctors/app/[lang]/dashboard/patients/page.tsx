import { Locale } from "../../../i18n/config";
import { getDictionary } from "../../../i18n/get-dictionary";
import { PatientsView } from "../../../../components/patients/PatientsView";

export default async function PatientsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return <PatientsView dict={dict} />;
}
