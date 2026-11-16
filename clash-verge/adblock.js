// Clash Verge Rev：粘贴到全局扩展脚本，或指定订阅的扩展脚本。
// 保留节点、DNS、TUN、原有策略组及分流；前三条增加广告过滤。
// 已有扩展脚本时，合并其 main 函数，勿直接覆盖已有逻辑。
// 若只需要直连去广告，将 DIRECT_ONLY 改成 true；仍使用 Rule 模式。
const DIRECT_ONLY = false;

function main(config) {
  const base = "https://raw.githubusercontent.com/Craigfu616/proxy-adblock-config/main";
  const prefix = [
    "RULE-SET,craig-adblock-allow,DIRECT",
    "RULE-SET,craig-adblock-custom,REJECT",
    "RULE-SET,craig-adblock-awa,REJECT",
  ];
  const oldRules = Array.isArray(config.rules) ? config.rules : [];
  if (!DIRECT_ONLY && oldRules.length === 0) {
    throw new Error("原配置没有分流规则。请先启用正常代理订阅，或设置 DIRECT_ONLY = true。");
  }
  const provider = (name, url, behavior, format, extension) => ({
    type: "http",
    behavior,
    format,
    url,
    path: `./rule-providers/${name}.${extension}`,
    interval: 86400,
  });
  config["rule-providers"] = {
    ...config["rule-providers"],
    "craig-adblock-allow": provider("craig-adblock-allow", `${base}/rules/allow.list`, "classical", "text", "list"),
    "craig-adblock-custom": provider("craig-adblock-custom", `${base}/rules/block.list`, "classical", "text", "list"),
    "craig-adblock-awa": provider(
      "craig-adblock-awa",
      "https://raw.githubusercontent.com/TG-Twilight/AWAvenue-Ads-Rule/main/Filters/AWAvenue-Ads-Rule-Clash-Only.Ads.yaml",
      "domain", "yaml", "yaml",
    ),
  };
  // 本仓库保留 craig-adblock-* 名称；重复执行也只保留一份前置规则。
  config.rules = prefix.concat(DIRECT_ONLY ? ["MATCH,DIRECT"] : oldRules.filter(rule => !prefix.includes(rule)));
  config.mode = "rule";
  return config;
}

