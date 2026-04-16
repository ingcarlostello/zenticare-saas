import { SignIn } from "@clerk/nextjs";
import { getAuthPath } from "@repo/ui";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <SignIn 
      routing="path" 
      path={getAuthPath(lang, 'LOGIN')} 
      signUpUrl={getAuthPath(lang, 'REGISTER')} 
    />
  );
}
