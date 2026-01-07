"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Copy, MoreHorizontal, Plus, Trash2, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner"; // Assuming you use Sonner or similar for toasts

// Services & Schemas
import { createAPIKeySchema } from "@/schemas/dashboard"; // Update path if needed
import { getAPIKeys, createAPIKey, revokeAPIKey } from "@/services/dashboardService";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Load Keys on Mount
  const fetchKeys = async () => {
    try {
      setLoading(true);
      const response = await getAPIKeys();
      setKeys(response.data);
    } catch (error) {
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  // Handle Copy
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("API Key copied to clipboard");
  };

  // Handle Revoke
  const handleRevoke = async (id) => {
    try {
      await revokeAPIKey(id);
      toast.success("API Key revoked successfully");
      fetchKeys(); // Refresh list
    } catch (error) {
      toast.error("Failed to revoke key");
    }
  };

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 gap-6">
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">API Keys</h2>
          <p className="text-sm text-muted-foreground">
            Manage your API keys and access limits.
          </p>
        </div>
        <CreateKeyModal 
          isOpen={isCreateOpen} 
          setIsOpen={setIsCreateOpen} 
          onSuccess={fetchKeys} 
        />
      </div>

      {/* Main Content Area */}
      <Card>
        <CardHeader>
          <CardTitle>Active Keys</CardTitle>
          <CardDescription>
            You have {keys.filter(k => k.is_active).length} active keys.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <KeysTable 
              data={keys} 
              onCopy={copyToClipboard} 
              onRevoke={handleRevoke} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// --- Sub-Component: Create Key Modal ---
function CreateKeyModal({ isOpen, setIsOpen, onSuccess }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createAPIKeySchema),
    defaultValues: {
      daily_limit: 1000,
    },
  });

  const onSubmit = async (data) => {
    try {
      await createAPIKey(data);
      toast.success("API Key created successfully");
      setIsOpen(false);
      reset();
      onSuccess(); // Refresh parent list
    } catch (error) {
      toast.error("Failed to create API key");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create New Key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
            Generate a new key to access the API. Set a daily limit to control usage.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Key Name</Label>
            <Input id="name" placeholder="e.g. Production App" {...register("name")} />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="daily_limit">Daily Limit</Label>
            <Input 
              id="daily_limit" 
              type="number" 
              {...register("daily_limit")} 
            />
            {errors.daily_limit && <p className="text-red-500 text-xs">{errors.daily_limit.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Key
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Sub-Component: Keys Table ---
function KeysTable({ data, onCopy, onRevoke }) {
  if (data.length === 0) {
    return <div className="text-center py-6 text-muted-foreground">No API keys found. Create one to get started.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="w-[300px]">API Key</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((key) => (
          <TableRow key={key.id}>
            <TableCell className="font-medium">
              <div className="flex flex-col">
                <span>{key.name}</span>
                <span className="text-xs text-muted-foreground">Limit: {key.daily_limit}/day</span>
              </div>
            </TableCell>
            <TableCell className="font-mono text-sm">
              <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded border max-w-fit">
                <span className="truncate max-w-[200px] select-all">
                  {key.is_active ? key.key : "••••••••••••••••"}
                </span>
                {key.is_active && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => onCopy(key.key)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </TableCell>
            <TableCell>
              {key.is_active ? (
                <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
              ) : (
                <Badge variant="destructive">Revoked</Badge>
              )}
            </TableCell>
            <TableCell>{format(new Date(key.created_at), "MMM d, yyyy")}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onCopy(key.key)} disabled={!key.is_active}>
                    <Copy className="mr-2 h-4 w-4" /> Copy Key
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  
                  {/* Delete with Confirmation Dialog Trigger */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={!key.is_active} className="text-red-600 focus:text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Revoke Key
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. Any applications using this key ({key.name}) will immediately lose access to the API.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onRevoke(key.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Yes, Revoke
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}