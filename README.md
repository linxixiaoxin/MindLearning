# 多书知识站架构草案

## 相关文档

- [持续推进记录](./00_持续推进记录.md)
- [网站战略与路线图](./01_网站战略与路线图.md)
- [思想伙伴选配器产品立项与开发记录](./02_思想伙伴选配器产品立项与开发记录.md)
- [产品项目文档中心](./03_产品项目文档/README.md)

这份草案服务一个明确目标：

- 先用《走出心智的误区》与《领导者的意识进化》启动多书站
- 后续持续加书时，不再复制整套 `book-kb-*` 单书目录
- 保留每本书的个性化表达，但把共用前端、共用生成流程、共用注册表抽出来

## 当前判断

基于现有仓库，最适合的不是“一开始就做跨 100 本书的大一统图谱”，而是：

- 先做 `多书门户 + 单书子站`
- 继续保留每本书的独立站点感受
- 让多书站成为统一入口、统一路由、统一搜索外壳
- 让单书页继续承接每本书自己的章节地图、概念图谱和内容风格

这样做的原因很直接：

- 当前两本书前端骨架已经高度相似，重复最多的是数据生成层
- 两本书虽然 schema 接近，但内容组织规则并不完全一样，强行彻底统一会拖慢上线
- 你的仓库已经有 `06_index` 这套全局索引，很适合升级成多书注册表

## 推荐架构

整个系统拆成 4 层。

### 1. 内容源层

继续沿用现有仓库，不动核心资产位置：

- `01_sources/01_books/.../assets`
- `02_collections/...`
- `03_outputs/04_by_book/...`
- `06_index/...`

这一层仍然是事实来源，不把书的真实资产搬到站点目录里。

### 2. 注册表层

新增一个统一注册表，负责告诉前端“有哪些书、每本书的 slug 是什么、是否可上线、入口图和状态是什么”。

推荐注册表输出：

- `web/public/registry/books.json`

注册表建议由以下信息生成：

- `06_index/book_category_map.csv`
- `06_index/book_asset_status.csv`
- `06_index/content_status.csv`
- `configs/books/*.book.json`

这里的原则是：

- 全局状态来自 `06_index`
- 单书展示差异来自 `book config`
- 不在多个地方重复维护书名、分类、入口文案

### 3. 生成层

生成层不再是“每本书一份 `generate_site.py`”，而是：

- 一个通用构建入口
- 若干构建 profile
- 每本书一份配置文件

推荐脚本：

- `scripts/build_registry.py`
- `scripts/build_book.py --book <slug>`
- `scripts/build_all.py`

推荐 profile 设计：

- `mindset_traps_v1`
- `leadership_growth_v1`
- 后续再加 `generic_book_v1`

profile 的作用不是保存书的数据，而是保存“这类书怎么组装页面”的规则。

### 4. 展示层

只保留一个前端应用，不再保留两套 `web/`。

推荐路由：

- `/books`
- `/books/:slug`
- `/books/:slug/graph`
- `/books/:slug/note/:nodeId`

前端不再直接 import 固定的 `graphData.js`，而是按路由动态加载：

- `/registry/books.json`
- `/books/<slug>/site.json`
- `/books/<slug>/graph.json`
- `/books/<slug>/file-map.json`

## 推荐目录

```text
04_operations/04_products_and_experiments/book-kb-multi/
├── README.md
├── configs/
│   └── books/
│       ├── _template.book.json
│       ├── mindset-traps.book.json
│       └── leadership-evolution.book.json
├── scripts/
│   ├── build_registry.py
│   ├── build_book.py
│   └── build_all.py
└── web/
    ├── src/
    └── public/
        ├── registry/
        │   └── books.json
        └── books/
            ├── mindset-traps/
            │   ├── site.json
            │   ├── graph.json
            │   ├── file-map.json
            │   ├── home-sections.json
            │   ├── toc.json
            │   ├── vault/
            │   └── images/
            └── leadership-evolution/
                ├── site.json
                ├── graph.json
                ├── file-map.json
                ├── home-sections.json
                ├── toc.json
                ├── vault/
                └── images/
```

## 生成产物约定

每本书建议输出这些文件。

### `site.json`

站点级信息：

- 标题、副标题、描述
- hero 文案
- 推荐阅读路径
- 快捷入口
- follow 区块
- 统计数字

### `graph.json`

图谱数据：

- `nodes`
- `links`
- `linkLabels`
- `nodeTypeMeta`
- `nodeImages`

### `file-map.json`

节点与 markdown 文件映射：

- `nodeId -> /books/<slug>/vault/...`

### `toc.json`

目录侧栏数据：

- 模块
- 分组
- 节点顺序

### `home-sections.json`

首页分区卡片：

- section id
- 标题、副标题、描述
- 节点列表

### `vault/`

最终给阅读器消费的 markdown 文件。

### `images/`

本书自己的章节缩略图、场景图、主题图、二维码等公开资源。

## `book config` 字段设计

配置文件建议只描述“差异”，不描述可以从资产推导出的重复信息。

推荐分成 6 组字段。

### 1. `book`

这本书是谁。

- `slug`
- `title`
- `shortTitle`
- `author`
- `primaryCategory`
- `secondaryCategory`
- `status`

### 2. `source`

这本书从哪里取数据。

- `assetsDir`
- `structuredJson`
- `summaryMarkdown`
- `topicAnglesMarkdown`
- `visualHooksMarkdown`
- `bookOutputDir`
- `xhsImageDir`
- `infographicsDir`
- `scenesDir`

### 3. `builder`

这本书用哪种构建规则。

- `profile`
- `entryNode`
- `supportsCrossBookTopic`
- `hiddenNodes`
- `pinnedNodes`

### 4. `site`

页面对外展示风格。

- `subtitle`
- `description`
- `heroOverline`
- `heroTitleLines`
- `searchPlaceholder`
- `footerNote`
- `creatorName`
- `creatorLabel`

### 5. `homepage`

首页怎么排。

- `recommendedPath`
- `quickLinks`
- `journeyTitle`
- `journeyDescription`
- `sectionOrder`

### 6. `images`

图片映射规则。

- `overviewImage`
- `chapterImageMode`
- `chapterImageOrder`
- `topicImageMap`
- `fallbackImage`

## 为什么不要第一版就做跨书概念合并

第一版不要把“复杂性”“成人发展”“认知偏误”这类词强行合成一个超级节点。

原因有 3 个：

- 同名概念在不同书里的定义边界不完全一样
- 一旦先做跨书合并，调试成本会立刻升高
- 你现在最缺的是可持续扩书能力，不是概念本体论

第一版更合理的做法：

- 先保证每本书内部图谱完整
- 多书站只做“书级导航”和“书级搜索”
- 第二版再加“跨书专题页”

## 数据流

```text
01_sources / 02_collections / 03_outputs / 06_index
                ↓
        configs/books/*.book.json
                ↓
        build_registry.py
                ↓
    web/public/registry/books.json

01_sources / 02_collections / 03_outputs
                ↓
        build_book.py --book <slug>
                ↓
  web/public/books/<slug>/{site,graph,file-map,toc,home-sections}.json
                ↓
        web 前端按路由动态加载
```

## 针对这两本书的落地建议

### 《走出心智的误区》

建议定位：

- 作为第一本“认知偏误/复杂判断类”模板书
- profile 用 `mindset_traps_v1`
- 首页更强调“误区链 + 场景入口 + N 卡主干”

### 《领导者的意识进化》

建议定位：

- 作为第一本“成人发展/领导成长类”模板书
- profile 用 `leadership_growth_v1`
- 首页更强调“成长路径 + 章节升级地图 + 工作现场应用”

## 分阶段实施

### Phase 1

先搭多书门户，不动单书站线上版本。

- 抽出共用前端
- 改成动态加载 JSON
- 先接两本书

交付结果：

- `/books` 可以看到两本书入口
- 可以进入每本书的阅读地图与图谱

### Phase 2

把单书 `generate_site.py` 改造成配置驱动构建。

- 提炼共用 builder
- 两本书只保留 profile 差异
- 输出统一产物格式

交付结果：

- 新增一本书只需要复制 config，不需要复制整套站

### Phase 3

补跨书能力。

- 多书搜索
- 同主题聚合页
- 跨书专题推荐页

交付结果：

- 多书站从“门户”升级成“书库”

## 实施原则

- 单书体验优先，不为跨书统一牺牲单书阅读感
- 单一事实源优先，书名和分类不要到处重复维护
- 配置驱动优先，新增书时尽量不改前端代码
- profile 优先，不同类型的书先按模板族群抽象
- 渐进式统一优先，先统一产物格式，再统一生成逻辑

## 下一步建议

如果按这份草案继续往前走，最合适的顺序是：

1. 先创建 `book-kb-multi/web`，把现有共用前端搬一份出来
2. 把 `graphData.js` 改成按 `slug` 读取 `public/books/<slug>` 下的 JSON
3. 先手工生成两本书的 JSON 产物，验证多书路由
4. 最后再回头抽象 `build_book.py`

这一步做完，你就从“两个单书 demo”切到了“可持续扩书的平台骨架”。
