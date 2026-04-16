import Image, { type ImageProps } from "next/image";
import { Button } from "@repo/ui/button";
import styles from "../page.module.css";
import { Locale } from "../i18n/config";
import { getDictionary } from "../i18n/get-dictionary";

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;

  return (
    <>
      <Image {...rest} src={srcLight} className="imgLight" />
      <Image {...rest} src={srcDark} className="imgDark" />
    </>
  );
};

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
