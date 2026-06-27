export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="TikTok Drop logo"
    >
      {/* Cyan offset */}
      <path
        d="M68 12H56v48c0 10-8 18-18 18s-18-8-18-18 8-18 18-18c2 0 4 .3 6 1V30c-2-.3-4-.5-6-.5C22 29.5 8 43.5 8 60.5S22 91.5 39 91.5 70 77.5 70 60.5V36c6 4 13 6 20 6V30c-8 0-15-7-18-14-1-2-2-4-2-4h-2z"
        fill="#25F4EE"
        transform="translate(-3, -2)"
      />
      {/* Pink offset */}
      <path
        d="M68 12H56v48c0 10-8 18-18 18s-18-8-18-18 8-18 18-18c2 0 4 .3 6 1V30c-2-.3-4-.5-6-.5C22 29.5 8 43.5 8 60.5S22 91.5 39 91.5 70 77.5 70 60.5V36c6 4 13 6 20 6V30c-8 0-15-7-18-14-1-2-2-4-2-4h-2z"
        fill="#FE2C55"
        transform="translate(3, 2)"
      />
      {/* White main note */}
      <path
        d="M68 12H56v48c0 10-8 18-18 18s-18-8-18-18 8-18 18-18c2 0 4 .3 6 1V30c-2-.3-4-.5-6-.5C22 29.5 8 43.5 8 60.5S22 91.5 39 91.5 70 77.5 70 60.5V36c6 4 13 6 20 6V30c-8 0-15-7-18-14-1-2-2-4-2-4h-2z"
        fill="#ffffff"
      />
    </svg>
  );
}
