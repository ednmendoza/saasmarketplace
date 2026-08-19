import React, { useMemo, useState } from "react";
import { fallbackLogo } from "@/lib/constants";

const domainFrom = (url) => {
  if (!url) return null;
  try {
    const u = url.startsWith("http") ? url : `https://${url}`;
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
};

export const AppLogo = ({ app, className = "h-12 w-12" }) => {
  const [idx, setIdx] = useState(0);

  const candidates = useMemo(() => {
    const list = [];
    if (app.logo_url) list.push(app.logo_url);
    const domain = domainFrom(app.website) || domainFrom(app.logo_url);
    if (domain) list.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
    list.push(fallbackLogo(app.name));
    return list;
  }, [app.logo_url, app.website, app.name]);

  const src = candidates[Math.min(idx, candidates.length - 1)];

  return (
    <div
      className={`${className} rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0`}
      data-testid={`app-logo-${app.slug || app.id}`}
    >
      <img
        src={src}
        alt={app.name}
        onError={() => setIdx((i) => i + 1)}
        className="h-full w-full object-contain p-2"
      />
    </div>
  );
};
