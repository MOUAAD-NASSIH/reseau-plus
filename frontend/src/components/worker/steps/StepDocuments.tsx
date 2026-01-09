import { useRef } from "react";
import {
  FileCheck,
  ShieldCheck,
  AlertCircle,
  X,
  FileText,
  BadgeCheck,
  CreditCard,
  GraduationCap,
  Upload
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import { useWorkerRegisterStore } from "../workerRegister.store";
import { Button } from "@/components/ui/button";
import { shouldReduceMotion, staggerContainer, fadeUpItem } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface DocumentType {
  id: "DIPLOMA" | "CV" | "ID";
  titleKey: string;
  descKey: string;
  formatsKey: string;
  icon: any;
  required: boolean;
}

const DOCUMENT_TYPES: DocumentType[] = [
  {
    id: "DIPLOMA",
    titleKey: "AUTH.REGISTER_WORKER.STEP_DOCUMENTS.DIPLOMA_TITLE",
    descKey: "AUTH.REGISTER_WORKER.STEP_DOCUMENTS.DIPLOMA_DESC",
    formatsKey: "AUTH.REGISTER_WORKER.STEP_DOCUMENTS.SUPPORTED_FORMATS",
    icon: GraduationCap,
    required: true,
  },
  {
    id: "ID",
    titleKey: "AUTH.REGISTER_WORKER.STEP_DOCUMENTS.ID_TITLE",
    descKey: "AUTH.REGISTER_WORKER.STEP_DOCUMENTS.ID_DESC",
    formatsKey: "AUTH.REGISTER_WORKER.STEP_DOCUMENTS.SUPPORTED_FORMATS",
    icon: CreditCard,
    required: true,
  },
  {
    id: "CV",
    titleKey: "AUTH.REGISTER_WORKER.STEP_DOCUMENTS.CV_TITLE",
    descKey: "AUTH.REGISTER_WORKER.STEP_DOCUMENTS.CV_DESC",
    formatsKey: "AUTH.REGISTER_WORKER.STEP_DOCUMENTS.SUPPORTED_FORMATS_CV",
    icon: FileText,
    required: false,
  }
];

export default function StepDocuments() {
  const { data, updateData } = useWorkerRegisterStore();
  const { t } = useTranslation();
  const inputRefs = {
    DIPLOMA: useRef<HTMLInputElement>(null),
    CV: useRef<HTMLInputElement>(null),
    ID: useRef<HTMLInputElement>(null),
  };

  const documents = data.documents || [];

  const handleFileChange = (type: "DIPLOMA" | "CV" | "ID", file: File | null) => {
    if (!file) return;

    // Filter out existing document of same type
    const otherDocs = documents.filter((doc) => doc.type !== type);

    updateData({
      documents: [
        ...otherDocs,
        { type, file, status: "UPLOADED" as const },
      ],
    });
  };

  const removeFile = (type: "DIPLOMA" | "CV" | "ID") => {
    updateData({
      documents: documents.filter((doc) => doc.type !== type),
    });
    // Reset file input
    if (inputRefs[type].current) {
      inputRefs[type].current!.value = "";
    }
  };

  const reduceMotion = shouldReduceMotion();

  return (
    <motion.div
      className="space-y-8"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <motion.div variants={reduceMotion ? {} : fadeUpItem}>
        <h2 className="text-xl md:text-2xl font-bold mb-2 tracking-tight text-foreground">
          {t('AUTH.REGISTER_WORKER.STEP_DOCUMENTS.TITLE')}
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          {t('AUTH.REGISTER_WORKER.STEP_DOCUMENTS.SUBTITLE')}
        </p>
      </motion.div>

      {/* Verification Shield Info */}
      <motion.div
        variants={reduceMotion ? {} : fadeUpItem}
        className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-4 shadow-sm"
      >
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <ShieldCheck className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-foreground">{t('AUTH.REGISTER_WORKER.STEP_DOCUMENTS.SECURE_UPLOAD_TITLE')}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('AUTH.REGISTER_WORKER.STEP_DOCUMENTS.SECURE_UPLOAD_DESC')}
          </p>
        </div>
      </motion.div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 gap-4">
        {DOCUMENT_TYPES.map((docType) => {
          const uploadedDoc = documents.find((d) => d.type === docType.id);
          const Icon = docType.icon;

          return (
            <motion.div
              key={docType.id}
              variants={reduceMotion ? {} : fadeUpItem}
              className={cn(
                "group relative overflow-hidden rounded-2xl border transition-all duration-300",
                uploadedDoc
                  ? "bg-linear-to-br from-primary/5 to-transparent border-primary/30 shadow-md ring-1 ring-primary/20"
                  : "bg-card border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              )}
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center p-5 gap-5">
                {/* Icon Section */}
                <div className={cn(
                  "h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 shadow-sm",
                  uploadedDoc
                    ? "bg-primary text-primary-foreground shadow-primary/20 scale-100"
                    : "bg-secondary text-muted-foreground group-hover:scale-105 group-hover:bg-secondary/80"
                )}>
                  <Icon className={cn("h-7 w-7 sm:h-8 sm:w-8", uploadedDoc && "animate-in zoom-in spin-in-[360deg] duration-500")} />
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-base sm:text-lg tracking-tight">{t(docType.titleKey)}</h3>
                    {docType.required ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive uppercase tracking-wider border border-destructive/10">
                        {t('AUTH.REGISTER_WORKER.STEP_DOCUMENTS.REQUIRED')}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground uppercase tracking-wider border border-border">
                        {t('AUTH.REGISTER_WORKER.STEP_DOCUMENTS.OPTIONAL')}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg">
                    {t(docType.descKey)}
                  </p>

                  {uploadedDoc ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 w-fit px-3 py-1.5 rounded-lg animate-in fade-in slide-in-from-bottom-1">
                      <FileCheck className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[150px] sm:max-w-[300px]">{uploadedDoc.file.name}</span>
                      <span className="text-muted-foreground/70 font-medium">
                        • {(uploadedDoc.file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ) : (
                    <p className="text-[10px] sm:text-xs font-medium text-muted-foreground/60 flex items-center gap-1.5">
                      <AlertCircle className="h-3 w-3" />
                      {t(docType.formatsKey)}
                    </p>
                  )}
                </div>

                {/* Action Section */}
                <div className="flex items-center justify-end sm:justify-start">
                  {uploadedDoc ? (
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="h-6 w-6 text-primary animate-in zoom-in" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        onClick={() => removeFile(docType.id)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto rounded-xl border-dashed border-2 border-primary/20 hover:border-primary hover:bg-primary/5 text-foreground hover:text-primary transition-all h-10 px-4 group/btn"
                      onClick={() => inputRefs[docType.id].current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2 group-hover/btn:-translate-y-0.5 transition-transform" />
                      {t('AUTH.REGISTER_WORKER.STEP_DOCUMENTS.UPLOAD_BUTTON')}
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress Bar (Visual only for now) */}
              {uploadedDoc && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/20">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    className="h-full bg-primary"
                  />
                </div>
              )}

              <input
                type="file"
                ref={inputRefs[docType.id]}
                className="hidden"
                accept={docType.id === "CV" ? ".pdf,.docx" : ".pdf"}
                onChange={(e) => handleFileChange(docType.id, e.target.files?.[0] || null)}
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
