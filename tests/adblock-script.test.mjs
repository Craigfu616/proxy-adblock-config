import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../clash-verge/adblock.js", import.meta.url), "utf8");
const clone = value => JSON.parse(JSON.stringify(value));
function apply(config, directOnly = false) {
  const code = directOnly ? source.replace("const DIRECT_ONLY = false;", "const DIRECT_ONLY = true;") : source;
  return runInNewContext(`${code}\nmain(input);`, { input: config });
}
const original = {
  proxies: [{ name: "我的节点", type: "socks5", server: "127.0.0.1", port: 1080 }],
  "proxy-groups": [{ name: "原代理组", type: "select", proxies: ["我的节点"] }],
  "rule-providers": { original: { type: "inline", behavior: "classical", payload: ["DOMAIN,example.org"] } },
  dns: { enable: true, nameserver: ["system"] },
  tun: { enable: false },
  mode: "global",
  rules: ["DOMAIN,example.org,DIRECT", "MATCH,原代理组"],
};
const config = clone(original);
const result = apply(config);
assert.equal(result, config);
for (const key of ["proxies", "proxy-groups", "dns", "tun"]) assert.deepEqual(result[key], original[key]);
assert.deepEqual(result["rule-providers"].original, original["rule-providers"].original);
assert.deepEqual(Array.from(result.rules.slice(3)), original.rules);
assert.equal(result.rules[0], "RULE-SET,craig-adblock-allow,DIRECT");
assert.equal(result.rules[1], "RULE-SET,craig-adblock-custom,REJECT");
assert.equal(result.rules[2], "RULE-SET,craig-adblock-awa,REJECT");
assert.equal(result.mode, "rule");
const once = JSON.stringify(result);
assert.equal(JSON.stringify(apply(result)), once, "重复执行不能重复插入规则");
const direct = apply(clone(original), true);
assert.deepEqual(Array.from(direct.rules.slice(3)), ["MATCH,DIRECT"]);
assert.deepEqual(direct.proxies, original.proxies);
assert.throws(() => apply({}), /原配置没有分流规则/);
assert.equal(apply({}, true).rules.at(-1), "MATCH,DIRECT");
console.log("PASS: 保留订阅、原规则与网络设置；白名单优先；重复执行；直连模式；空规则保护。");
