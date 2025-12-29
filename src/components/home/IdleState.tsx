"use client";

export function IdleState() {
  return (
    <div className="text-muted-foreground flex h-full items-center justify-center">
      <div className="max-w-lg px-4 text-center font-mono">
        <div className="mb-6 text-6xl">&#62;_</div>
        <h2 className="text-foreground mb-2 text-xl font-bold">Ready to crawl</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Visualize your local development app structure
        </p>

        {/* Example URLs */}
        <div className="bg-card border-border mb-6 border p-4 text-left">
          <p className="text-muted-foreground mb-3 text-xs tracking-wide uppercase">
            Example URLs to try:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-primary">$</span>
              <code className="text-foreground">http://localhost:3000</code>
              <span className="text-muted-foreground text-xs">- Next.js default</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">$</span>
              <code className="text-foreground">http://localhost:5173</code>
              <span className="text-muted-foreground text-xs">- Vite default</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">$</span>
              <code className="text-foreground">http://localhost:4200</code>
              <span className="text-muted-foreground text-xs">- Angular default</span>
            </li>
          </ul>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="bg-card border-border border p-4">
            <span className="text-foreground mb-1 block font-medium">Tree View</span>
            <span className="text-muted-foreground">Interactive sitemap visualization</span>
          </div>
          <div className="bg-card border-border border p-4">
            <span className="text-foreground mb-1 block font-medium">Link Status</span>
            <span className="text-muted-foreground">Detect broken and redirected links</span>
          </div>
          <div className="bg-card border-border border p-4">
            <span className="text-foreground mb-1 block font-medium">SEO Analysis</span>
            <span className="text-muted-foreground">Meta tags, headings, images</span>
          </div>
          <div className="bg-card border-border border p-4">
            <span className="text-foreground mb-1 block font-medium">Export</span>
            <span className="text-muted-foreground">JSON, PNG, SVG, sitemap.xml</span>
          </div>
        </div>
      </div>
    </div>
  );
}
