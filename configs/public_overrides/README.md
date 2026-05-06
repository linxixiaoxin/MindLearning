# public_overrides 使用说明

> 创建时间：2026-05-03  
> 关联决策：`../03_产品项目文档/06_决策复盘/50_关键决策记录_ADR.md` 的 ADR-007

这个目录只存放少量人工精选覆盖稿，不存放整本书的第二套公开内容。

默认规则：

```text
01_sources/01_books/**        -> 本地源资产
configs/books/*.book.json     -> 单书事实源
scripts/build_public_book.mjs -> 生成 public_structured_nk
configs/public_overrides/**   -> 少量精选卡覆盖默认生成稿
web/public/books/**           -> 生成产物
```

建议结构：

```text
configs/public_overrides/
└─ <slug>/
   └─ <nodeId>.md
```

使用原则：

1. 只有首页推荐、问题工作台证据、学习路径关键节点和外部传播入口需要放 override。
2. 每本书先控制在 3-10 张精选卡，不追求全量文章化。
3. override 文件的 `nodeId` 必须对应生成后的 `file-map.json`。
4. 构建脚本读取 override 时，只替换正文，不改变图谱节点和边，除非显式声明。
5. 不要把原始 vault、清洗日志、质检过程或内部提示词复制到这里。

刷新方式：

```bash
cd web
npm run build:ready-books:refresh
```

如果只改了某一本书，可以在项目根目录执行：

```bash
node scripts/build_public_book.mjs --manifest=configs/expansion/ready_structured_books_manifest.json --public-manifest=web/public/registry/ready_structured_books_manifest.json --book=<slug>
```

DEV-038 后，首批 override 先落在 9 本书的 `公开入口.md`；后续继续小批量推进，不把这里扩成第二套完整书库。
