
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function ContactPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({ name, email, subject, message });

        toast({
            title: "Message Sent!",
            description: "Thanks for reaching out. We'll get back to you soon.",
        });

        // Clear form
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
    }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link href="/" className="flex items-center justify-center font-bold text-xl" prefetch={false}>
          <Image src="/img/Azmaai logo.png" alt="AzmaAI Logo" width={24} height={24} className="mr-2" />
          <span>AZMA AI</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Login
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            prefetch={false}
          >
            Get Started
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section
          className="relative w-full py-12 md:py-24 lg:py-32 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: `url('https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXRtcWpjdmxqd29nOHJqdTRlYzZtczRmdW4wYWNkZ3c0OGl4M3VtNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ITRemFlr5tS39AzQUL/giphy.gif')`,
          }}
        >
          <div className="absolute inset-0 bg-black/60 z-0" />
          <div className="relative z-10 container px-4 md:px-6 text-center text-white">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Contact Us</h1>
            <p className="max-w-[700px] mx-auto text-gray-200 md:text-xl mt-4">
              Have questions or feedback? We'd love to hear from you.
            </p>
          </div>
        </section>

        <section
          className="relative w-full py-12 md:py-24 lg:py-32 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: `url('https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXRtcWpjdmxqd29nOHJqdTRlYzZtczRmdW4wYWNkZ3c0OGl4M3VtNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ITRemFlr5tS39AzQUL/giphy.gif')`,
          }}
        >
          <div className="absolute inset-0 bg-black/60 z-0" />
          <div className="relative z-10 container px-4 md:px-6">
            <Card className="max-w-2xl mx-auto bg-background/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>Fill out the form below and we will get back to you as soon as possible.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="What is your message about?" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Your message..." className="min-h-[150px]" value={message} onChange={(e) => setMessage(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full">Send Message</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; AzmaAI – Academic Zenith for Manuscripts & Assignments. Sfaret Technologies © 2025</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="/about" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            About
          </Link>
          <Link href="#features" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Features
          </Link>
          <Link href="#pricing" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Pricing
          </Link>
           <Link href="/privacy-policy" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
