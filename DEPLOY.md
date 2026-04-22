# 多书站部署清单

这份清单对应当前的多书站项目。

- 代码源目录：`E:\RedBook\04_operations\07_skill_lib\book-kb-multi`
- GitHub 发布仓库：`https://github.com/linxixiaoxin/MindLearning`
- 本地发布镜像路径：`E:\Cache\Repos\MindLearning`
- 前端根目录：`web/`
- 同步脚本：`scripts/sync_publish_repo.ps1`

## 为什么要分两层仓库

建议长期保持“两层仓库”：

- 内容生产仓库：`RedBook`
- 发布仓库：`MindLearning`

这样做的好处是：

- 不会把 `RedBook` 里其他未提交改动一起推上生产
- 部署仓库结构更干净，Netlify 更容易识别构建入口
- 回滚、排查、版本管理都更简单

## 固定本地路径

后续统一把发布仓库放在这个固定位置：

- `E:\Cache\Repos\MindLearning`

不要再继续使用临时目录，比如：

- `%TEMP%\MindLearning-codex`

原因很简单：

- 临时目录不稳定
- 其他窗口不知道路径
- 重启或清理缓存后容易丢

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

- Netlify 从 `web/` 开始构建
- 执行 `npm run build`
- 发布 `web/dist`
- 未知路径统一回退到 `index.html`，交给 SPA 路由处理

## 首次准备

如果本地还没有发布镜像仓库，先执行：

```powershell
git clone https://github.com/linxixiaoxin/MindLearning.git E:\Cache\Repos\MindLearning
```

然后确认这几个路径都存在：

- `E:\RedBook\04_operations\07_skill_lib\book-kb-multi`
- `E:\Cache\Repos\MindLearning`
- `E:\Cache\Repos\MindLearning\.git`

## 日常发布

每次发布按这个顺序走：

1. 在 `RedBook` 里完成多书站改动
2. 本地构建校验
3. 同步到本地发布镜像
4. 在发布镜像仓库里提交并推送
5. 等 Netlify 自动部署

## 本地构建校验

```powershell
Set-Location E:\RedBook\04_operations\07_skill_lib\book-kb-multi\web
npm run build
```

重点检查这些产物：

- `web/dist/index.html`
- `web/dist/_redirects`
- `web/dist/registry/books.json`
- `web/dist/books/mindset-traps/site.json`
- `web/dist/books/leadership-evolution/site.json`

## 同步到发布镜像

推荐直接跑脚本：

```powershell
Set-Location E:\RedBook\04_operations\07_skill_lib\book-kb-multi
powershell -ExecutionPolicy Bypass -File .\scripts\sync_publish_repo.ps1
```

脚本会做这些事：

- 确保发布镜像仓库存在
- 清理发布镜像里除 `.git` 外的旧内容
- 把当前 `book-kb-multi` 同步过去
- 排除 `web/node_modules`、`web/dist`、日志和临时文件
- 最后输出发布镜像仓库的 `git status`

## 推送到 GitHub

同步完成后，在发布镜像仓库执行：

```powershell
Set-Location E:\Cache\Repos\MindLearning
git status -sb
git add .
git commit -m "你的提交说明"
git push origin main
```

如果只是想快速发布当天改动，常用流程就是：

```powershell
Set-Location E:\RedBook\04_operations\07_skill_lib\book-kb-multi
powershell -ExecutionPolicy Bypass -File .\scripts\sync_publish_repo.ps1

Set-Location E:\Cache\Repos\MindLearning
git status -sb
git add .
git commit -m "Update multi-book site"
git push origin main
```

## Netlify 后台要确认的值

如果线上出现 404，先检查 Netlify UI 里的这三个值没有覆盖仓库配置：

- Base directory：`web`
- Build command：`npm run build`
- Publish directory：`dist`

## 404 排查清单

### 根域名直接是 Netlify 404

最常见原因：

- 没从 `web/` 构建
- 发布目录不是 `dist`
- 仓库根目录没有 `netlify.toml`

优先检查：

- Netlify 的 Base directory
- Netlify 的 Publish directory
- GitHub 仓库根目录是否已有 `netlify.toml`

### 首页能开，但刷新详情页 404

最常见原因：

- 缺少 SPA 回退规则

优先检查：

- `web/public/_redirects` 是否存在
- `web/dist/_redirects` 是否存在
- `netlify.toml` 是否包含 `/* -> /index.html 200`

### 页面能开，但图片或 JSON 404

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

### 不要直接从大仓库发布

`RedBook` 是内容生产仓库，不是理想的部署仓库。

里面有很多：

- 未提交内容
- 试验文件
- 临时资产
- 并行任务

如果直接拿它接部署，很容易把无关内容一起带上去。

### 发布仓库只保留可上线最小集合

这次发布时，真正需要的只有：

- `README.md`
- `DEPLOY.md`
- `.gitignore`
- `netlify.toml`
- `configs/`
- `scripts/`
- `web/`

不应该带上的内容：

- `web/node_modules`
- `web/dist`
- 本地日志
- 其他书、其他脚本、其他未准备上线的资产

### 本地发布镜像必须固定路径

这是这次最该记住的经验。

如果发布镜像放在临时目录里：

- 其他窗口不知道去哪里继续推
- 文档没法写死
- 自动化脚本也没法稳定复用

所以现在统一固定为：

- `E:\Cache\Repos\MindLearning`

## 后续建议

如果后面准备频繁发布，建议再补两步自动化：

1. 做正式构建脚本
2. 做一键同步加发布脚本

当前已经先落了一步：

- `scripts/sync_publish_repo.ps1`

后面最值得补的是：

- `build_registry.py`
- `build_book.py`
- `build_all.py`

## 当前状态

当前 `MindLearning` 已包含：

- 多书站前端
- 两本书的数据包
- `netlify.toml`
- 部署清单

如果 Netlify 已连接这个仓库，部署设置又没有被 UI 覆盖，就可以正常上线。
