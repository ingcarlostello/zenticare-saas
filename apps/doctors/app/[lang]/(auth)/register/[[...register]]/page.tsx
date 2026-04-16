import { SignUp } from "@clerk/nextjs";
import { getAuthPath } from "@repo/ui";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <SignUp 
      routing="path" 
      path={getAuthPath(lang, 'REGISTER')} 
      signInUrl={getAuthPath(lang, 'LOGIN')} 
    />
  );
}
