import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Shield, Zap, Globe, CheckCircle, ArrowRight, Building2, Lock, TrendingUp } from "lucide-react"

export default function LandingPage() {
  const features = [
    {
      icon: Shield,
      title: "Secure Ownership",
      description: "Blockchain-verified property ownership with immutable records and smart contract automation.",
    },
    {
      icon: Zap,
      title: "Instant Transactions",
      description: "Automated property transfers with AI-powered verification and instant settlement.",
    },
    {
      icon: Globe,
      title: "Global Marketplace",
      description: "Access properties worldwide with transparent pricing and verified documentation.",
    },
  ]

  const benefits = [
    "Immutable ownership records",
    "Automated legal compliance",
    "Reduced transaction costs",
    "Instant property transfers",
    "AI-powered fraud detection",
    "Global accessibility",
  ]

  return (
    <div className="min-h-screen w-full bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 animated-gradient opacity-90"></div>
        <div className="relative mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-6">
              Revolutionizing Property Ownership with{' '}
              <span className="bg-gradient-to-r from-purple-200 to-white bg-clip-text text-transparent">
                Blockchain
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Secure, transparent, and verified real estate transactions powered by smart contracts and AI technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                asChild
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
              >
                <Link href="/auth/signup">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="bg-transparent border-white/30 text-white hover:bg-white/10"
              >
                <Link href="/marketplace">Explore Properties</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Our platform simplifies property transactions through blockchain technology and AI automation.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="animated-gradient rounded-xl w-full justify-center">
                  <Card className="gradient-border-content border-0 h-full text-center w-full  sm:max-w-sm md:max-w-md mx-auto">
                    <CardHeader>
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-800/10 to-purple-100/10 flex items-center justify-center">
                        <Icon className="h-8 w-8 text-purple-800 dark:text-purple-100" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base text-white">{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Blockchain */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 md:gap-12 items-center">

            {/* Left Column */}
            <div>
              <h2 className="text-3xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">
                Why Blockchain for Real Estate?
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg mb-6 md:mb-8">
                Traditional property transactions are slow, expensive, and prone to fraud. Our blockchain solution
                eliminates intermediaries, reduces costs, and ensures complete transparency.
              </p>

              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center sm:space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm sm:text-base">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="grid gap-4 md:gap-6 grid-cols-1">
              {[
                {
                  icon: Lock,
                  title: 'Secure & Immutable',
                  desc: 'Every transaction is recorded on the blockchain, creating an immutable history of ownership that cannot be altered or disputed.'
                },
                {
                  icon: TrendingUp,
                  title: 'Cost Effective',
                  desc: 'Smart contracts automate processes, reducing the need for intermediaries and cutting transaction costs by up to 80%.'
                },
                {
                  icon: Building2,
                  title: 'Global Access',
                  desc: 'Access properties from anywhere in the world with standardized processes and instant verification.'
                }
              ].map((item, idx) => (
                <Card key={idx} className="glass w-full max-w-md mx-auto">
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <item.icon className="h-5 w-5 text-purple-800 dark:text-purple-100 mr-2" />
                    <CardTitle className="text-base sm:text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs sm:text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-purple-600 to-purple-100"></div>
            <div className="relative px-4 sm:px-8 py-10 md:py-16 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6">
                Ready to Transform Your Property Experience?
              </h2>
              <p className="text-purple-100 text-base sm:text-lg mb-6 md:mb-8 mx-auto">
                Join thousands of users who trust PropChain for secure, transparent, and efficient property
                transactions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  asChild
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                >
                  <Link href="/auth/signup">Create Account</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="bg-transparent border-white/30 text-white hover:bg-white/10"
                >
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
