import { getDictionary } from "../../i18n/get-dictionary";
import { Check } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

export default async function PricingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const dict = await getDictionary(resolvedParams.lang as any);
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-base-50 pt-6 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-base-content tracking-tight mb-4">
            {dict.pricing.title}
          </h1>
          <div className="inline-flex items-center gap-2 bg-base-200/50 px-4 py-2 rounded-full text-sm font-medium text-base-content/70">
            <span>{dict.pricing.monthly}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
          {/* Free Tier */}
          <div className="bg-base-100 rounded-[2rem] p-10 shadow-lg border border-base-200 flex flex-col h-full relative">
            <h2 className="text-2xl font-bold text-base-content mb-8">
              {dict.pricing.planFree}
            </h2>

            <ul className="space-y-4 mb-auto text-base-content/80 flex-grow">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-base-content/40" />
                <span>{dict.pricing.feFreeOffers}</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-base-content/40" />
                <span>{dict.pricing.feFreeLoyalty}</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-base-content/40" />
                <span>{dict.pricing.feFreeCoupons}</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-base-content/40" />
                <span>{dict.pricing.feFreeLocation}</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-base-content/40" />
                <span>{dict.pricing.feFreePresentation}</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-base-content/40" />
                <span>{dict.pricing.feFreeStats}</span>
              </li>
            </ul>

            <div className="mt-12 pt-6 border-t border-base-200/60">
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-bold text-base-content">
                  ${dict.pricing.priceFree}
                </span>
              </div>
              {!userId && (
                <button className="btn btn-ghost bg-base-200/50 hover:bg-base-200 w-full rounded-xl text-base-content/80 font-semibold border-0">
                  {dict.pricing.chooseBtn}
                </button>
              )}
            </div>
          </div>

          {/* Pro Tier (Premium Aesthetic) */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2rem] p-10 shadow-2xl text-white flex flex-col h-full md:scale-105 sm:scale-100 relative overflow-hidden">
            <h2 className="text-2xl font-bold mb-8 uppercase tracking-wide">
              {dict.pricing.planPro}
            </h2>

            <ul className="space-y-4 mb-auto text-white/90 flex-grow relative z-10">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-white/60" />
                <span>{dict.pricing.feProBasic}</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-white/60" />
                <span>{dict.pricing.feProLocations}</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-white/60" />
                <span>{dict.pricing.feProBanners}</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-white/60" />
                <span>{dict.pricing.feProSurveys}</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-white/60" />
                <span>{dict.pricing.feProNotifications}</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-white/60" />
                <span>{dict.pricing.feProAdvancedStats}</span>
              </li>
            </ul>

            <div className="mt-12 pt-6 border-t border-white/20 relative z-10">
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-bold">
                  ${dict.pricing.pricePro}
                </span>
              </div>
              <button className="btn bg-white hover:bg-base-200 text-blue-700 w-full rounded-xl font-bold border-0 shadow-md">
                {dict.pricing.chooseBtn}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
