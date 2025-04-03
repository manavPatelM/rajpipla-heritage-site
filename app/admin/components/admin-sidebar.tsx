"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Archive, Users, Calendar, Compass, Store, Settings, UserCog, ShieldCheck } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Artifacts", href: "/admin/artifacts", icon: Archive },
  // { name: "Bookings", href: "/admin/bookings", icon: Calendar },
  { name: "Virtual Tours", href: "/admin/virtual-tours", icon: Compass },
  { name: "Users", href: "/admin/users", icon: UserCog },
]

export default function AdminSidebar() {

  
  
  
  const pathname = usePathname()

  return (
    <div className="w-64 bg-card border-r h-screen sticky top-0">
      <div className="flex flex-col h-full">
        <div className="flex items-center h-16 px-6 border-b">
          <Link href="/admin" className="text-xl font-bold flex items-center">
            <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
            Admin Panel
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-muted" />
            <div className="ml-3">
              <p className="text-sm font-medium">Admin user</p>
              <p className="text-xs text-muted-foreground">admin@rajpipla.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

