"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Coins, Ban, Shield, CreditCard, Activity, Loader2, Download, UserCog } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Services & Schemas
import adminUserService from "@/services/adminUserService";
import { addCreditsSchema } from "@/schemas/admin-user";

// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UserUsagePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId;

  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");

  // Modals
  const [creditModalOpen, setCreditModalOpen] = useState(false);

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch User Details
      const userRes = await adminUserService.getUser(userId);
      setUser(userRes.data);

      // 2. Fetch User Logs
      const logsRes = await adminUserService.getUserLogs(userId, { time_range: timeRange });
      setLogs(logsRes.data);
    } catch (error) {
      toast.error("Failed to load user data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, timeRange]);

  const handleToggleStatus = async () => {
    if (!user) return;
    try {
      await adminUserService.toggleUserActive(user.id);
      setUser({ ...user, is_active: !user.is_active });
      toast.success("User status updated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleToggleStaff = async () => {
    if (!user) return;
    try {
      const response = await adminUserService.toggleUserStaff(user.id);
      setUser({ ...user, is_staff: response.data.is_staff, role: response.data.role });
      toast.success("User permissions updated");
    } catch (error) {
      toast.error("Failed to update permissions");
    }
  };

  if (loading && !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!user) return <div>User not found</div>;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* 1. Header & Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Analytics</h1>
          <p className="text-sm text-muted-foreground">Detailed usage report for {user.name}</p>
        </div>
      </div>

      {/* 2. User Profile & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row flex-wrap items-center gap-4 pb-2">
            <Avatar className="h-16 w-16 border-2">
              <AvatarImage src={user.profile_image} />
              <AvatarFallback className="text-xl">{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
              <div className="flex gap-2 mt-1">
                {user.is_active ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="destructive">Banned</Badge>
                )}
                {user.is_staff && (
                  <Badge variant="outline" className="text-purple-600 border-purple-200">
                    Admin
                  </Badge>
                )}
              </div>
            </div>
            <div className="ml-auto flex gap-2 flex-wrap">
              <Button variant="outline" onClick={handleToggleStatus}>
                {user.is_active ? <Ban className="mr-2 h-4 w-4" /> : <Shield className="mr-2 h-4 w-4" />}
                {user.is_active ? "Ban User" : "Unban User"}
              </Button>
              <Button variant="outline" onClick={handleToggleStaff}>
                <UserCog className="mr-2 h-4 w-4" />
                {user.is_staff ? "Remove Admin" : "Make Admin"}
              </Button>
              <Button onClick={() => setCreditModalOpen(true)}>
                <Coins className="mr-2 h-4 w-4" /> Add Credits
              </Button>
            </div>
          </CardHeader>
          <Separator className="my-2" />
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
            <div>
              <span className="text-xs text-muted-foreground block">User ID</span>
              <span className="font-mono text-sm">{user.id}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Organization</span>
              <span className="text-sm">{user.organization || "-"}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Joined</span>
              <span className="text-sm">{user.date_joined ? format(new Date(user.date_joined), "MMM d, yyyy") : "-"}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Last Login</span>
              <span className="text-sm">{user.last_login ? format(new Date(user.last_login), "MMM d, yyyy") : "Never"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Credit Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Credit Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Available</span>
              <span className="text-3xl font-bold">{user.credit?.remaining_credits || 0}</span>
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Purchased</span>
                <span className="font-medium">{user.credit?.purchased_credits || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Free (Today)</span>
                <span className="font-medium text-green-600">
                  {user.credit?.daily_free_credits || 0} / 20
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Detailed Logs Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>API Request History</CardTitle>
            <CardDescription>View all API calls made by this user.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No activity found in this period.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-xs">{format(new Date(log.timestamp), "MMM d, HH:mm:ss")}</TableCell>
                    <TableCell className="text-sm font-medium">{log.endpoint}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.method}</Badge>
                    </TableCell>
                    <TableCell>
                      {log.status_code >= 200 && log.status_code < 300 ? (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                          {log.status_code}
                        </Badge>
                      ) : (
                        <Badge variant="destructive">{log.status_code}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{log.ip_address}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reused Add Credit Dialog */}
      <AddCreditDialog
        open={creditModalOpen}
        onOpenChange={(val) => {
          setCreditModalOpen(val);
          if (!val) fetchData(); // Refresh data on close
        }}
        user={user}
      />
    </div>
  );
}

// Re-using the same AddCreditDialog from the list page for consistency
function AddCreditDialog({ open, onOpenChange, user }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addCreditsSchema),
  });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const onSubmit = async (data) => {
    if (!user) return;
    try {
      await adminUserService.addUserCredits(user.id, data.credits);
      toast.success(`Credits added successfully`);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to add credits");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Credits</DialogTitle>
          <DialogDescription>
            Add credits to <strong>{user?.name}</strong>&apos;s balance.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input type="number" {...register("credits")} placeholder="100" />
            {errors.credits && <p className="text-red-500 text-xs">{errors.credits.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Confirm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
