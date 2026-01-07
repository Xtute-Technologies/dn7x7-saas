"use client";

import { useState } from "react";
import { Loader2, Play } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function PlaygroundPage() {
  const [apiKey, setApiKey] = useState("");
  const [categoryEnabled, setCategoryEnabled] = useState(false);
  const [category, setCategory] = useState("global");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  const runRequest = async () => {
    if (!apiKey) {
      toast.error("Please enter your API key");
      return;
    }

    setLoading(true);
    setResponse("");

    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("page_size", pageSize);

      if (categoryEnabled) {
        params.append("category", category);
      }

      const url = `https://api.dairynews7x7.com/api/news/?${params.toString()}`;

      const res = await fetch(url, {
        headers: {
          "X-API-KEY": apiKey,
        },
      });

      const text = await res.text();

      if (!res.ok) {
        throw new Error(text || `Request failed with ${res.status}`);
      }

      setResponse(JSON.stringify(JSON.parse(text), null, 2));
    } catch (err) {
      setResponse(err.message || "Unknown error");
      toast.error("API request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold">API Playground</h1>
        <p className="text-muted-foreground">
          Test the DairyNews7x7 API in real time using your API key.
        </p>
      </div>

      {/* Request Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Request Configuration</CardTitle>
          <CardDescription>
            Configure query parameters and execute the request.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* API Key */}
          <div className="space-y-2">
            <Label>API Key</Label>
            <Input
              placeholder="dn7x7_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          {/* Category Toggle */}
          <div className="flex items-center justify-between border rounded-lg p-3">
            <div className="space-y-1">
              <Label>Category Filter</Label>
              <p className="text-sm text-muted-foreground">
                Enable to filter news by category
              </p>
            </div>
            <Switch
              checked={categoryEnabled}
              onCheckedChange={setCategoryEnabled}
            />
          </div>

          {categoryEnabled && (
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indian">Indian</SelectItem>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Pagination */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Page</Label>
              <Input
                type="number"
                min={1}
                value={page}
                onChange={(e) => setPage(Number(e.target.value))}
              />
            </div>

           
          </div>

          {/* Run Button */}
          <Button onClick={runRequest} disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Run Request
          </Button>
        </CardContent>
      </Card>

      {/* Response */}
      <Card>
        <CardHeader>
          <CardTitle>Response</CardTitle>
          <CardDescription>
            Raw JSON response from the API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={response}
            readOnly
            className="font-mono min-h-75"
            placeholder="Response will appear here..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
