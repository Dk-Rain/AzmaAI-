import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MountainIcon, Target, Lightbulb, Handshake, School } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link href="/" className="flex items-center justify-center font-bold text-xl" prefetch={false}>
          <School className="h-6 w-6 mr-2 text-primary" />
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
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">About AZMA AI</h1>
            <p className="max-w-[700px] mx-auto text-gray-200 md:text-xl mt-4">
              Empowering students through innovative academic assistance.
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
          <div className="relative z-10 container px-4 md:px-6 text-white">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">Our Mission</h2>
                <p className="text-gray-200">
                  Our mission is to bridge the gap between academic challenges and student success. We believe that every student deserves access to the tools and support they need to excel. AZMA AI was born from a desire to create a comprehensive platform that simplifies the academic journey, from initial research to final submission.
                </p>
                <p className="text-gray-200">
                  We leverage cutting-edge AI to provide personalized research assistance, connect students with skilled virtual assistants, and offer a seamless way to manage tasks and find essential services like printing. Our goal is to reduce stress and boost productivity, allowing students to focus on what truly matters: learning and growth.
                </p>
              </div>
              <img
                src="https://picsum.photos/seed/4/600/400"
                width="600"
                height="400"
                alt="Collaborating students"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center"
                data-ai-hint="collaborating students"
              />
            </div>
          </div>
        </section>

        <section
          className="relative w-full py-12 md:py-24 lg:py-32 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: `url('https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXRtcWpjdmxqd29nOHJqdTRlYzZtczRmdW4wYWNkZ3c0OGl4M3VtNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ITRemFlr5tS39AzQUL/giphy.gif')`,
          }}
        >
          <div className="absolute inset-0 bg-black/60 z-0" />
          <div className="relative z-10 container px-4 md:px-6 text-white">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Core Values</h2>
                <p className="max-w-[900px] text-gray-200 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  What Drives Us
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-3 md:gap-12 mt-12">
              <div className="grid gap-1 text-center">
                <Lightbulb className="h-10 w-10 mx-auto text-primary" />
                <h3 className="text-lg font-bold">Innovation</h3>
                <p className="text-sm text-gray-300">We constantly explore new technologies to provide the most effective academic tools.</p>
              </div>
              <div className="grid gap-1 text-center">
                <Target className="h-10 w-10 mx-auto text-primary" />
                <h3 className="text-lg font-bold">Student-Centric</h3>
                <p className="text-sm text-gray-300">Our platform is designed with the student's needs at the forefront of every feature.</p>
              </div>
              <div className="grid gap-1 text-center">
                <Handshake className="h-10 w-10 mx-auto text-primary" />
                <h3 className="text-lg font-bold">Integrity</h3>
                <p className="text-sm text-gray-300">We are committed to fostering academic honesty and providing reliable, ethical support.</p>
              </div>
            </div>
          </div>
        </section>
        
        <section
          className="relative w-full py-12 md:py-24 lg:py-32 bg-cover bg-center bg-fixed border-t"
          style={{
            backgroundImage: `url('https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXRtcWpjdmxqd29nOHJqdTRlYzZtczRmdW4wYWNkZ3c0OGl4M3VtNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ITRemFlr5tS39AzQUL/giphy.gif')`,
          }}
        >
          <div className="absolute inset-0 bg-black/60 z-0" />
          <div className="relative z-10 container px-4 md:px-6 text-white">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Join the Future of Academic Assistance</h2>
                  <p className="max-w-[900px] text-gray-200 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Ready to streamline your studies and achieve your goals? Sign up for AZMA AI today.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="/signup"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Sign Up Now
                  </Link>
                </div>
              </div>
          </div>
        </section>

      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; AzmaAI – Academic Zenith for Manuscripts & Assignments.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#features" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Features
          </Link>
          <Link href="#pricing" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Pricing
          </Link>
          <Link href="/contact" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Contact
          </Link>
           <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
