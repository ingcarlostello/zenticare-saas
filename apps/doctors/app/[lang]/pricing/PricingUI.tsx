import { CheckoutButton } from "../../../components/CheckoutButton";
import { PricingCard } from "../../../components/PricingCard";


interface PricingUIProps {
  dict: any;
  userId?: string;
  userEmail?: string;
  userPlanWeight: number;
  proPlanWeight: number;
}

export function PricingUI({
  dict,
  userId,
  userEmail,
  userPlanWeight,
  proPlanWeight,
}: PricingUIProps) {
  const freeFeatures = [
    dict.pricing.feFreeOffers,
    dict.pricing.feFreeLoyalty,
    dict.pricing.feFreeCoupons,
    dict.pricing.feFreeLocation,
    dict.pricing.feFreePresentation,
    dict.pricing.feFreeStats,
  ];

  const proFeatures = [
    dict.pricing.feProBasic,
    dict.pricing.feProLocations,
    dict.pricing.feProBanners,
    dict.pricing.feProSurveys,
    dict.pricing.feProNotifications,
    dict.pricing.feProAdvancedStats,
  ];  

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
          <PricingCard
            title={dict.pricing.planFree}
            price={dict.pricing.priceFree}
            features={freeFeatures}
            actionButton={
              !userId && (
                <button className="btn btn-ghost bg-base-200/50 hover:bg-base-200 w-full rounded-xl text-base-content/80 font-semibold border-0">
                  {dict.pricing.chooseBtn}
                </button>
              )
            }
          />

          {/* Pro Tier (Premium Aesthetic) */}
          <PricingCard
            isHighlighted
            title={dict.pricing.planPro}
            price={dict.pricing.pricePro}
            features={proFeatures}
            actionButton={
              <>
                {userPlanWeight < proPlanWeight && (
                  <CheckoutButton
                    priceId="pri_01kpkft1t0m239f9184pdm4wfw"
                    text={dict.pricing.chooseBtn}
                    email={userEmail}
                    clerkId={userId}
                    className="btn bg-white hover:bg-base-200 text-blue-700 w-full rounded-xl font-bold border-0 shadow-md"
                  />
                )}
                {userPlanWeight >= proPlanWeight && (
                  <button
                    disabled
                    className="btn bg-white/20 text-white w-full rounded-xl font-bold border-0 shadow-sm cursor-not-allowed"
                  >
                    {userPlanWeight === proPlanWeight ? dict.pricing.currentPlan : dict.pricing.included}
                  </button>
                )}
              </>
            }
          />
        </div>
      </div>
    </div>
  );
}
