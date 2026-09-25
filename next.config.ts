import type { NextConfig } from "next";

const homepageSectionRedirects = [
  { source: "/about", destination: "/#about" },
  { source: "/aap", destination: "/#aap" },
  { source: "/faq", destination: "/#faq" },
  { source: "/contact", destination: "/#contact" },
] as const;

const nextConfig: NextConfig = {
  async redirects() {
    return homepageSectionRedirects.map(({ source, destination }) => ({
      source,
      destination,
      permanent: true,
    }));
  },
};

export default nextConfig;
