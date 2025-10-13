// components/newsletter-signup.tsx

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export function NewsletterSignup() {
  return (
    <form className="w-full max-w-md space-y-2">
      <label className="text-sm font-medium">Subscribe to our newsletter</label>
      <div className="flex items-center space-x-2">
        <Input type="email" placeholder="Enter your email" />
        <Button type="submit">
          <Mail className="mr-2 h-4 w-4" />
          Subscribe
        </Button>
      </div>
    </form>
  )
}
