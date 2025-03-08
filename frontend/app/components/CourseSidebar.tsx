import { useState } from 'react';
import { Bell, FileText, Server, Menu } from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface CourseSidebarProps {
  currentTab: string;
  onTabChange: (tabId: string) => void;
  items?: SidebarItem[];
}

const defaultItems: SidebarItem[] = [
  {
    id: 'details',
    label: '公告',
    icon: <Bell className="h-5 w-5" />
  },
  {
    id: 'resources',
    label: '资源',
    icon: <FileText className="h-5 w-5" />
  },
  {
    id: 'images',
    label: '镜像',
    icon: <Server className="h-5 w-5" />
  }
];

export default function CourseSidebar({
  currentTab,
  onTabChange,
  items = defaultItems
}: CourseSidebarProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* 桌面侧边栏 */}
      <div
        className={`transition-all duration-300 ease-in-out hidden md:block ${sidebarExpanded ? 'w-48' : 'w-16'} shrink-0 bg-white rounded-lg shadow-md`}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        <div className="p-4">
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center w-full p-2 rounded-md transition-colors ${currentTab === item.id ? 'bg-green-50 text-green-600' : 'hover:bg-gray-100'}`}
                >
                  {item.icon}
                  {sidebarExpanded && <span className="ml-3 transition-opacity duration-200">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 移动端悬浮球和菜单 */}
      <div className="md:hidden fixed right-4 bottom-4 z-50">
        {isMobileMenuOpen ? (
          <div className="bg-white rounded-lg shadow-lg p-4 mb-4 transition-all duration-300 transform origin-bottom-right">
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleTabClick(item.id)}
                    className={`flex items-center w-full p-2 rounded-md transition-colors ${currentTab === item.id ? 'bg-green-50 text-green-600' : 'hover:bg-gray-100'}`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </>
  );
} 