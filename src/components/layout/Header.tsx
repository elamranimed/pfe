import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white border-b">
      <div className="flex flex-1 justify-between px-4 md:px-6">
        <div className="flex items-center md:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        <div className="flex flex-1 items-center">
          {/* Search bar could go here */}
        </div>
        <div className="ml-4 flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5 text-gray-400" />
          </Button>
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
              JD
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
