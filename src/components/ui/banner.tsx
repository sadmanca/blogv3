import { useState, useEffect } from "react";
import { ArrowRightIcon, Bell, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BannerProps {
  type: string;
  text: string;
  link: string;
}

export default function Banner({ type, text, link }: BannerProps) {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isViewportWideEnough, setIsViewportWideEnough] = useState(true);

  useEffect(() => {
    const bannerClosed = localStorage.getItem("bannerClosed");
    if (bannerClosed === "true") {
      setDismissed(true);
      return;
    }

    setMounted(true);

    const handleResize = () => {
      setIsViewportWideEnough(window.innerWidth > 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleClose = () => {
    setMounted(false);
    setTimeout(() => setDismissed(true), 500);
    localStorage.setItem("bannerClosed", "true");
  };

  if (dismissed || !isViewportWideEnough) return null;

  return (
    <div
      className={`bg-purple-300 dark:bg-purple-900 text-gray-900 dark:text-white px-2 py-1 relative transform transition-transform duration-500 ${
        mounted ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="flex items-center justify-center text-sm">
        <a 
          href={link} 
          className="flex items-center group"
          onClick={() => {
            localStorage.setItem("bannerClosed", "true");
            setMounted(false);
            setTimeout(() => setDismissed(true), 500);
          }}
        >
          <span className="inline-flex items-center transition-transform duration-300 group-hover:-translate-x-1">
            <span className="relative flex items-center">
              <span className="h-1 w-1 bg-red-500 rounded-full animate-ping duration-2000"></span>
              <span className="h-1 w-1 bg-red-500 rounded-full absolute"></span>
            </span>
            <Bell
              className="ml-1 mr-1 shrink-0 opacity-60"
              size={16}
              aria-hidden="true"
            />
            <span className="underline">{text}</span>
          </span>
          <span className="mx-2">|</span>
          <span className="inline-flex items-center transition-transform duration-300 group-hover:translate-x-1">
            <span>Read Now</span>
            <ArrowRightIcon
              className="ml-1 inline-flex opacity-60"
              size={16}
              aria-hidden="true"
            />
          </span>
        </a>
      </div>
      <Button
        variant="ghost"
        className="absolute top-1/2 right-6 -translate-y-1/2 group size-8 shrink-0 p-0 hover:bg-transparent cursor-pointer"
        onClick={handleClose}
        aria-label="Close banner"
      >
        <XIcon
          size={16}
          className="opacity-60 group-hover:opacity-100"
          aria-hidden="true"
        />
      </Button>
    </div>
  );
}
