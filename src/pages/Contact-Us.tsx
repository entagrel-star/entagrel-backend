// components/contact-us.tsx
import Header from '@/components/Header';
import {
  Mail,
  Phone,
  MapPin,
  SendHorizontal,
  Facebook,
  Instagram,
  Linkedin,
  X,
  Youtube,
  
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export function ContactUs() {
  return (<>
    <Header/>
    <section className="bg-white h-screen w-screen text-white py-16 px-6">
      
      <div className="flex flex-col justify-center items-center">
        {/* LEFT: Contact Info */}
        <div className="space-y-6 pb-10">
          <h2 className="text-4xl font-bold text-primary text-center">
            Get In <span className="text-primary">Touch</span>
          </h2>
          <p className="text-gray-400">
            Ready to transform your digital presence? Let's start a conversation.
          </p>

          {/* <div className="space-y-4">
            <ContactItem icon={<Phone />} title="Phone" value="+91 99954 98218" />
            <ContactItem icon={<Mail />} title="Email" value="info@parasya.in" />
            <ContactItem
              icon={<MapPin />}
              title="Location"
              value="Rayan avenue 1st floor, Kariyad Thalassery, Kannur, Kerala 673316"
            />
          </div> */}

          {/* <div>
            <h3 className="text-sm font-medium mb-2">Follow Us</h3>
            <div className="flex items-center gap-4 text-white/80">
              <SocialIcon icon={<X />} />
              <SocialIcon icon={<Instagram />} />
              <SocialIcon icon={<Linkedin />} />
              <SocialIcon icon={<Facebook />} />
              
              <SocialIcon icon={<Youtube />} />
            </div>
          </div> */}
        </div>

        {/* RIGHT: Contact Form */}
        <form className="bg-primary p-6 rounded-lg shadow space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="John" className="bg-white text-black" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" placeholder="Doe" className="bg-white text-black" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="john@example.com" className="bg-white text-black" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="How can we help?" className="bg-white text-black" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Your message here"
              className="bg-white text-black"
              rows={4}
            />
          </div>

          <Button type="submit" className="bg-black hover:bg-gray-800 w-full text-white">
            <SendHorizontal className="w-4 h-4 mr-2" />
            Submit
          </Button>
        </form>
      </div>
    </section>
    </>
  )
}

// Subcomponent: Contact Item
function ContactItem({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode
  title: string
  value: string
}) {
  return (
    <div className="flex items-start gap-4 bg-zinc-900 p-4 rounded-lg">
      <div className="text-pink-600 mt-1">{icon}</div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-sm text-gray-300">{value}</p>
      </div>
    </div>
  )
}

// Subcomponent: Social Icon
function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded-full hover:bg-pink-600 transition">
      {icon}
    </div>
  )
}
