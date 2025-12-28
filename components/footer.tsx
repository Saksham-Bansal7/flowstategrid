// components/footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center text-sm text-muted-foreground">
          Made with ❤️ by{" "}
          <Link
            href="https://github.com/Saksham-Bansal7"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:text-primary transition-colors underline underline-offset-4"
          >
            Saksham
          </Link>
        </div>
      </div>
    </footer>
  );
}