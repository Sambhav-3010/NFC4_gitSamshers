"use client"

import { parseEther } from "ethers";
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { User, Building2, Plus, MapPin, Eye } from "lucide-react"
import ConnectWallet from "@/components/ConnectWallet"

import { connectWallet, getContract } from "@/lib/ethers"

// Define the structure of a property for type safety
interface Land {
  id: number
  propertyName: string
  propertyAddress: string
  totalLandArea: string
  wholePrice: string
  forSale: boolean
  isShared: boolean
  totalShares: number
  availableShares: number
}

export default function ProfilePage() {

  const [lands, setLands] = useState<Land[]>([])
  const [account, setAccount] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const [user, setUser] = useState<any>(null)
  // Initialize properties from localStorage or use a default if localStorage is empty
  // const [properties, setProperties] = useState<Property[]>(() => {
  //   if (typeof window !== 'undefined') {
  //     const savedProperties = localStorage.getItem("properties");
  //     // If properties exist in localStorage, parse them. Otherwise, use a default minimal set.
  //     // Note: The structure here is simpler than marketplace's mockProperties,
  //     // so we'll only load basic fields if they exist in localStorage.
  //     if (savedProperties) {
  //       const parsedProperties: Property[] = JSON.parse(savedProperties);
  //       // Filter to only include properties relevant to the current user if a user ID was tracked
  //       // For now, we'll just return all properties from localStorage.
  //       return parsedProperties;
  //     }
  //   }
  //   // Fallback if localStorage is not available or empty
  //   return [
  //     {
  //       id: 1,
  //       title: "Modern Villa in Gurgaon",
  //       address: "Sector 45, Gurgaon, Haryana",
  //       area: "3500 sq ft",
  //       price: "₹2.5 Cr",
  //       status: "Listed",
  //       image: "/placeholder.svg?height=200&width=300&text=Villa",
  //     },
  //     {
  //       id: 2,
  //       title: "Luxury Apartment",
  //       address: "Bandra West, Mumbai, Maharashtra",
  //       area: "1800 sq ft",
  //       price: "₹3.2 Cr",
  //       status: "Sold",
  //       image: "/placeholder.svg?height=200&width=300&text=Apartment",
  //     },
  //   ];
  // })
  const router = useRouter()
  const [filterStatus, setFilterStatus] = useState("All")

 // Auth check
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    setUser({
      name: localStorage.getItem("userName") || "John Doe",
      email: localStorage.getItem("userEmail") || "john@example.com",
      role: localStorage.getItem("userRole") || "buyer",
    })
  }, [router])

  // Connect wallet and fetch on-chain properties
  useEffect(() => {
    const init = async () => {
      const acc = await connectWallet()
      if (acc) {
        setAccount(acc)
        await fetchOwnedLands(acc)
      }
    }
    init()
  }, [])


  const fetchOwnedLands = async (user: string) => {
    setLoading(true)
    try {
      const contract = await getContract()
      const acc = await connectWallet()
      const ids: bigint[] = await contract.getLandsByOwner(acc);
      const results: Land[] = []

      for (const idBig of ids) {
        const [details, currentOwner, isSharedFlag, totalSharesBig, availableSharesBig, pricePerShareBig] =
  await contract.getLandDetails(idBig);

      // details is the Land struct; in ethers v6 it’s a tuple with named properties
      const landItem: Land = {
        // convert carefully; use strings if IDs may exceed 2^53
        id: Number(idBig), // or parseInt(idBig.toString(), 10)
        propertyName: details.propertyName ?? details[13],
        propertyAddress: details.propertyAddress ?? details[10],
        totalLandArea: (details.totalLandArea ?? details[11]).toString(),
        wholePrice: (details.wholePrice ?? details[2]).toString(),
        forSale: (details.forSale ?? details[9]) as boolean,
        isShared: (details.isShared ?? details[14]) as boolean,
        totalShares: Number((details.totalShares ?? details[15]).toString()),
        availableShares: Number((details.availableShares ?? details[16]).toString()),
      };

      results.push(landItem);
    }

    setLands(results);
    } catch (err) {
      console.error("Error fetching owned lands:", err)
    } finally {
      setLoading(false)
    }
  }

const listWhole1 = async (id: number, priceWei: 100) => {
  const contract = await getContract();
  const tx = await contract.listWhole(id, priceWei);
  await tx.wait();
  await fetchOwnedLands(account);
};

const fractionalise = async (id: number, shares: number, pricePerShareWei: bigint) => {
  const contract = await getContract();
  const tx = await contract.fractionalise(id, shares, pricePerShareWei);
  await tx.wait();
  await fetchOwnedLands(account);
};

 const handleListWhole = async (id: number) => {
  const land = lands.find((l) => l.id === id);
  if (!land) return;

  // If land.wholePrice is in ETH like "0.10", convert to wei
  
  await listWhole1(id, 100);
};

const handleListAsShares = (id: number) => {

  const land = lands.find((l) => l.id === id);

  if (!land) return;
  handleListWhole(id);
  // Ask user for desired number of shares (> 1)
  const input = prompt("Enter number of shares (>1):", "100");
  if (!input) return;
  const shares = Number(input);
  if (!Number.isInteger(shares) || shares <= 1) {
    alert("Shares must be an integer greater than 1");
    return;
  }

  // Price per share in ETH; convert to wei
  const pricePerShareWei = ethers.parseEther("0.1"); // or prompt for price per share
  fractionalise(id, shares, pricePerShareWei);
};

  const handleViewDetails = (id: number) => {
    router.push(`/details/${id}`)
  }

  if (!user) return <div>Loading...</div>


  const getStatusColor = (status: string) => {
    switch (status) {
      case "Listed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "On Sale":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "Sold":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-purple-600 to-purple-100"></div>
            <div className="relative px-8 py-12">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mr-6">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user.name}!</h1>
                  <p className="text-purple-100 capitalize">{user.role} Dashboard</p>
                </div>
              </div>
            </div>
          </div>
            <ConnectWallet/>
          {/* User Info */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <Badge className="capitalize bg-gradient-to-r from-purple-800/10 to-purple-100/10 text-purple-800 dark:text-purple-100">
                    {user.role}
                  </Badge>
                </div>
              </CardContent>
              
            </Card>
            


            <Card className="glass">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500"
                >
                  <Link href="/register-property">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Property
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="w-full border-purple-800/20 dark:border-purple-100/20 bg-transparent"
                >
                  <Link href="/verify-land">Verify Documents</Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="w-full border-purple-800/20 dark:border-purple-100/20 bg-transparent"
                >
                  <Link href="/marketplace">Browse Marketplace</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Properties Section */}
<Card className="glass">
  <CardHeader>
    <div className="flex justify-between items-center">
      <div>
        <CardTitle className="flex items-center">
          <Building2 className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
          My Properties
        </CardTitle>
        <CardDescription>Manage your registered properties</CardDescription>
      </div>
    </div>
  </CardHeader>

  <CardContent>
    {lands.length === 0 ? (
      <div className="text-center py-12">
        <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground mb-4">No properties registered yet.</p>
        <Button
          asChild
          className="bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500"
        >
          <Link href="/register-property">Register Your First Property</Link>
        </Button>
      </div>
    ) : (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {lands.map((land) => (
          <Card
            key={land.id}
            className="overflow-hidden border border-purple-800/20 dark:border-purple-100/20"
          >
            <div className="aspect-video bg-muted">
              <img
                src="/placeholder.svg"
                alt={land.propertyName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://placehold.co/300x200/E0E0E0/333333?text=${encodeURIComponent(land.propertyName)}`;
                }}
              />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{land.propertyName}</CardTitle>
                <Badge className={land.isShared ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                  {land.isShared ? "Fractional" : land.forSale ? "Listed" : "Owned"}
                </Badge>
              </div>
              <CardDescription className="flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                {land.propertyAddress}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Area:</span>
                  <p className="font-medium">{land.totalLandArea} sq.ft</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Price:</span>
                  
                </div>
                <div>
                  <span className="text-muted-foreground">Shares:</span>
                  <p className="font-medium">{land.totalShares}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Available:</span>
                  <p className="font-medium">{land.availableShares}</p>
                </div>
              </div>

              <div className="flex space-x-2">
                {!land.forSale && (
                  <Button
                    size="sm"
                    className="flex-1 bg-purple-700 hover:bg-purple-800 text-white"
                    onClick={() => handleListWhole(land.id)}
                  >
                    List for Sale
                  </Button>
                )}
                {!land.isShared && (
                  <Button
                    size="sm"
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                    onClick={() => handleListAsShares(land.id)}
                  >
                    List as Shares
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-purple-800/20 dark:border-purple-100/20"
                  onClick={() => handleViewDetails(land.id)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )}
  </CardContent>
</Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
