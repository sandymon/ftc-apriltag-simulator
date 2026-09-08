export type Camera = "limelight" | "webcam";
export type Path = Camera | "both";
export type SlideKind = "concept" | "tag" | "axes" | "flow" | "compare" | "setup" | "ui" | "measurements" | "code" | "challenge" | "quiz" | "troubleshoot" | "resources" | "checklist";
export type Quiz = { question: string; options: string[]; answer: number; explanation: string };
export type Lesson = {
  id: string; title: string; subtitle: string; kind: SlideKind;
  points: string[]; takeaway: string; note: string;
  source: string; focus?: string; quiz?: Quiz;
};
export type Module = { id: string; label: string; title: string; description: string; path: Camera | "shared"; minutes: number; lessons: Lesson[] };
export type Source = { title: string; url: string; reviewed: string };
