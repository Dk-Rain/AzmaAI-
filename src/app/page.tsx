import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, FolderOpen, Gauge, Library, Lock, PlayCircle, Rocket, School, BookOpenCheck } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="px-4 lg:px-6 h-14 flex items-center sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <Link href="#" className="flex items-center justify-center font-bold text-xl" prefetch={false}>
          <School className="h-6 w-6 mr-2 text-primary" />
          <span className="font-headline">AzmaAI</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4 hidden md:inline-flex" prefetch={false}>
            Features
          </Link>
          <Link href="#pricing" className="text-sm font-medium hover:underline underline-offset-4 hidden md:inline-flex" prefetch={false}>
            Pricing
          </Link>
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
              Login
          </Link>
          <Link
              href="/signup"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              prefetch={false}
          >
              Sign Up
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 bg-gray-50 dark:bg-gray-900/50">
          <div className="container px-4 md:px-6 text-center">
            <div className="max-w-3xl mx-auto space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl font-headline">
                From Topic to Thesis Smarter with AzmaAI
              </h1>
              <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
                Your AI-powered academic assistant that writes, formats, and cites your assignments, manuscripts, and research papers in minutes.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  prefetch={false}
                >
                  Start Writing Free
                </Link>
                <Link
                  href="#"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  prefetch={false}
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Watch Demo
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-3 mb-12">
              <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">A seamless process in three simple steps.</p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-3 md:gap-12">
              <div className="grid gap-2 text-center">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-lg font-bold">Enter Your Topic</h3>
                <p className="text-sm text-muted-foreground">Input your assignment or thesis requirements.</p>
              </div>
              <div className="grid gap-2 text-center">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-lg font-bold">Generate & Format</h3>
                <p className="text-sm text-muted-foreground">AzmaAI writes and formats in your chosen academic style.</p>
              </div>
              <div className="grid gap-2 text-center">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-lg font-bold">Download & Submit</h3>
                <p className="text-sm text-muted-foreground">Export ready-to-use Word/PDF documents.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900/50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-3 mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Key Features</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">Everything you need for academic excellence.</p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 lg:grid-cols-3 md:gap-12">
              <div className="grid gap-2">
                <Gauge className="h-8 w-8 text-accent" />
                <h3 className="text-lg font-bold">Auto Formatting</h3>
                <p className="text-sm text-muted-foreground">Fonts, spacing, margins, citations done for you.</p>
              </div>
              <div className="grid gap-2">
                <BookOpenCheck className="h-8 w-8 text-accent" />
                <h3 className="text-lg font-bold">Verified References</h3>
                <p className="text-sm text-muted-foreground">Real academic DOIs, APA/MLA/Chicago styles.</p>
              </div>
              <div className="grid gap-2">
                <Rocket className="h-8 w-8 text-accent" />
                <h3 className="text-lg font-bold">Fast & Smart</h3>
                <p className="text-sm text-muted-foreground">Get drafts in minutes, not weeks.</p>
              </div>
              <div className="grid gap-2">
                <FolderOpen className="h-8 w-8 text-accent" />
                <h3 className="text-lg font-bold">Multiple Templates</h3>
                <p className="text-sm text-muted-foreground">Essays, theses, research proposals, term papers.</p>
              </div>
              <div className="grid gap-2">
                <Lock className="h-8 w-8 text-accent" />
                <h3 className="text-lg font-bold">Safe & Private</h3>
                <p className="text-sm text-muted-foreground">Your data stays secure.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Preview Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">See AzmaAI in Action</h2>
              <p className="text-muted-foreground md:text-xl/relaxed">
                Watch how easily you can go from a simple topic to a fully-formatted academic paper, complete with accurate citations. No more tedious manual work.
              </p>
              <Link
                href="/signup"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                prefetch={false}
              >
                Try AzmaAI Now
              </Link>
            </div>
            <div className="mx-auto w-full max-w-md">
              <Image
                src="https://picsum.photos/seed/app-preview/600/400"
                width={600}
                height={400}
                alt="App Preview"
                className="rounded-xl shadow-lg"
                data-ai-hint="app interface"
              />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900/50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-3 mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Loved by Students & Academics</h2>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-3 md:gap-12">
              <Card>
                <CardContent className="p-6">
                  <p className="mb-4">"AzmaAI helped me finish my thesis two weeks early!"</p>
                  <p className="font-semibold">🎓 Final Year Student</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="mb-4">"No more formatting stress — my assignments look professional."</p>
                  <p className="font-semibold">📖 University Freshman</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="mb-4">"Game-changer for research writing!"</p>
                  <p className="font-semibold">🧑‍🏫 Lecturer</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
             <div className="text-center space-y-3 mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Pricing Plans</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">Choose a plan that fits your academic needs.</p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-3 md:gap-12">
              <Card>
                <CardHeader>
                  <CardTitle>Free Plan</CardTitle>
                  <CardDescription>Limited pages, limited references.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-3xl font-bold">₦0</p>
                    <p className="text-sm text-muted-foreground">For getting started</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild><Link href="/signup">Get Started</Link></Button>
                </CardFooter>
              </Card>
               <Card className="border-primary shadow-lg">
                <CardHeader>
                  <CardTitle>Student Plan</CardTitle>
                  <CardDescription>Unlimited assignments, export to Word/PDF.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-3xl font-bold">₦2,000<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                    <p className="text-sm text-muted-foreground">Perfect for coursework</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild><Link href="/signup">Choose Student</Link></Button>
                </CardFooter>
              </Card>
               <Card>
                <CardHeader>
                  <CardTitle>Pro Plan</CardTitle>
                  <CardDescription>+ plagiarism check, advanced templates.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-3xl font-bold">₦8,000<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                    <p className="text-sm text-muted-foreground">For serious researchers</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild><Link href="/signup">Choose Pro</Link></Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; AzmaAI – Academic Zenith for Manuscripts & Assignments.</p>
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
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
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
