"use client";
import { useEffect } from "react";

export default function CustomCursor() {
  useEffect(() => {
    if (window.innerWidth < 768) {
      return;
    } else {
      // Create cursor elements
      const cursor = document.createElement("div");
      const dot = document.createElement("div");

      cursor.className = "cursor-ring";
      dot.className = "cursor-dot";

      document.body.appendChild(cursor);
      document.body.appendChild(dot);

      const move = (e) => {
        cursor.style.left = e.clientX + "px";
        cursor.style.top = e.clientY + "px";
        dot.style.left = e.clientX + "px";
        dot.style.top = e.clientY + "px";
      };

      document.addEventListener("mousemove", move);

      const checkIframeEvents = () => {
        const iframe = document.querySelector("iframe");

        if (!iframe) return;

        // Remove cursor when mouse enters iframe
        iframe.addEventListener("mouseover", () => {
          if (cursor.parentNode) cursor.remove();
          if (dot.parentNode) dot.remove();
        });

        // Re-add cursor when mouse exits iframe
        iframe.addEventListener("mouseout", () => {
          if (!document.body.contains(cursor))
            document.body.appendChild(cursor);
          if (!document.body.contains(dot)) document.body.appendChild(dot);
        });
      };

      // Wait for iframe to be mounted
      setTimeout(checkIframeEvents, 500); // Delay to ensure iframe loads

      return () => {
        document.removeEventListener("mousemove", move);
        if (cursor.parentNode) cursor.remove();
        if (dot.parentNode) dot.remove();

        const iframe = document.querySelector("iframe");
        if (iframe) {
          checkIframeEvents();
          iframe.removeEventListener("mouseover", () => {});
          iframe.removeEventListener("mouseout", () => {});
        }
      };
    }
  }, []);

  return null;
}
