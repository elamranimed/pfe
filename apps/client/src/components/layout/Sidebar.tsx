import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building, 
  CreditCard, 
  Receipt,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', path: '/' },
  { icon: Building, label: 'Bureaux', path: '/offices' },
  { icon: CreditCard, label: 'Paiements', path: '/payments' },
  { icon: Receipt, label: 'Dépenses', path: '/expenses' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="hidden border-r bg-white md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col grow pt-5 overflow-y-auto">
        <div className="flex items-center shrink-0 px-4 mb-8">
          <Building2 className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">SyndicApp</span>
        </div>
        <nav className="flex-1 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 shrink-0",
                    isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
