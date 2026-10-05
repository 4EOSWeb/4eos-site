import { SignalPoster } from "./SignalPoster";
import type { Phase } from "./formations";

/**
 * The still poster for this page's formation. The live field lives in the
 * root layout so it is not torn down on navigation.
 */
export function SignalBackdrop({
  phase,
  scene,
}: {
  phase: Phase;
  scene?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className="signal-poster pointer-events-none fixed inset-0 z-0"
    >
      <SignalPoster phase={phase} scene={scene} className="h-full w-full" />
    </div>
  );
}
