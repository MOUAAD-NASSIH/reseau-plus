import { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ColumnDef } from "@tanstack/react-table";
import {
    Layers,
    Plus,
    Pencil,
    Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DataTable, DataTableColumnHeader } from "@/components/common/DataTable";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
} from "@/components/ui/alert-dialog";
import {
    useGetDomainsQuery,
    useCreateDomainMutation,
    useUpdateDomainMutation,
    useDeleteDomainMutation,
} from "@/features/api/endpoints/domainEndpoints";
import type { Domain } from "@/types/auth.types";

const domainSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
});

type DomainFormData = z.infer<typeof domainSchema>;

interface DomainFormDialogProps {
    domain?: Domain | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: DomainFormData) => void;
    isSubmitting: boolean;
}

function DomainFormDialog({
    domain,
    open,
    onOpenChange,
    onSubmit,
    isSubmitting,
}: DomainFormDialogProps) {
    const isEditing = !!domain;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<DomainFormData>({
        resolver: zodResolver(domainSchema),
        defaultValues: {
            name: domain?.name || "",
            description: domain?.description || "",
        },
    });

    const handleClose = () => {
        reset();
        onOpenChange(false);
    };

    const handleFormSubmit = (data: DomainFormData) => {
        onSubmit(data);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Layers className="h-5 w-5" />
                        {isEditing ? "Edit Domain" : "Create Domain"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update the domain information"
                            : "Add a new domain to the platform"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="Enter domain name"
                            {...register("name")}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="Enter domain description"
                            rows={3}
                            {...register("description")}
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">
                                {errors.description.message}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? isEditing
                                    ? "Updating..."
                                    : "Creating..."
                                : isEditing
                                    ? "Update Domain"
                                    : "Create Domain"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function DomainsManagement() {
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [domainToDelete, setDomainToDelete] = useState<Domain | null>(null);

    const { data: domainsData, isLoading } = useGetDomainsQuery();
    const [createDomain, { isLoading: isCreating }] = useCreateDomainMutation();
    const [updateDomain, { isLoading: isUpdating }] = useUpdateDomainMutation();
    const [deleteDomain, { isLoading: isDeleting }] = useDeleteDomainMutation();

    const domains = domainsData?.data || [];

    const handleCreateClick = useCallback(() => {
        setSelectedDomain(null);
        setFormDialogOpen(true);
    }, []);

    const handleEditClick = useCallback((domain: Domain) => {
        setSelectedDomain(domain);
        setFormDialogOpen(true);
    }, []);

    const handleDeleteClick = useCallback((domain: Domain) => {
        setDomainToDelete(domain);
        setDeleteDialogOpen(true);
    }, []);

    const handleFormSubmit = useCallback(async (data: DomainFormData) => {
        try {
            if (selectedDomain) {
                await updateDomain({ id: selectedDomain.id, data }).unwrap();
                setFormDialogOpen(false);
                setSelectedDomain(null);
            } else {
                await createDomain(data).unwrap();
                setFormDialogOpen(false);
            }
        } catch {
            // Error handling is done by RTK Query
        }
    }, [selectedDomain, updateDomain, createDomain]);

    const handleDeleteConfirm = useCallback(async () => {
        if (domainToDelete) {
            try {
                await deleteDomain(domainToDelete.id).unwrap();
                setDeleteDialogOpen(false);
                setDomainToDelete(null);
            } catch {
                // Error handling is done by RTK Query
            }
        }
    }, [domainToDelete, deleteDomain]);

    // Column definitions for DataTable
    const columns: ColumnDef<Domain>[] = useMemo(
        () => [
            {
                accessorKey: "name",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Domain" />
                ),
                cell: ({ row }) => {
                    const domain = row.original;
                    return (
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Layers className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-medium text-foreground">{domain.name}</p>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: "description",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Description" />
                ),
                cell: ({ row }) => {
                    const description = row.getValue("description") as string | null;
                    return description ? (
                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-[300px]">
                            {description}
                        </p>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    );
                },
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => {
                    const domain = row.original;
                    return (
                        <div className="flex items-center gap-2 justify-end">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClick(domain)}
                                className="hover:text-primary hover:bg-primary/10"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(domain)}
                                className="hover:text-destructive hover:bg-destructive/10 text-muted-foreground"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                },
                enableSorting: false,
            },
        ],
        [handleEditClick, handleDeleteClick]
    );

    return (
        <div className="space-y-8 pb-8 font-spline">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl font-spline">
                        Domains
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-[600px]">
                        Manage professional domains and categories.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                   <Button onClick={handleCreateClick} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Domain
                    </Button>
                </div>
            </div>

            <Card className="border-border/40 shadow-2xl bg-card/60 backdrop-blur-xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/20 border-b border-border/40">
                    <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Layers className="h-5 w-5 text-primary" />
                        </div>
                        Domain List
                        {!isLoading && (
                            <Badge variant="secondary" className="ml-2 bg-background/50 backdrop-blur-sm border-border/50">
                                {domains.length}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable
                        columns={columns}
                        data={domains}
                        isLoading={isLoading}
                        enableSorting={true}
                        enableGlobalFilter={true}
                        globalFilterPlaceholder="Search domains..."
                        enablePagination={true}
                        pageSize={10}
                        emptyIcon={Layers}
                        emptyTitle="No domains yet"
                        emptyDescription="Create your first domain to get started"
                        emptyAction={
                            <Button onClick={handleCreateClick} variant="outline" className="mt-4">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Domain
                            </Button>
                        }
                    />
                </CardContent>
            </Card>

            {/* Form Dialog */}
            <DomainFormDialog
                domain={selectedDomain}
                open={formDialogOpen}
                onOpenChange={setFormDialogOpen}
                onSubmit={handleFormSubmit}
                isSubmitting={isCreating || isUpdating}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Domain</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{domainToDelete?.name}"? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

