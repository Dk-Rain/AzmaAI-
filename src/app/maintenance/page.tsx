
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { School, Wrench } from 'lucide-react';
import Link from 'next/link';

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Wrench className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="mt-4 text-2xl">Under Maintenance</CardTitle>
          <CardDescription>
            We're currently performing some scheduled maintenance. We'll be back online shortly. Thank you for your patience!
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className='text-sm text-muted-foreground'>
                In the meantime, you can check our status on our social media pages or contact support if you have an urgent inquiry.
            </p>
            <div className="mt-6">
                <Link href="/" className="flex items-center justify-center font-bold text-xl" prefetch={false}>
                    <School className="h-6 w-6 mr-2 text-primary" />
                    <span>AZMA AI</span>
                </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

    