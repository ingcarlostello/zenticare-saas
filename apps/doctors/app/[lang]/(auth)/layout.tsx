import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-[calc(100vh-73px)] lg:grid lg:grid-cols-2">
      {/* Left pane: Image background */}
      <div className="relative hidden lg:block">
        <Image
          src="/doctor-auth-bg.png"
          alt="Zenticare Doctor"
          fill
          className="object-cover rounded-r-lg"
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </div>
      
      {/* Right pane: Auth Form */}
      <div className="flex items-center justify-center p-8 bg-base-100">
        <div className="w-full max-w-md flex flex-col items-center">
          {children}
        </div>
      </div>
    </div>
  );
}
