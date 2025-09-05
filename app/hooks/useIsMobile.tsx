// hooks/useIsMobile.ts
import { useEffect, useState } from "react";

export function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < breakpoint);

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, [breakpoint]);

  return isMobile;
}
