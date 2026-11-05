// Photos picked on the dashboard, handed to /product-input (also across the login detour).
// shortcut: kept in memory, so a full page reload or Google redirect sign-in drops them; move to IndexedDB if that bites.
let pending: File[] = [];

export function setPendingPhotos(files: File[]) {
  pending = files;
}

export function takePendingPhotos(): File[] {
  const files = pending;
  pending = [];
  return files;
}
