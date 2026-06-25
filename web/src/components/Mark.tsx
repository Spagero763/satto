"use client";

import { motion } from "framer-motion";
import type { Cell } from "@/lib/engine";

export default function Mark({ value }: { value: Cell }) {
  if (!value) return null;
  const stroke = value === "X" ? "#9b7bff" : "#2ee6b0";

  if (value === "X") {
    return (
      <svg viewBox="0 0 48 48" className="h-[58%] w-[58%]">
        {[
          ["M12 12 L36 36", 0],
          ["M36 12 L12 36", 0.12],
        ].map(([d, delay]) => (
          <motion.path
            key={d as string}
            d={d as string}
            stroke={stroke}
            strokeWidth={6}
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.22, delay: delay as number, ease: "easeOut" }}
          />
        ))}
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" className="h-[58%] w-[58%]">
      <motion.circle
        cx="24"
        cy="24"
        r="14"
        stroke={stroke}
        strokeWidth={6}
        fill="none"
        initial={{ pathLength: 0, rotate: -90 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
        style={{ transformOrigin: "center" }}
      />
    </svg>
  );
}
