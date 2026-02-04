import { Outlet } from "react-router";
import { Header } from "@/components/landing";

export default function PublicLayout() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1 w-full">
                <Outlet />
            </main>
        </div>
    );
}
