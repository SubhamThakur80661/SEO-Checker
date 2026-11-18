const { URL } = require('url');
const dns = require('dns').promises;
const net = require('net');

/**
 * Checks whether an IPv4 or IPv6 address is publicly routable.
 * Rejects private, loopback, link-local, multicast, and reserved ranges.
 */
function isPublicIp(ip) {
  if (typeof ip !== 'string') return false;
  const version = net.isIP(ip);
  if (version === 4) {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return false;
    const [a, b, c] = parts;
    // 0.0.0.0/8 (current network)
    if (a === 0) return false;
    // 10.0.0.0/8 (private)
    if (a === 10) return false;
    // 100.64.0.0/10 (shared / CGNAT)
    if (a === 100 && b >= 64 && b <= 127) return false;
    // 127.0.0.0/8 (loopback)
    if (a === 127) return false;
    // 169.254.0.0/16 (link-local)
    if (a === 169 && b === 254) return false;
    // 172.16.0.0/12 (private)
    if (a === 172 && b >= 16 && b <= 31) return false;
    // 192.0.0.0/24 (IETF assignments), 192.0.2.0/24 (TEST-NET-1)
    if (a === 192 && b === 0 && (c === 0 || c === 2)) return false;
    // 192.168.0.0/16 (private)
    if (a === 192 && b === 168) return false;
    // 198.18.0.0/15 (benchmark)
    if (a === 198 && (b === 18 || b === 19)) return false;
    // 198.51.100.0/24 (TEST-NET-2)
    if (a === 198 && b === 51 && c === 100) return false;
    // 203.0.113.0/24 (TEST-NET-3)
    if (a === 203 && b === 0 && c === 113) return false;
    // 224.0.0.0/4 (multicast) & 240.0.0.0/4 (reserved / broadcast)
    if (a >= 224) return false;
    return true;
  }
  if (version === 6) {
    const normalized = ip.toLowerCase();
    // Loopback & unspecified
    if (normalized === '::1' || normalized === '::') return false;
    // IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1)
    const ipv4MappedMatch = normalized.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
    if (ipv4MappedMatch) {
      return isPublicIp(ipv4MappedMatch[1]);
    }
    // fe80::/10 link-local unicast (fe8*, fe9*, fea*, feb*)
    if (/^fe[89ab]/i.test(normalized)) return false;
    // fc00::/7 unique local address (fc*, fd*)
    if (/^f[cd]/i.test(normalized)) return false;
    // ff00::/8 multicast
    if (/^ff/i.test(normalized)) return false;
    // 2001:db8::/32 documentation
    if (normalized.startsWith('2001:db8:') || normalized === '2001:db8') return false;
    return true;
  }
  return false;
}

const ALLOWED_PORTS = new Set(['', '80', '443', '8080', '8443', '3000', '5000']);

/**
 * Asserts that a URL is valid, safe, and targets a public host.
 * Throws an Error with a clear message if rejected.
 */
async function assertPublicUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new Error('A valid URL string is required.');
  }

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Invalid URL format.');
  }

  // Only http/https
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Unsupported protocol "${parsed.protocol}". Only HTTP and HTTPS are permitted.`);
  }

  // Reject embedded credentials
  if (parsed.username || parsed.password) {
    throw new Error('URLs with embedded credentials are not allowed.');
  }

  // Restrict ports
  if (!ALLOWED_PORTS.has(parsed.port)) {
    throw new Error(`Port ${parsed.port} is not permitted.`);
  }

  const hostname = parsed.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (!hostname) {
    throw new Error('Hostname is missing in the URL.');
  }

  // Reject obvious localhost aliases
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    throw new Error('Access to localhost addresses is blocked.');
  }

  // If hostname is already an IP address, validate it directly
  if (net.isIP(hostname)) {
    if (!isPublicIp(hostname)) {
      throw new Error(`Access to private IP address ${hostname} is blocked.`);
    }
    return parsed;
  }

  // Resolve hostname via DNS and ensure all addresses are public (fail closed)
  let addresses;
  try {
    addresses = await dns.lookup(hostname, { all: true });
  } catch (err) {
    throw new Error(`DNS resolution failed for "${hostname}": ${err.message}`);
  }

  if (!addresses || addresses.length === 0) {
    throw new Error(`Could not resolve hostname "${hostname}".`);
  }

  for (const record of addresses) {
    if (!isPublicIp(record.address)) {
      throw new Error(`Hostname "${hostname}" resolved to non-public IP (${record.address}). Access blocked.`);
    }
  }

  return parsed;
}

module.exports = {
  assertPublicUrl,
  isPublicIp
};
