"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Search,
  Filter,
  Heart,
  Eye,
  Building2,
  Zap,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Navbar } from "@/components/navbar";

const mockProperties = [
  {
    id: 1,
    title: "Luxury Villa with Pool",
    location: "Gurgaon, Haryana",
    area: "4,500 sq ft",
    price: "₹2.5 Cr",
    image: "/placeholder.svg?height=200&width=300&text=Luxury+Villa",
    status: "Tokenized",
    type: "Villa",
    bedrooms: 4,
    bathrooms: 3,
    verified: true,
    views: 1247,
    likes: 89,
    description: "An exquisite villa featuring a private pool, lush gardens, and smart home technology. Located in a prime residential area with excellent connectivity.",
    ownerId: "0xOwner123abc",
    latitude: "28.4595",
    longitude: "77.0266"
  },
  {
    id: 2,
    title: "Modern Apartment Complex",
    location: "Mumbai, Maharashtra",
    area: "1,200 sq ft",
    price: "₹1.8 Cr",
    image: "/placeholder.svg?height=200&width=300&text=Modern+Apartment",
    status: "Pending Sale",
    type: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    verified: true,
    views: 892,
    likes: 67,
    description: "Contemporary apartment with stunning city views, modern amenities, and access to a state-of-the-art gym. Ideal for urban living.",
    ownerId: "0xOwner456def",
    latitude: "19.0760",
    longitude: "72.8777"
  },
  {
    id: 3,
    title: "Commercial Office Space",
    location: "Bangalore, Karnataka",
    area: "8,000 sq ft",
    price: "₹5.2 Cr",
    image: "/placeholder.svg?height=200&width=300&text=Office+Space",
    status: "Smart Contract Verified",
    type: "Commercial",
    bedrooms: 0,
    bathrooms: 4,
    verified: true,
    views: 2156,
    likes: 134,
    description: "Spacious commercial office space in a bustling business district. Features multiple cabins, conference rooms, and ample parking.",
    ownerId: "0xOwner789ghi",
    latitude: "12.9716",
    longitude: "77.5946"
  },
  {
    id: 4,
    title: "Penthouse with City View",
    location: "Delhi, NCR",
    area: "3,200 sq ft",
    price: "₹4.1 Cr",
    image: "/placeholder.svg?height=200&width=300&text=Penthouse",
    status: "Tokenized",
    type: "Penthouse",
    bedrooms: 3,
    bathrooms: 3,
    verified: true,
    views: 1678,
    likes: 156,
    description: "Luxurious penthouse offering panoramic city views, high-end finishes, and exclusive access to rooftop amenities. A true urban oasis.",
    ownerId: "0xOwner012jkl",
    latitude: "28.6139",
    longitude: "77.2090"
  },
  {
    id: 5,
    title: "Farmhouse with Land",
    location: "Lonavala, Maharashtra",
    area: "12,000 sq ft",
    price: "₹3.8 Cr",
    image: "/placeholder.svg?height=200&width=300&text=Farmhouse",
    status: "Pending Sale",
    type: "Farmhouse",
    bedrooms: 5,
    bathrooms: 4,
    verified: false,
    views: 743,
    likes: 45,
    description: "Expansive farmhouse property with vast agricultural land, perfect for a serene retreat or agricultural ventures. Includes a large main house and outbuildings.",
    ownerId: "0xOwner345mno",
    latitude: "18.7500",
    longitude: "73.4000"
  },
  {
    id: 6,
    title: "Studio Apartment",
    location: "Pune, Maharashtra",
    area: "650 sq ft",
    price: "₹85 L",
    image: "/placeholder.svg?height=200&width=300&text=Studio",
    status: "Smart Contract Verified",
    type: "Studio",
    bedrooms: 1,
    bathrooms: 1,
    verified: true,
    views: 456,
    likes: 23,
    description: "Compact and efficient studio apartment, ideal for singles or couples. Located near major IT hubs with easy access to public transport.",
    ownerId: "0xOwner678pqr",
    latitude: "18.5204",
    longitude: "73.8567"
  },
];

export default function MarketplacePage() {
  const [userEmail, setUserEmail] = useState<string>("");
  const [properties, setProperties] = useState(mockProperties);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const isAuthenticated = localStorage.getItem("isAuthenticated");

    if (!email || !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    setUserEmail(email);
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Tokenized":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "Pending Sale":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "Smart Contract Verified":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation =
      locationFilter === "all" ||
      property.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesType =
      typeFilter === "all" ||
      property.type.toLowerCase() === typeFilter.toLowerCase();
    const matchesStatus =
      statusFilter === "all" || property.status === statusFilter;

    // Basic price filter logic (can be expanded for ranges)
    const matchesPrice = priceFilter === "all" ||
      (priceFilter === "under-1cr" && parseFloat(property.price.replace(/[₹ CrL,]/g, '')) < 100) || // Assuming 'L' is Lakhs, 'Cr' is Crores
      (priceFilter === "1-3cr" && parseFloat(property.price.replace(/[₹ CrL,]/g, '')) >= 1 && parseFloat(property.price.replace(/[₹ CrL,]/g, '')) < 3) ||
      (priceFilter === "3-5cr" && parseFloat(property.price.replace(/[₹ CrL,]/g, '')) >= 3 && parseFloat(property.price.replace(/[₹ CrL,]/g, '')) < 5) ||
      (priceFilter === "above-5cr" && parseFloat(property.price.replace(/[₹ CrL,]/g, '')) >= 5);

    return matchesSearch && matchesLocation && matchesType && matchesStatus && matchesPrice;
  });

  const handlePropertyAction = (propertyId: number, action: string) => {
    console.log(`${action} property ${propertyId}`);
    if (action === "purchase") {
      router.push(`/purchase/${propertyId}`); // Redirect to the purchase page
    } else if (action === "view") {
      router.push(`/details/${propertyId}`); // Redirect to the property details page
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">

        <main className="p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-purple-600 to-purple-100"></div>
              <div className="relative px-8 py-12">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      Property Marketplace
                    </h1>
                    <p className="text-purple-100">
                      Discover verified real estate with blockchain technology
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 flex space-x-3">
                    <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                      <Zap className="mr-2 h-4 w-4" />
                      AI Recommendations
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <Card className="glass border-purple-800/20 dark:border-purple-100/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                  Search & Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search</label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search properties..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 bg-background/50 border-purple-800/20 dark:border-purple-100/20 focus:ring-purple-800 dark:focus:ring-purple-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Select
                      value={locationFilter}
                      onValueChange={setLocationFilter}
                    >
                      <SelectTrigger className="bg-background/50 border-purple-800/20 dark:border-purple-100/20">
                        <SelectValue placeholder="All locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="mumbai">Mumbai</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                        <SelectItem value="bangalore">Bangalore</SelectItem>
                        <SelectItem value="gurgaon">Gurgaon</SelectItem>
                        <SelectItem value="pune">Pune</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="bg-background/50 border-purple-800/20 dark:border-purple-100/20">
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="penthouse">Penthouse</SelectItem>
                        <SelectItem value="farmhouse">Farmhouse</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="bg-background/50 border-purple-800/20 dark:border-purple-100/20">
                        <SelectValue placeholder="All status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Tokenized">Tokenized</SelectItem>
                        <SelectItem value="Pending Sale">
                          Pending Sale
                        </SelectItem>
                        <SelectItem value="Smart Contract Verified">
                          Smart Contract Verified
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price Range</label>
                    <Select value={priceFilter} onValueChange={setPriceFilter}>
                      <SelectTrigger className="bg-background/50 border-purple-800/20 dark:border-purple-100/20">
                        <SelectValue placeholder="All prices" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="under-1cr">Under ₹1 Cr</SelectItem>
                        <SelectItem value="1-3cr">₹1-3 Cr</SelectItem>
                        <SelectItem value="3-5cr">₹3-5 Cr</SelectItem>
                        <SelectItem value="above-5cr">Above ₹5 Cr</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Showing {filteredProperties.length} of {properties.length}{" "}
                properties
              </p>
            </div>

            {/* Properties Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProperties.map((property) => (
                <Card
                  key={property.id}
                  className="overflow-hidden glass border-purple-800/20 dark:border-purple-100/20 hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video bg-muted relative">
                    <img
                      src={property.image || "/placeholder.svg"}
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://placehold.co/300x200/E0E0E0/333333?text=${encodeURIComponent(property.title)}`;
                      }}
                    />
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                        onClick={() =>
                          handlePropertyAction(property.id, "like")
                        }
                      >
                        <Heart className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <Badge className={getStatusColor(property.status)}>
                        {property.status}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">
                        {property.title}
                      </CardTitle>
                      {property.verified && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      {property.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Area:</span>
                        <p className="font-medium">{property.area}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <p className="font-medium">{property.type}</p>
                      </div>
                      {property.bedrooms > 0 && (
                        <>
                          <div>
                            <span className="text-muted-foreground">
                              Bedrooms:
                            </span>
                            <p className="font-medium">{property.bedrooms}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Bathrooms:
                            </span>
                            <p className="font-medium">{property.bathrooms}</p>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {property.views}
                        </div>
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {property.likes}
                        </div>
                      </div>
                      <div className="text-xl font-bold text-foreground">
                        {property.price}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button
                        className="flex-1 bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500"
                        onClick={() =>
                          handlePropertyAction(property.id, "view")
                        }
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-purple-800/20 dark:border-purple-100/20 hover:bg-purple-800/5 dark:hover:bg-purple-100/5 bg-transparent"
                        onClick={() =>
                          handlePropertyAction(property.id, "purchase")
                        }
                      >
                        Initiate Purchase
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProperties.length === 0 && (
              <Card className="glass border-purple-800/20 dark:border-purple-100/20">
                <CardContent className="text-center py-12">
                  <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    No properties match your current filters.
                  </p>
                  <Button
                    variant="outline"
                    className="border-purple-800/20 dark:border-purple-100/20 hover:bg-purple-800/5 dark:hover:bg-purple-100/5 bg-transparent"
                    onClick={() => {
                      setSearchTerm("");
                      setLocationFilter("all");
                      setTypeFilter("all");
                      setStatusFilter("all");
                      setPriceFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
