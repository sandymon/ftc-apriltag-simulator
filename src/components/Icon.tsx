const shapes: Record<string, string> = {
  arrow: "M5 12h14M13 6l6 6-6 6", chevron: "m9 5 7 7-7 7", check: "m5 12 4 4L19 6",
  play: "m8 5 11 7-11 7Z", pause: "M8 5v14M16 5v14", stop: "M6 6h12v12H6z",
  lab: "M9 3h6M10 3v6L4 19q-1 2 2 2h12q3 0 2-2L14 9V3M7 15h10",
  screen: "M3 4h18v13H3zM8 21h8M12 17v4", menu: "M4 6h16M4 12h16M4 18h16",
  book: "M12 5v15M12 5Q7 2 3 4v15q5-2 9 1 4-3 9-1V4q-4-2-9 1",
  code: "m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-2 20", external: "M14 3h7v7M21 3l-11 11M10 3H3v18h18v-7",
  reset: "M3 10a9 9 0 1 1 1 8M3 3v7h7", close: "m5 5 14 14M5 19 14-14",
  target: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
  download: "M12 3v12m-5-5 5 5 5-5M4 15v6h16v-6", sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 1v3M12 20v3M1 12h3M20 12h3M4 4l2 2M18 18l2 2M4 20l2-2M18 6l2-2",
};
export function Icon({ name, size = 20 }: { name: string; size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={shapes[name] ?? shapes.target}/></svg>; }
