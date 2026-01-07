"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Eye, EyeOff, Terminal } from "lucide-react";
import { toast } from "sonner";

// Components
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table"; // You might want to rename this to LogsTable later
import { SectionCards } from "@/components/section-cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Services
import { getCredits, getAPIKeys, getLogs } from "@/services/dashboardService";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [mainKey, setMainKey] = useState(null);
  const [showKey, setShowKey] = useState(false);
  const [logs, setLogs] = useState([]);

  // Fetch All Dashboard Data
  useEffect(() => {
    async function loadData() {
      try {
        const [creditRes, keysRes, logsRes] = await Promise.all([
          getCredits(),
          getAPIKeys(),
          getLogs({ time_range: "24h" }) // Fetch last 24h for stats
        ]);

        const creditsData = creditRes.data;
        const keysData = keysRes.data;
        const logsData = logsRes.data;

        // 1. Set Main Active Key (First active one found)
        const active = keysData.find(k => k.is_active);
        if (active) setMainKey(active.key);

        // 2. Calculate Stats
        const totalCalls = logsData.length;
        const successCalls = logsData.filter(l => l.status_code >= 200 && l.status_code < 300).length;
        const successRate = totalCalls > 0 ? ((successCalls / totalCalls) * 100).toFixed(1) : 100;

        setStats({
          credits: creditsData.remaining_credits,
          daily_free: creditsData.daily_free_credits,
          active_keys: keysData.filter(k => k.is_active).length,
          total_calls_24h: totalCalls,
          success_rate: successRate
        });

        // 3. Set Logs for Table/Chart
        setLogs(logsData);

      } catch (error) {
        console.error("Dashboard load failed", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const copyToClipboard = () => {
    if (mainKey) {
      navigator.clipboard.writeText(mainKey);
      toast.success("API Key copied!");
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          
          {/* 1. SECTION CARDS (Stats) */}
          <SectionCards stats={stats} />

          {/* 2. ACTIVE API KEY DISPLAY */}
          <div className="px-4 lg:px-6">
            <Card className="bg-gradient-to-r from-sidebar-accent/50 to-transparent">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-md">
                        <Terminal className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Primary API Key</CardTitle>
                        <CardDescription>Use this key to authenticate your requests.</CardDescription>
                    </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 max-w-2xl">
                  <div className="relative flex-1">
                    <Input 
                      value={mainKey || "No Active Keys Found"} 
                      readOnly 
                      type={showKey ? "text" : "password"}
                      className="pr-10 font-mono bg-background" 
                    />
                    <button 
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <Button onClick={copyToClipboard} disabled={!mainKey}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          

        </div>
      </div>
    </div>
  );
}