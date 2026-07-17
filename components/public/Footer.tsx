import { Github, Linkedin } from '../ui/Icons';

interface FooterProps {
  ownerName: string;
  username: string;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
}

export function Footer({ ownerName, username, linkedinUrl, githubUrl }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-transparent border-t border-zinc-900/80 py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Brand layout in footer */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-primary-500 to-secondary-600 flex items-center justify-center font-bold text-[10px] text-zinc-950">
              {ownerName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-bold text-white tracking-tight">{ownerName}</span>
          </div>
          
          <p className="text-xs text-zinc-500 font-light">
            &copy; {year} {ownerName}. Seluruh hak cipta dilindungi.
          </p>
        </div>

        {/* Built details and copyright links */}
        <div className="text-xs text-zinc-600 font-light text-center md:text-right md:order-2">
          Dibuat secara elegan dengan <span className="text-primary-500">HgzPort</span>.
        </div>

        {/* Social Icons list */}
        <div className="flex items-center gap-3 md:order-3">
          {linkedinUrl && (
            <a 
              href={linkedinUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 hover:border-primary-500/40 text-zinc-500 hover:text-primary-400 transition-all"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          )}
          {githubUrl && (
            <a 
              href={githubUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 hover:border-zinc-700 text-zinc-500 hover:text-white transition-all"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
          )}
        </div>
        
      </div>
    </footer>
  );
}
