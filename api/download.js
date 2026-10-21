export default async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || 'zero4kka/island';

  if (!token) {
    return res.status(500).json({ error: 'GITHUB_TOKEN environment variable is not configured' });
  }

  try {
    const relRes = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
      headers: {
        'User-Agent': 'Island-Download-Proxy',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!relRes.ok) {
      return res.status(relRes.status).json({ error: 'Failed to fetch release metadata' });
    }

    const release = await relRes.json();
    const asset = (release.assets || []).find(a => a.name.toLowerCase().endsWith('.exe')) || release.assets[0];

    if (!asset || !asset.url) {
      return res.status(404).json({ error: 'Installer asset not found in latest release' });
    }

    // Request download: GitHub API returns 302 with AWS S3 / Azure CDN presigned URL
    const dlRes = await fetch(asset.url, {
      headers: {
        'User-Agent': 'Island-Download-Proxy',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/octet-stream'
      },
      redirect: 'manual'
    });

    const redirectUrl = dlRes.headers.get('location');
    if (redirectUrl) {
      // 302 Found: User downloads directly from high-speed GitHub CDN without exposing the token
      return res.redirect(302, redirectUrl);
    }

    return res.status(500).json({ error: 'GitHub did not provide redirect URL' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
