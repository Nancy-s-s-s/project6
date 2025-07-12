class BloomFilter {
  constructor(size, hashes) {
    this.size = size;
    this.hashes = hashes;
    this.bits = new Uint8Array(size);
  }

  _hashes(value) {
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const hashes = [];
    for (let i = 0; i < this.hashes; i++) {
      const hash = Array.from(data).reduce((acc, c) => acc * 31 + c + i, 0) % this.size;
      hashes.push(hash);
    }
    return hashes;
  }

  add(value) {
    for (const h of this._hashes(value)) {
      this.bits[h] = 1;
    }
  }

  contains(value) {
    return this._hashes(value).every(h => this.bits[h] === 1);
  }

  loadBits(bitsArray) {
    this.bits = new Uint8Array(bitsArray);
  }
}
window.BloomFilter = BloomFilter;