import { Link } from "react-router";
import { UserCheck, FileText, CreditCard } from "lucide-react";

export function QuickLinks() {
  const links = [
    { title: "Validate Workers", icon: UserCheck, href: "/admin/workers" },
    { title: "Review Documents", icon: FileText, href: "/admin/documents" },
    { title: "Payments", icon: CreditCard, href: "/admin/payments" },
  ];

  return (
    <div className="bg-card rounded-xl border shadow-sm p-6">
      <h3 className="text-lg font-bold mb-4">Quick Actions</h3>

      <div className="flex flex-col gap-2">
        {links.map(({ title, icon: Icon, href }) => (
          <Link
            key={href}
            to={href}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition"
          >
            <Icon className="h-5 w-5 text-primary" />
            <span className="font-medium text-sm">{title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
