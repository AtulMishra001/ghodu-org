// Which way the next screen should slide in: 1 from the right, -1 from the
// left, 0 a plain rise. Set by whatever starts the navigation (a tab tap, the
// back button) and read once by the page template. Kept out of the URL hooks
// so the template never blocks prerendering.
let pending = 0;

export function setNavDirection(direction: -1 | 0 | 1) {
  pending = direction;
}

export function takeNavDirection() {
  const direction = pending;
  pending = 0;
  return direction;
}
