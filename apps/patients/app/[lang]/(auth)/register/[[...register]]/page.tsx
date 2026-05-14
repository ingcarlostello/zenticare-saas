import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
      <SignUp unsafeMetadata={{ role: "patient" }} />
    </div>
  );
}
