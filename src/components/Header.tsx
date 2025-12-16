import { useState, useRef, useEffect } from "react";
import { Menu, X, Globe, LogOut } from "lucide-react";
import { useAuthStore } from "../store/authStore";

interface HeaderProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const LANGUAGES = [
  { key: "lo", label: "🇱🇦 Lao" },
  { key: "en", label: "🇬🇧 English" },
  { key: "zh", label: "🇨🇳 中文" },
] as const;

const Header = ({ open, setOpen }: HeaderProps) => {
  const logout = useAuthStore((state: any) => state.logout);
  const [selectedLang, setSelectedLang] = useState("en");
  const [langOpen, setLangOpen] = useState(false);

  const currentLang =
    LANGUAGES.find((l) => l.key === selectedLang)?.label ?? "🇬🇧 English";

  const dropdownDesktopRef = useRef<HTMLDivElement>(null);
  const dropdownMobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const isOutside =
        dropdownDesktopRef.current &&
        !dropdownDesktopRef.current.contains(e.target as Node) &&
        dropdownMobileRef.current &&
        !dropdownMobileRef.current.contains(e.target as Node);

      if (isOutside) setLangOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const LanguageDropdown = () => (
    <div className="absolute right-16 sm:right-10 top-10 w-32 bg-white text-gray-800 rounded-sm! shadow-lg z-50">
      {LANGUAGES.map((lang, i) => (
        <button
          key={lang.key}
          onClick={() => {
            setSelectedLang(lang.key);
            setLangOpen(false);
          }}
          className={`block w-full p-2 text-xs! hover:bg-gray-100 text-left transition-colors ${
            i === 0
              ? "rounded-t-sm!"
              : i === LANGUAGES.length - 1
              ? "rounded-b-sm!"
              : ""
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-gray-800 text-white px-4 flex items-center gap-3 z-50">
      {setOpen && (
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-sm! hover:bg-gray-700 transition-colors"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      )}

      <p className="font-semibold text-base flex-1">Admin Panel</p>

      {/* Desktop */}
      <div
        ref={dropdownDesktopRef}
        className="hidden sm:flex items-center gap-2 relative"
      >
        <button
          onClick={() => setLangOpen((v) => !v)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs! rounded-sm! hover:bg-gray-700 transition-colors"
        >
          <Globe size={16} />
          <span>{currentLang}</span>
        </button>
        {langOpen && <LanguageDropdown />}
        <button
          onClick={logout}
          className="flex items-center gap-1 px-3 py-1.5 text-xs! bg-red-600 hover:bg-red-700 rounded-sm! transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

      {/* Mobile */}
      <div
        ref={dropdownMobileRef}
        className="sm:hidden flex items-center gap-2 relative"
      >
        <button
          onClick={() => setLangOpen((v) => !v)}
          className="p-2 rounded-sm! hover:bg-gray-700 transition-colors"
        >
          <Globe size={18} />
        </button>
        {langOpen && <LanguageDropdown />}
        <button
          onClick={logout}
          className="p-2 bg-red-600 hover:bg-red-700 rounded-sm!  transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;
