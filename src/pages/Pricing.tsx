import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const pricingTiers = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for trying out our service",
    features: [
      "10 text-to-speech conversions per month",
      "Access to 3 basic voices",
      "Maximum 1000 characters per conversion",
      "Standard audio quality (16kHz)",
      "Basic voice settings",
      "Export as MP3",
    ],
    limitations: [
      "No voice cloning",
      "No commercial use",
      "No voice customization",
      "No priority support",
      "Limited voice selection",
    ],
    buttonText: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "29",
    description: "For content creators and professionals",
    features: [
      "Unlimited conversions",
      "Access to all 30+ premium voices",
      "Up to 5000 characters per conversion",
      "High-quality audio (24kHz)",
      "Advanced voice customization",
      "Priority email support",
      "Commercial usage rights",
      "Multiple export formats",
      "Voice style control",
      "Stability & clarity settings",
    ],
    limitations: [
      "Limited voice cloning (1 voice)",
      "Basic analytics",
    ],
    buttonText: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large-scale business needs",
    features: [
      "Everything in Pro, plus:",
      "Unlimited voice cloning",
      "Custom voice creation",
      "Ultra high-quality audio (48kHz)",
      "API access",
      "Dedicated account manager",
      "24/7 priority support",
      "Custom integration support",
      "Advanced analytics",
      "Service Level Agreement (SLA)",
      "Custom model fine-tuning",
      "Bulk conversion tools",
    ],
    limitations: [],
    buttonText: "Contact Sales",
    highlighted: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

const Pricing = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Simple, transparent pricing
          </motion.h1>
          <motion.p 
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Choose the perfect plan for your text-to-speech needs
          </motion.p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              variants={cardVariants}
              className={cn(
                "rounded-xl p-8 backdrop-blur-sm border",
                tier.highlighted
                  ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-input/30 bg-card"
              )}
            >
              <div className="relative">
                {tier.highlighted && (
                  <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-semibold">{tier.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-bold">${tier.price}</span>
                  {tier.price !== "Custom" && <span className="ml-2 text-muted-foreground">/month</span>}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
              </div>

              <div className="mt-8 space-y-4">
                <h4 className="text-sm font-semibold">What's included:</h4>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {tier.limitations.length > 0 && (
                  <>
                    <h4 className="text-sm font-semibold pt-4">Limitations:</h4>
                    <ul className="space-y-3">
                      {tier.limitations.map((limitation) => (
                        <li key={limitation} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <X className="h-4 w-4 text-destructive/70 mt-0.5" />
                          <span>{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              <button
                className={cn(
                  "mt-8 w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors",
                  tier.highlighted
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {tier.buttonText}
              </button>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <p className="text-muted-foreground">
            All plans include 24/7 basic support and access to our documentation.
            <br />
            Need a custom solution? <a href="#" className="text-primary hover:underline">Contact our sales team</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing; 