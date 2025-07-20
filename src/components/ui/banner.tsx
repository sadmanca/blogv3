import { useState, useEffect } from "react";
import { ArrowRightIcon, Bell, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BannerProps {
  type: string; // The text to display in the banner
  text: string; // The text to display in the banner
  link: string; // The URL the banner should link to
}

export default function Banner({ type, text, link }: BannerProps) {
  const [isVisible, setIsVisible] = useState(false); // Default to false to avoid pop-in
  const [shouldRender, setShouldRender] = useState(false); // Controls rendering for animation
  const [isViewportWideEnough, setIsViewportWideEnough] = useState(true);

  useEffect(() => {
    // Check if the banner has been closed previously
    const bannerClosed = localStorage.getItem("bannerClosed");
    if (bannerClosed !== "true") {
      setShouldRender(true); // Render the banner
      setTimeout(() => setIsVisible(true), 50); // Delay visibility to trigger animation
    }

    const handleResize = () => {
      // Check if the viewport width is greater than 768px (or any threshold you choose)
      setIsViewportWideEnough(window.innerWidth > 768);
    };

    // Initial check
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setShouldRender(false), 500); // Wait for animation to finish before unmounting
    localStorage.setItem("bannerClosed", "true"); // Save the closed state
  };

  // Hide the banner if it's not visible or if the viewport is too small
  if (!shouldRender || !isViewportWideEnough) return null;

  return (
    <div
      className={`bg-foreground/80 text-background px-2 py-1 relative transform transition-transform duration-500 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="flex items-center justify-center text-sm">
        <a 
          href={link} 
          className="flex items-center group"
        >
          <span className="relative flex items-center">
            <span className="h-1 w-1 bg-red-500 rounded-full animate-ping duration-2000"></span>
            <span className="h-1 w-1 bg-red-500 rounded-full absolute"></span>
          </span>
          <Bell
            className="ml-1 mr-1 shrink-0 opacity-60"
            size={16}
            aria-hidden="true"
          />
          <span>{type}</span>
          <span className="underline ml-1">{text}</span>
          <ArrowRightIcon
            className="ml-2 inline-flex opacity-60 transition-transform group-hover:translate-x-0.5"
            size={16}
            aria-hidden="true"
          />
        </a>
      </div>
      <Button
        variant="ghost"
        className="absolute top-1/2 right-6 -translate-y-1/2 group size-8 shrink-0 p-0 hover:bg-transparent hover:text-white hover:dark:text-black"
        onClick={handleClose}
        aria-label="Close banner"
      >
        <XIcon
          size={16}
          className="opacity-60"
          aria-hidden="true"
        />
      </Button>
    </div>
  );
}