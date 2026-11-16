# Shadowrocket 首页直连节点订阅：研究与验收

核查日期：2026-11-17（Asia/Shanghai）。

目标：保留代理商主配置，广告模块一直启用，只在首页切换「广告屏蔽」与原境外节点。前者让普通连接真正直连，后者沿用代理商分流。

## 当前结论

**用户的 Shadowrocket 2.2.93（3488）未接纳 YAML `type: direct` 首页节点，已通过同订阅对照确认。** 首先，纯 direct 订阅提示“不能获取节点”，Safari 可读。随后，在同一份 YAML 中同时放入 SOCKS5 对照和 direct 候选，用户反馈只有「导入对照-不要连接」出现，「广告屏蔽」未出现。

这个结果排除了该次订阅整体下载失败及整个 YAML 都不能解析的解释，证明当前客户端没有接纳其中的 direct 条目。Sub-Store 导出器会保留该类型，但转换器输出不能作为客户端支持证据。

**这条节点订阅路径在该版本不可用，不能作为目标方案交付。** 其余已核查的公开节点格式和 Lua 示例，也未提供可以据以实现首页直连节点的受支持接口。因此目前没有可交付的 Shadowrocket 方案同时满足“保留代理商配置、只切换首页节点、广告模块常开”。这个结论针对当前版本及已核查路径，不是对未来版本或全部未公开机制的断言。

实验已结束，文件只作研究留档，不推荐继续导入。用户可删除「导入对照」测试订阅，不要选择或连接其中的本地 SOCKS5 条目；不需要安装出站探针。广告模块可继续叠加在代理商原配置上。

## 证据

| 来源 | 查到的内容 | 能证明什么 |
| --- | --- | --- |
| [App Store 官方产品页](https://apps.apple.com/us/app/shadowrocket/id932747118)及其 iTunes 元数据 | 查询到公开版 2.2.93，发布日期 2026-10-29；更新记录未提供 direct 首页节点的说明 | 确认此次检索的公开版本基准，不能确定用户实际版本 |
| [开发者官网](https://shadowlaunch.com/) | 官网没有公开完整的节点导入类型规范 | 不能仅靠官网确定该类型支持与否 |
| [Shadowrocket 社区手册](https://github.com/LOWERTOP/Shadowrocket/blob/main/README.md) | 记录了 Clash YAML 导入、`DIRECT` 策略、规则优先级和模块机制 | 存在 YAML 导入路径；未明确保证 direct 类型会成为首页节点 |
| [Sub-Store 的 Shadowrocket 导出器](https://github.com/sub-store-org/Sub-Store/blob/31b678cd30e73e73c628b1324eac4a499d6624be/backend/src/core/proxy-utils/producers/shadowrocket.js) | 导出器的类型过滤分支不排除 `direct`；输出辅助函数生成 `proxies:` 节点列表 | `type: direct` 可以通过该转换器的 Shadowrocket 导出路径，但转换器输出不能替代客户端验证 |
| [Sub-Store 输出辅助函数](https://github.com/sub-store-org/Sub-Store/blob/master/backend/src/core/proxy-utils/producers/utils.js)与[解析器](https://github.com/sub-store-org/Sub-Store/blob/master/backend/src/core/proxy-utils/parsers/index.js) | YAML 输出使用 `proxies` 根字段；Clash 类型解析器接受 `direct` | 最小实验订阅格式有代码依据，不需要虚构服务器地址和端口 |
| [Shadowrocket 的 Lua HTTP 示例](https://github.com/Shadowrocket/lua-backend/blob/master/http-backend.lua) | 示例先向代理端发送 HTTP CONNECT，随后在读写回调返回 `backend.RESULT.DIRECT` | 这个同名常量用于示例中的原样转发，不能据此把 Lua 节点认定为直连出口 |

手册为社区维护，并非客户端完整实现。上述源码属于转换器或扩展示例，并非 Shadowrocket 的节点导入器和隧道核心。

## 第一关：节点导入（同订阅对照确认未通过）

2026-11-17 用户反馈：2.2.93（3488）提示“不能获取节点”，Safari 可读原订阅文本，没有获得可用节点。

“不能获取节点”本身只是结果提示，因此随后使用了下面的同订阅对照，而非直接将该提示当作不支持类型的明确诊断。

实验订阅：

```text
https://raw.githubusercontent.com/Craigfu616/proxy-adblock-config/main/shadowrocket/experimental/direct-node.yaml
```

1. 保持代理商当前主配置与广告模块不变，记录 Shadowrocket 版本号。
2. 在 **首页 → ＋ → Subscribe（订阅）** 添加上面的地址，备注可填「直连节点实验」，然后更新。
3. 不要在「配置」页导入这份文件，也不要替换现有主配置。
4. 检查是否出现名为「广告屏蔽」的节点，并查看它的类型或详情。若没有节点、提示不支持、或被误识别成需填写服务器的其他协议，停止此路径，记录结果。

仅出现这个名称还不算成功，需要继续验证实际出站。不要为了让条目出现而补一个 `127.0.0.1` 假代理。

### 同订阅的导入对照

```text
https://raw.githubusercontent.com/Craigfu616/proxy-adblock-config/main/shadowrocket/experimental/direct-node-control.yaml
```

这份文件同时包含「导入对照-不要连接」（SOCKS5 格式）与「广告屏蔽」（direct 类型）。对照条目没有实际代理服务，只验证导入，绝不把它当作直连节点。

**用户实际结果：只有「导入对照-不要连接」。** 当前版本接受同次下载中的 SOCKS5 条目，没有接纳 direct 条目。下列判断表用于说明这次实验如何区分原因，实验已经结束，无需再次操作。

在首页新建 Subscribe 并更新后，仅查看条目：

- 只有对照条目：证明同次下载及 YAML 节点解析可用，但当前客户端未接纳 direct 条目，可停止这一路径。
- 两个条目都出现：还需查看类型，并按第二关验证真正出站。
- 两个都没有／仍提示不能获取节点：下载或 YAML 导入问题仍未排除，不能据此断言 direct 类型本身被拒绝。

查看结果后可以删除「导入对照」这条测试订阅，不需要改代理商原配置或停用广告模块。

## 第二关：实际出站（未进入，不需要安装探针）

国内网站正常打开不能独立证明新节点是直连，因为原配置可能本来就让该网站走 `DIRECT`。

第一关成功后，可安装临时单域验证模块：

```text
https://raw.githubusercontent.com/Craigfu616/proxy-adblock-config/main/shadowrocket/experimental/direct-probe.module
```

模块只将 `api.ipify.org` 的请求设置为 `PROXY`，使该请求明确交给首页当前节点；不改主配置、DNS 或默认出口。它应位于其他会处理此域名的模块之前。广告模块一直保持启用，全局路由保持「配置」。

1. 准备当前 Wi-Fi / 蜂窝网络的直连公网出口作为本地对照。可以临时关闭 VPN 访问一次 `https://api.ipify.org/`，记录在手机上后重新开启；不必把 IP 发到聊天或仓库。若网络原本无法访问此站，不能将其访问失败直接归因于节点类型。
2. 首页选择「广告屏蔽」，启用探针模块后重新访问同一地址，检查连接记录确实命中探针并交给该节点，返回出口应与直连对照一致。
3. 首页切换到原有境外节点，再发起新请求，确认同一探针使用该节点且返回相应代理出口。
4. 两种选择下请求 `http://adblock-test.invalid/`，都应在连接记录中命中广告模块并 `REJECT`。
5. 验证后停用或删除探针模块。广告模块和代理商原配置继续保留。

切换后要发起新请求，并检查实际日志，避免沿用旧连接或浏览器缓存。单次出口 IP 结果不能代替规则命中与所选节点记录。

## 第三关：原配置能否只靠首页节点切换

即使 direct 节点实测可用，还要核查原配置中的代理路径是否都跟随首页当前节点：

- 指向内置 `PROXY` 的规则通常跟随首页节点。
- 指定具体服务器、固定代理组或独立自动测速组的规则，可能不跟随首页选择。
- 明确经指定代理查询的 DNS，以及配置外的自动测速活动，也不能仅凭一次首页切换就认定已经停止使用代理。

因此，“节点本身真正直连”和“保留这份代理商配置时，全部预期请求都跟随它”是两项验收。第二项需要检查规则、分组及相关 DNS 设置的结构，不能在没看配置的情况下保证成立；无需公开节点密码或私人订阅链接。

## 状态

| 项目 | 状态 |
| --- | --- |
| 不改代理商主配置的广告模块 | 已提供；手机效果待实测 |
| 最小 YAML direct 实验订阅 | 已确认在用户的 2.2.93（3488）上未被接纳，仅作研究留档 |
| 同订阅格式对照 | SOCKS5 对照成功出现，direct 条目未出现 |
| Shadowrocket 首页成功导入 direct 节点 | 未通过，不是该次订阅整体下载或整个 YAML 解析失败 |
| Shadowrocket 实际直连与境外节点切换 | 未进入；第一关未通过 |
| 原代理商配置全部相关路径跟随首页选择 | 待检查配置结构 |

没有发布虚构的 `direct://`、无效 SOCKS 节点或未经证实的 Lua 直连实现。
