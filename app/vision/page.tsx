import type { Metadata } from "next";
import VisionContent from "./vision-content";

export const metadata: Metadata = {
  title: "The wider NodeDots system",
  description: "See how NodeDots can connect evidence, requirements, and decisions beyond code.",
};

export default function VisionPage() {
  return <VisionContent />;
}
