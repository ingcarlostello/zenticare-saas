import { Locale } from "../../../i18n/config";
import { getDictionary } from "../../../i18n/get-dictionary";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">{dict.sidebar.profile}</h1>
      <p className="mt-4 opacity-70">Contenido de perfil en construcción...</p>
    </div>
  );
}
