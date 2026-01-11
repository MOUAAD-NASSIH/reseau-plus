import { useParams, Link, useNavigate } from "react-router";
import { format } from "date-fns";
import { useState } from "react";
import {
    MapPin,
    Calendar,
    CheckCircle,
    Loader2,
    AlertTriangle,
    Clock,
    TrendingUp,
    Users,
    HelpCircle,
    Navigation,
    FileDown,
    FileText,
    Phone,
    MessageSquare,
    X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGetMissionQuery } from "@/features/api/endpoints/missionEndpoints";
import { useGetMyApplicationsQuery, useApplyToMissionMutation } from "@/features/api/endpoints/applicationEndpoints";
import { useLazyGetOrCreateConversationQuery } from "@/services/messageService";
import ChatWindow from "@/components/messages/ChatWindow";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

function getUrgencyIcon(urgency: string) {
    switch (urgency) {
        case "HIGH":
            return <AlertTriangle className="h-4 w-4 text-red-400" />;
        case "MEDIUM":
            return <TrendingUp className="h-4 w-4 text-yellow-400" />;
        case "LOW":
            return <TrendingUp className="h-4 w-4 text-green-400" />;
        default:
            return null;
    }
}

function getStatusColor(status: string) {
    switch (status) {
        case "OPEN":
            return "bg-primary/20 text-primary border-primary/30";
        case "ONGOING":
            return "bg-blue-500/20 text-blue-400 border-blue-500/30";
        case "CLOSED":
            return "bg-gray-500/20 text-gray-400 border-gray-500/30";
        case "CANCELLED":
            return "bg-red-500/20 text-red-400 border-red-500/30";
        default:
            return "bg-muted text-muted-foreground";
    }
}

function MissionDetailsSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-12 w-full" />
            <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
                <div className="lg:col-span-5 space-y-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        </div>
    );
}

export default function MissionDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const missionId = parseInt(id || "0");

    const { data: missionData, isLoading: missionLoading, error: missionError } = useGetMissionQuery(missionId);
    const { data: applicationsData, isLoading: applicationsLoading } = useGetMyApplicationsQuery();
    const [applyToMission, { isLoading: isApplying }] = useApplyToMissionMutation();
    const [getOrCreateConversation] = useLazyGetOrCreateConversationQuery();

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [currentConversation, setCurrentConversation] = useState<any>(null);

    const mission = missionData?.data;
    const applications = applicationsData?.data || [];
    const institution = mission?.institution;

    // Check if already applied
    const existingApplication = applications.find((app) => app.missionId === missionId);
    const isApplied = !!existingApplication;

    const handleApply = async () => {
        try {
            await applyToMission({ missionId }).unwrap();
            showSuccessToast("Application submitted", "Your application has been sent to the institution.");
        } catch (error) {
            showErrorToast(error, "Failed to submit application");
        }
    };

    const handleOpenChat = async () => {
        if (!institution?.userId) {
            showErrorToast(null, "Institution contact not available");
            return;
        }

        try {
            const conversation = await getOrCreateConversation(institution.userId).unwrap();
            setCurrentConversation(conversation);
            setIsChatOpen(true);
        } catch (error) {
            showErrorToast(error, "Failed to open chat");
        }
    };

    if (missionLoading || applicationsLoading) {
        return <MissionDetailsSkeleton />;
    }

    if (missionError || !mission) {
        return (
            <div className="min-h-screen p-4 lg:px-40">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Mission not found</AlertTitle>
                    <AlertDescription>
                        The mission you're looking for doesn't exist or has been removed.
                    </AlertDescription>
                </Alert>
                <div className="mt-4">
                    <Button variant="outline" onClick={() => navigate("/worker/missions")}>
                        Back to Missions
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark text-white">
            {/* Breadcrumbs */}
            <div className="px-4 md:px-10 lg:px-40 py-4">
                <div className="flex flex-wrap gap-2 text-sm">
                    <Link to="/worker/dashboard" className="text-text-subtle hover:text-primary transition-colors">
                        Dashboard
                    </Link>
                    <span className="text-text-subtle">/</span>
                    <Link to="/worker/missions" className="text-text-subtle hover:text-primary transition-colors">
                        Missions
                    </Link>
                    <span className="text-text-subtle">/</span>
                    <span className="text-white font-medium">
                        Mission #{mission.id} Details
                    </span>
                </div>
            </div>

            {/* Page Heading & Actions */}
            <div className="px-4 md:px-10 lg:px-40 pb-8 border-b border-card-border/30">
                <div className="flex flex-col md:flex-row flex-wrap justify-between gap-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <div className="flex flex-wrap gap-3 items-center">
                                <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
                                    {mission.title}
                                </h1>
                                <Badge className={cn("flex items-center gap-2 px-3 py-1 border", getStatusColor(mission.status))}>
                                    <span className="size-2 rounded-full bg-current"></span>
                                    <span className="text-xs font-bold uppercase tracking-wider">
                                        {mission.status}
                                    </span>
                                </Badge>
                                {isApplied && (
                                    <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Applied
                                    </Badge>
                                )}
                            </div>
                            <p className="text-text-subtle text-base mt-1">
                                {institution?.institutionName} • Ref ID: #{mission.id}-{mission.title?.substring(0, 3).toUpperCase()}
                            </p>
                        </div>

                        {/* Chips */}
                        <div className="flex gap-2 flex-wrap">
                            {mission.urgency && (
                                <div className="flex h-8 items-center gap-2 rounded-full bg-card-dark border border-card-border px-4">
                                    {getUrgencyIcon(mission.urgency)}
                                    <p className="text-white text-xs font-medium">{mission.urgency} Priority</p>
                                </div>
                            )}
                            {mission.location && (
                                <div className="flex h-8 items-center gap-2 rounded-full bg-card-dark border border-card-border px-4">
                                    <MapPin className="h-4 w-4 text-text-subtle" />
                                    <p className="text-white text-xs font-medium">On-Site</p>
                                </div>
                            )}
                            <div className="flex h-8 items-center gap-2 rounded-full bg-card-dark border border-card-border px-4">
                                <Users className="h-4 w-4 text-text-subtle" />
                                <p className="text-white text-xs font-medium">Professional Mission</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 self-start md:self-end">
                        <Button
                            variant="outline"
                            className="rounded-full border-card-border bg-card-dark hover:bg-card-border text-white"
                        >
                            <HelpCircle className="h-4 w-4 mr-2" />
                            Support
                        </Button>
                        {!isApplied && mission.status === "OPEN" && (
                            <Button
                                onClick={handleApply}
                                disabled={isApplying}
                                className="rounded-full bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(43,238,121,0.3)]"
                            >
                                {isApplying ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Applying...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Apply Now
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 md:px-10 lg:px-40 py-8">
                {/* Left Column */}
                <div className="lg:col-span-7 flex flex-col gap-8">
                    {/* Mission Overview */}
                    <div className="flex flex-col gap-4">
                        <h2 className="text-white text-xl font-bold">Mission Overview</h2>
                        <Card className="bg-card-dark border-card-border">
                            <CardContent className="p-6">
                                <p className="text-gray-300 leading-relaxed mb-6">
                                    {mission.description || "Professional social work services required. Please review all requirements carefully before applying."}
                                </p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                                    <div className="flex items-start gap-3">
                                        <div className="size-10 rounded-full bg-card-border flex items-center justify-center shrink-0">
                                            <Calendar className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-text-subtle text-xs uppercase tracking-wider font-bold">Date</p>
                                            <p className="text-white font-medium">
                                                {mission.startDate ? format(new Date(mission.startDate), "MMM d, yyyy") : "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="size-10 rounded-full bg-card-border flex items-center justify-center shrink-0">
                                            <Clock className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-text-subtle text-xs uppercase tracking-wider font-bold">Duration</p>
                                            <p className="text-white font-medium">
                                                {mission.startDate && mission.endDate
                                                    ? `${format(new Date(mission.startDate), "MMM d")} - ${format(new Date(mission.endDate), "MMM d, yyyy")}`
                                                    : "Multiple Days"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Location & Directions */}
                    {institution && (
                        <div className="flex flex-col gap-4">
                            <h2 className="text-white text-xl font-bold">Location</h2>
                            <Card className="bg-card-dark border-card-border">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-3 mb-4">
                                        <MapPin className="h-5 w-5 text-primary mt-1" />
                                        <div>
                                            <p className="text-white font-bold text-lg mb-1">{institution.institutionName}</p>
                                            <p className="text-text-subtle text-sm">
                                                {institution.address || "Address not provided"}
                                                {institution.city && <><br />{institution.city}</>}
                                            </p>
                                        </div>
                                    </div>
                                    <Button className="w-full rounded-full border border-card-border bg-transparent text-white hover:bg-card-border">
                                        <Navigation className="h-4 w-4 mr-2" />
                                        Get Directions
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Domains Section */}
                    {mission.domains && mission.domains.length > 0 && (
                        <div className="flex flex-col gap-4">
                            <h2 className="text-white text-xl font-bold">Required Domains</h2>
                            <Card className="bg-card-dark border-card-border">
                                <CardContent className="p-6">
                                    <div className="flex flex-wrap gap-2">
                                        {mission.domains.map((md) => (
                                            <div
                                                key={md.id}
                                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-background-dark border border-card-border text-white text-sm"
                                            >
                                                {md.domain?.name}
                                                {md.isRequired && (
                                                    <span className="text-red-400 font-bold">*</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {mission.domains.some((md) => md.isRequired) && (
                                        <p className="text-xs text-text-subtle mt-4 flex items-center gap-1">
                                            <span className="text-red-400 font-bold">*</span>
                                            Required domain for this mission
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Application Status */}
                    {isApplied && (
                        <div className="flex flex-col gap-4">
                            <h2 className="text-white text-xl font-bold">Application Status</h2>
                            <Card className="bg-emerald-500/10 border-emerald-500/30">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-6 w-6 text-emerald-400 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-semibold text-emerald-100">
                                                Application Submitted Successfully
                                            </p>
                                            <p className="text-sm text-emerald-300 mt-1">
                                                Status: <span className="font-medium">{existingApplication?.status}</span>
                                            </p>
                                            <p className="text-xs text-emerald-400 mt-2">
                                                Applied on {format(new Date(existingApplication!.appliedAt), "MMM d, yyyy 'at' h:mm a")}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    {/* Contact Card */}
                    <Card className="bg-card-dark border-card-border">
                        <CardContent className="p-5">
                            <h3 className="text-text-subtle text-xs font-bold uppercase tracking-wider mb-4">
                                Point of Contact
                            </h3>
                            <div className="flex items-center gap-4 mb-5">
                                <div className="size-12 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-lg">
                                    {institution?.institutionName?.charAt(0) || "?"}
                                </div>
                                <div>
                                    <p className="text-white font-bold text-lg">Institution Contact</p>
                                    <p className="text-text-subtle text-sm">Coordinator</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    className="bg-background-dark border-card-border text-white hover:border-primary/50"
                                >
                                    <Phone className="h-4 w-4 mr-2 text-primary" />
                                    Call
                                </Button>
                                <Button
                                    variant="outline"
                                    className="bg-background-dark border-card-border text-white hover:border-primary/50"
                                    onClick={handleOpenChat}
                                >
                                    <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                                    Message
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Compensation Card */}
                    <Card className="bg-linear-to-br from-card-dark to-[#16291f] border-card-border">
                        <CardContent className="p-5">
                            <h3 className="text-text-subtle text-xs font-bold uppercase tracking-wider mb-2">
                                Compensation
                            </h3>
                            <div className="flex items-end gap-1 mb-4">
                                <span className="text-3xl font-bold text-white">
                                    €{Number(mission.budget || 0).toFixed(2)}
                                </span>
                                <span className="text-text-subtle text-sm mb-1.5 font-medium">/ Total</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-t border-card-border/50 pt-3">
                                <span className="text-gray-400">
                                    {mission.speciality && `Speciality: ${mission.speciality.name}`}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documents/Resources */}
                    <Card className="bg-card-dark border-card-border">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-white font-bold text-lg">Resources</h3>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-background-dark hover:bg-[#15291d] transition-colors group cursor-pointer border border-transparent hover:border-card-border">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-500">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-white text-sm font-medium group-hover:text-primary transition-colors">
                                                Mission Guidelines
                                            </span>
                                            <span className="text-text-subtle text-xs">General info</span>
                                        </div>
                                    </div>
                                    <FileDown className="h-5 w-5 text-text-subtle hover:text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Chat Modal */}
            {isChatOpen && currentConversation && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setIsChatOpen(false);
                        }
                    }}
                >
                    <div className="bg-background-dark border border-card-border rounded-lg w-full max-w-4xl h-[600px] flex flex-col shadow-2xl m-4">
                        <div className="flex items-center justify-between p-4 border-b border-card-border flex-shrink-0">
                            <h2 className="text-xl font-bold">Message Institution</h2>
                            <button
                                onClick={() => setIsChatOpen(false)}
                                className="p-2 hover:bg-card-dark rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 min-h-0">
                            <ChatWindow
                                conversation={currentConversation}
                                onBack={() => setIsChatOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

