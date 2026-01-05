import { FileText } from "lucide-react";

interface DocumentItem {
    type: string;
    fileName: string;
}

interface DocumentListProps {
    documents: DocumentItem[];
}

export function DocumentList({ documents }: DocumentListProps) {
    if (documents.length === 0) {
        return <p className="text-sm text-muted-foreground">No documents uploaded</p>;
    }

    return (
        <div className="space-y-2">
            {documents.map((doc, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="font-medium">{doc.fileName}</p>
                        <p className="text-sm text-muted-foreground">{doc.type}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
