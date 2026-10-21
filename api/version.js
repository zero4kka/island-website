export default async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || 'zero4kka/island';

  try {
    const headers = {
      'User-Agent': 'Island-Version-Proxy',
      'Accept': 'application/vnd.github.v3+json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const relRes = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers });

    if (relRes.ok) {
      const release = await relRes.json();
      const asset = (release.assets || []).find(a => a.name.toLowerCase().endsWith('.exe')) || release.assets[0];

      res.setHeader('Cache-Control', 'public, max-age=300');
      return res.status(200).json({
        version: release.tag_name ? release.tag_name.replace(/^v/i, '') : '1.3.6',
        tag: release.tag_name || 'v1.3.6',
        name: release.name || 'Island',
        notes: release.body || '',
        published_at: release.published_at,
        asset_name: asset ? asset.name : 'Island_Setup.exe',
        asset_size: asset ? asset.size : null
      });
    }
  } catch (err) {}

  res.setHeader('Cache-Control', 'public, max-age=60');
  return res.status(200).json({
    version: '1.3.6',
    tag: 'v1.3.6',
    asset_name: 'Island_Setup.exe'
  });
}
