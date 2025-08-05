"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  Building2,
  ShoppingCart,
  Shield,
  Bot,
  FileCodeIcon as FileContract,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Activity,
  Users,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string>("")
  const [userEmail, setUserEmail] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    const email = localStorage.getItem("userEmail")
    const isAuthenticated = localStorage.getItem("isAuthenticated")

    if (!role || !email || !isAuthenticated) {
      router.push("/auth/login")
      return
    }

    setUserRole(role)
    setUserEmail(email)
  }, [router])

  const getBuyerStats = () => [
    {
      title: "Active Searches",
      value: "12",
      change: "+3 this week",
      icon: Building2,
      color: "from-purple-800 to-purple-600",
    },
    {
      title: "Saved Properties",
      value: "8",
      change: "+2 new",
      icon: ShoppingCart,
      color: "from-purple-700 to-purple-500",
    },
    {
      title: "Offers Made",
      value: "3",
      change: "2 pending",
      icon: FileContract,
      color: "from-purple-600 to-purple-400",
    },
    {
      title: "Verification Score",
      value: "95%",
      change: "Excellent",
      icon: Shield,
      color: "from-green-600 to-green-400",
    },
  ]

  const getSellerStats = () => [
    {
      title: "Listed Properties",
      value: "5",
      change: "+1 this month",
      icon: Building2,
      color: "from-purple-800 to-purple-600",
    },
    {
      title: "Total Views",
      value: "1,247",
      change: "+15% this week",
      icon: TrendingUp,
      color: "from-purple-700 to-purple-500",
    },
    {
      title: "Offers Received",
      value: "8",
      change: "3 pending",
      icon: FileContract,
      color: "from-purple-600 to-purple-400",
    },
    {
      title: "Revenue Generated",
      value: "₹2.4Cr",
      change: "+22% vs last year",
      icon: Activity,
      color: "from-green-600 to-green-400",
    },
  ]

  const getRegulatorStats = () => [
    {
      title: "Pending Reviews",
      value: "23",
      change: "5 urgent",
      icon: Clock,
      color: "from-orange-600 to-orange-400",
    },
    {
      title: "Approved Today",
      value: "15",
      change: "+8 vs yesterday",
      icon: CheckCircle,
      color: "from-green-600 to-green-400",
    },
    {
      title: "Compliance Issues",
      value: "2",
      change: "Down from 5",
      icon: AlertTriangle,
      color: "from-red-600 to-red-400",
    },
    {
      title: "Active Users",
      value: "1,234",
      change: "+12% this month",
      icon: Users,
      color: "from-purple-600 to-purple-400",
    },
  ]

  const getStatsForRole = () => {
    switch (userRole) {
      case "seller":
        return getSellerStats()
      case "regulator":
        return getRegulatorStats()
      default:
        return getBuyerStats()
    }
  }

  const stats = getStatsForRole()

  const recentTransactions = [
    {
      id: "0x1a2b3c4d",
      type: "Property Purchase",
      property: "Luxury Villa, Gurgaon",
      amount: "₹2.5Cr",
      status: "completed",
      timestamp: "2 hours ago",
    },
    {
      id: "0x5e6f7g8h",
      type: "Smart Contract",
      property: "Apartment, Mumbai",
      amount: "₹1.2Cr",
      status: "pending",
      timestamp: "4 hours ago",
    },
    {
      id: "0x9i0j1k2l",
      type: "Verification",
      property: "Commercial Space, Delhi",
      amount: "₹5.8Cr",
      status: "approved",
      timestamp: "1 day ago",
    },
  ]

  const aiInsights = [
    {
      title: "Market Trend Analysis",
      description: "Property prices in your area are expected to rise by 8% in Q2",
      confidence: 92,
      type: "trend",
    },
    {
      title: "Fraud Detection",
      description: "All recent transactions verified as legitimate",
      confidence: 98,
      type: "security",
    },
    {
      title: "Smart Contract Optimization",
      description: "Suggested improvements could save 15% on transaction fees",
      confidence: 85,
      type: "optimization",
    },
  ]

  if (!userRole) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole={userRole} userEmail={userEmail} />

      {/* Desktop Theme Toggle */}
      <div className="hidden lg:block fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <main className="lg:ml-64 p-6">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 animated-gradient opacity-90"></div>
            <div className="relative px-8 py-12 text-center">
              <h1 className="text-4xl font-bold text-white mb-4">
                Welcome to Your {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard
              </h1>
              <p className="text-purple-100 text-lg mb-6 max-w-2xl mx-auto">
                Monitor your blockchain real estate activities with AI-powered insights
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                  <Zap className="mr-2 h-5 w-5" />
                  Quick Actions
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white/30 text-white hover:bg-white/10"
                >
                  View Reports
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="gradient-border">
                  <Card className="gradient-border-content border-0 h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}/10`}>
                        <Icon className={`h-4 w-4 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* AI Agent Section */}
            <div className="lg:col-span-2">
              <Card className="glass border-purple-800/20 dark:border-purple-100/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bot className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                    AI Agent Insights
                  </CardTitle>
                  <CardDescription>Real-time analysis and recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiInsights.map((insight, index) => (
                    <div
                      key={index}
                      className="p-4 bg-background/50 rounded-lg border border-purple-800/10 dark:border-purple-100/10"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <Badge className="bg-gradient-to-r from-purple-800/10 to-purple-100/10 text-purple-800 dark:text-purple-100">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                      <Progress value={insight.confidence} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="glass border-purple-800/20 dark:border-purple-100/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>Blockchain transaction history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-800 to-purple-100"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{transaction.type}</p>
                        <p className="text-xs text-muted-foreground">{transaction.property}</p>
                        <p className="text-xs text-muted-foreground">{transaction.timestamp}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{transaction.amount}</p>
                        <Badge
                          variant="secondary"
                          className={
                            transaction.status === "completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : transaction.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Smart Contract Automation */}
          <Card className="gradient-border">
            <div className="gradient-border-content">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileContract className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                  Smart Contract Automation
                </CardTitle>
                <CardDescription>Automated blockchain operations and contract management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button className="h-20 flex flex-col items-center justify-center bg-gradient-to-br from-purple-800/10 to-purple-100/10 hover:from-purple-800/20 hover:to-purple-100/20 border border-purple-800/20 dark:border-purple-100/20">
                    <FileContract className="h-6 w-6 mb-2 text-purple-800 dark:text-purple-100" />
                    <span className="text-sm">Create Contract</span>
                  </Button>
                  <Button className="h-20 flex flex-col items-center justify-center bg-gradient-to-br from-purple-800/10 to-purple-100/10 hover:from-purple-800/20 hover:to-purple-100/20 border border-purple-800/20 dark:border-purple-100/20">
                    <Shield className="h-6 w-6 mb-2 text-purple-800 dark:text-purple-100" />
                    <span className="text-sm">Verify Identity</span>
                  </Button>
                  <Button className="h-20 flex flex-col items-center justify-center bg-gradient-to-br from-purple-800/10 to-purple-100/10 hover:from-purple-800/20 hover:to-purple-100/20 border border-purple-800/20 dark:border-purple-100/20">
                    <TrendingUp className="h-6 w-6 mb-2 text-purple-800 dark:text-purple-100" />
                    <span className="text-sm">Transfer Ownership</span>
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
