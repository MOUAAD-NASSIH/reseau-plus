import { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ColumnDef } from "@tanstack/react-table";
import {
    Briefcase,
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
    useSpecialities,
    useCreateSpeciality,
    useUpdateSpeciality,
    useDeleteSpeciality,
} from "@/features/hooks/useDomains";
import type { Speciality } from "@/types/auth.types";

const specialitySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
});

type SpecialityFormData = z.infer<typeof specialitySchema>;


interface SpecialityFormDialogProps {
    speciality?: Speciality | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: SpecialityFormData) => void;
    isSubmitting: boolean;
}

function SpecialityFormDialog({
    speciality,
    open,
    onOpenChange,
    onSubmit,
    isSubmitting,
}: SpecialityFormDialogProps) {
    const isEditing = !!speciality;

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

    const handleClose = () => {
        reset();
        onOpenChange(false);
    };

    const handleFormSubmit = (data: SpecialityFormData) => {
        onSubmit(data);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        {isEditing ? "Edit Speciality" : "Create Speciality"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update the speciality information"
                            : "Add a new speciality to the platform"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="Enter speciality name"
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
                            placeholder="Enter speciality description"
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
                                    ? "Update Speciality"
                                    : "Create Speciality"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


export default function SpecialitiesManagement() {
    const [selectedSpeciality, setSelectedSpeciality] = useState<Speciality | null>(null);
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [specialityToDelete, setSpecialityToDelete] = useState<Speciality | null>(null);

    const { data: specialitiesData, isLoading } = useSpecialities();
    const createSpeciality = useCreateSpeciality();
    const updateSpeciality = useUpdateSpeciality();
    const deleteSpeciality = useDeleteSpeciality();

    const specialities = specialitiesData?.data || [];

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

    const handleFormSubmit = useCallback((data: SpecialityFormData) => {
        if (selectedSpeciality) {
            updateSpeciality.mutate(
                { id: selectedSpeciality.id, data },
                {
                    onSuccess: () => {
                        setFormDialogOpen(false);
                        setSelectedSpeciality(null);
                    },
                }
            );
        } else {
            createSpeciality.mutate(data, {
                onSuccess: () => {
                    setFormDialogOpen(false);
                },
            });
        }
    }, [selectedSpeciality, updateSpeciality, createSpeciality]);

    const handleDeleteConfirm = useCallback(() => {
        if (specialityToDelete) {
            deleteSpeciality.mutate(specialityToDelete.id, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setSpecialityToDelete(null);
                },
            });
        }
    }, [specialityToDelete, deleteSpeciality]);

    // Column definitions for DataTable
    const columns: ColumnDef<Speciality>[] = useMemo(
        () => [
            {
                accessorKey: "name",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Speciality" />
                ),
                cell: ({ row }) => {
                    const speciality = row.original;
                    return (
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Briefcase className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-medium">{speciality.name}</p>
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
                    const speciality = row.original;
                    return (
                        <div className="flex items-center gap-2 justify-end">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClick(speciality)}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(speciality)}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
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
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Specialities
                        {!isLoading && (
                            <Badge variant="secondary" className="ml-2">
                                {specialities.length}
                            </Badge>
                        )}
                    </CardTitle>
                    <Button onClick={handleCreateClick}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Speciality
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={specialities}
                        isLoading={isLoading}
                        enableSorting={true}
                        enableGlobalFilter={true}
                        globalFilterPlaceholder="Search specialities..."
                        enablePagination={true}
                        pageSize={10}
                        emptyIcon={Briefcase}
                        emptyTitle="No specialities yet"
                        emptyDescription="Create your first speciality to get started"
                        emptyAction={
                            <Button onClick={handleCreateClick}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Speciality
                            </Button>
                        }
                    />
                </CardContent>
            </Card>


            {/* Form Dialog */}
            <SpecialityFormDialog
                speciality={selectedSpeciality}
                open={formDialogOpen}
                onOpenChange={setFormDialogOpen}
                onSubmit={handleFormSubmit}
                isSubmitting={createSpeciality.isPending || updateSpeciality.isPending}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Speciality</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{specialityToDelete?.name}"? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteSpeciality.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
