"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, User, Phone, CreditCard, MapPin } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    aadhaar: "",
    pan: "",
    address: "",
    role: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const signupData = localStorage.getItem("signupData")
    if (signupData) {
      const data = JSON.parse(signupData)
      setFormData((prev) => ({ ...prev, name: data.name, role: data.role }))
    } else {
      router.push("/auth/signup")
    }
  }, [router])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Phone number must be 10 digits"
    if (!formData.aadhaar.trim()) newErrors.aadhaar = "Aadhaar number is required"
    else if (!/^\d{12}$/.test(formData.aadhaar)) newErrors.aadhaar = "Aadhaar must be 12 digits"
    if (!formData.pan.trim()) newErrors.pan = "PAN is required"
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) newErrors.pan = "Invalid PAN format"
    if (!formData.address.trim()) newErrors.address = "Address is required"
    if (!formData.role) newErrors.role = "Role is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)

    setTimeout(() => {
      localStorage.setItem("registrationData", JSON.stringify(formData))
      router.push("/verify")
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 animated-gradient opacity-90"></div>

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-2xl glass">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-800 to-purple-100 flex items-center justify-center mr-3">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-800 to-purple-600 bg-clip-text text-transparent">
                  PropChain
                </h1>
                <p className="text-xs text-muted-foreground">Blockchain Real Estate</p>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
            <CardDescription>Provide your details for identity verification</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`bg-background/50 border-purple-800/20 dark:border-purple-100/20 focus:ring-purple-800 dark:focus:ring-purple-100 ${errors.name ? "border-red-500" : ""}`}
                  />
                  {errors.name && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.name}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    placeholder="10-digit phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={`bg-background/50 border-purple-800/20 dark:border-purple-100/20 focus:ring-purple-800 dark:focus:ring-purple-100 ${errors.phone ? "border-red-500" : ""}`}
                  />
                  {errors.phone && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.phone}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aadhaar" className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Aadhaar Number
                  </Label>
                  <Input
                    id="aadhaar"
                    placeholder="12-digit Aadhaar number"
                    value={formData.aadhaar}
                    onChange={(e) => handleInputChange("aadhaar", e.target.value)}
                    className={`bg-background/50 border-purple-800/20 dark:border-purple-100/20 focus:ring-purple-800 dark:focus:ring-purple-100 ${errors.aadhaar ? "border-red-500" : ""}`}
                  />
                  {errors.aadhaar && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.aadhaar}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pan" className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    PAN Number
                  </Label>
                  <Input
                    id="pan"
                    placeholder="ABCDE1234F"
                    value={formData.pan}
                    onChange={(e) => handleInputChange("pan", e.target.value.toUpperCase())}
                    className={`bg-background/50 border-purple-800/20 dark:border-purple-100/20 focus:ring-purple-800 dark:focus:ring-purple-100 ${errors.pan ? "border-red-500" : ""}`}
                  />
                  {errors.pan && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.pan}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Address
                </Label>
                <Textarea
                  id="address"
                  placeholder="Enter your complete address"
                  rows={3}
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className={`bg-background/50 border-purple-800/20 dark:border-purple-100/20 focus:ring-purple-800 dark:focus:ring-purple-100 ${errors.address ? "border-red-500" : ""}`}
                />
                {errors.address && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.address}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger
                    className={`bg-background/50 border-purple-800/20 dark:border-purple-100/20 ${errors.role ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                    <SelectItem value="regulator">Regulator</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.role}</AlertDescription>
                  </Alert>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500"
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Complete Registration"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
