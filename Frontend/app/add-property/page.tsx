"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function AddPropertyDetails() {
  const [addr, setAddr] = useState("")
  const [area, setArea] = useState("")
  const [postal, setPostal] = useState("")
  const [name, setName] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // TODO: Replace this with actual blockchain interaction logic
      console.log({ addr, area, postal, name })

      // Simulate success
      setTimeout(() => {
        router.push("/register-property") // adjust if route is different
      }, 500)
    } catch (err) {
      console.error("Submission failed", err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-700 px-4 py-10">
      <div className="w-full max-w-xl bg-white/90 rounded-2xl shadow-xl p-8 backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-center text-purple-800 mb-6">Add Property Details</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-purple-700">Property Address</Label>
            <Input
              value={addr}
              onChange={(e) => setAddr(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-purple-700">Area (sq. ft.)</Label>
            <Input
              type="number"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-purple-700">Postal Code</Label>
            <Input
              type="number"
              value={postal}
              onChange={(e) => setPostal(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-purple-700">Owner Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-fuchsia-600 hover:to-purple-700 text-white font-semibold"
          >
            Continue to Document Upload
          </Button>
        </form>
      </div>
    </div>
  )
}
