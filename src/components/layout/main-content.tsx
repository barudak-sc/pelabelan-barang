"use client";

import { useSidebar } from "@/context/SidebarContext";

export function MainContent({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered } = useSidebar();
  const isOpen = isExpanded || isHovered;

  return (
    <div
      className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out
        ${isOpen ? "lg:ml-[290px]" : "lg:ml-[90px]"}
      `}
    >
      {children}
    </div>
  );
}
