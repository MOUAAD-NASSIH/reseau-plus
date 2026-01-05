import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, FileText, Trash, CheckCircle2 } from "lucide-react";

import {
  workerDocumentsSchema,
  type WorkerDocumentsForm,
} from "../workerRegister.schema";

import { useWorkerRegisterStore } from "../workerRegister.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const REQUIRED_DOCS = [
  {
    type: "DIPLOMA",
    label: "Diploma",
    description: "Official diploma or certification (PDF)",
  },
  {
    type: "CV",
    label: "Curriculum Vitae (CV)",
    description: "Updated resume highlighting your experience",
  },
  {
    type: "ID",
    label: "Identity Document",
    description: "National ID or passport",
  },
] as const;

type DocType = (typeof REQUIRED_DOCS)[number]["type"];

export default function StepDocuments() {
  const { data, updateData } = useWorkerRegisterStore();

  const form = useForm<WorkerDocumentsForm>({
    resolver: zodResolver(workerDocumentsSchema),
    defaultValues: {
      documents: data.documents ?? [],
    },
  });

  const fileInputs = useRef<Record<DocType, HTMLInputElement | null>>({
    DIPLOMA: null,
    CV: null,
    ID: null,
  });

  /* ================================
     Persist valid data
  ================================ */
  useEffect(() => {
    const sub = form.watch((values) => {
      const result = workerDocumentsSchema.safeParse(values);
      if (result.success) {
        updateData(result.data);
      }
    });
    return () => sub.unsubscribe();
  }, [form, updateData]);

  function onFileChange(type: DocType, file?: File) {
    if (!file) return;

    const existing = form.getValues("documents") ?? [];
    const filtered = existing.filter((d) => d.type !== type);

    form.setValue("documents", [...filtered, { type, file }], {
      shouldValidate: true,
    });
  }

  function removeFile(type: DocType) {
    const updated =
      form.getValues("documents")?.filter((d) => d.type !== type) ?? [];

    form.setValue("documents", updated, {
      shouldValidate: true,
    });
  }

  const documents = form.watch("documents") ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">
          Required documents
        </h2>
        <p className="text-muted-foreground">
          These documents are required for verification and approval
        </p>
      </div>

      {/* Document list */}
      <div className="space-y-4">
        {REQUIRED_DOCS.map((doc) => {
          const uploaded = documents.find((d) => d.type === doc.type);

          return (
            <div
              key={doc.type}
              className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-5"
            >
              {/* Left content */}
              <div className="flex items-start gap-4">
                {uploaded ? (
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1" />
                ) : (
                  <FileText className="h-6 w-6 text-muted-foreground mt-1" />
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{doc.label}</p>

                    {uploaded ? (
                      <Badge variant="secondary">Uploaded</Badge>
                    ) : (
                      <Badge variant="outline">Required</Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {doc.description}
                  </p>

                  {uploaded && (
                    <p className="text-sm text-muted-foreground">
                      {uploaded.file.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {!uploaded ? (
                  <>
                    <input
                      ref={(el) => {
                        fileInputs.current[doc.type] = el;
                      }}
                      type="file"
                      className="hidden"
                      onChange={(e) =>
                        onFileChange(doc.type, e.target.files?.[0])
                      }
                    />

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputs.current[doc.type]?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(doc.type)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Error */}
      {form.formState.errors.documents && (
        <p className="text-sm text-destructive">
          {form.formState.errors.documents.message}
        </p>
      )}
    </div>
  );
}
