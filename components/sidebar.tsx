import type React from "react"
import { HomeIcon, LayoutDashboard, Settings, PuzzleIcon } from "lucide-react"

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const navigation: NavItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: HomeIcon,
  },
  {
    name: "Layout",
    href: "/layout",
    icon: LayoutDashboard,
  },
  {
    name: "Elements",
    href: "/elements",
    icon: PuzzleIcon, // Or any other appropriate icon
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-100 h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Your App</h1>
      <nav>
        <ul>
          {navigation.map((item) => (
            <li key={item.name} className="mb-2">
              <a href={item.href} className="flex items-center space-x-2 hover:text-blue-500">
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

