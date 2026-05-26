"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  User,
  Settings,
  CreditCard,
  LogOut,
} from "lucide-react";

type MenuItemProps = {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick?: () => void;
};

function MenuItem({
  icon,
  label,
  danger,
  onClick,
}: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-200 ${
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : "text-[#666666] hover:bg-[#E5E4E2]/50 hover:text-[#333333]"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

interface ProfileDropdownProps {
  ownerName?: string;
  ownerEmail?: string;
  avatarInitial?: string;
  avatarColor?: string;
  showMenuItems?: boolean;
  onProfile?: () => void;
  onSettings?: () => void;
  onBilling?: () => void;
  onLogout?: () => void;
}

export default function ProfileDropdown({
  ownerName = "Owner",
  ownerEmail = "owner@company.com",
  avatarInitial = "O",
  avatarColor = "from-[#88BDF2] to-[#BDDDFC]",
  showMenuItems = true,
  onProfile,
  onSettings,
  onBilling,
  onLogout,
}: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-xl border border-[#E5E4E2] bg-[#faf9f9] px-3 py-2 transition-all duration-300 hover:bg-[#f1f0ed] hover:border-[#d8e2ff]"
      >
        <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor} text-sm font-semibold text-white`}>
          {avatarInitial}
        </div>

        <div className="hidden text-left sm:block">
          <p className="text-sm font-medium text-[#333333]">{ownerName}</p>
          <p className="text-xs text-[#888888]">
            {ownerEmail}
          </p>
        </div>

        <ChevronDown
          className={`h-4 w-4 text-[#888888] transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full z-50 mt-3 w-80 overflow-hidden rounded-2xl border border-[#E5E4E2] bg-white shadow-xl backdrop-blur-xl"
          >
            {/* Header - Always show name and email */}
            <div className="border-b border-[#E5E4E2] p-4">
              <p className="text-sm font-semibold text-[#333333]">
                {ownerName}
              </p>
              <p className="mt-1 text-xs text-[#888888]">
                {ownerEmail}
              </p>
            </div>

            {/* Menu Items - Only show if enabled */}
            {showMenuItems && (
              <div className="p-2">
                <MenuItem
                  icon={<User size={18} />}
                  label="Profile"
                  onClick={onProfile}
                />

                <MenuItem
                  icon={<Settings size={18} />}
                  label="Settings"
                  onClick={onSettings}
                />

                <MenuItem
                  icon={<CreditCard size={18} />}
                  label="Billing"
                  onClick={onBilling}
                />

                <div className="my-2 border-t border-[#E5E4E2]" />

                <MenuItem
                  icon={<LogOut size={18} />}
                  label="Logout"
                  danger
                  onClick={onLogout}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
