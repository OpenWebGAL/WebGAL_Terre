export function isLocalBrowserHost(hostname = window.location.hostname): boolean {
  const normalizedHostname = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  return normalizedHostname === 'localhost' || normalizedHostname === '::1' || /^127(?:\.\d{1,3}){3}$/.test(normalizedHostname);
}
