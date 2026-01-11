import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { format } from "date-fns";
import {
    ArrowLeft,
    MapPin,
    Calendar,
    DollarSign,
    Building2,
    CheckCircle,
    AlertCircle,
    Clock,
    Phone,
    MessageSquare,
    FileDown,
    FileText,
    HelpCircle,
    Star,
    TrendingUp,
    Users,
    Navigation,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGetAssignmentQuery } from "@/features/api/endpoints/assignmentEndpoints";
import { cn } from "@/lib/utils";

function getStatusColor(status: string) {
    switch (status) {
        case "ACTIVE":
            return "bg-primary/20 text-primary border-primary/30";
        case "ONGOING":
            return "bg-blue-500/20 text-blue-400 border-blue-500/30";
        case "COMPLETED":
            return "bg-green-500/20 text-green-400 border-green-500/30";
        case "CANCELLED":
            return "bg-red-500/20 text-red-400 border-red-500/30";
        default:
            return "bg-muted text-muted-foreground";
    }
}

function getUrgencyIcon(urgency: string) {
    switch (urgency) {
        case "HIGH":
            return <AlertCircle className="h-4 w-4 text-red-400" />;
        case "MEDIUM":
            return <TrendingUp className="h-4 w-4 text-yellow-400" />;
        case "LOW":
            return <TrendingUp className="h-4 w-4 text-green-400" />;
        default:
            return null;
    }
}

function AssignmentDetailsSkeleton() {
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

export default function AssignmentDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const assignmentId = parseInt(id || "0");

    const { data: assignmentData, isLoading, error } = useGetAssignmentQuery(assignmentId);
    const assignment = assignmentData?.data;
    const mission = assignment?.mission;
    const institution = assignment?.institution;

    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [tasks, setTasks] = useState([
        { id: 1, text: "Complete initial intake forms for new arrivals (Form 3B)", completed: false },
        { id: 2, text: "Conduct safety briefing for family units", completed: false },
        { id: 3, text: "Log incident reports if any disturbances occur", completed: false },
        { id: 4, text: "Handover briefing to morning shift lead", completed: false },
    ]);

    if (isLoading) {
        return <AssignmentDetailsSkeleton />;
    }

    if (error || !assignment) {
        return (
            <div className="min-h-screen p-4 lg:px-40">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Assignment not found</AlertTitle>
                    <AlertDescription>
                        The assignment you're looking for doesn't exist or has been removed.
                    </AlertDescription>
                </Alert>
                <div className="mt-4">
                    <Button variant="outline" onClick={() => navigate("/worker/assignments")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Assignments
                    </Button>
                </div>
            </div>
        );
    }

    const toggleTask = (id: number) => {
        setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
    };

    return (
        <div className="min-h-screen bg-background-dark text-white">
            {/* Breadcrumbs */}
            <div className="px-4 md:px-10 lg:px-40 py-4">
                <div className="flex flex-wrap gap-2 text-sm">
                    <Link to="/worker/dashboard" className="text-text-subtle hover:text-primary transition-colors">
                        Dashboard
                    </Link>
                    <span className="text-text-subtle">/</span>
                    <Link to="/worker/assignments" className="text-text-subtle hover:text-primary transition-colors">
                        Missions
                    </Link>
                    <span className="text-text-subtle">/</span>
                    <span className="text-white font-medium">
                        Mission #{assignment.id} Details
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
                                    {mission?.title || "Assignment"}
                                </h1>
                                <Badge className={cn("flex items-center gap-2 px-3 py-1 border", getStatusColor(assignment.status))}>
                                    <span className="size-2 rounded-full bg-current"></span>
                                    <span className="text-xs font-bold uppercase tracking-wider">
                                        {assignment.status}
                                    </span>
                                </Badge>
                            </div>
                            <p className="text-text-subtle text-base mt-1">
                                {institution?.institutionName} • Ref ID: #{assignment.id}-{mission?.title?.substring(0, 3).toUpperCase()}
                            </p>
                        </div>

                        {/* Chips */}
                        <div className="flex gap-2 flex-wrap">
                            {mission?.urgency && (
                                <div className="flex h-8 items-center gap-2 rounded-full bg-card-dark border border-card-border px-4">
                                    {getUrgencyIcon(mission.urgency)}
                                    <p className="text-white text-xs font-medium">{mission.urgency} Priority</p>
                                </div>
                            )}
                            {mission?.location && (
                                <div className="flex h-8 items-center gap-2 rounded-full bg-card-dark border border-card-border px-4">
                                    <MapPin className="h-4 w-4 text-text-subtle" />
                                    <p className="text-white text-xs font-medium">On-Site</p>
                                </div>
                            )}
                            <div className="flex h-8 items-center gap-2 rounded-full bg-card-dark border border-card-border px-4">
                                <Users className="h-4 w-4 text-text-subtle" />
                                <p className="text-white text-xs font-medium">Team Mission</p>
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
                        {assignment.status === "ACTIVE" && (
                            <Button className="rounded-full bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(43,238,121,0.3)]">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Check In
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
                                    {mission?.description || "Provide professional social work services as assigned. Ensure all protocols are followed and documentation is completed accurately."}
                                </p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                                    <div className="flex items-start gap-3">
                                        <div className="size-10 rounded-full bg-card-border flex items-center justify-center shrink-0">
                                            <Calendar className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-text-subtle text-xs uppercase tracking-wider font-bold">Date</p>
                                            <p className="text-white font-medium">
                                                {mission?.startDate ? format(new Date(mission.startDate), "MMM d, yyyy") : "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="size-10 rounded-full bg-card-border flex items-center justify-center shrink-0">
                                            <Clock className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-text-subtle text-xs uppercase tracking-wider font-bold">Time</p>
                                            <p className="text-white font-medium">
                                                {mission?.startDate && mission?.endDate
                                                    ? `${format(new Date(mission.startDate), "hh:mm a")} - ${format(new Date(mission.endDate), "hh:mm a")}`
                                                    : "Full Day"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tasks & Responsibilities */}
                    <div className="flex flex-col gap-4">
                        <h2 className="text-white text-xl font-bold">Tasks & Responsibilities</h2>
                        <Card className="bg-card-dark border-card-border">
                            <CardContent className="p-6 flex flex-col gap-4">
                                {tasks.map((task, index) => (
                                    <div key={task.id}>
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <Checkbox
                                                checked={task.completed}
                                                onCheckedChange={() => toggleTask(task.id)}
                                                className="mt-1 size-5 rounded border-card-border bg-background-dark data-[state=checked]:bg-primary data-[state=checked]:text-black"
                                            />
                                            <span className={cn(
                                                "text-gray-300 group-hover:text-white transition-colors",
                                                task.completed && "line-through text-muted-foreground"
                                            )}>
                                                {task.text}
                                            </span>
                                        </label>
                                        {index < tasks.length - 1 && (
                                            <div className="h-px bg-card-border/50 w-full my-4"></div>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Post Mission Feedback */}
                    {assignment.status === "COMPLETED" && (
                        <div className="flex flex-col gap-4 mt-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-white text-xl font-bold">Mission Report</h2>
                                <Badge className="text-xs font-medium bg-primary text-black px-2 py-1">
                                    Post-Mission
                                </Badge>
                            </div>
                            <Card className="bg-card-dark border-card-border opacity-75 hover:opacity-100 transition-opacity">
                                <CardContent className="p-6">
                                    <p className="text-text-subtle text-sm mb-4">
                                        Please submit this report after your shift is completed.
                                    </p>
                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <label className="block text-white text-sm font-medium mb-2">
                                                How did the mission go?
                                            </label>
                                            <Textarea
                                                value={feedback}
                                                onChange={(e) => setFeedback(e.target.value)}
                                                className="w-full bg-background-dark border-card-border text-white focus:border-primary resize-none h-32"
                                                placeholder="Describe any issues, incidents, or general feedback..."
                                            />
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-6 justify-between items-center">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-white text-sm font-medium">Institution Rating</span>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={cn(
                                                                "h-6 w-6 cursor-pointer transition-colors",
                                                                star <= rating
                                                                    ? "fill-primary text-primary"
                                                                    : "text-card-border hover:text-primary/50"
                                                            )}
                                                            onClick={() => setRating(star)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <Button className="w-full sm:w-auto rounded-full bg-white/10 text-white hover:bg-white/20 border border-transparent hover:border-white/30">
                                                Submit Report
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    {/* Location Card */}
                    {institution && (
                        <Card className="bg-card-dark border-card-border overflow-hidden">
                            <div className="h-40 w-full bg-gray-700 relative overflow-hidden group cursor-pointer">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-card-dark/80 flex items-center justify-center">
                                    <div className="bg-primary/90 rounded-full p-3 shadow-lg transform group-hover:scale-110 transition-transform">
                                        <Navigation className="h-6 w-6 text-black" />
                                    </div>
                                </div>
                            </div>
                            <CardContent className="p-5 flex flex-col gap-3">
                                <h3 className="text-white font-bold text-lg">{institution.institutionName}</h3>
                                <div className="flex items-start gap-2 text-text-subtle">
                                    <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                                    <p className="text-sm">
                                        {institution.address || "Address not provided"}<br />
                                        {institution.city && `${institution.city}`}
                                    </p>
                                </div>
                                <Button className="mt-2 w-full rounded-full border border-card-border bg-transparent text-white hover:bg-card-border">
                                    <Navigation className="h-4 w-4 mr-2" />
                                    Get Directions
                                </Button>
                            </CardContent>
                        </Card>
                    )}

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
                                    <p className="text-white font-bold text-lg">Supervisor</p>
                                    <p className="text-text-subtle text-sm">Shift Supervisor</p>
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
                                >
                                    <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                                    Message
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Earnings Card */}
                    <Card className="bg-gradient-to-br from-card-dark to-[#16291f] border-card-border">
                        <CardContent className="p-5">
                            <h3 className="text-text-subtle text-xs font-bold uppercase tracking-wider mb-2">
                                Earnings Estimate
                            </h3>
                            <div className="flex items-end gap-1 mb-4">
                                <span className="text-3xl font-bold text-white">
                                    €{Number(mission?.budget || 0).toFixed(2)}
                                </span>
                                <span className="text-text-subtle text-sm mb-1.5 font-medium">/ Total</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-t border-card-border/50 pt-3">
                                <span className="text-gray-400">
                                    {mission?.budget && `Rate: €${(Number(mission.budget) / 8).toFixed(2)}/hr x 8hrs`}
                                </span>
                                <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                    <span className="size-1.5 rounded-full bg-orange-400 mr-1.5"></span>
                                    <span className="text-xs font-bold">Pending</span>
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documents */}
                    <Card className="bg-card-dark border-card-border">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-white font-bold text-lg">Documents</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-primary text-xs font-bold hover:underline h-auto p-0"
                                >
                                    Download All
                                </Button>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-background-dark hover:bg-[#15291d] transition-colors group cursor-pointer border border-transparent hover:border-card-border">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded bg-red-500/20 flex items-center justify-center text-red-500">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-white text-sm font-medium group-hover:text-primary transition-colors">
                                                Safety_Protocol_v2.pdf
                                            </span>
                                            <span className="text-text-subtle text-xs">2.4 MB</span>
                                        </div>
                                    </div>
                                    <FileDown className="h-5 w-5 text-text-subtle hover:text-white" />
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-background-dark hover:bg-[#15291d] transition-colors group cursor-pointer border border-transparent hover:border-card-border">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-500">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-white text-sm font-medium group-hover:text-primary transition-colors">
                                                Shift_Checklist.docx
                                            </span>
                                            <span className="text-text-subtle text-xs">145 KB</span>
                                        </div>
                                    </div>
                                    <FileDown className="h-5 w-5 text-text-subtle hover:text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
