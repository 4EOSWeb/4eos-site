import { SignalLab } from "./SignalLab";

// Development-only harness for tuning the formations. Not linked from the
// site and excluded from the sitemap.
export const metadata = { robots: { index: false, follow: false } };

export default function Page() {
  return <SignalLab />;
}
