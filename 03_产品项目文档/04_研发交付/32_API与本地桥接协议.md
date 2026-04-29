# API 与本地桥接协议

> 创建时间：2026-04-29  
> 最近更新：2026-04-29  
> 当前状态：v0.1 协议基线稿  
> 关联文件：`web/scripts/codex-insight-bridge.mjs`、`web/netlify/functions/thought-partner-insight.mjs`

## 1. 协议目标

本文件记录思想伙伴选配器当前所有外部/半外部数据交互约定，避免前端、Codex、本地 bridge 和 Netlify Function 字段不一致。

当前有两条链路：

1. 本地 Codex bridge：服务内部开发和半自动协作。
2. Netlify Function AI 洞察接口：服务线上 AI 洞察能力，占位并可后续启用。

## 2. 本地 Codex bridge

### 2.1 启动方式

在 `web/` 目录执行：

```text
npm run codex:bridge
```

默认监听：

```text
http://127.0.0.1:8787
```

可通过环境变量修改端口：

```text
CODEX_BRIDGE_PORT=8788 npm run codex:bridge
```

Windows PowerShell 可用：

```text
$env:CODEX_BRIDGE_PORT='8788'; npm run codex:bridge
```

### 2.2 文件路径

| 文件 | 用途 |
| --- | --- |
| `web/codex-inbox/thought-partner-latest.json` | 页面写入的最新请求 |
| `web/codex-inbox/thought-partner-response.json` | Codex 或接口写回的最新洞察 |

## 3. Bridge Endpoints

### 3.1 `GET /status`

用途：检查本地 bridge 是否启动，以及最近请求/返回时间。

响应示例：

```json
{
  "ok": true,
  "service": "codex-insight-bridge",
  "started": true,
  "port": 8787,
  "inboxPath": ".../thought-partner-latest.json",
  "responsePath": ".../thought-partner-response.json",
  "latestRequestAt": null,
  "latestResponseAt": null,
  "latestResponseSource": null
}
```

### 3.2 `POST /thought-partner/inbox`

用途：页面把当前结果卡、用户反馈和上下文写入本地收件箱。

请求体：由前端生成的 payload。

写入文件结构：

```json
{
  "receivedAt": "2026-04-29T00:00:00.000Z",
  "source": "book-kb-multi local webpage",
  "payload": {}
}
```

响应示例：

```json
{
  "ok": true,
  "inboxPath": ".../thought-partner-latest.json",
  "receivedAt": "2026-04-29T00:00:00.000Z"
}
```

### 3.3 `GET /thought-partner/response`

用途：页面读取 Codex 返回。

成功时返回 `thought-partner-response.json` 内容。

无返回时：

```json
{
  "error": "No Codex response yet"
}
```

状态码：`404`

### 3.4 `POST /thought-partner/response`

用途：允许外部脚本或 Codex 辅助工具把洞察写入 response 文件。

请求体示例：

```json
{
  "source": "codex",
  "insight": {
    "pattern": "用户在行动前会先预演失败",
    "reading": "这更像是一种自我保护，而不是单纯拖延。",
    "nextAction": "把行动缩小到 2 分钟内可完成的一步。",
    "tags": ["行动阻滞", "预演失败", "低摩擦"]
  }
}
```

写入后会自动补充：

```json
{
  "receivedAt": "..."
}
```

## 4. 前端期望的洞察字段

当前洞察卡字段应统一为：

| 字段 | 说明 |
| --- | --- |
| `pattern` | 我看见的模式 |
| `reading` | 这说明什么 |
| `nextAction` | 新的建议 |
| `tags` | 标签数组，建议 3-5 个 |

注意：早期文档中可能出现 `meaning` / `suggestion` 字段。后续研发应逐步统一到 `reading` / `nextAction`，或在前端做兼容映射。

兼容建议：

```text
reading = reading || meaning
nextAction = nextAction || suggestion
```

## 5. Netlify Function：AI 洞察接口

文件：

```text
web/netlify/functions/thought-partner-insight.mjs
```

线上路径通常为：

```text
/.netlify/functions/thought-partner-insight
```

### 5.1 Method

```text
POST
```

### 5.2 环境变量

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `OPENAI_API_KEY` | 是 | AI 调用 key |
| `OPENAI_MODEL` | 否 | 指定模型；未设置时使用代码默认值 |

### 5.3 请求字段

| 字段 | 说明 | 必填 |
| --- | --- | --- |
| `feedback` | 用户行动后反馈 | 是 |
| `sceneTitle` | 困境标题 | 建议 |
| `displayedProblem` | 展示给用户的困境重述 | 建议 |
| `primaryAxis` | 主能力轴 | 建议 |
| `supportNeed` | 承接方式 | 建议 |
| `expressionTaste` | 表达气质 | 建议 |
| `selectedGoal` | 当前目标 | 建议 |
| `lenses` | 学科镜头 | 建议 |
| `partners` | 伙伴组合 | 建议 |
| `minimumAction` | 最小行动 | 建议 |

### 5.4 成功响应

```json
{
  "insight": {
    "pattern": "用户行动反馈里呈现出的模式",
    "reading": "温和、具体、非诊断化解释",
    "nextAction": "24 小时内可尝试的新建议",
    "tags": ["标签1", "标签2", "标签3"]
  },
  "source": "ai"
}
```

### 5.5 错误响应

| 场景 | 状态码 | 响应 |
| --- | --- | --- |
| 非 POST | 405 | `{ "error": "Method not allowed" }` |
| 未配置 key | 503 | `{ "error": "OPENAI_API_KEY is not configured" }` |
| JSON 非法 | 400 | `{ "error": "Invalid JSON body" }` |
| 缺少 feedback | 400 | `{ "error": "feedback is required" }` |
| AI 返回异常 | 502/500 | `{ "error": "..." }` |

## 6. 前端 fallback 规则

如果 Netlify Function：

- 不存在；
- 未配置 key；
- 请求失败；
- 返回格式无法解析；

前端必须回退本地规则版洞察，不能阻塞用户生成洞察卡。

## 7. 安全与隐私边界

- 不传用户真实身份信息。
- `feedback` 可能包含隐私，后续如存储必须脱敏。
- AI 输出不得做心理诊断、医疗建议、法律建议或金融建议。
- Bridge 默认只监听 `127.0.0.1`，不对局域网暴露。

## 8. 当前待统一问题

| 问题 | 建议 |
| --- | --- |
| 文档中 `meaning/suggestion` 与代码中 `reading/nextAction` 不完全一致 | 前端兼容，文档统一为 `reading/nextAction` |
| Bridge CORS methods 未显式包含 GET | 如浏览器需要跨源 GET status/response，补 `GET` |
| AI 模型默认值后续可能变化 | 不在文档硬编码推荐模型，只记录代码当前行为 |
| response 文件是否清空 | 暂不自动清空，避免调试时丢失返回 |

## 9. 协议变更规则

任何字段变化必须同步更新：

- `31_数据结构与配置字典.md`
- 本文件
- `36_研发任务与需求同步.md`
- 前端解析逻辑
- 测试用例
