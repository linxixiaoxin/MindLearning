# 多书站部署清单

这份清单对应当前的多书站项目：

- 代码源目录：`04_operations/07_skill_lib/book-kb-multi`
- 独立发布仓库：`https://github.com/linxixiaoxin/MindLearning`
- 当前前端根目录：`web/`

## 推荐发布模式

建议长期保持“两层仓库”：

- 内容生产仓库：`RedBook`
  - 继续承载 `01_sources / 02_collections / 03_outputs / 06_index`
  - 这里适合高频编辑、试验、生成内容
- 发布仓库：`MindLearning`
  - 只承载 `book-kb-multi` 这一套可部署站点
  - 这里适合接 Netlify / GitHub Pages 等托管平台

这样做的好处是：

- 不会把大仓库里无关改动一起推上生产
- 部署仓库结构更干净，平台更容易识别构建入口
- 站点回滚、排查、版本管理都更简单

## 当前 Netlify 配置

仓库根目录放 `netlify.toml`：

```toml
[build]
  base = "web"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

对应含义：

- Netlify 从 `web/` 目录开始构建
- 执行 `npm run build`
- 发布 `web/dist`
- 所有未知路径回退到 `index.html`，交给 SPA 路由处理

## 首次部署清单

1. 确认 GitHub 仓库里已经有独立发布项目，而不是整个 `RedBook`
2. 确认仓库根目录存在 `netlify.toml`
3. 在 Netlify 新建站点并连接 `MindLearning`
4. 在 Netlify 后台确认这三个值没有被旧设置覆盖：
   - Base directory：`web`
   - Build command：`npm run build`
   - Publish directory：`dist`
5. 触发首次 Deploy
6. 部署完成后验证：
   - `/`
   - `/books`
   - `/registry/books.json`
   - `/books/mindset-traps/site.json`
   - `/books/leadership-evolution/site.json`

## 日常发布清单

每次准备上线时，按这个顺序走：

1. 在 `RedBook` 内完成多书站改动
2. 本地构建校验：

```bash
cd 04_operations/07_skill_lib/book-kb-multi/web
npm run build
```

3. 重点检查构建产物是否存在：
   - `web/dist/index.html`
   - `web/dist/_redirects`
   - `web/dist/registry/books.json`
   - `web/dist/books/<slug>/site.json`
4. 把 `book-kb-multi` 同步到独立发布仓库
5. 推送到 `MindLearning/main`
6. 等 Netlify 自动重新部署
7. 上线后抽查关键页面和 JSON 资源

## 404 排查清单

### 1. 根域名直接是 Netlify 404

最常见原因：

- Netlify 没有从 `web/` 构建
- 发布目录不是 `dist`
- 仓库根目录没有 `netlify.toml`

优先检查：

- Netlify 项目的 Base directory
- Netlify 项目的 Publish directory
- GitHub 仓库根目录是否已有 `netlify.toml`

### 2. 站点首页能打开，但刷新详情页 404

最常见原因：

- 缺少 SPA 回退规则

优先检查：

- `web/public/_redirects` 是否存在
- 构建后 `web/dist/_redirects` 是否存在
- `netlify.toml` 是否包含 `/* -> /index.html 200`

### 3. 页面能开，但图片或 JSON 404

最常见原因：

- 资源路径不是绝对路径
- 数据没有输出到 `public/books/<slug>`

优先检查：

- `/registry/books.json`
- `/books/<slug>/site.json`
- `/books/<slug>/graph.json`
- `/books/<slug>/file-map.json`
- `/books/<slug>/vault/...`

## 这次隔离出来的经验

### 1. 不要直接从大仓库发布

这次最大的经验就是：

- `RedBook` 是内容生产仓库，不是理想的部署仓库
- 里面有很多未提交内容、实验文件、临时资产、并行任务
- 如果直接拿它接部署，容易把无关内容一起带上去

更稳的做法是：

- 保持 `RedBook` 作为主工作区
- 把 `book-kb-multi` 单独抽出来，作为部署镜像仓库

### 2. 部署仓库只保留“可上线最小集合”

这次发布时，真正需要的只有：

- `README.md`
- `configs/`
- `web/`
- `netlify.toml`

不应该带上的内容：

- `web/node_modules`
- `web/dist`
- 本地日志
- 其他书、其他脚本、其他还没准备上线的内容资产

### 3. `.gitignore` 要尽早补

部署仓库如果没有 `.gitignore`，最容易把下面这些误推上去：

- `node_modules`
- `dist`
- `.log`

这次已经补上：

- `.gitignore`

## 后续建议

如果后面准备频繁发布，建议再补两步自动化：

1. 做一个“导出到发布仓库”的脚本
   - 把 `book-kb-multi` 自动同步到 `MindLearning` 本地副本
2. 做正式构建脚本
   - `build_registry.py`
   - `build_book.py`
   - `build_all.py`

这样以后流程会变成：

```text
RedBook 里生产内容
  -> 运行 build 脚本生成多书站产物
  -> 同步到 MindLearning
  -> push
  -> Netlify 自动发布
```

## 当前状态

当前 `MindLearning` 已包含：

- 多书站前端
- 两本书的数据包
- `netlify.toml`

如果 Netlify 已连接这个仓库，理论上只要部署设置不被 UI 覆盖，就可以正常上线。
