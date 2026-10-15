export const Footer = () => (
  <footer className="border-t border-border bg-primary text-primary-foreground mt-20">
    <div className="container py-12 grid md:grid-cols-4 gap-8">
      <div className="md:col-span-2">
        <div className="font-serif text-2xl font-bold">Alma<span className="text-gold">.</span>Net</div>
        <p className="text-primary-foreground/70 mt-3 max-w-md text-sm leading-relaxed">
          Where alumni, students, and mentors converge. Build lasting connections, share knowledge, and shape the next generation.
        </p>
      </div>
      <div>
        <h4 className="font-semibold text-sm uppercase tracking-wider text-gold mb-3">Network</h4>
        <ul className="space-y-2 text-sm text-primary-foreground/70">
          <li>Alumni Directory</li><li>Student Profiles</li><li>Mentor Hub</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-sm uppercase tracking-wider text-gold mb-3">Institution</h4>
        <ul className="space-y-2 text-sm text-primary-foreground/70">
          <li>About</li><li>Privacy</li><li>Contact</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-primary-foreground/10 py-5">
      <div className="container text-xs text-primary-foreground/50 flex justify-between">
        <span>© {new Date().getFullYear()} Alma.Net — Alumni Network</span>
        <span>Crafted with care</span>
      </div>
    </div>
  </footer>
);