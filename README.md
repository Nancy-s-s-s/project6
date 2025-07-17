1. 模拟 OPRF：
   
客户端：
  1. 用户输入 (username, password)
  2. 计算 x = H(username || password)
  3. 客户端生成 r（随机盲因子）
  4. 发送 blinded = r·x 到服务器

服务器：
  5. 服务器有私钥 k，返回 y = k·blinded

客户端：
  6. 去盲化：z = y / r
  7. 检查是否在本地布隆过滤器中 z ∈ Bloom

其中：
     所有乘除在有限域内
     服务端永远不会知道原始密码
     客户端也不会获得泄露数据库内容

2. 实现 Bloom Filter
   
Bloom Filter 是一个空间效率极高的集合检测结构。
服务端预计算泄露集中的 z = k·H(user||password)
添加进布隆过滤器
客户端最终只需判断 z 是否 ∈ BloomFilter

3. 分工结构设计

password-checkup-advanced/
├── server/
│   ├── server.py             ← 提供 blind-sign 服务
│   └── build_filter.py       ← 构建布隆过滤器并保存为文件
├── client/
│   ├── popup.html
│   ├── popup.js
│   ├── bloom.js              ← 客户端 Bloom 过滤器库（JS版）
│   └── manifest.json

安全性总结
安全目标	                   如何达成
服务端不知道用户密码	         OPRF 实现盲签名
用户无法枚举泄露集内容	       布隆过滤器（不可逆 + 不泄露）
查询隐私保护	                 不显式暴露 password 或 z 值

输入如下测试数据进行模拟检测：

用户名	          密码	           结果
test@example.com	123456	       Password reuse detected!
test@example.com	abcdefg12345	 Password looks safe.
