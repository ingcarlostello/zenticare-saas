import { getDictionary } from "../../../i18n/get-dictionary";
import { Locale } from "../../../i18n/config";
import { ScheduleManager } from "../../../../components/schedule/ScheduleManager";

interface SchedulePageProps {
  params: Promise<{
    lang: Locale;
  }>;
}

export default async function SchedulePage({ params }: SchedulePageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="flex h-full flex-col">
      <ScheduleManager dict={dict} />
    </div>
  );
}
