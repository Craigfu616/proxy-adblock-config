# 代理客户端去广告配置

给 Shadowrocket、小火箭、Mihomo / Clash Meta、Clash Verge Rev 使用的广告过滤配置。已有代理服务可以继续使用；只想去广告时，也可以让普通连接全部直连。

**已经在用代理商配置的手机，优先使用附加模块 / 规则，见[手机模块与真正直连入口](docs/mobile-addons.md)。** Shadowrocket 的[广告模块](shadowrocket/adblock.module)可叠加到原配置；Android Mihomo 的[直连节点订阅](clash/direct-node-provider.yaml)使用真正的 `direct` 出站。两者的节点导入方式不能混为一谈。

Shadowrocket 2.2.93（3488）已通过同订阅对照确认：能导入 SOCKS5 对照，却未接纳 `direct` 条目。这条首页直连节点订阅路径不可用，实验已结束；详见[研究与测试记录](docs/shadowrocket-direct-research.md)。当前没有可交付的 Shadowrocket 首页直连节点订阅。

**连接开关开启，不代表所有流量都会经过代理服务器。** 开关让流量进入客户端，由规则选择 `REJECT`（拦截）、`DIRECT`（直连）或已有代理。关键是使用**配置 / Rule 模式**，把广告拦截放在普通分流规则之前。

```text
进入客户端的请求
  ├─ 命中放行规则 → DIRECT
  ├─ 命中广告规则 → REJECT
  └─ 其他请求     → 全部直连，或继续使用你原有的代理分流
```

## 选择用法

| 需求 | Shadowrocket | Mihomo / Clash Meta / Clash Verge Rev |
| --- | --- | --- |
| 只去广告，普通请求全部直连 | [完整直连配置](shadowrocket/direct-adblock.conf) | [完整直连配置](clash/direct-adblock.yaml) |
| 保留现在的代理分流，增加去广告 | [把三条规则插到当前配置最前面](shadowrocket/prepend-rules.conf) | Verge Rev 使用[扩展脚本](clash-verge/adblock.js)；其他客户端使用[合并片段](clash/adblock-snippet.yaml) |
| 没有自己的分流规则，想先使用基础分流 | [局域网 / 中国 IP 直连，其余代理](shadowrocket/proxy-adblock.conf) | 使用自己的代理订阅，再叠加扩展脚本 / 合并片段 |

已有代理商配置时，Shadowrocket 手机优先使用上面的广告模块；桌面端和其他客户端可使用第二行。下面的完整配置属于独立使用方式。

## Shadowrocket：保留现有代理，添加去广告

1. 在「配置」中先复制一份当前配置，编辑副本。
2. 打开 [prepend-rules.conf](https://raw.githubusercontent.com/Craigfu616/proxy-adblock-config/main/shadowrocket/prepend-rules.conf)，把其中三条非注释规则放到现有 `[Rule]` 段最前面。不要新增第二个 `[Rule]` 段，也不要删除原来的 `FINAL`。
3. 保存并启用副本；首页继续选择你已有的节点。
4. 将「全局路由」设为**配置**，保持连接开关开启。更新规则集，并在连接记录中检查命中的规则。

仅导入规则集不会自动接入当前配置，必须存在引用它的 `RULE-SET` / `DOMAIN-SET` 规则。不要用「全局代理」或「全局直连」代替配置模式。

如果当前配置会被远程订阅更新覆盖，请在本地副本中编辑，更新主配置后重新合入这三行。

## Shadowrocket：只去广告，普通请求全部直连

1. 「配置」→ 添加远程配置，粘贴下面的地址，下载后选择启用。

```text
https://raw.githubusercontent.com/Craigfu616/proxy-adblock-config/main/shadowrocket/direct-adblock.conf
```

2. 首页选中你已有的一个节点，以满足客户端开启连接的要求。选中节点只是指定命中 `PROXY` 时用哪个服务器，不代表每条请求都会使用它。
3. 将「全局路由」设为**配置**，保持连接开关开启。
4. 这份配置的末尾是 `FINAL,DIRECT`，没有代理分流规则。广告命中时拒绝连接，其他请求直连。DNS 使用系统解析，并显式关闭解析失败后转代理；无需新增“去广告节点”。

在连接记录中检查普通请求的策略应为 `DIRECT`、广告应为 `REJECT`。手动测速、代理组自动测速、节点订阅更新属于另外的客户端活动，不能仅凭业务请求直连就保证这些活动也完全不产生节点流量。

不要把 `127.0.0.1:9` 无效代理当作可以在原代理商配置中随时选择的直连节点。它只在所有普通请求已被这份独立配置设置为 `DIRECT` 时不会被使用，不能实现“保留原配置、仅换节点切换直连与境外代理”。真正直连入口的支持情况见[手机说明](docs/mobile-addons.md)。VPN 隧道开启时，`DIRECT` 也不保证通过所有 App 的 VPN 检测。

DNS 参数含义参考 [Shadowrocket 使用手册](https://github.com/LOWERTOP/Shadowrocket/wiki/#隐式参数)。

需要基础代理分流时，导入以下地址，并在首页选中原有可用节点：

```text
https://raw.githubusercontent.com/Craigfu616/proxy-adblock-config/main/shadowrocket/proxy-adblock.conf
```

基础代理版按 IP 国家分类，无法替代原订阅中精细的国内外、游戏、流媒体或 AI 分流。优先考虑合并到现有配置。

## Clash Verge Rev：保留原订阅

1. 保持现有代理订阅处于启用状态。
2. 打开 [adblock.js](https://raw.githubusercontent.com/Craigfu616/proxy-adblock-config/main/clash-verge/adblock.js)，复制到「全局扩展脚本」，或对应订阅的「扩展脚本」中，保存并重新加载配置。不同版本的入口名称可能略有不同。
3. 已有脚本时，需要合并到现有 `main(config)` 中；不要直接覆盖原有脚本。
4. 保持 **Rule / 规则模式**。脚本会将三条去广告规则放在现有规则之前，并保留原来的节点、策略组、DNS、TUN 和其他规则。

脚本中的 `DIRECT_ONLY = false` 表示沿用原分流；改成 `true` 后，普通业务请求改为 `MATCH,DIRECT`。原订阅中的节点更新、测速或代理 DNS 设置仍可能连接代理；需要独立直连配置时，使用下一节。

这里使用 JavaScript 扩展脚本。不要把 `prepend-rules` 放进新版 Verge 的扩展配置，那个旧字段不能可靠地实现前置规则。参见 [Verge 官方扩展说明](https://www.clashverge.dev/guide/extend.html)及[脚本说明](https://www.clashverge.dev/guide/script.html)。

## Mihomo / Clash Meta：直连版和其他客户端

完整直连配置的远程地址：

```text
https://raw.githubusercontent.com/Craigfu616/proxy-adblock-config/main/clash/direct-adblock.yaml
```

在客户端导入并启用，使用 **Rule 模式**。这份配置没有代理节点，以 `MATCH,DIRECT` 结尾，监听本机 `127.0.0.1:7890`。

保留现有代理时，按照 [adblock-snippet.yaml](clash/adblock-snippet.yaml) 的注释合并：将 `rule-providers` 加入现有配置，并把三条 `rules` 插到当前规则最前面，保留原来的 `MATCH`。**片段不是完整订阅**，直接替换现有配置会丢失代理部分。订阅会更新的客户端，应使用其覆写 / 扩展机制，避免更新覆盖修改。

系统代理只覆盖遵循系统代理设置的应用。需要让更多应用流量进入 Mihomo 时，由客户端开启 TUN / 虚拟网卡；本仓库不会自动切换你设备的网络设置。只对进入客户端、能识别目标域名的连接应用广告规则。

规则提供器每 24 小时更新一次；也可以在客户端手动刷新。首次使用必须成功下载规则集，不能仅凭连接开关开启就认定广告过滤已生效。

## 规则来源与维护

第一版采用 [AWAvenue 秋风广告规则](https://github.com/TG-Twilight/AWAvenue-Ads-Rule)的 **Only.Ads / 纯广告** 变体：

- Shadowrocket 使用上游提供的 [Surge DOMAIN-SET](https://raw.githubusercontent.com/TG-Twilight/AWAvenue-Ads-Rule/main/Filters/AWAvenue-Ads-Rule-Surge-Only.Ads.list)。
- Mihomo 使用上游提供的 [Clash domain YAML](https://raw.githubusercontent.com/TG-Twilight/AWAvenue-Ads-Rule/main/Filters/AWAvenue-Ads-Rule-Clash-Only.Ads.yaml)。

直接引用上游，各格式的具体匹配范围以上游文件及客户端实现为准。没有复制或修改第三方完整规则表；第三方规则遵守[其许可证](https://github.com/TG-Twilight/AWAvenue-Ads-Rule/blob/main/LICENSE)。上游更新由客户端刷新获取，无需每天提交本仓库。

选择纯广告版是为了优先保留正常功能，没有叠加上游单独分类的隐私 / 不受欢迎规则。另调研了 [anti-AD](https://github.com/privacy-protection-tools/anti-AD)，第一版不叠加，以便排查误拦截。

自己的补充规则在 [rules/block.list](rules/block.list)，放行规则在 [rules/allow.list](rules/allow.list)。这两个文件可供两类客户端共用。规则从上往下匹配；放行优先。

新增拦截示例，填写域名而非完整网址：

```text
DOMAIN,ads.example.com
DOMAIN-SUFFIX,ad-network.example
```

域名放行示例：

```text
DOMAIN,api.example.com
```

本仓库的放行策略是 `DIRECT`，即同时指定该域名直连。若域名需要代理，应在本地配置最前面加一条使用你的代理策略的精确例外，勿把本地代理组名称写入公共规则文件。

自定义规则和放行规则修改后，需要客户端刷新规则集；修改完整配置需要重新下载 / 更新配置；Verge 脚本修改后需要重新粘贴并重载。Shadowrocket 的刷新入口和自动更新能力随版本而异，首次请手动更新并查看下载结果。

## 检查是否生效与处理误拦截

- 请求 `http://adblock-test.invalid/`：应在连接记录中看到命中自定义规则并 `REJECT`。
- 请求 `http://allow.adblock-test.invalid/`：应先命中放行并 `DIRECT`。`.invalid` 是保留测试域，直连后解析失败属于预期；判断依据是连接记录中的策略，不是网页能否打开。
- 访问正常网站，确认仍按所选模式直连或代理；选择一个实际使用中出现的广告请求，在连接记录中检查对应域名和拒绝策略。
- 页面、登录或支付异常时，先查看被拒绝的**具体域名**，确认后精确放行并重试。避免一开始就放行整家服务的全部域名。

如果 GitHub Raw 在当前直连网络无法访问，先利用原有代理下载完整配置和规则集，再切换到直连版。下载失败不等于已启用过滤；需确认客户端中规则集已加载。网络不允许访问的站点，在全部直连模式下也不会因为开启客户端而变得可访问。

## 能做到什么

这版在域名层拒绝广告连接，无需安装根证书或开启 HTTPS 解密。它适合使用独立广告服务器的请求；与正文共用域名的广告、服务端插入的视频广告、本地缓存广告和广告留下的空白位置，不能保证靠域名规则去除。App 中的倒计时、奖励广告和广告检测也可能仍然存在。

公开仓库只保存通用配置。节点地址、密码、个人订阅链接应放在客户端本地。

## 验证

验证记录见 [docs/verification.md](docs/verification.md)。扩展脚本的回归检查无需第三方依赖：

```sh
node tests/adblock-script.test.mjs
```

Mihomo 配置参数参考[规则提供器](https://wiki.metacubex.one/config/rule-providers/)和[路由规则](https://wiki.metacubex.one/config/rules/)。
