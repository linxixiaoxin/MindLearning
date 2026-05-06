# 人格原型实验室知识库

这个目录用于沉淀“人格原型实验室”的产品级结构化知识库。

它不直接替代 `01_sources/01_books/`。原始书籍、小说、课程和材料仍然放在 `01_sources`；本目录只保存经过抽取、标注、授权分级和产品化整理后的结构化对象。

## 推荐目录结构

```text
02_知识库/人格原型实验室/
├─ 00_registry/
│  └─ source_works.json
├─ 01_source_texts/
│  └─ README.md
├─ 02_archetype_kernels/
│  └─ community-story.json
├─ 03_virtual_persons/
│  └─ creator-lin.json
├─ 04_life_scenes/
│  └─ family-chat.json
├─ 05_rule_sets/
│  └─ public-judgement.json
├─ 06_roundtable_sessions/
│  └─ README.md
├─ 07_exports/
│  └─ README.md
└─ schemas/
   ├─ source_work.schema.json
   ├─ archetype_kernel.schema.json
   ├─ virtual_person.schema.json
   └─ rule_set.schema.json
```

## 数据分层

1. `SourceWork`：源作品，可以是书、小说、剧本、游戏规则、论文、访谈。
2. `ArchetypeKernel`：从源作品中抽出的文学/人格/命运结构。
3. `VirtualPerson`：可进入圆桌和人生沙盘的虚拟人生模型。
4. `LifeScene`：现代处境，如家庭群、婚恋冲突、内容数据焦虑。
5. `RuleSet`：互动规则，如公开评价、资源有限、信息不对称。
6. `RoundtableSession`：一次圆桌推演记录。
7. `OutputArtifact`：小红书图文、文学号选题、短剧、游戏样张等。

## 和前端的关系

前端不直接读取这个目录。后续用脚本把这里的结构化对象导出到：

```text
web/public/archetype-kb/index.json
```

然后：

- `/tools/archetype-lab` 读取 `ArchetypeKernel + LifeScene + RuleSet`；
- `/tools/roundtable` 读取 `VirtualPerson + ProblemCase + EvidenceRefs`；
- `/tools/content-ops` 读取 `RoundtableSession + OutputArtifact`。

## 版权和隐私原则

- 公版文学原型可以进入公开展示。
- 版权状态不清楚的作品只做内部研究，不输出长引文。
- 真实用户材料默认不进入公开知识库。
- 心理敏感字段必须标注 `privacy_level`。
- 每个模型都应保留 `evidence_refs` 和 `review_status`。
