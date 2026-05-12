import { getDictionary } from "../../../i18n/get-dictionary";
import { Locale } from "../../../i18n/config";
import { ScheduleManager } from "../../../../components/schedule/ScheduleManager";

interface SchedulePageProps {
  params: {
    lang: Locale;
  };
}

export default async function SchedulePage({ params }: SchedulePageProps) {
  const dict = await getDictionary(params.lang);

  return (
    <div className="flex h-full flex-col">
      <ScheduleManager dict={dict} />
    </div>
  );
}
