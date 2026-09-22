const footerLinks = {
  Product: ["Features", "How it works", "Pricing", "FAQ"],
  Company: ["About", "Blog", "Careers", "Contact"],
  Legal: ["Privacy", "Terms", "Security"],
};

export default function Footer() {
  return (
    <footer className="border-t border-emerald-300/[0.08] bg-[#050706]">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">

          {/* Brand */}
          <div>
            <a href="#" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-mint-400 shadow-[0_0_20px_rgba(34,197,94,0.12)]">
                <span className="text-sm font-bold text-white">
                  I
                </span>
              </div>

              <span className="text-[17px] font-semibold tracking-tight text-white">
                Invoice<span className="text-emerald-400">AI</span>
              </span>
            </a>

            <p className="mt-4 max-w-xs text-sm leading-6 text-[#536058]">
              Intelligent invoicing and cash flow tools for modern
              businesses.
            </p>
          </div>

          {/* Footer links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-xs font-medium uppercase tracking-wider text-[#8A948D]">
                {category}
              </h3>

              <ul className="mt-5 space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href={
                        link === "Features"
                          ? "#features"
                          : link === "How it works"
                          ? "#how-it-works"
                          : link === "Pricing"
                          ? "#pricing"
                          : link === "FAQ"
                          ? "#faq"
                          : "#"
                      }
                      className="text-sm text-[#536058] transition hover:text-[#BBF7D0]"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-14 flex flex-col gap-4 border-t border-emerald-300/[0.08] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#536058]">
            © 2026 InvoiceAI. All rights reserved.
          </p>

          <p className="text-xs text-[#536058]">
            Built for modern businesses.
          </p>
        </div>
      </div>
    </footer>
  );
}