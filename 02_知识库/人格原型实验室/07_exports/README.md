# Exports

这里保存从产品知识库导出的前端运行数据。

推荐导出目标：

```text
E:/RedBook/04_operations/04_products_and_experiments/book-kb-multi/web/public/archetype-kb/index.json
```

后续可以写脚本：

```text
scripts/export-archetype-kb.mjs
```

导出时应过滤：

- `privacy_level = private_sensitive` 的真实用户材料；
- 版权状态为 `restricted` 或 `unknown` 且仅限内部研究的原文证据；
- 未通过 review 的专家敏感判断。
