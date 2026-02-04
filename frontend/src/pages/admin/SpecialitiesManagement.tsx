import { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ColumnDef } from "@tanstack/react-table";
import {
    Briefcase,
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
    useGetSpecialitiesQuery,
    useCreateSpecialityMutation,
    useUpdateSpecialityMutation,
    useDeleteSpecialityMutation,
} from "@/features/api/endpoints/domainEndpoints";
import type { Speciality } from "@/types/auth.types";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

interface SpecialityFormDialogProps {
    speciality?: Speciality | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: SpecialityFormData) => void;
    isSubmitting: boolean;
}

type SpecialityFormData = {
    name: string;
    description?: string;
};

function SpecialityFormDialog({
    speciality,
    open,
    onOpenChange,
    onSubmit,
    isSubmitting,
}: SpecialityFormDialogProps) {
    const { t } = useTranslation();
    const isEditing = !!speciality;

    const specialitySchema = z.object({
        name: z.string().min(2, t("SPECIALITIES_MANAGEMENT.VALIDATION.NAME_MIN")),
        description: z.string().optional(),
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<SpecialityFormData>({
        resolver: zodResolver(specialitySchema),
        defaultValues: {
            name: speciality?.name || "",
            description: speciality?.description || "",
        },
    });

    // Update form when speciality changes (for edit mode)
    useEffect(() => {
        if (speciality) {
            reset({
                name: speciality.name || "",
                description: speciality.description || "",
            });
        } else {
            reset({
                name: "",
                description: "",
            });
        }
    }, [speciality, reset]);

    const handleClose = () => {
        reset();
        onOpenChange(false);
    };

    const handleFormSubmit = (data: SpecialityFormData) => {
        onSubmit(data);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[550px] gap-0 p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4 bg-linear-to-br from-primary/5 to-transparent border-b border-border/50">
                    <DialogTitle className="flex items-center gap-3 text-2xl font-spline">
                        <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
                            <Briefcase className="h-6 w-6 text-primary" />
                        </div>
                        <span>{isEditing ? t("SPECIALITIES_MANAGEMENT.DIALOG.EDIT_TITLE") : t("SPECIALITIES_MANAGEMENT.DIALOG.CREATE_TITLE")}</span>
                    </DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground pl-[52px]">
                        {isEditing
                            ? t("SPECIALITIES_MANAGEMENT.DIALOG.EDIT_DESC")
                            : t("SPECIALITIES_MANAGEMENT.DIALOG.CREATE_DESC")}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="px-6 py-6 space-y-6">
                    <div className="space-y-3">
                        <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                            {t("SPECIALITIES_MANAGEMENT.DIALOG.NAME_LABEL")}
                        </Label>
                        <Input
                            id="name"
                            placeholder={t("SPECIALITIES_MANAGEMENT.DIALOG.NAME_PLACEHOLDER")}
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
                            {t("SPECIALITIES_MANAGEMENT.DIALOG.DESC_LABEL")}
                        </Label>
                        <Textarea
                            id="description"
                            placeholder={t("SPECIALITIES_MANAGEMENT.DIALOG.DESC_PLACEHOLDER")}
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
                            {t("SPECIALITIES_MANAGEMENT.DIALOG.CANCEL")}
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="min-w-[160px] h-11 bg-primary hover:bg-primary/90"
                        >
                            {isSubmitting
                                ? isEditing
                                    ? t("SPECIALITIES_MANAGEMENT.DIALOG.UPDATING")
                                    : t("SPECIALITIES_MANAGEMENT.DIALOG.CREATING")
                                : isEditing
                                    ? t("SPECIALITIES_MANAGEMENT.DIALOG.UPDATE")
                                    : t("SPECIALITIES_MANAGEMENT.DIALOG.CREATE")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Mobile Card Component
interface SpecialityCardProps {
    speciality: Speciality;
    onEdit: (speciality: Speciality) => void;
    onDelete: (speciality: Speciality) => void;
}

function SpecialityCard({ speciality, onEdit, onDelete }: SpecialityCardProps) {
    const { t } = useTranslation();

    return (
        <Card className="group border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300">
            <CardContent className="p-5">
                <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 border border-primary/20 group-hover:scale-105 transition-transform">
                        <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                        <h3 className="font-bold text-lg text-foreground truncate">
                            {speciality.name}
                        </h3>
                        {speciality.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {speciality.description}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/40">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(speciality)}
                        className="flex-1 h-9 hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-colors"
                    >
                        <Pencil className="h-4 w-4 mr-2" />
                        {t("SPECIALITIES_MANAGEMENT.TABLE.COLUMNS.ACTIONS")}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(speciality)}
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

export default function SpecialitiesManagement() {
    const { t } = useTranslation();
    const [selectedSpeciality, setSelectedSpeciality] = useState<Speciality | null>(null);
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [specialityToDelete, setSpecialityToDelete] = useState<Speciality | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const { data: specialitiesData, isLoading } = useGetSpecialitiesQuery();
    const [createSpeciality, { isLoading: isCreating }] = useCreateSpecialityMutation();
    const [updateSpeciality, { isLoading: isUpdating }] = useUpdateSpecialityMutation();
    const [deleteSpeciality, { isLoading: isDeleting }] = useDeleteSpecialityMutation();

    const specialities = specialitiesData?.data || [];

    // Filter specialities based on search
    const filteredSpecialities = useMemo(() => {
        if (!searchQuery.trim()) return specialities;
        const query = searchQuery.toLowerCase();
        return specialities.filter(
            (speciality) =>
                speciality.name.toLowerCase().includes(query) ||
                speciality.description?.toLowerCase().includes(query)
        );
    }, [specialities, searchQuery]);

    const handleCreateClick = useCallback(() => {
        setSelectedSpeciality(null);
        setFormDialogOpen(true);
    }, []);

    const handleEditClick = useCallback((speciality: Speciality) => {
        setSelectedSpeciality(speciality);
        setFormDialogOpen(true);
    }, []);

    const handleDeleteClick = useCallback((speciality: Speciality) => {
        setSpecialityToDelete(speciality);
        setDeleteDialogOpen(true);
    }, []);

    const handleFormSubmit = useCallback(async (data: SpecialityFormData) => {
        try {
            if (selectedSpeciality) {
                await updateSpeciality({ id: selectedSpeciality.id, data }).unwrap();
                showSuccessToast(
                    t("SPECIALITIES_MANAGEMENT.DIALOG.UPDATE"),
                    t("SPECIALITIES_MANAGEMENT.DIALOG.EDIT_DESC")
                );
                setFormDialogOpen(false);
                setSelectedSpeciality(null);
            } else {
                await createSpeciality(data).unwrap();
                showSuccessToast(
                    t("SPECIALITIES_MANAGEMENT.DIALOG.CREATE"),
                    t("SPECIALITIES_MANAGEMENT.DIALOG.CREATE_DESC")
                );
                setFormDialogOpen(false);
            }
        } catch (error) {
            showErrorToast(error);
        }
    }, [selectedSpeciality, updateSpeciality, createSpeciality, t]);

    const handleDeleteConfirm = useCallback(async () => {
        if (specialityToDelete) {
            try {
                await deleteSpeciality(specialityToDelete.id).unwrap();
                showSuccessToast(
                    t("SPECIALITIES_MANAGEMENT.DELETE.TITLE"),
                    t("SPECIALITIES_MANAGEMENT.DELETE.MESSAGE", { name: specialityToDelete.name })
                );
                setDeleteDialogOpen(false);
                setSpecialityToDelete(null);
            } catch (error) {
                showErrorToast(error);
            }
        }
    }, [specialityToDelete, deleteSpeciality, t]);

    // Column definitions for DataTable (desktop)
    const columns: ColumnDef<Speciality>[] = useMemo(
        () => [
            {
                accessorKey: "name",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title={t("SPECIALITIES_MANAGEMENT.TABLE.COLUMNS.SPECIALITY")} />
                ),
                cell: ({ row }) => {
                    const speciality = row.original;
                    return (
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 border border-primary/20">
                                <Briefcase className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-foreground truncate">{speciality.name}</p>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: "description",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title={t("SPECIALITIES_MANAGEMENT.TABLE.COLUMNS.DESCRIPTION")} />
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
                header: t("SPECIALITIES_MANAGEMENT.TABLE.COLUMNS.ACTIONS"),
                cell: ({ row }) => {
                    const speciality = row.original;
                    return (
                        <div className="flex items-center gap-2 justify-end">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClick(speciality)}
                                className="h-9 w-9 p-0 hover:text-primary hover:bg-primary/10 transition-colors"
                            >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(speciality)}
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
                        {t("SPECIALITIES_MANAGEMENT.TITLE")}
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-[600px]">
                        {t("SPECIALITIES_MANAGEMENT.SUBTITLE")}
                    </p>
                </div>

                <Button
                    onClick={handleCreateClick}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 h-11"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    {t("SPECIALITIES_MANAGEMENT.ADD_BUTTON")}
                </Button>
            </div>

            {/* Search Bar */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder={t("SPECIALITIES_MANAGEMENT.TABLE.SEARCH_PLACEHOLDER")}
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
                            <Briefcase className="h-5 w-5 text-primary" />
                        </div>
                        {t("SPECIALITIES_MANAGEMENT.TABLE.TITLE")}
                        {!isLoading && (
                            <Badge variant="secondary" className="ml-2 bg-background/50 backdrop-blur-sm border-border/50">
                                {filteredSpecialities.length}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable
                        columns={columns}
                        data={filteredSpecialities}
                        isLoading={isLoading}
                        enableSorting={true}
                        enableGlobalFilter={false}
                        enablePagination={true}
                        pageSize={10}
                        emptyIcon={Briefcase}
                        emptyTitle={t("SPECIALITIES_MANAGEMENT.TABLE.EMPTY_TITLE")}
                        emptyDescription={t("SPECIALITIES_MANAGEMENT.TABLE.EMPTY_DESC")}
                        emptyAction={
                            <Button onClick={handleCreateClick} variant="outline" className="mt-4">
                                <Plus className="mr-2 h-4 w-4" />
                                {t("SPECIALITIES_MANAGEMENT.ADD_BUTTON")}
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
                ) : filteredSpecialities.length === 0 ? (
                    <Card className="border-border/40 border-dashed">
                        <CardContent className="p-12 text-center">
                            <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                <Briefcase className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{t("SPECIALITIES_MANAGEMENT.TABLE.EMPTY_TITLE")}</h3>
                            <p className="text-sm text-muted-foreground mb-4">{t("SPECIALITIES_MANAGEMENT.TABLE.EMPTY_DESC")}</p>
                            <Button onClick={handleCreateClick} variant="outline">
                                <Plus className="mr-2 h-4 w-4" />
                                {t("SPECIALITIES_MANAGEMENT.ADD_BUTTON")}
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    filteredSpecialities.map((speciality) => (
                        <SpecialityCard
                            key={speciality.id}
                            speciality={speciality}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                        />
                    ))
                )}
            </div>

            {/* Form Dialog */}
            <SpecialityFormDialog
                speciality={selectedSpeciality}
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
                            {t("SPECIALITIES_MANAGEMENT.DELETE.TITLE")}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                            {t("SPECIALITIES_MANAGEMENT.DELETE.MESSAGE", { name: specialityToDelete?.name })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel className="min-w-[100px]">
                            {t("SPECIALITIES_MANAGEMENT.DELETE.CANCEL")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 min-w-[100px]"
                        >
                            {isDeleting ? t("SPECIALITIES_MANAGEMENT.DELETE.DELETING") : t("SPECIALITIES_MANAGEMENT.DELETE.CONFIRM")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
