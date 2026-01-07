import { Block } from "@/components/block";

export function SiteFooter() {
  return (
    <footer className="py-6 md:px-8 md:py-0 border-t border-foreground/10">
      <Block className="flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          © {new Date().getFullYear()} DairyNews7x7. All rights reserved.
        </p>
      </Block>
    </footer>
  );
}
  