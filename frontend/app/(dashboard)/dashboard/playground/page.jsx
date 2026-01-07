"use client";

import { useState } from "react";
import { 
  Loader2, 
  Play, 
  Copy, 
  Check, 
  Terminal, 
  FileJson, 
  Lock, 
  Settings2,
  Code2
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const BASE_URL = "https://api.dairynews7x7.com";

export default function PlaygroundPage() {
  // Global Config
  const [apiKey, setApiKey] = useState("");
  const [endpointType, setEndpointType] = useState("list"); // 'list' | 'detail'

  // List Config
  const [categoryEnabled, setCategoryEnabled] = useState(false);
  const [category, setCategory] = useState("global");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Detail Config
  const [postId, setPostId] = useState("");

  // Request State
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [statusCode, setStatusCode] = useState(null);

  // --- URL Construction ---
  const constructUrl = () => {
    if (endpointType === "detail") {
      return `${BASE_URL}/api/news/${postId || "{id}"}/`;
    }

    const params = new URLSearchParams();
    params.append("page", page);
    params.append("page_size", pageSize);
    if (categoryEnabled) {
      params.append("category", category);
    }
    return `${BASE_URL}/api/news/?${params.toString()}`;
  };

  const currentUrl = constructUrl();

  // --- Code Snippets ---
  const getCurl = () => {
    return `curl -X GET "${currentUrl}" \\
  -H "X-API-KEY: ${apiKey || "YOUR_API_KEY"}"`;
  };

  const getJs = () => {
    return `const response = await fetch("${currentUrl}", {
  method: "GET",
  headers: {
    "X-API-KEY": "${apiKey || "YOUR_API_KEY"}",
    "Content-Type": "application/json"
  }
});

const data = await response.json();
console.log(data);`;
  };

  const getPython = () => {
    return `import requests

url = "${currentUrl}"
headers = {
    "X-API-KEY": "${apiKey || "YOUR_API_KEY"}"
}

response = requests.get(url, headers=headers)
print(response.json())`;
  };

  // --- Execute Request ---
  const runRequest = async () => {
    if (!apiKey) {
      toast.error("Please enter your API key first");
      return;
    }
    if (endpointType === "detail" && !postId) {
      toast.error("Please enter a Post ID");
      return;
    }

    setLoading(true);
    setResponse("");
    setStatusCode(null);

    try {
      const res = await fetch(currentUrl, {
        headers: {
          "X-API-KEY": apiKey,
        },
      });

      setStatusCode(res.status);
      const text = await res.text();

      try {
        // Try parsing JSON for pretty print
        const json = JSON.parse(text);
        setResponse(JSON.stringify(json, null, 2));
      } catch {
        // Fallback to text if not JSON
        setResponse(text);
      }

      if (!res.ok) {
        toast.error(`Request failed: ${res.status}`);
      } else {
        toast.success("Request successful");
      }
    } catch (err) {
      setResponse(`Error: ${err.message}`);
      toast.error("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
 <div className="flex flex-1 flex-col p-4 md:p-6 gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">API Playground</h1>
        <p className="text-muted-foreground text-lg">
          Test endpoints and generate integration code in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Configuration (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 1. Authentication */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" /> 
                Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  X-API-KEY
                </Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="dn7x7_..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="font-mono text-sm pr-10"
                  />
                </div>
                <p className="text-[0.8rem] text-muted-foreground">
                  Required for all requests.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 2. Endpoint Configuration */}
          <Card className="shadow-sm flex flex-col"> 
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-muted-foreground" />
                Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
              
              <Tabs value={endpointType} onValueChange={setEndpointType} className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="list">List</TabsTrigger>
                  <TabsTrigger value="detail">Detail</TabsTrigger>
                </TabsList>
              </Tabs>

              {endpointType === "list" ? (
                <div className="space-y-5 animate-in fade-in slide-in-from-top-1">
                  
                  {/* Category Filter */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-normal">Filter by Category</Label>
                      <Switch
                        checked={categoryEnabled}
                        onCheckedChange={setCategoryEnabled}
                      />
                    </div>

                    {categoryEnabled && (
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="global">Global</SelectItem>
                          <SelectItem value="indian">Indian</SelectItem>
                          <SelectItem value="blog">Blog</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <Separator />

                  {/* Pagination */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase">Page</Label>
                      <Input
                        type="number"
                        min={1}
                        value={page}
                        onChange={(e) => setPage(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase">Size</Label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={pageSize}
                        onChange={(e) => setPageSize(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase">Post ID</Label>
                    <Input
                      placeholder="e.g. 123"
                      type="number"
                      value={postId}
                      onChange={(e) => setPostId(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Unique identifier for the article.</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-2 pb-6">
              <Button onClick={runRequest} disabled={loading} className="w-full font-semibold" size="lg">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4 fill-current" />}
                Send Request
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* RIGHT COLUMN: Code & Response (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 3. Code Generation - Dark Theme Area */}
          <div className="rounded-xl border bg-zinc-950 text-zinc-50 shadow-sm overflow-hidden">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <span className="ml-2 text-xs font-medium text-zinc-400 flex items-center gap-2">
                  <Code2 className="w-3 h-3" /> Request Preview
                </span>
              </div>
              <div className="flex items-center gap-2 max-w-[60%]">
                 <Badge variant="outline" className="text-zinc-400 border-zinc-700 font-mono text-[10px] uppercase">GET</Badge>
                 <span className="text-xs text-zinc-500 font-mono truncate" title={currentUrl}>{currentUrl}</span>
              </div>
            </div>
            
            <Tabs defaultValue="curl" className="w-full">
              <div className="flex items-center justify-between px-2 bg-zinc-900/30 border-b border-zinc-800">
                <TabsList className="bg-transparent h-10 p-0 gap-4">
                  <TabsTrigger value="curl" className="data-[state=active]:bg-transparent data-[state=active]:text-zinc-100 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 h-full text-zinc-500 hover:text-zinc-300 transition-colors text-xs uppercase tracking-wide">cURL</TabsTrigger>
                  <TabsTrigger value="js" className="data-[state=active]:bg-transparent data-[state=active]:text-zinc-100 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 h-full text-zinc-500 hover:text-zinc-300 transition-colors text-xs uppercase tracking-wide">JavaScript</TabsTrigger>
                  <TabsTrigger value="python" className="data-[state=active]:bg-transparent data-[state=active]:text-zinc-100 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 h-full text-zinc-500 hover:text-zinc-300 transition-colors text-xs uppercase tracking-wide">Python</TabsTrigger>
                </TabsList>
                <div className="pr-2">
                  <CopyButton text={
                    endpointType === "curl" ? getCurl() : 
                    endpointType === "js" ? getJs() : getPython()
                  } className="text-zinc-400 hover:text-zinc-100" />
                </div>
              </div>
              
              <TabsContent value="curl" className="m-0">
                <CodeBlock code={getCurl()} />
              </TabsContent>
              <TabsContent value="js" className="m-0">
                <CodeBlock code={getJs()} language="javascript" />
              </TabsContent>
              <TabsContent value="python" className="m-0">
                <CodeBlock code={getPython()} language="python" />
              </TabsContent>
            </Tabs>
          </div>

          {/* 4. Response Area */}
          <Card className="h-[600px] flex flex-col shadow-sm border-muted">
            <CardHeader className="py-3 px-4 border-b bg-muted/20 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <FileJson className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Response Body</span>
              </div>
              {statusCode && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Status:</span>
                  <Badge variant={statusCode >= 200 && statusCode < 300 ? "default" : "destructive"} className="h-5 px-2 font-mono">
                    {statusCode}
                  </Badge>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 p-0 relative bg-zinc-50/50 dark:bg-zinc-900/20">
              <Textarea
                value={response}
                readOnly
                className="font-mono text-xs w-full h-full resize-none border-0 focus-visible:ring-0 p-4 leading-relaxed bg-transparent text-foreground"
                placeholder="// API Response will appear here..."
              />
            </CardContent>
            <CardFooter className="py-2 px-4 border-t bg-muted/20 flex justify-end">
               <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground" onClick={() => {
                 navigator.clipboard.writeText(response);
                 toast.success("Response copied");
               }} disabled={!response}>
                 <Copy className="h-3 w-3 mr-2" /> Copy JSON
               </Button>
            </CardFooter>
          </Card>

        </div>
      </div>
    </div>
  );
}

// Helper Components

function CodeBlock({ code }) {
  return (
    <pre className="p-4 overflow-x-auto text-xs font-mono text-green-300 bg-zinc-950 min-h-[140px] leading-normal">
      <code>{code}</code>
    </pre>
  );
}

function CopyButton({ text, className }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Snippet copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className={`h-7 w-7 ${className}`}
      onClick={handleCopy}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}