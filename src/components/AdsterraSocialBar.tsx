import { useEffect } from "react";

const SCRIPT_SRC =
  "https://pl29302332.profitablecpmratenetwork.com/ee/7e/28/ee7e281db6c354a2ec599d7bd646e6ef.js";
const SCRIPT_ID = "adsterra-social-bar";

/**
 * Loads the Adsterra Social Bar script on the current page only.
 * Removes the script (and any nodes it injected with a known prefix)
 * on unmount so it does not leak into admin/editor pages.
 */
const AdsterraSocialBar = () => {
  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.getElementById(SCRIPT_ID)?.remove();
    };
  }, []);

  return null;
};

export default AdsterraSocialBar;
