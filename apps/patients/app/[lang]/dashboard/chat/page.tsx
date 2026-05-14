import { Locale } from "../../../i18n/config";
import { getDictionary } from "../../../i18n/get-dictionary";
import { ChatPageClient } from "../../../../components/chat/ChatPageClient";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <div className="h-[calc(100dvh-64px)] p-4 overflow-hidden">
      <div className="h-full flex flex-col bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
        <ChatPageClient dict={dict} lang={lang} />
      </div>
    </div>
  );
}
