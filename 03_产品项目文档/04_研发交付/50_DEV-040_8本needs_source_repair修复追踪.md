# DEV-040：8 本 needs_source_repair 回源修复追踪

> 创建日期：2026-05-05  
> 来源：DEV-038 抽样验收（[49_142本基础公开层抽样验收](./49_142本基础公开层抽样验收与首批override_2026-05-03.md)）  
> 目标：修复 8 本标记 `needs_source_repair` 的书的结构化知识.json，使 `publication.publicSanity.blockerCount` 回到 0

## 8 本书清单

| # | bookId | 书名 | 节点数 | 问题 | 修复方式 | 状态 |
|---|---|---|---|---|---|---|
| 1 | `book-073de824c7` | 创伤与记忆 | 27 | 源资产混入书单污染 | 递归清理 25 处书单污染 → 0 | ✅ done |
| 2 | `book-f4f4d5b183` | 复杂心智 | 40 | OCR 污染 | 清理 OCR 噪声 `丬代 i 自 L 能 h` → `陈颖坚` | ✅ done |
| 3 | `book-c7bed1c989` | 商业模式新生代（个人） | 44 | 混入投资概念 | 无残留（已在公开层过滤） | ✅ done |
| 4 | `book-2d95038e61` | 全球商學院必修決策思維術 | 40 | 外文残片 `Erfolgsmodelle` | 清理 11 处 | ✅ done |
| 5 | `book-9cc3e112cd` | 质性研究访谈 | 37 | OCR 噪声 | 清理 `口 0 / 下口` | ✅ done |
| 6 | `book-e04989128c` | 爆款文案写作指南 | 40 | 图书分类号 | 清理 `F713` 等分类号 | ✅ done |
| 7 | `book-25ea5787fc` | 十四堂人生创意课Ⅱ | 27 | 书单污染 | 递归清理 25 处 → 0 | ✅ done |
| 8 | `book-8a65fd4d02` | 沧浪之水 | 38 | 书单污染 | 递归清理 11 处 → 0 | ✅ done |

## 修复流程

每本书：
1. 打开 `assets/结构化知识.json`
2. 对照问题类型定位污染节点
3. 删除/修复污染内容
4. 重新跑 `npm run build:ready-books:refresh`
5. 确认 `publicSanity.blockerCount` 归零

## 修复后验证

- 8 本书全部修复后，`npm run build` 通过
- 公开面卫生：`blockerCount: 0`
- 中控台状态从 `needs_source_repair` 更新为 `partially_curated` 或 `curated`

## 关联任务

- DEV-038（已完成）：142 本基础公开层抽样验收
- DEV-040（本任务）：8 本回源修复
- DEV-041（后续）：第二批高价值节点 override
