"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Block } from "@/components/block";
import { ModeToggle } from "../mode-toggle";
import { useAuth } from "@/context/AuthContext";

export function SiteHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Block className="flex h-16 items-center justify-between">
        {/* --- Logo & Brand --- */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            {/* Logo Image */}
            <div className="relative size-10 overflow-hidden rounded-xs">
              <Image src="/logo.png" alt="DairyNews7x7 Logo" fill className="object-cover" priority />
            </div>
            <span className="hidden font-bold tracking-tight sm:inline-block">
              DairyNews7x7 <span className="text-primary">API</span>
            </span>
          </Link>
        </div>

        {/* --- Desktop Navigation --- */}
        <nav className="hidden md:flex items-center gap-6">
          {/* <Link href="/docs" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Documentation
          </Link> */}
          {/* <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Features
          </Link> */}
          <div className="flex items-center gap-2 pl-2">
            {user ? (
              <Button size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Get API Key</Link>
                </Button>
              </>
            )}
            <ModeToggle />
          </div>
        </nav>

        {/* --- Mobile Navigation (Sidebar) --- */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="-mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[350px]">
            <SheetHeader className="text-left border-b pb-4 mb-4">
              <SheetTitle className="flex items-center gap-2">
                <div className="relative size-8 overflow-hidden rounded-xs">
                  <Image src="/logo.png" alt="Logo" fill className="object-cover" />
                </div>
                DairyNews7x7
              </SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-4 p-1">
              <SheetClose asChild>
                <Link href="/" className="block px-2 py-1 text-lg font-medium hover:text-primary">
                  Home
                </Link>
              </SheetClose>
              {/* <SheetClose asChild>
                <Link href="/docs" className="block px-2 py-1 text-lg font-medium hover:text-primary">
                  Documentation
                </Link>
              </SheetClose> */}
              {/* <SheetClose asChild>
                <Link href="/#features" className="block px-2 py-1 text-lg font-medium hover:text-primary">
                  Features
                </Link>
              </SheetClose> */}

              <div className="my-2 border-t" />

              {user ? (
                <SheetClose asChild>
                  <Button className="w-full mt-2" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                </SheetClose>
              ) : (
                <>
                  <SheetClose asChild>
                    <Link href="/login" className="block px-2 py-1 text-lg font-medium hover:text-primary">
                      Log in
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button className="w-full mt-2" asChild>
                      <Link href="/register">Get API Key</Link>
                    </Button>
                  </SheetClose>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </Block>
    </header>
  );
}
