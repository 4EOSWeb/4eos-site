/**
 * Chapter morph. Set this to false to restore the original snap:
 * the field eases with the old exponential and the shader blends in
 * straight lines again. Settled formations are unchanged either way.
 */
export const ORGANIC_FLOW = true;

/**
 * Lock each formation before the spring finishes, and drop the late
 * sideways drift. Set this to false to go back to the softer morph
 * that eases in and then trims the shape.
 */
export const CONFIDENT_SETTLE = true;

/** Angular frequency and damping for one chapter of travel. */
export const FLOW_STIFFNESS = 22;
/** Above critical damping so a chapter does not coast past its picture. */
export const FLOW_DAMPING = 12;
