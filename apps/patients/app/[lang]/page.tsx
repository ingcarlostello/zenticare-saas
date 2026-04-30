import { Locale } from "../i18n/config";
import { getDictionary } from "../i18n/get-dictionary";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{dict.page.title}</h1>
      <p className="mt-2 text-base-content/80">{dict.page.description}</p>
      
      <div className="mt-4">
        <button className="btn">Default</button>
      </div>
    </div>
  );
}
