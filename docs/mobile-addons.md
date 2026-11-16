# 手机：保留代理商配置，叠加广告过滤

目标交互：VPN 保持开启，平时选择「广告屏蔽」入口，普通连接直连、广告拒绝；需要境外服务时选择代理商节点，广告继续拒绝。

广告过滤和出站节点是两项独立设置。节点订阅提供可选择的出口，广告模块 / 规则集负责拦截。只导入节点不会自动安装广告规则。

## Shadowrocket：可直接使用的广告模块

保持代理商原有配置启用，在「配置 → 模块 → ＋」添加下面的远程模块并启用：

```text
https://raw.githubusercontent.com/Craigfu616/proxy-adblock-config/main/shadowrocket/adblock.module
```

全局路由保持「配置」。模块只包含精确放行、自定义广告拒绝和秋风纯广告域名集，未设置 `FINAL`、DNS、节点或策略组。它不覆盖代理商的配置文件；广告和明确放行之外的请求继续交给原配置处理。规则类模块的优先级高于主配置，参见 [Shadowrocket 社区手册：模块与优先级](https://github.com/LOWERTOP/Shadowrocket/wiki/#模块)。已有其他模块时，检查其顺序和最终编译结果。

这一步实现的是「沿用代理商分流，同时过滤广告」，尚未实现「首页选择一个直连节点」。

## Shadowrocket：直连入口的当前限制

已查阅的 Shadowrocket 手册明确支持 `DIRECT` 策略及含 `DIRECT` 的代理分组。但 YAML `type: direct` 首页节点订阅在用户的 2.2.93（3488）上未被接纳：同一份订阅中的 SOCKS5 对照能出现，direct 条目不出现，已排除该次订阅整体下载失败及整个 YAML 都不能解析的解释。详情见[研究与测试记录](shadowrocket-direct-research.md)。该候选仅留档，不作为可用节点推荐。

`127.0.0.1:9` 是无效代理，不是真正直连节点。原配置命中 `PROXY` 时，选择它会尝试连接本机该端口并失败，不会自动变成 `DIRECT`。之前提到的占位方式，只适用于所有普通请求已经由独立配置设置为 `DIRECT` 的情况；它不能完成上述保持原配置的切换目标。

在 Shadowrocket 中可以使用已支持的 `DIRECT` 策略切换，但需要正确接入原配置实际使用的策略组。如果原配置直接指定了其他节点或独立分组，它们不会因为首页换了节点而自动跟随。没有检查代理商配置的规则和分组之前，不能保证增加一个入口就能接管全部代理请求。

如果要求严格保持「仅在首页点节点、不切换策略、不替换原配置」的交互，目前没有可交付的 Shadowrocket 方案。已测试的原生 direct YAML 路径在该版本不可用，也未在核查的公开格式中找到其他受支持的首页直连节点接口。广告模块本身可以继续独立使用。

## Android Clash Meta / Mihomo：真正的直连节点订阅

内核支持原生 `type: direct`，见 [Mihomo 官方说明](https://wiki.metacubex.one/config/proxies/direct/)。本仓库提供名为「广告屏蔽」的真实直连出站：

```text
https://raw.githubusercontent.com/Craigfu616/proxy-adblock-config/main/clash/direct-node-provider.yaml
```

这是 `proxy-provider` 的节点清单，不是完整配置，也不是 Android 系统里的另一条 VPN。一次性将下面的提供器合入原配置，再在原先负责代理出口的 `select` 分组中，将 `adblock-direct` 加入 `use`。原有 `use`、节点、规则都要保留：

```yaml
proxy-providers:
  adblock-direct:
    type: http
    url: https://raw.githubusercontent.com/Craigfu616/proxy-adblock-config/main/clash/direct-node-provider.yaml
    path: ./proxy-providers/adblock-direct.yaml
    interval: 86400
```

原有分组的合并示意；名称必须沿用你配置中的实际分组，不要另建一个没有规则引用的分组：

```yaml
proxy-groups:
  - name: 你的原有出口组
    type: select
    # 保留原有 proxies 和 use，在 use 内追加 adblock-direct。
    use:
      - adblock-direct
```

然后按 [clash/adblock-snippet.yaml](../clash/adblock-snippet.yaml) 将广告规则放在主配置规则前面。选择「广告屏蔽」时，该分组的请求真正直连；选择原代理商节点时，该分组的请求按原分流使用该节点。广告规则不随选择改变。

Android 客户端不会因为增加第二份完整配置就自动共用第一份配置的节点；这里需要合并到同一份有效配置。CMFA 的具体版本是否在界面直接提供此类提供器编辑能力，需要在手机确认。代理商配置如果没有本地覆写机制，更新可能覆盖本地合并内容，应先确认配置管理方式。

## VPN 检测与国内流量

两类客户端保持 VPN 隧道开启时，即使业务连接直连，系统 VPN 状态仍然存在。该方案不保证检测 VPN 的 App 会将它视为“没有开启 VPN”。Shadowrocket 的「代理类型 None」只改变接管方式，不能保证消除 VPN 检测；参见[社区手册的检测代理说明](https://github.com/LOWERTOP/Shadowrocket/wiki/#检测代理)。

Android 可以在应用访问控制中把某些 App 排除出 VPN，但它们也会绕过 Clash 的广告过滤。平台机制参考 [Android per-app VPN](https://developer.android.com/develop/connectivity/vpn#per-app)。

选择境外节点后，哪些国内请求仍然直连，取决于代理商原配置。单独添加广告模块不能修复原配置的国内误分流。保留所有原路由行为与同时修正其中的误分流，需要分别说明和验证。

## 验证状态

Shadowrocket 模块按社区手册核对并做静态检查，未在 iPhone 上实测。Mihomo v1.19.33 已实际加载节点订阅，API 确认「广告屏蔽」节点类型为 `Direct`；选择它时请求成功直达本地目标服务，切换到测试代理后相同请求按代理策略处理，两种选择下广告仍被拒绝。测试代理是不可用的本地 SOCKS 端口，只证明切换路径，没有验证真实境外节点连通性。

Android 客户端界面、代理商原配置和手机 App 兼容性不能由桌面内核测试替代。Shadowrocket 的 2.2.93（3488）同订阅对照已确认未接纳 direct 条目，不能将 Android 格式标记为已适配 Shadowrocket。
