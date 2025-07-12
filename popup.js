async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return BigInt("0x" + Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join(""));
}

function modinv(a, m) {
  let m0 = m, t, q;
  let x0 = 0n, x1 = 1n;
  while (a > 1n) {
    q = a / m;
    t = m;
    m = a % m; a = t;
    t = x0;
    x0 = x1 - q * x0; x1 = t;
  }
  return (x1 + m0) % m0;
}

async function fetchFilter() {
  const res = await fetch("http://localhost:5000/bloom");
  const json = await res.json();
  const bf = new BloomFilter(json.size, json.hashes);
  bf.loadBits(json.bits);
  return bf;
}

document.getElementById("checkBtn").onclick = async () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const P = BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f");
  const r = 3n + BigInt(Math.floor(Math.random() * 1000));
  const x = await sha256(username + password);
  const blinded = (x * r) % P;

  const res = await fetch("http://localhost:5000/oprf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blinded: blinded.toString() })
  });
  const data = await res.json();
  const y = BigInt(data.result);
  const r_inv = modinv(r, P);
  const final = (y * r_inv) % P;

  const bloom = await fetchFilter();
  const reused = bloom.contains(final.toString());
  document.getElementById("result").textContent = reused ? "⚠️ Password reuse detected!" : "✅ Password looks safe.";
};