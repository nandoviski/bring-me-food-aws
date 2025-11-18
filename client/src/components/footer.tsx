import Link from "next/link";
import { Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-8 mt-auto">
      <div className="container-custom flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="text-center md:text-left">
          <p className="text-sm font-medium">
            &copy; {new Date().getFullYear()} Bring Me Food. All rights reserved.
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-2 md:flex-row md:gap-6">
          <span className="text-sm text-primary-foreground/80">
            Created by <span className="font-semibold text-white">Fernando Marostega</span>
          </span>
          
          <Link 
            href="mailto:fmarostega@gmail.com" 
            className="flex items-center gap-2 text-sm font-medium hover:text-secondary transition-colors"
          >
            <Mail className="h-4 w-4" />
            <span>Contact Me</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
