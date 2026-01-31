import { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ColumnDef } from "@tanstack/react-table";
import {
    Layers,
    Plus,
    Pencil,
    Trash2,
    Search,
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
import { showSuccessToast, showErrorToast } from "@/lib/toast";

interface DomainFormDialogProps {
    domain?: Domain | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: DomainFormData) => void;
    isSubmitting: boolean;
}

type DomainFormData = {
    name: string;
    description?: string;
};

function DomainFormDialog({
    domain,
    open,
    onOpenChange,
    onSubmit,
    isSubmitting,
}: DomainFormDialogProps) {
    const { t } = useTranslation();
    const isEditing = !!domain;

    const domainSchema = z.object({
        name: z.string().min(2, t("DOMAINS_MANAGEMENT.VALIDATION.NAME_MIN")),
        description: z.string().optional(),
    });

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

    // Update form when domain changes (for edit mode)
    useEffect(() => {
        if (domain) {
            reset({
                name: domain.name || "",
                description: domain.description || "",
            });
        } else {
            reset({
                name: "",
                description: "",
            });
        }
    }, [domain, reset]);

    const handleClose = () => {
        reset();
        onOpenChange(false);
    };

    const handleFormSubmit = (data: DomainFormData) => {
        onSubmit(data);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[550px] gap-0 p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4 bg-linear-to-br from-primary/5 to-transparent border-b border-border/50">
                    <DialogTitle className="flex items-center gap-3 text-2xl font-spline">
                        <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
                            <Layers className="h-6 w-6 text-primary" />
                        </div>
                        <span>{isEditing ? t("DOMAINS_MANAGEMENT.DIALOG.EDIT_TITLE") : t("DOMAINS_MANAGEMENT.DIALOG.CREATE_TITLE")}</span>
                    </DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground pl-[52px]">
                        {isEditing
                            ? t("DOMAINS_MANAGEMENT.DIALOG.EDIT_DESC")
                            : t("DOMAINS_MANAGEMENT.DIALOG.CREATE_DESC")}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="px-6 py-6 space-y-6">
                    <div className="space-y-3">
                        <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                            {t("DOMAINS_MANAGEMENT.DIALOG.NAME_LABEL")}
                        </Label>
                        <Input
                            id="name"
                            placeholder={t("DOMAINS_MANAGEMENT.DIALOG.NAME_PLACEHOLDER")}
                            {...register("name")}
                            className="h-12 text-base"
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive flex items-center gap-1.5">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="description" className="text-sm font-semibold text-foreground">
                            {t("DOMAINS_MANAGEMENT.DIALOG.DESC_LABEL")}
                        </Label>
                        <Textarea
                            id="description"
                            placeholder={t("DOMAINS_MANAGEMENT.DIALOG.DESC_PLACEHOLDER")}
                            rows={4}
                            {...register("description")}
                            className="resize-none text-base placeholder:opacity-55"
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive flex items-center gap-1.5">
                                {errors.description.message}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="gap-3 pt-4 border-t border-border/50">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="min-w-[120px] h-11"
                        >
                            {t("DOMAINS_MANAGEMENT.DIALOG.CANCEL")}
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="min-w-[160px] h-11 bg-primary hover:bg-primary/90"
                        >
                            {isSubmitting
                                ? isEditing
                                    ? t("DOMAINS_MANAGEMENT.DIALOG.UPDATING")
                                    : t("DOMAINS_MANAGEMENT.DIALOG.CREATING")
                                : isEditing
                                    ? t("DOMAINS_MANAGEMENT.DIALOG.UPDATE")
                                    : t("DOMAINS_MANAGEMENT.DIALOG.CREATE")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Mobile Card Component
interface DomainCardProps {
    domain: Domain;
    onEdit: (domain: Domain) => void;
    onDelete: (domain: Domain) => void;
}

function DomainCard({ domain, onEdit, onDelete }: DomainCardProps) {
    const { t } = useTranslation();

    return (
        <Card className="group border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300">
            <CardContent className="p-5">
                <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 border border-primary/20 group-hover:scale-105 transition-transform">
                        <Layers className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                        <h3 className="font-bold text-lg text-foreground truncate">
                            {domain.name}
                        </h3>
                        {domain.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {domain.description}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/40">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(domain)}
                        className="flex-1 h-9 hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-colors"
                    >
                        <Pencil className="h-4 w-4 mr-2" />
                        {t("DOMAINS_MANAGEMENT.TABLE.COLUMNS.ACTIONS")}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(domain)}
                        className="h-9 w-9 p-0 hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function DomainsManagement() {
    const { t } = useTranslation();
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [domainToDelete, setDomainToDelete] = useState<Domain | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const { data: domainsData, isLoading } = useGetDomainsQuery();
    const [createDomain, { isLoading: isCreating }] = useCreateDomainMutation();
    const [updateDomain, { isLoading: isUpdating }] = useUpdateDomainMutation();
    const [deleteDomain, { isLoading: isDeleting }] = useDeleteDomainMutation();

    const domains = domainsData?.data || [];

    // Filter domains based on search
    const filteredDomains = useMemo(() => {
        if (!searchQuery.trim()) return domains;
        const query = searchQuery.toLowerCase();
        return domains.filter(
            (domain) =>
                domain.name.toLowerCase().includes(query) ||
                domain.description?.toLowerCase().includes(query)
        );
    }, [domains, searchQuery]);

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
                showSuccessToast(
                    t("DOMAINS_MANAGEMENT.DIALOG.UPDATE"),
                    t("DOMAINS_MANAGEMENT.DIALOG.EDIT_DESC")
                );
                setFormDialogOpen(false);
                setSelectedDomain(null);
            } else {
                await createDomain(data).unwrap();
                showSuccessToast(
                    t("DOMAINS_MANAGEMENT.DIALOG.CREATE"),
                    t("DOMAINS_MANAGEMENT.DIALOG.CREATE_DESC")
                );
                setFormDialogOpen(false);
            }
        } catch (error) {
            showErrorToast(error);
        }
    }, [selectedDomain, updateDomain, createDomain, t]);

    const handleDeleteConfirm = useCallback(async () => {
        if (domainToDelete) {
            try {
                await deleteDomain(domainToDelete.id).unwrap();
                showSuccessToast(
                    t("DOMAINS_MANAGEMENT.DELETE.TITLE"),
                    t("DOMAINS_MANAGEMENT.DELETE.MESSAGE", { name: domainToDelete.name })
                );
                setDeleteDialogOpen(false);
                setDomainToDelete(null);
            } catch (error) {
                showErrorToast(error);
            }
        }
    }, [domainToDelete, deleteDomain, t]);

    // Column definitions for DataTable (desktop)
    const columns: ColumnDef<Domain>[] = useMemo(
        () => [
            {
                accessorKey: "name",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title={t("DOMAINS_MANAGEMENT.TABLE.COLUMNS.DOMAIN")} />
                ),
                cell: ({ row }) => {
                    const domain = row.original;
                    return (
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 border border-primary/20">
                                <Layers className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-foreground truncate">{domain.name}</p>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: "description",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title={t("DOMAINS_MANAGEMENT.TABLE.COLUMNS.DESCRIPTION")} />
                ),
                cell: ({ row }) => {
                    const description = row.getValue("description") as string | null;
                    return description ? (
                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-[400px]">
                            {description}
                        </p>
                    ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                    );
                },
            },
            {
                id: "actions",
                header: t("DOMAINS_MANAGEMENT.TABLE.COLUMNS.ACTIONS"),
                cell: ({ row }) => {
                    const domain = row.original;
                    return (
                        <div className="flex items-center gap-2 justify-end">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClick(domain)}
                                className="h-9 w-9 p-0 hover:text-primary hover:bg-primary/10 transition-colors"
                            >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(domain)}
                                className="h-9 w-9 p-0 hover:text-destructive hover:bg-destructive/10 text-muted-foreground transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                            </Button>
                        </div>
                    );
                },
                enableSorting: false,
            },
        ],
        [handleEditClick, handleDeleteClick, t]
    );

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl sm:text-4xl 2xl:text-5xl font-extrabold tracking-tight text-foreground font-spline">
                        {t("DOMAINS_MANAGEMENT.TITLE")}
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-[600px]">
                        {t("DOMAINS_MANAGEMENT.SUBTITLE")}
                    </p>
                </div>

                <Button
                    onClick={handleCreateClick}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 h-11"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    {t("DOMAINS_MANAGEMENT.ADD_BUTTON")}
                </Button>
            </div>

            {/* Search Bar */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder={t("DOMAINS_MANAGEMENT.TABLE.SEARCH_PLACEHOLDER")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-12 text-base bg-background/50"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Desktop Table View */}
            <Card className="border-border/40 shadow-2xl bg-card/60 backdrop-blur-xl overflow-hidden rounded-2xl hidden md:block">
                <CardHeader className="flex flex-row items-center justify-between pb-4 bg-muted/20 border-b border-border/40 px-6 py-5">
                    <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2 font-spline">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Layers className="h-5 w-5 text-primary" />
                        </div>
                        {t("DOMAINS_MANAGEMENT.TABLE.TITLE")}
                        {!isLoading && (
                            <Badge variant="secondary" className="ml-2 bg-background/50 backdrop-blur-sm border-border/50">
                                {filteredDomains.length}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable
                        columns={columns}
                        data={filteredDomains}
                        isLoading={isLoading}
                        enableSorting={true}
                        enableGlobalFilter={false}
                        enablePagination={true}
                        pageSize={10}
                        emptyIcon={Layers}
                        emptyTitle={t("DOMAINS_MANAGEMENT.TABLE.EMPTY_TITLE")}
                        emptyDescription={t("DOMAINS_MANAGEMENT.TABLE.EMPTY_DESC")}
                        emptyAction={
                            <Button onClick={handleCreateClick} variant="outline" className="mt-4">
                                <Plus className="mr-2 h-4 w-4" />
                                {t("DOMAINS_MANAGEMENT.ADD_BUTTON")}
                            </Button>
                        }
                    />
                </CardContent>
            </Card>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i} className="border-border/40 animate-pulse">
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-muted shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-5 bg-muted rounded w-3/4" />
                                            <div className="h-4 bg-muted rounded w-full" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : filteredDomains.length === 0 ? (
                    <Card className="border-border/40 border-dashed">
                        <CardContent className="p-12 text-center">
                            <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                <Layers className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{t("DOMAINS_MANAGEMENT.TABLE.EMPTY_TITLE")}</h3>
                            <p className="text-sm text-muted-foreground mb-4">{t("DOMAINS_MANAGEMENT.TABLE.EMPTY_DESC")}</p>
                            <Button onClick={handleCreateClick} variant="outline">
                                <Plus className="mr-2 h-4 w-4" />
                                {t("DOMAINS_MANAGEMENT.ADD_BUTTON")}
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    filteredDomains.map((domain) => (
                        <DomainCard
                            key={domain.id}
                            domain={domain}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                        />
                    ))
                )}
            </div>

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
                        <AlertDialogTitle className="font-spline text-xl">
                            {t("DOMAINS_MANAGEMENT.DELETE.TITLE")}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                            {t("DOMAINS_MANAGEMENT.DELETE.MESSAGE", { name: domainToDelete?.name })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel className="min-w-[100px]">
                            {t("DOMAINS_MANAGEMENT.DELETE.CANCEL")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 min-w-[100px]"
                        >
                            {isDeleting ? t("DOMAINS_MANAGEMENT.DELETE.DELETING") : t("DOMAINS_MANAGEMENT.DELETE.CONFIRM")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
