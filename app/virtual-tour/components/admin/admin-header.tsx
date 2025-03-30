"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Home, LogOut, Settings, User } from "lucide-react"

export default function AdminHeader() {
  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="text-primary">Virtual Tour</span>
            <span className="rounded bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">Admin</span>
          </Link>

          <nav className="hidden md:flex">
            <ul className="flex gap-6">
              <li>
                <Link href="/admin" className="text-sm font-medium text-foreground">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-sm font-medium text-muted-foreground">
                  Settings
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-sm font-medium text-muted-foreground">
                  Help
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm" className="hidden md:flex">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              View Site
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin User</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

