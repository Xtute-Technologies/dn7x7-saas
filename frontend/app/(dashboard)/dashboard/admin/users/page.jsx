"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Loader2, Search, MoreVertical, Shield, Ban, CheckCircle, 
  Coins, ChevronLeft, ChevronRight, Eye, Activity, Calendar
} from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { format } from "date-fns";

// Services & Schemas
import adminUserService from "@/services/adminUserService";
import { addCreditsSchema } from "@/schemas/admin-user";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardHeader, CardTitle, CardFooter
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  // Modals State
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false); // New Details Sheet
  const [selectedUser, setSelectedUser] = useState(null);

  // --- Fetch Users ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminUserService.getAllUsers({
        page: currentPage,
        search: debouncedSearch,
        page_size: 10
      });
      if (response.data.results) {
        setUsers(response.data.results);
        const count = response.data.count || 0;
        setTotalPages(Math.ceil(count / 10)); 
      } else {
        setUsers(response.data); 
      }
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, debouncedSearch]);

  // --- Handlers ---
  const handleToggleStatus = async (user) => {
    const originalStatus = user.is_active;
    setUsers(users.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
    try {
      await adminUserService.toggleUserActive(user.id);
      toast.success(`User updated successfully`);
    } catch (error) {
      setUsers(users.map(u => u.id === user.id ? { ...u, is_active: originalStatus } : u));
      toast.error("Failed to update status");
    }
  };

  const openCreditModal = (user) => {
    setSelectedUser(user);
    setCreditModalOpen(true);
  };

  const openDetails = (user) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 gap-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-sm text-muted-foreground">Manage system users.</p>
        </div>
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="px-6 py-4 border-b">
           <CardTitle className="text-base">Registered Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow>
                   <TableCell colSpan={4} className="h-24 text-center">
                     <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                   </TableCell>
                 </TableRow>
              ) : users.map((user) => (
                  <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDetails(user)}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          <AvatarImage src={user.profile_image} />
                          <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.is_staff ? <Badge variant="outline" className="bg-purple-50 text-purple-700">Admin</Badge> : <Badge variant="outline">User</Badge>}
                    </TableCell>
                    <TableCell>
                      {user.is_active ? 
                        <Badge variant="secondary" className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" /> Active</Badge> : 
                        <Badge variant="destructive"><Ban className="w-3 h-3 mr-1" /> Banned</Badge>
                      }
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openDetails(user); }}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/admin/api-logs/${user.id}`}>
                                <Activity className="mr-2 h-4 w-4" /> Check Usage Logs
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openCreditModal(user); }}>
                            <Coins className="mr-2 h-4 w-4" /> Add Credits
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleStatus(user); }}>
                            {user.is_active ? <span className="text-red-500 flex items-center"><Ban className="mr-2 h-4 w-4" /> Deactivate</span> : <span className="text-green-600 flex items-center"><Shield className="mr-2 h-4 w-4" /> Activate</span>}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t py-4">
            <div className="text-xs text-muted-foreground">Page {currentPage} of {totalPages}</div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>Next</Button>
            </div>
        </CardFooter>
      </Card>

      {/* VIEW DETAILS SHEET */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>User Details</SheetTitle>
                <SheetDescription>Account meta information.</SheetDescription>
            </SheetHeader>
            {selectedUser && (
                <div className="py-6 space-y-6 px-4">
                    <div className="flex flex-col items-center">
                        <Avatar className="h-24 w-24 mb-4 border-2">
                            <AvatarImage src={selectedUser.profile_image} />
                            <AvatarFallback className="text-2xl">{selectedUser.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                        <p className="text-muted-foreground">{selectedUser.email}</p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <span className="text-sm font-medium flex items-center"><Calendar className="w-4 h-4 mr-2" /> Joined</span>
                            <span className="text-sm">{selectedUser.date_joined ? format(new Date(selectedUser.date_joined), "PPP") : "N/A"}</span>
                        </div>
                        <div className="flex items-center justify-between border-b pb-2">
                            <span className="text-sm font-medium">Organization</span>
                            <span className="text-sm">{selectedUser.organization || "N/A"}</span>
                        </div>
                        <div className="flex items-center justify-between border-b pb-2">
                            <span className="text-sm font-medium">User ID</span>
                            <span className="text-sm font-mono">{selectedUser.id}</span>
                        </div>
                    </div>
                    <Button className="w-full" asChild>
                        <Link href={`/dashboard/admin/api-logs/${selectedUser.id}`}>
                            View Full Usage History
                        </Link>
                    </Button>
                </div>
            )}
        </SheetContent>
      </Sheet>

      <AddCreditDialog open={creditModalOpen} onOpenChange={setCreditModalOpen} user={selectedUser} />
    </div>
  );
}

// --- SUB-COMPONENT: Add Credit Dialog ---
function AddCreditDialog({ open, onOpenChange, user }) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(addCreditsSchema),
    });

    // Reset form when modal opens/closes or user changes
    useEffect(() => {
        if (!open) reset();
    }, [open, reset]);

    const onSubmit = async (data) => {
        if (!user) return;
        try {
            await adminUserService.addUserCredits(user.id, data.credits);
            toast.success(`Successfully added ${data.credits} credits to ${user.name}`);
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to add credits");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Credits</DialogTitle>
                    <DialogDescription>
                        Manually add usage credits to <strong>{user?.name}</strong>.
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="credits">Amount</Label>
                        <div className="relative">
                            <Coins className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                id="credits" 
                                type="number" 
                                placeholder="e.g. 100" 
                                className="pl-9"
                                {...register("credits")}
                            />
                        </div>
                        {errors.credits && (
                            <p className="text-red-500 text-xs">{errors.credits.message}</p>
                        )}
                    </div>
                    
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Transfer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}