import { Locale } from "../../../../i18n/config";
import { getDictionary } from "../../../../i18n/get-dictionary";
import { GoogleCallbackClient } from "./GoogleCallbackClient";

export default async function GoogleCallbackPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return <GoogleCallbackClient dict={dict} />;
}
