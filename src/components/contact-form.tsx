// components/contact-form.tsx

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Send } from "lucide-react"

export function ContactForm() {
  return (
    <form className="w-full max-w-lg space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" type="text" placeholder="Your full name" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" type="tel" placeholder="+1 234 567 890" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" placeholder="Tell us what you need help with..." rows={4} />
      </div>

      <Button type="submit" className="w-full">
        <Send className="w-4 h-4 mr-2" />
        Send Message
      </Button>
    </form>
  )
}
