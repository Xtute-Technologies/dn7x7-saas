import Link from "next/link";
import { 
  ArrowRight, 
  Globe, 
  Newspaper, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  Code, 
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Block } from "@/components/block";

export default function Page() {
  return (
    <Block className="py-10 md:py-20 space-y-24 border-x border-foreground/10">
      
      {/* --- Section 1: Hero --- */}
      <section className="flex flex-col items-center text-center gap-6 max-w-4xl mx-auto">
        <Badge variant="secondary" className="px-4 py-1 text-sm rounded-full">
          v1.0 Now Available
        </Badge>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary">
          The Pulse of the <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
            Global Dairy Industry
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Empower your platform with real-time intelligence from DairyNews7x7. 
          Access market data, global trends, and milk production insights via our high-performance API.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Button size="lg" className="h-12 px-8 text-base rounded-full" asChild>
            <Link href="/register">
              Get API Key <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-full" asChild>
            <Link href="/docs">
              Read the Docs
            </Link>
          </Button>
        </div>
        <div className="pt-8 flex items-center gap-8 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" /> Free Tier Available
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" /> No Credit Card Required
          </span>
        </div>
      </section>

      {/* --- Section 2: Bento Grid Features --- */}
      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Large Item: Indian & Global Coverage */}
        <Card className="group col-span-1 md:col-span-2 lg:col-span-2 row-span-2 bg-gradient-to-br from-blue-50/50 to-indigo-50/10 dark:from-blue-950/20 dark:to-indigo-950/10 border-muted/60 overflow-hidden hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl">Indian & Global Headlines</CardTitle>
            <CardDescription className="text-base">
              Get the latest scoop from India's dynamic dairy sector alongside critical global market updates. All in one unified stream.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative min-h-[200px]">
             {/* Micro-interaction: News tickers sliding or appearing */}
             <div className="space-y-3 pt-4 opacity-80 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-3 p-3 bg-background/60 backdrop-blur rounded-lg border shadow-sm translate-x-2 group-hover:translate-x-0 transition-transform duration-500 delay-75">
                  <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-sm font-medium">Amul announces new procurement prices...</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/60 backdrop-blur rounded-lg border shadow-sm translate-x-6 group-hover:translate-x-0 transition-transform duration-500 delay-100">
                   <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium">Global GDT index rises by 2.3%...</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/60 backdrop-blur rounded-lg border shadow-sm translate-x-4 group-hover:translate-x-0 transition-transform duration-500 delay-150">
                   <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">Milk production report: North India...</span>
                </div>
             </div>
          </CardContent>
        </Card>

        {/* Tall Item: Expert Insights */}
        <Card className="group col-span-1 md:col-span-1 lg:col-span-1 row-span-2 flex flex-col justify-between border-muted/60 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform">
              <Newspaper className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle>Expert Insights</CardTitle>
            <CardDescription>
              Access exclusive editorials and blogs from <strong>Kuldeep Sharma</strong> and industry veterans.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-xl border border-dashed">
               <p className="text-xs font-mono text-muted-foreground mb-2">// Latest Blog Endpoint</p>
               <div className="text-sm font-medium">GET /blogs/kuldeep-sharma</div>
            </div>
            <div className="text-xs text-muted-foreground italic px-2">
              "The future of dairy lies in sustainable tech..."
            </div>
          </CardContent>
        </Card>

        {/* Medium Item: DairyNews7x7 */}
        <Card className="group col-span-1 md:col-span-1 border-muted/60 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardHeader>
            <Zap className="h-6 w-6 text-yellow-500 mb-2 group-hover:text-yellow-400 transition-colors" />
            <CardTitle className="text-lg">DairyNews7x7.com</CardTitle>
            <CardDescription>
              Direct integration with the trusted news portal.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Medium Item: Developer Ready */}
        <Card className="group col-span-1 md:col-span-1 border-muted/60 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardHeader>
            <Code className="h-6 w-6 text-cyan-500 mb-2 group-hover:scale-110 transition-transform" />
            <CardTitle className="text-lg">JSON Ready</CardTitle>
            <CardDescription>
              Clean data structure for easy frontend integration.
            </CardDescription>
          </CardHeader>
        </Card>

         {/* Wide Item: Ecosystem CTA */}
         <Card className="col-span-1 md:col-span-2 lg:col-span-4 bg-primary text-primary-foreground border-none shadow-lg">
          <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <CardTitle className="text-xl">Powered by the DairyNews7x7 Ecosystem</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                The most comprehensive database for dairy news, prices, and analysis.
              </CardDescription>
            </div>
            <Button variant="secondary" className="rounded-full shadow-md hover:shadow-xl transition-all" asChild>
              <Link href="/register">Start Integrating Now</Link>
            </Button>
          </CardHeader>
        </Card>

      </section>

      {/* --- Section 3: Integration CTA --- */}
      <section className="bg-muted/30 rounded-3xl p-8 md:p-12 border border-dashed text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="mx-auto h-12 w-12 rounded-full bg-background border flex items-center justify-center shadow-sm">
             <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Ready to build?</h2>
          <p className="text-muted-foreground text-lg">
            Join hundreds of developers building the future of agritech. 
            Get your free API key today and start fetching news in under 5 minutes.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/register">Start for Free</Link>
            </Button>
            {/* <Button size="lg" variant="ghost" asChild>
              <Link href="/contact">Contact Sales</Link>
            </Button> */}
          </div>
        </div>
      </section>

    </Block>
  );
}