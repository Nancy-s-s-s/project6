from flask import Flask, request, jsonify
from flask_cors import CORS
import hashlib

app = Flask(__name__)
CORS(app)
P = 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f
k = 7  # server's secret key

def hash_to_int(s):
    return int.from_bytes(hashlib.sha256(s.encode()).digest(), 'big') % P

# build dummy Bloom filter (in-memory)
class BloomFilter:
    def __init__(self, size, hashes):
        self.size = size
        self.hashes = hashes
        self.bits = [0] * size

    def _hashes(self, value):
        return [(int(value) + i * 7) % self.size for i in range(self.hashes)]

    def add(self, value):
        for h in self._hashes(value):
            self.bits[h] = 1

    def to_dict(self):
        return {"size": self.size, "hashes": self.hashes, "bits": self.bits}

bf = BloomFilter(2048, 4)
for pwd in ["123456", "password123", "qwerty"]:
    x = hash_to_int("test@example.com" + pwd)
    z = (x * k) % P
    bf.add(str(z))

@app.route("/oprf", methods=["POST"])
def oprf():
    data = request.get_json()
    blinded = int(data["blinded"])
    result = (blinded * k) % P
    return jsonify({"result": str(result)})

@app.route("/bloom")
def bloom():
    return jsonify(bf.to_dict())

if __name__ == "__main__":
    app.run(debug=True)
