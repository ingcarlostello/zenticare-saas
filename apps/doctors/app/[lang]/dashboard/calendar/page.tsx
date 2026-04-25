import { Locale } from "../../../i18n/config";
import { getDictionary } from "../../../i18n/get-dictionary";
import { CalendarView } from "../../../../components/calendar/CalendarView";

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <div className="flex-1 w-full h-full p-4 md:p-6 max-w-7xl mx-auto">
      <CalendarView dict={dict} lang={lang as Locale} />
    </div>
  );
}
