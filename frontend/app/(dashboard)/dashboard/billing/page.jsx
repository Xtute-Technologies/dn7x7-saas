"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { 
  Loader2, 
  Calendar, 
  CreditCard, 
  ArrowLeft, 
  ArrowRight,
  Download
} from "lucide-react";
import { toast } from "sonner";

// Services
import { getLogs, getCredits } from "@/services/dashboardService";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [credits, setCredits] = useState(null);
  
  // Filter States
  const [timeRange, setTimeRange] = useState("7d"); // Default to last 7 days
  const [currentPage, setCurrentPage] = useState(1);
  
  // Pagination constants
  const ITEMS_PER_PAGE = 10;

  // Fetch Data
  useEffect(() => {
    fetchBillingData();
  }, [timeRange, currentPage]);

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      // Parallel fetch for efficiency
      const [creditRes, logsRes] = await Promise.all([
        getCredits(),
        getLogs({ time_range: timeRange }) // Backend filters by date
      ]);

      setCredits(creditRes.data);
      setLogs(logsRes.data);
    } catch (error) {
      toast.error("Failed to load billing history");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- Client-Side Pagination Logic ---
  // (Note: For large datasets, move this logic to the Backend Django ViewSet)
  const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLogs = logs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  // Helper to determine cost (Usually 1 credit per success, or 0 if failed)
  const getCost = (status) => {
    // If status is 402 (Payment Required), no credit was taken because they had none.
    if (status === 402) return 0;
    // Assuming we charge for every attempt that reaches the middleware logic
    return 1;
  };

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 gap-6">
      
      {/* 1. HEADER & SUMMARY */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Billing & Usage</h2>
        <p className="text-sm text-muted-foreground">
          View your credit balance and consumption history.
        </p>
      </div>

      {/* Credit Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credits?.remaining_credits || 0}</div>
            <p className="text-xs text-muted-foreground">
              Combined Free + Paid credits
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Free Tier</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credits?.daily_free_credits || 0} / 20</div>
            <p className="text-xs text-muted-foreground">
              Resets automatically at midnight
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchased Credits</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credits?.purchased_credits || 0}</div>
            <p className="text-xs text-muted-foreground">
              Permanent credits that never expire
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* 2. USAGE HISTORY TABLE */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                <CardTitle>Usage History</CardTitle>
                <CardDescription>
                Detailed log of API calls and credit deductions.
                </CardDescription>
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-2">
                <Select value={timeRange} onValueChange={(val) => {
                    setTimeRange(val);
                    setCurrentPage(1); // Reset to page 1 on filter change
                }}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
                </Select>
                
                <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
             <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
          ) : logs.length === 0 ? (
             <div className="text-center py-10 text-muted-foreground">
                No usage history found for this period.
             </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Cost (Credits)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                        {format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss")}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                        {log.endpoint}
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline">{log.method}</Badge>
                    </TableCell>
                    <TableCell>
                        <StatusBadge code={log.status_code} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                        {getCost(log.status_code)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {/* 3. PAGINATION FOOTER */}
        <CardFooter className="flex items-center justify-between border-t px-6 py-4">
            <div className="text-xs text-muted-foreground">
                Showing <strong>{startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, logs.length)}</strong> of <strong>{logs.length}</strong>
            </div>
            <div className="flex items-center gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePrevPage} 
                    disabled={currentPage === 1}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Previous
                </Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleNextPage} 
                    disabled={currentPage >= totalPages}
                >
                    Next <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}

// --- Helper Component for Status ---
function StatusBadge({ code }) {
    if (code >= 200 && code < 300) {
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Success</Badge>;
    }
    if (code === 402) {
        return <Badge variant="destructive">Payment Req</Badge>;
    }
    if (code >= 400 && code < 500) {
        return <Badge variant="secondary">Client Err</Badge>;
    }
    return <Badge variant="destructive">Server Err</Badge>;
}