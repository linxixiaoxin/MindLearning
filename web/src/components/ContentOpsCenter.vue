<template>
  <div class="content-ops-wrap">
    <div class="content-ops-scroll">
      <section class="ops-shell">
        <header class="ops-header">
          <div class="title-block">
            <div class="ops-kicker">CONTENT OPS · DAILY / DATA / ARCHIVE</div>
            <h1>内容运营驾驶舱</h1>
            <p>
              先看今天要推进什么、最近排期怎么走、数据给了什么信号。
              长期路线、资料索引和路径雷达下沉到低频区，避免日常打开时被信息压住。
            </p>
          </div>
          <div class="header-actions">
            <button class="ghost-btn" :disabled="isRefreshing" @click="refreshWorkspaceData">
              {{ isRefreshing ? '刷新中' : '刷新数据' }}
            </button>
            <span class="refresh-note">{{ lastRefreshLabel }}</span>
            <button class="primary-btn" @click="activeMode = 'topics'">今日运营</button>
            <button class="ghost-btn" @click="activeMode = 'data'">内容数据</button>
            <button class="ghost-btn" @click="activeMode = 'workspace'">资料与低频</button>
          </div>
        </header>

        <section class="top-metrics" aria-label="工作台总览">
          <article class="metric-card">
            <span>推进中的工作流</span>
            <strong>{{ workspaceTracks.length }}</strong>
            <small>网页项目 · 原型探索 · 内容数据 · 发布门禁</small>
          </article>
          <article class="metric-card">
            <span>待办事项</span>
            <strong>{{ todoSummary.total }}</strong>
            <small>{{ todoSummary.today }} 今日 · {{ todoSummary.next }} 下一步 · {{ todoSummary.blocked }} 阻塞</small>
          </article>
          <article class="metric-card">
            <span>今日推进</span>
            <strong>{{ todayOpsTasks.length }}</strong>
            <small>{{ todayPrimaryTask?.title }}</small>
          </article>
          <article class="metric-card">
            <span>选题排期</span>
            <strong>{{ calendarSummary.total }}</strong>
            <small>{{ calendarSummary.today }} 今日 · {{ calendarSummary.next }} 下一步 · {{ calendarSummary.draft }} 草稿</small>
          </article>
          <article class="metric-card">
            <span>名著系列</span>
            <strong>{{ literarySeriesSummary.total }}</strong>
            <small>{{ literarySeriesSummary.completed }} 已成样张 · 下一篇 {{ nextLiteraryTopic?.title }}</small>
          </article>
          <article class="metric-card">
            <span>圆桌回流</span>
            <strong>{{ visibleRoundtableArtifacts.length }}</strong>
            <small>{{ kbRoundtableArtifacts.length }} 条 KB · {{ roundtableArtifacts.length }} 条本地</small>
          </article>
        </section>

        <section v-if="xhsWeeklyData.hasData" class="weekly-analytics" aria-label="小红书周报分析">
          <div class="panel-head">
            <div>
              <div class="ops-kicker">WEEKLY XHS REPORT</div>
              <h2>{{ xhsWeeklyData.week }} 小红书周报</h2>
            </div>
            <div class="weekly-meta-pills">
              <span class="count-pill">{{ xhsWeeklyData.snapshot.itemCount }} 篇笔记</span>
              <span v-if="xhsWeeklyGeneratedLabel" class="count-pill subtle">{{ xhsWeeklyGeneratedLabel }}</span>
            </div>
          </div>

          <div class="weekly-summary-strip">
            <article class="weekly-summary-card">
              <span>总曝光</span>
              <strong>{{ formatNumber(xhsWeeklyData.snapshot.exposure) }}</strong>
            </article>
            <article class="weekly-summary-card">
              <span>打开率</span>
              <strong>{{ formatPercent(xhsWeeklyData.snapshot.openRate) }}</strong>
            </article>
            <article class="weekly-summary-card">
              <span>总互动</span>
              <strong>{{ formatNumber(xhsWeeklyData.snapshot.likes + xhsWeeklyData.snapshot.comments + xhsWeeklyData.snapshot.saves + xhsWeeklyData.snapshot.shares) }}</strong>
            </article>
            <article class="weekly-summary-card">
              <span>总涨粉</span>
              <strong>{{ formatNumber(xhsWeeklyData.snapshot.follows) }}</strong>
            </article>
            <article class="weekly-summary-card">
              <span>打开率中位</span>
              <strong>{{ formatPercent(xhsWeeklyData.medians.openRate) }}</strong>
            </article>
            <article class="weekly-summary-card">
              <span>收藏率中位</span>
              <strong>{{ formatPercent(xhsWeeklyData.medians.collectRate) }}</strong>
            </article>
          </div>

          <div class="weekly-table-grid">
            <div class="weekly-table-panel">
              <div class="weekly-table-title">曝光最高</div>
              <div class="weekly-mini-table">
                <div v-for="(row, i) in xhsWeeklyData.topByExposure.slice(0, 5)" :key="'e'+i" class="weekly-table-row">
                  <span class="wtr-title">{{ row.title }}</span>
                  <span class="wtr-metric">{{ formatNumber(row.impressions) }}</span>
                  <span class="wtr-rate">{{ formatPercent(row.openRate) }}</span>
                  <span v-if="row.actionHint !== '继续观察'" class="wtr-hint">{{ row.actionHint }}</span>
                </div>
              </div>
            </div>
            <div class="weekly-table-panel">
              <div class="weekly-table-title">最值得复做</div>
              <div class="weekly-mini-table">
                <div v-for="(row, i) in xhsWeeklyData.topByCollectRate.slice(0, 5)" :key="'c'+i" class="weekly-table-row">
                  <span class="wtr-title">{{ row.title }}</span>
                  <span class="wtr-metric">{{ formatPercent(row.collectRate) }}</span>
                  <span class="wtr-rate">{{ formatNumber(row.impressions) }}</span>
                  <span v-if="row.actionHint !== '继续观察'" class="wtr-hint">{{ row.actionHint }}</span>
                </div>
              </div>
            </div>
            <div class="weekly-table-panel">
              <div class="weekly-table-title">涨粉最好</div>
              <div class="weekly-mini-table">
                <div v-for="(row, i) in xhsWeeklyData.topByFollowers.slice(0, 5)" :key="'f'+i" class="weekly-table-row">
                  <span class="wtr-title">{{ row.title }}</span>
                  <span class="wtr-metric">{{ formatNumber(row.newFollowers) }}粉</span>
                  <span class="wtr-rate">{{ formatPercent(row.collectRate) }}</span>
                  <span v-if="row.actionHint !== '继续观察'" class="wtr-hint">{{ row.actionHint }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="xhsWeeklyData.recommendations.length" class="weekly-recs">
            <div class="weekly-recs-title">自动建议</div>
            <ul>
              <li v-for="(rec, i) in xhsWeeklyData.recommendations" :key="i">{{ rec }}</li>
            </ul>
          </div>
        </section>

        <section class="daily-command-section" aria-label="日常常看区">
          <div class="section-head">
            <div>
              <div class="ops-kicker">DAILY COMMAND</div>
              <h2>每天先看这里</h2>
            </div>
            <p>把高频判断收在首屏：今天动手项、近 7 日排期、平台数据和圆桌回流。低频资料放到后面的“资料与低频”。</p>
          </div>

          <div class="daily-command-grid">
            <article class="daily-command-card focus-card">
              <div class="panel-head compact">
                <div>
                  <div class="ops-kicker">TODAY</div>
                  <h3>今天看这几件事</h3>
                </div>
                <span class="count-pill">{{ todayOpsTasks.length }} 条</span>
              </div>
              <div class="daily-list">
                <article v-for="task in todayOpsTasks.slice(0, 4)" :key="`daily-${task.id}`" class="daily-row">
                  <div>
                    <span :class="['task-status', task.status]">{{ taskStatusLabel(task.status) }}</span>
                    <small>{{ task.lane }}</small>
                  </div>
                  <strong>{{ task.title }}</strong>
                  <p>{{ task.detail }}</p>
                </article>
              </div>
            </article>

            <article class="daily-command-card">
              <div class="panel-head compact">
                <div>
                  <div class="ops-kicker">CALENDAR</div>
                  <h3>近 7 日排期</h3>
                </div>
                <span class="count-pill">{{ calendarSummary.total }} 项</span>
              </div>
              <div class="daily-calendar-list">
                <article v-for="item in opsCalendar.slice(0, 5)" :key="`daily-${item.date}-${item.topic}`" class="compact-calendar-row">
                  <time>{{ item.date.slice(5) }}</time>
                  <div>
                    <strong>{{ item.topic }}</strong>
                    <small>{{ item.channel }} · {{ item.task }}</small>
                  </div>
                  <span :class="['calendar-status', item.status]">{{ calendarStatusLabel(item.status) }}</span>
                </article>
              </div>
            </article>

            <article class="daily-command-card">
              <div class="panel-head compact">
                <div>
                  <div class="ops-kicker">DATA SIGNAL</div>
                  <h3>平台快照</h3>
                </div>
                <button class="text-btn" @click="activeMode = 'data'">看明细</button>
              </div>
              <div class="mini-snapshot-list">
                <article v-for="snapshot in channelSnapshots" :key="`mini-${snapshot.id}`" class="mini-snapshot-row">
                  <div>
                    <span>{{ snapshot.label }}</span>
                    <strong>{{ snapshot.date }}</strong>
                  </div>
                  <div class="mini-snapshot-metrics">
                    <span>{{ snapshot.id === 'wechat' ? '阅读' : '观看' }} {{ formatNumber(snapshot.views) }}</span>
                    <span>收藏 {{ formatPercent(snapshot.saveRate) }}</span>
                    <span>涨粉 {{ formatPercent(snapshot.followRate) }}</span>
                  </div>
                  <p>{{ snapshot.insight }}</p>
                </article>
              </div>
            </article>

            <article class="daily-command-card">
              <div class="panel-head compact">
                <div>
                  <div class="ops-kicker">RETURN POOL</div>
                  <h3>圆桌回流池</h3>
                </div>
                <span class="count-pill">{{ visibleRoundtableArtifacts.length }} 条</span>
              </div>
              <div v-if="visibleRoundtableArtifacts.length" class="compact-return-list">
                <article v-for="artifact in visibleRoundtableArtifacts.slice(0, 3)" :key="`daily-${artifact.id}`" class="compact-return-row">
                  <span>{{ artifact.type }}</span>
                  <strong>{{ artifact.title }}</strong>
                  <p>{{ artifact.useFor }}</p>
                </article>
              </div>
              <div v-else class="empty-state compact-empty">
                暂无新回流。跑完圆桌后这里会自动承接内容素材。
              </div>
            </article>
          </div>
        </section>

        <nav class="mode-tabs" aria-label="工作台视图">
          <button
            v-for="mode in viewModes"
            :key="mode.id"
            :class="{ active: activeMode === mode.id }"
            @click="activeMode = mode.id"
          >
            <strong>{{ mode.label }}</strong>
            <span>{{ mode.description }}</span>
          </button>
        </nav>

        <section class="ops-overview-grid" aria-label="全局推进视野">
          <article class="overview-card">
            <div class="panel-head compact">
              <div>
                <div class="ops-kicker">GLOBAL VIEW</div>
                <h3>全局推进看板</h3>
              </div>
              <span class="count-pill">{{ globalOverviewCards.length }} 项</span>
            </div>
            <div class="overview-stat-grid">
              <article v-for="card in globalOverviewCards" :key="card.id" class="overview-stat">
                <span>{{ card.label }}</span>
                <strong>{{ card.value }}</strong>
                <small>{{ card.detail }}</small>
              </article>
            </div>
          </article>

          <article class="overview-card">
            <div class="panel-head compact">
              <div>
                <div class="ops-kicker">TODO PROGRESS</div>
                <h3>待办推进程度</h3>
              </div>
              <span class="count-pill">{{ todoSummary.total }} 条</span>
            </div>
            <div class="progress-list">
              <article v-for="row in taskProgressRows" :key="row.id" class="progress-row">
                <div>
                  <strong>{{ row.label }}</strong>
                  <small>{{ row.detail }}</small>
                </div>
                <span>{{ row.count }}</span>
                <i><em :style="{ width: `${row.percent}%` }"></em></i>
              </article>
            </div>
          </article>
        </section>

        <template v-if="activeMode === 'data'">
          <section class="snapshot-strip" aria-label="平台数据快照">
            <article v-for="snapshot in channelSnapshots" :key="snapshot.id" class="snapshot-panel">
              <div class="snapshot-head">
                <div>
                  <span>{{ snapshot.label }}</span>
                  <strong>{{ snapshot.date }}</strong>
                </div>
                <small>{{ snapshot.source }}</small>
              </div>
              <div class="snapshot-metrics">
                <div>
                  <span>{{ snapshot.id === 'wechat' ? '阅读' : '观看' }}</span>
                  <strong>{{ formatNumber(snapshot.views) }}</strong>
                </div>
                <div>
                  <span>收藏率</span>
                  <strong>{{ formatPercent(snapshot.saveRate) }}</strong>
                </div>
                <div>
                  <span>涨粉率</span>
                  <strong>{{ formatPercent(snapshot.followRate) }}</strong>
                </div>
                <div>
                  <span>分享率</span>
                  <strong>{{ formatPercent(snapshot.shareRate) }}</strong>
                </div>
              </div>
              <p>{{ snapshot.insight }}</p>
            </article>
          </section>

          <section class="control-panel">
            <label class="search-field">
              <span>搜索已发内容、系列或复盘判断</span>
              <input
                v-model.trim="searchQuery"
                type="search"
                placeholder="例如：沟通、事实、团队、高敏感、AI"
              >
            </label>

            <div class="filter-block">
              <span>平台</span>
              <div class="segmented-control" aria-label="平台筛选">
                <button
                  v-for="channel in channelFilters"
                  :key="channel.id"
                  :class="{ active: selectedChannel === channel.id }"
                  @click="selectedChannel = channel.id"
                >
                  {{ channel.label }}
                </button>
              </div>
            </div>

            <div class="filter-block">
              <span>排序</span>
              <div class="segmented-control" aria-label="排序方式">
                <button
                  v-for="option in sortOptions"
                  :key="option.id"
                  :class="{ active: sortMode === option.id }"
                  @click="sortMode = option.id"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
          </section>

          <nav class="category-strip" aria-label="内容分类">
            <button
              v-for="category in contentCategories"
              :key="category.id"
              :class="{ active: selectedCategory === category.id }"
              @click="selectedCategory = category.id"
            >
              <span>{{ category.label }}</span>
              <strong>{{ categoryCounts[category.id] || 0 }}</strong>
            </button>
          </nav>

          <section class="data-workspace">
            <main class="published-panel">
              <div class="panel-head">
                <div>
                  <div class="ops-kicker">PUBLISHED LIBRARY</div>
                  <h2>已发布内容库</h2>
                </div>
                <span class="count-pill">{{ filteredItems.length }} 条</span>
              </div>

              <div class="content-list" aria-label="已发布内容列表">
                <button
                  v-for="item in filteredItems"
                  :key="item.id"
                  class="content-row"
                  :class="{ active: selectedItemId === item.id }"
                  @click="selectedItemId = item.id"
                >
                  <span class="channel-pill" :class="item.channel">{{ channelLabel(item.channel) }}</span>
                  <div class="row-title">
                    <strong>{{ item.title }}</strong>
                    <small>
                      {{ item.publishedAt }} · {{ getCategoryMeta(item.category).label }} · {{ item.series }}
                    </small>
                  </div>
                  <div class="row-metric">
                    <span>{{ item.channel === 'wechat' ? '阅读' : '观看' }}</span>
                    <strong>{{ formatNumber(primaryViews(item)) }}</strong>
                  </div>
                  <div class="row-metric">
                    <span>收藏</span>
                    <strong>{{ formatNumber(item.metrics.saves || 0) }}</strong>
                  </div>
                  <div class="row-metric">
                    <span>涨粉</span>
                    <strong>{{ formatNumber(item.metrics.follows || 0) }}</strong>
                  </div>
                  <span class="signal-badge" :class="performanceLevel(item).tone">
                    {{ performanceLevel(item).label }}
                  </span>
                </button>

                <div v-if="!filteredItems.length" class="empty-state">
                  没有找到匹配内容。可以换一个关键词，或切回“全部”分类。
                </div>
              </div>
            </main>

            <aside class="detail-stack">
              <article v-if="selectedItem" class="detail-panel">
                <div class="panel-head">
                  <div>
                    <div class="ops-kicker">SELECTED CONTENT</div>
                    <h2>{{ selectedItem.title }}</h2>
                  </div>
                  <span class="channel-pill" :class="selectedItem.channel">
                    {{ channelLabel(selectedItem.channel) }}
                  </span>
                </div>

                <div class="detail-meta">
                  <span>{{ selectedItem.publishedAt }}</span>
                  <span>{{ getCategoryMeta(selectedItem.category).label }}</span>
                  <span>{{ selectedItem.format }}</span>
                </div>

                <div class="detail-metrics">
                  <article>
                    <span>{{ selectedItem.channel === 'wechat' ? '阅读' : '观看' }}</span>
                    <strong>{{ formatNumber(primaryViews(selectedItem)) }}</strong>
                  </article>
                  <article>
                    <span>收藏率</span>
                    <strong>{{ formatPercent(metricRate(selectedItem, 'saveRate')) }}</strong>
                  </article>
                  <article>
                    <span>涨粉率</span>
                    <strong>{{ formatPercent(metricRate(selectedItem, 'followRate')) }}</strong>
                  </article>
                  <article>
                    <span>分享率</span>
                    <strong>{{ formatPercent(metricRate(selectedItem, 'shareRate')) }}</strong>
                  </article>
                </div>

                <div class="decision-box">
                  <span>复用判断</span>
                  <p>{{ selectedItem.decision }}</p>
                </div>

                <div v-if="relatedCluster" class="next-bridge">
                  <span>后续连接</span>
                  <strong>{{ relatedCluster.label }}</strong>
                  <p>{{ relatedCluster.signal }}</p>
                </div>
              </article>

              <article class="insight-panel">
                <div class="panel-head compact">
                  <div>
                    <div class="ops-kicker">DATA READINGS</div>
                    <h3>近期复盘结论</h3>
                  </div>
                </div>
                <div class="insight-list">
                  <article v-for="insight in performanceInsights" :key="insight.id" class="insight-row">
                    <strong>{{ insight.title }}</strong>
                    <p>{{ insight.summary }}</p>
                    <small>{{ insight.action }}</small>
                  </article>
                </div>
              </article>
            </aside>
          </section>
        </template>

        <template v-else-if="activeMode === 'workspace'">
          <section class="workspace-section">
            <div class="section-head">
              <div>
                <div class="ops-kicker">CURRENT WORKSTREAMS</div>
                <h2>现在真正要推进的几条线</h2>
              </div>
              <p>这是低频区里仍然需要定期扫一眼的项目总览：网页项目、原型探索、数据闭环和发布门禁。</p>
            </div>

            <div class="track-grid">
              <article v-for="track in workspaceTracks" :key="track.id" class="track-card">
                <div class="track-top">
                  <span class="lane-pill">{{ track.lane }}</span>
                  <span class="priority-pill">{{ track.priority }}</span>
                </div>
                <h3>{{ track.title }}</h3>
                <p>{{ track.summary }}</p>
                <div class="tag-row">
                  <span v-for="metric in track.metrics" :key="metric">{{ metric }}</span>
                </div>
                <div class="next-box">
                  <span>{{ track.status }}</span>
                  <strong>{{ track.nextAction }}</strong>
                </div>
                <div class="card-footer">
                  <button class="text-btn" @click="openWorkspaceTarget(track)">
                    {{ track.routeLabel || '打开入口' }}
                  </button>
                  <small>{{ track.sourceLabel }} · {{ track.source }}</small>
                </div>
              </article>
            </div>
          </section>

          <section class="task-resource-grid archive-grid">
            <article class="resource-board">
              <div class="panel-head compact">
                <div>
                  <div class="ops-kicker">RESOURCE INDEX</div>
                  <h3>资料在哪里</h3>
                </div>
                <span class="count-pill">{{ workspaceIndexLabel }}</span>
              </div>
              <div class="resource-list">
                <article v-for="resource in workspaceResourceEntries" :key="resource.id" class="resource-row">
                  <div class="resource-head">
                    <span>{{ resource.type }}</span>
                    <button class="text-btn" @click="openWorkspaceTarget(resource)">
                      {{ resource.routeLabel || '打开关联入口' }}
                    </button>
                  </div>
                  <strong>{{ resource.title }}</strong>
                  <p>{{ resource.summary }}</p>
                  <div v-if="resource.items?.length" class="resource-items">
                    <span v-for="entry in resource.items.slice(0, 4)" :key="`${resource.id}-${entry.title}-${entry.source}`">
                      {{ entry.title }}
                    </span>
                  </div>
                  <small>{{ resource.sourceLabel }} · {{ resource.source }}</small>
                </article>
              </div>
            </article>

            <article class="resource-board">
              <div class="panel-head compact">
                <div>
                  <div class="ops-kicker">UPDATE RADAR</div>
                  <h3>怎么知道资料更新了</h3>
                </div>
              </div>
              <div class="update-list">
                <article v-for="rhythm in workspaceUpdateRhythms" :key="rhythm.id" class="update-row">
                  <div>
                    <span>{{ rhythm.cadence }}</span>
                    <strong>{{ rhythm.title }}</strong>
                  </div>
                  <p>{{ rhythm.detail }}</p>
                  <small>{{ rhythm.signal }}</small>
                </article>
              </div>
            </article>
          </section>

          <section class="path-radar-section low-frequency-section">
            <div class="section-head">
              <div>
                <div class="ops-kicker">PATH RADAR</div>
                <h2>低频路径雷达图</h2>
              </div>
              <p>不需要每天看，但当方向散掉时用它校准：入口、回流、证据和发布之间是否还连着。</p>
            </div>

            <div class="path-radar-layout">
              <div class="path-radar-canvas" aria-label="路径雷达图示">
                <svg viewBox="0 0 420 320" role="img" aria-hidden="true">
                  <defs>
                    <linearGradient id="radarGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#204f67" stop-opacity="0.18" />
                      <stop offset="100%" stop-color="#bf6f3f" stop-opacity="0.14" />
                    </linearGradient>
                  </defs>
                  <circle cx="210" cy="160" r="118" fill="none" stroke="#204f671f" stroke-width="2" />
                  <circle cx="210" cy="160" r="86" fill="none" stroke="#204f671a" stroke-width="2" />
                  <circle cx="210" cy="160" r="54" fill="none" stroke="#204f6717" stroke-width="2" />
                  <path d="M210 42 L298 110 L282 212 L138 212 L122 110 Z" fill="url(#radarGlow)" stroke="#204f6730" stroke-width="2" />
                  <path d="M210 160 L298 110" stroke="#bf6f3f66" stroke-width="2" stroke-dasharray="6 6" />
                  <path d="M298 110 L282 212" stroke="#204f6760" stroke-width="2" stroke-dasharray="6 6" />
                  <path d="M282 212 L138 212" stroke="#204f6760" stroke-width="2" stroke-dasharray="6 6" />
                  <path d="M138 212 L122 110" stroke="#bf6f3f66" stroke-width="2" stroke-dasharray="6 6" />
                  <path d="M122 110 L210 42" stroke="#204f6760" stroke-width="2" stroke-dasharray="6 6" />
                  <circle cx="210" cy="160" r="22" fill="#fff" stroke="#204f6740" stroke-width="2" />
                  <text x="210" y="156" text-anchor="middle" class="radar-center-label">工作台</text>
                  <text x="210" y="170" text-anchor="middle" class="radar-center-sub">入口 / 回流 / 证据 / 发布</text>
                </svg>
                <div v-for="node in workspaceRadarNodes" :key="node.id" class="radar-node" :class="node.tone" :style="node.style">
                  <strong>{{ node.label }}</strong>
                  <span>{{ node.caption }}</span>
                  <small>{{ node.link }}</small>
                </div>
              </div>

              <div class="path-radar-list">
                <article v-for="node in workspaceRadarNodes" :key="`${node.id}-detail`" class="radar-detail-card">
                  <div class="radar-detail-head">
                    <span>{{ node.index }}</span>
                    <strong>{{ node.label }}</strong>
                  </div>
                  <p>{{ node.summary }}</p>
                  <small>{{ node.link }}</small>
                </article>
              </div>
            </div>
          </section>

          <section class="strategy-section low-frequency-section">
            <div class="section-head">
              <div>
                <div class="ops-kicker">STRATEGY CORE</div>
                <h2>长期方向和内核思想</h2>
              </div>
              <p>这里放不该被短期任务淹掉的东西：为什么做、往哪里走、哪些功能是同一个系统里的不同入口。</p>
            </div>

            <div class="strategy-grid">
              <article v-for="panel in workspaceStrategyPanels" :key="panel.id" class="strategy-card">
                <span>{{ panel.type }}</span>
                <h3>{{ panel.title }}</h3>
                <p>{{ panel.summary }}</p>
                <div class="tag-row">
                  <em v-for="anchor in panel.anchors" :key="anchor">{{ anchor }}</em>
                </div>
                <small>{{ panel.source }}</small>
              </article>
            </div>
          </section>

          <section class="roadmap-section low-frequency-section">
            <div class="section-head">
              <div>
                <div class="ops-kicker">LONG ROADMAP</div>
                <h2>长期计划表</h2>
              </div>
              <p>短期任务只回答今天做什么；这张表回答为什么今天值得做这件事。</p>
            </div>
            <div class="roadmap-list">
              <article v-for="item in workspaceRoadmap" :key="item.phase" class="roadmap-card">
                <div class="roadmap-time">
                  <span>{{ item.phase }}</span>
                  <small>{{ item.horizon }}</small>
                </div>
                <div>
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.goal }}</p>
                  <div class="tag-row">
                    <em v-for="deliverable in item.deliverables" :key="deliverable">{{ deliverable }}</em>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </template>

        <template v-else>
          <section class="series-plan-section">
            <div class="section-head">
              <div>
                <div class="ops-kicker">RELEASE REGISTRY</div>
                <h2>发布状态机</h2>
              </div>
              <p>从发布登记表自动生成：先看哪些已经发布待复盘，哪些已经成图待质检，哪些还要补图或补作业单。</p>
            </div>

            <div class="series-summary-grid">
              <article class="overview-stat">
                <span>登记项目</span>
                <strong>{{ releaseRegistrySummary.total }}</strong>
                <small>{{ releaseRegistryFreshnessLabel }}</small>
              </article>
              <article class="overview-stat">
                <span>已发布待复盘</span>
                <strong>{{ releaseRegistrySummary.published }}</strong>
                <small>优先回填链接、6h / 24h 数据和评论原话</small>
              </article>
              <article class="overview-stat">
                <span>待质检成图</span>
                <strong>{{ releaseRegistrySummary.imagesDone }}</strong>
                <small>首图、手机端可读性、尾页 CTA</small>
              </article>
              <article class="overview-stat">
                <span>待补图 / 提示词</span>
                <strong>{{ releaseRegistrySummary.promptDone }}</strong>
                <small>先补图组，再进入质检</small>
              </article>
            </div>

            <div class="task-resource-grid">
              <article
                v-for="group in releaseStatusGroups"
                :key="group.id"
                class="task-board"
              >
                <div class="panel-head compact">
                  <div>
                    <div class="ops-kicker">{{ group.kicker }}</div>
                    <h3>{{ group.label }}</h3>
                  </div>
                  <span class="count-pill">{{ group.items.length }} 条</span>
                </div>
                <div class="series-list">
                  <article v-for="item in group.items.slice(0, 6)" :key="item.id" class="series-row">
                    <span :class="['series-status', releaseStatusTone(item.status)]">{{ releaseStatusLabel(item.status) }}</span>
                    <div>
                      <strong>{{ item.priority }} · {{ item.title }}</strong>
                      <p>{{ item.next_action }}</p>
                      <small>{{ item.series }} · {{ item.target_date }} · {{ item.asset_path }}</small>
                    </div>
                  </article>
                  <div v-if="!group.items.length" class="empty-state compact-empty">暂无项目。</div>
                </div>
              </article>
            </div>
          </section>

          <section class="series-plan-section">
            <div class="section-head">
              <div>
                <div class="ops-kicker">CLASSIC SERIES PLAN</div>
                <h2>名著人物职场心理图鉴</h2>
              </div>
              <p>第一季先按 12 篇规划：2 篇已成样张，1 篇进入下一篇，后续围绕职场常见程度、名著识别度和原型差异继续排。</p>
            </div>

            <div class="series-summary-grid">
              <article class="overview-stat">
                <span>第一季容量</span>
                <strong>{{ literarySeriesSummary.total }}</strong>
                <small>主图文；可扩展为 15-18 条复盘/互动续篇</small>
              </article>
              <article class="overview-stat">
                <span>已成样张</span>
                <strong>{{ literarySeriesSummary.completed }}</strong>
                <small>祥林嫂 / 王熙凤已进入产品闭环</small>
              </article>
              <article class="overview-stat">
                <span>本周推进</span>
                <strong>{{ classicLiteraryDailyPlan.length }}</strong>
                <small>每日一个明确交付物</small>
              </article>
              <article class="overview-stat">
                <span>下一篇</span>
                <strong>{{ nextLiteraryTopic?.order }}</strong>
                <small>{{ nextLiteraryTopic?.title }} · {{ nextLiteraryTopic?.archetype }}</small>
              </article>
            </div>

            <div class="series-layout">
              <article class="series-board">
                <div class="panel-head compact">
                  <div>
                    <div class="ops-kicker">SEASON 01</div>
                    <h3>第一季 12 篇路线</h3>
                  </div>
                </div>
                <div class="series-list">
                  <article v-for="item in classicLiterarySeriesPlan" :key="item.id" class="series-row">
                    <span :class="['series-status', item.status]">{{ seriesStatusLabel(item.status) }}</span>
                    <div>
                      <strong>{{ item.order }} · {{ item.title }}</strong>
                      <p>{{ item.workplaceHook }}</p>
                      <small>{{ item.source }} · {{ item.archetype }}</small>
                    </div>
                  </article>
                </div>
              </article>

              <article class="series-board">
                <div class="panel-head compact">
                  <div>
                    <div class="ops-kicker">DAILY PLAN</div>
                    <h3>7 日推进计划</h3>
                  </div>
                </div>
                <div class="daily-plan-list">
                  <article v-for="day in classicLiteraryDailyPlan" :key="day.day" class="daily-plan-row">
                    <time>{{ day.date }}</time>
                    <div>
                      <strong>{{ day.day }} · {{ day.focus }}</strong>
                      <p>{{ day.deliverable }}</p>
                    </div>
                    <span :class="['calendar-status', day.status]">{{ calendarStatusLabel(day.status) }}</span>
                  </article>
                </div>
              </article>
            </div>
          </section>

          <section class="task-resource-grid">
            <article class="task-board">
              <div class="panel-head compact">
                <div>
                  <div class="ops-kicker">CONTENT CALENDAR</div>
                  <h3>内容排期与观察</h3>
                </div>
              </div>
              <div class="calendar-list">
                <article v-for="item in opsCalendar" :key="`${item.date}-${item.topic}`" class="calendar-row">
                  <time>{{ item.date }}</time>
                  <div>
                    <strong>{{ item.topic }}</strong>
                    <small>{{ item.channel }} · {{ item.task }}</small>
                  </div>
                  <span :class="['calendar-status', item.status]">{{ calendarStatusLabel(item.status) }}</span>
                </article>
              </div>
            </article>

            <article class="resource-board">
              <div class="panel-head compact">
                <div>
                  <div class="ops-kicker">GAPS</div>
                  <h3>建议补齐的东西</h3>
                </div>
              </div>
              <div class="recommendation-list">
                <article
                  v-for="recommendation in materialRecommendations"
                  :key="recommendation.id"
                  class="recommendation-row"
                >
                  <strong>{{ recommendation.title }}</strong>
                  <p>{{ recommendation.reason }}</p>
                  <small>{{ recommendation.nextAction }}</small>
                </article>
              </div>
            </article>
          </section>

          <section class="planning-section">
            <div class="section-head">
              <div>
                <div class="ops-kicker">NEXT TOPIC SYSTEM</div>
                <h2>接下来能做什么选题</h2>
              </div>
              <p>优先把表达、沟通、心理情绪类内容做成连续栏目，再让团队沟通和学习 / AI 作为外延。</p>
            </div>

            <div class="cluster-layout">
              <div class="cluster-list">
                <button
                  v-for="cluster in futureTopicClusters"
                  :key="cluster.id"
                  class="cluster-card"
                  :class="{ active: selectedClusterId === cluster.id }"
                  @click="selectedClusterId = cluster.id"
                >
                  <div>
                    <span>{{ cluster.priority }}</span>
                    <strong>{{ cluster.label }}</strong>
                  </div>
                  <small>{{ cluster.status }}</small>
                  <p>{{ cluster.signal }}</p>
                </button>
              </div>

              <article v-if="selectedCluster" class="cluster-detail">
                <div class="panel-head">
                  <div>
                    <div class="ops-kicker">TOPIC LOGIC</div>
                    <h3>{{ selectedCluster.label }}</h3>
                  </div>
                  <span class="priority-pill">{{ selectedCluster.priority }}</span>
                </div>

                <div class="logic-chain">
                  <span v-for="step in selectedCluster.logicChain" :key="step">{{ step }}</span>
                </div>

                <div class="cluster-columns">
                  <div>
                    <h4>下一批题目</h4>
                    <ol class="topic-seed-list">
                      <li v-for="topic in selectedCluster.nextTopics" :key="topic">{{ topic }}</li>
                    </ol>
                  </div>
                  <div>
                    <h4>可绑定素材</h4>
                    <div class="asset-tags">
                      <span v-for="asset in selectedCluster.sourceAssets" :key="asset">{{ asset }}</span>
                    </div>
                    <div class="test-question">
                      <span>本轮验证问题</span>
                      <p>{{ selectedCluster.testQuestion }}</p>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section class="quick-topic-section">
            <div class="section-head">
              <div>
                <div class="ops-kicker">QUICK PICK</div>
                <h2>快速选题</h2>
              </div>
              <p>输入一个处境或情绪关键词，从 72 个场景库中匹配最适合的选题方向。</p>
            </div>

            <div class="quick-topic-input-row">
              <input
                v-model="quickMatchInput"
                type="text"
                placeholder="例如：绩效面谈、和父母吵架、被甩锅、职场焦虑"
                @keyup.enter="handleQuickMatch"
              >
              <button class="primary-btn" @click="handleQuickMatch">匹配</button>
            </div>

            <div v-if="quickMatchResults.length" class="quick-topic-grid">
              <article v-for="(result, index) in quickMatchResults" :key="result.scene.id" class="quick-match-card">
                <div class="quick-match-head">
                  <span class="match-index">{{ index + 1 }}</span>
                  <strong>{{ result.scene.title }}</strong>
                  <small>{{ result.scene.domain }} · {{ result.scene.stuck }}</small>
                </div>
                <p>{{ result.scene.oneLiner }}</p>
                <div class="tag-row" v-if="result.scene.archetypes?.length">
                  <span v-for="archetype in result.scene.archetypes" :key="archetype">{{ archetype }}</span>
                </div>
                <div class="topic-angle-box" v-if="result.topicAngle">
                  <span>选题角度</span>
                  <p>{{ result.topicAngle }}</p>
                </div>
              </article>
            </div>
            <div v-else-if="quickMatchInput && !quickMatchResults.length" class="empty-state compact-empty">
              未找到匹配场景，试试其他关键词。
            </div>
          </section>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import releaseRegistry from '../data/contentOpsReleaseRegistry.generated.json'
import workspaceResourceIndex from '../data/workspaceResourceIndex.generated.json'
import initialXhsWeeklyData from '../data/xhsWeeklyData.generated.json'
import xhsWeeklyDataUrl from '../data/xhsWeeklyData.generated.json?url'
import initialContentOpsAutoData from '../data/contentOpsAutoData.generated.json'
import contentOpsAutoDataUrl from '../data/contentOpsAutoData.generated.json?url'
import {
  classicLiteraryDailyPlan,
  classicLiterarySeriesPlan,
  contentOpsTasks,
  contentCategories,
  futureTopicClusters,
  getCategoryMeta,
  generateTopicAngle,
  getSceneAssets,
  materialRecommendations,
  opsCalendar,
  performanceInsights,
  quickMatchScene,
  todayOpsTasks,
  workspaceResourceHubs,
  workspaceRoadmap,
  workspaceStrategyPanels,
  workspaceTracks,
  workspaceUpdateRhythms,
  channelSnapshots as _manualChannelSnapshots,
  publishedContentItems as _manualPublishedItems,
} from '../data/contentOpsData.js'

defineEmits([
  'openBook',
  'openProblemLab',
  'openEventLens',
  'openLearningPath',
  'openCapabilityPaths',
])

const channelFilters = [
  { id: 'all', label: '全部' },
  { id: 'xhs', label: '小红书' },
  { id: 'wechat', label: '公众号' },
]

const sortOptions = [
  { id: 'signal', label: '按信号' },
  { id: 'date', label: '按日期' },
  { id: 'views', label: '按阅读' },
]

const viewModes = [
  { id: 'topics', label: '日常运营', description: '系列计划、选题群和补齐项' },
  { id: 'data', label: '内容数据', description: '小红书 / 公众号表现复盘' },
  { id: 'workspace', label: '资料与低频', description: '项目线、资料索引和长期结构' },
]

const activeMode = ref(initialMode())
const selectedChannel = ref('all')
const selectedCategory = ref('all')
const sortMode = ref('signal')
const searchQuery = ref('')
const selectedItemId = ref('')
const selectedClusterId = ref('literary-workplace-archetypes')
const roundtableArtifactStorageKey = 'redbook:content-artifact-inbox'
const roundtableArtifacts = ref(loadRoundtableArtifacts())
const kbRoundtableArtifacts = ref([])
const xhsWeeklyData = ref(initialXhsWeeklyData)
const contentOpsAutoData = ref(initialContentOpsAutoData)
const isRefreshing = ref(false)
const lastRefreshAt = ref(null)
const refreshTimer = ref(null)
const quickMatchInput = ref('')
const quickMatchResults = ref([])

const numberFormatter = new Intl.NumberFormat('zh-CN')

// Merged data: auto-generated metrics + manual curation
const channelSnapshots = computed(() => {
  const autoSnap = contentOpsAutoData.value?.channelSnapshots?.find(s => s.id === 'xhs')
  if (!autoSnap || !contentOpsAutoData.value?.hasData) return _manualChannelSnapshots
  return _manualChannelSnapshots.map(s => {
    if (s.id === 'xhs') return { ...autoSnap, insight: autoSnap.insight || s.insight }
    return s
  })
})

const publishedContentItems = computed(() => {
  if (!contentOpsAutoData.value?.hasData) return _manualPublishedItems
  const autoItems = contentOpsAutoData.value.publishedContentItems || []
  const autoByTitle = new Map(autoItems.map(i => [i.title, i]))

  // Auto items enriched with manual overrides (category, series, decision)
  const merged = autoItems.map(auto => {
    const manual = _manualPublishedItems.find(m =>
      m.channel === 'xhs' && (m.id === auto.id || m.title === auto.title)
    )
    if (manual) {
      return {
        ...auto,
        category: manual.category || auto.category,
        series: manual.series || auto.series,
        format: manual.format || auto.format,
        decision: manual.decision || auto.decision,
      }
    }
    return auto
  })

  // Append non-xhs manual items (wechat etc.)
  for (const m of _manualPublishedItems) {
    if (m.channel !== 'xhs') merged.push(m)
  }
  return merged
})

const categoryCounts = computed(() => {
  const counts = { all: publishedContentItems.value.length }
  for (const item of publishedContentItems.value) {
    counts[item.category] = (counts[item.category] || 0) + 1
  }
  return counts
})

const libraryStats = computed(() => ({
  total: publishedContentItems.value.length,
  xhs: publishedContentItems.value.filter((item) => item.channel === 'xhs').length,
  wechat: publishedContentItems.value.filter((item) => item.channel === 'wechat').length,
}))

const todayPrimaryTask = computed(() => todayOpsTasks.find((task) => task.status === 'today') || todayOpsTasks[0])

const todoSummary = computed(() => {
  const tasks = [...todayOpsTasks, ...contentOpsTasks]
  const today = tasks.filter((task) => task.status === 'today').length
  const blocked = tasks.filter((task) => task.status === 'blocked').length
  const next = tasks.filter((task) => ['next', 'ready', 'framing', 'drafting'].includes(task.status)).length
  const inbox = tasks.filter((task) => task.status === 'inbox').length
  return {
    total: tasks.length,
    today,
    next,
    blocked,
    inbox,
  }
})

const calendarSummary = computed(() => ({
  total: opsCalendar.length,
  today: opsCalendar.filter((item) => item.status === 'today').length,
  next: opsCalendar.filter((item) => item.status === 'next').length,
  draft: opsCalendar.filter((item) => item.status === 'draft').length,
  idea: opsCalendar.filter((item) => item.status === 'idea').length,
}))

const releaseRegistryItems = computed(() =>
  Array.isArray(releaseRegistry?.items) ? releaseRegistry.items.filter((item) => item?.id) : [],
)

const releaseRegistrySummary = computed(() => ({
  total: releaseRegistryItems.value.length,
  published: releaseRegistryItems.value.filter((item) => ['published', 'reviewing_6h', 'reviewing_24h', 'reviewing_72h'].includes(item.status)).length,
  imagesDone: releaseRegistryItems.value.filter((item) => item.status === 'images_done').length,
  promptDone: releaseRegistryItems.value.filter((item) => item.status === 'prompt_done').length,
}))

const releaseRegistryFreshnessLabel = computed(() => {
  const generatedAt = releaseRegistry?.generatedAt
  if (!generatedAt) return '发布登记表生成状态未知'
  const date = new Date(generatedAt)
  if (Number.isNaN(date.getTime())) return '发布登记表已生成'
  return `自动生成 · ${date.toLocaleDateString('zh-CN')} ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
})

const releaseStatusGroupConfig = [
  {
    id: 'published',
    kicker: 'REVIEW FIRST',
    label: '已发布待复盘',
    statuses: ['published', 'reviewing_6h', 'reviewing_24h', 'reviewing_72h'],
  },
  {
    id: 'qa',
    kicker: 'QA QUEUE',
    label: '待质检 / 待发布',
    statuses: ['images_done', 'qa_passed', 'publish_ready'],
  },
  {
    id: 'production',
    kicker: 'PRODUCTION',
    label: '待生图 / 待补稿',
    statuses: ['topic_locked', 'draft_done', 'prompt_done', 'draft_ready_4_0_4_2', 'qa_blocked'],
  },
  {
    id: 'planning',
    kicker: 'PLANNING',
    label: '候选与观察',
    statuses: ['candidate', 'reviewed', 'paused'],
  },
]

const releaseStatusGroups = computed(() =>
  releaseStatusGroupConfig.map((group) => ({
    ...group,
    items: releaseRegistryItems.value
      .filter((item) => group.statuses.includes(item.status))
      .sort((a, b) => releasePriorityScore(a.priority) - releasePriorityScore(b.priority) || a.target_date.localeCompare(b.target_date)),
  })),
)

const literarySeriesSummary = computed(() => {
  const completedStatuses = ['published', 'ready']
  return {
    total: classicLiterarySeriesPlan.length,
    completed: classicLiterarySeriesPlan.filter((item) => completedStatuses.includes(item.status)).length,
    inProgress: classicLiterarySeriesPlan.filter((item) => item.status === 'next').length,
    planned: classicLiterarySeriesPlan.filter((item) => item.status === 'planned').length,
  }
})

const nextLiteraryTopic = computed(() =>
  classicLiterarySeriesPlan.find((item) => item.status === 'next')
  || classicLiterarySeriesPlan.find((item) => item.status === 'planned')
  || classicLiterarySeriesPlan[0],
)

const globalOverviewCards = computed(() => [
  {
    id: 'content-library',
    label: '已纳入内容',
    value: libraryStats.value.total,
    detail: `${libraryStats.value.xhs} 篇小红书 · ${libraryStats.value.wechat} 篇公众号`,
  },
  {
    id: 'resource-index',
    label: '资料入口',
    value: workspaceResourceEntries.value.length,
    detail: workspaceIndexLabel.value,
  },
  {
    id: 'long-roadmap',
    label: '长期路线',
    value: workspaceRoadmap.length,
    detail: '公开书库 -> 原型实验室 -> 虚拟人生沙盘',
  },
  {
    id: 'data-refresh',
    label: '数据刷新',
    value: lastRefreshAt.value ? '已刷新' : '待刷新',
    detail: `圆桌/KB ${lastRefreshLabel.value}；运营快照需跑后台数据流水线`,
  },
])

const taskProgressRows = computed(() => {
  const total = Math.max(todoSummary.value.total, 1)
  return [
    {
      id: 'today',
      label: '今天处理',
      count: todoSummary.value.today,
      percent: Math.round((todoSummary.value.today / total) * 100),
      detail: '现在应该动手的事项',
    },
    {
      id: 'next',
      label: '下一步 / 进行中',
      count: todoSummary.value.next,
      percent: Math.round((todoSummary.value.next / total) * 100),
      detail: '已经进入结构化推进',
    },
    {
      id: 'inbox',
      label: '素材池',
      count: todoSummary.value.inbox,
      percent: Math.round((todoSummary.value.inbox / total) * 100),
      detail: '先收着，等强信号再排期',
    },
    {
      id: 'blocked',
      label: '待补齐 / 阻塞',
      count: todoSummary.value.blocked,
      percent: Math.round((todoSummary.value.blocked / total) * 100),
      detail: '需要数据、证据或发布门禁',
    },
  ]
})

const lastRefreshLabel = computed(() => {
  if (!lastRefreshAt.value) return '尚未刷新'
  return `上次刷新 ${lastRefreshAt.value.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
})

const xhsWeeklyGeneratedLabel = computed(() => {
  const generatedAt = xhsWeeklyData.value?.generatedAt
  if (!generatedAt) return ''
  const date = new Date(generatedAt)
  if (Number.isNaN(date.getTime())) return ''
  const monthDay = date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  const time = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  return `生成 ${monthDay} ${time}`
})

const generatedWorkspaceResources = computed(() => {
  const resources = workspaceResourceIndex?.resources
  return Array.isArray(resources) ? resources.filter((item) => item?.id && item?.title) : []
})

const workspaceResourceEntries = computed(() =>
  generatedWorkspaceResources.value.length ? generatedWorkspaceResources.value : workspaceResourceHubs,
)

const workspaceIndexLabel = computed(() => {
  if (!generatedWorkspaceResources.value.length) return '手写兜底索引'
  const generatedAt = workspaceResourceIndex?.generatedAt
  if (!generatedAt) return '自动生成索引'
  const date = new Date(generatedAt)
  if (Number.isNaN(date.getTime())) return '自动生成索引'
  return `自动索引 · ${date.toLocaleDateString('zh-CN')}`
})

const visibleRoundtableArtifacts = computed(() => {
  const seen = new Set()
  return [
    ...roundtableArtifacts.value,
    ...kbRoundtableArtifacts.value,
  ].filter((artifact) => {
    if (seen.has(artifact.id)) return false
    seen.add(artifact.id)
    return true
  })
})

const filteredItems = computed(() => {
  const query = searchQuery.value.toLowerCase()
  const items = publishedContentItems.value.filter((item) => {
    const matchesChannel = selectedChannel.value === 'all' || item.channel === selectedChannel.value
    const matchesCategory = selectedCategory.value === 'all' || item.category === selectedCategory.value
    const haystack = [
      item.title,
      item.series,
      item.format,
      item.decision,
      getCategoryMeta(item.category).label,
    ].join(' ').toLowerCase()
    const matchesQuery = !query || haystack.includes(query)
    return matchesChannel && matchesCategory && matchesQuery
  })

  return items.sort((a, b) => {
    if (sortMode.value === 'date') {
      return b.publishedAt.localeCompare(a.publishedAt)
    }
    if (sortMode.value === 'views') {
      return primaryViews(b) - primaryViews(a)
    }
    return itemScore(b) - itemScore(a)
  })
})

const selectedItem = computed(() =>
  publishedContentItems.value.find((item) => item.id === selectedItemId.value) || filteredItems.value[0],
)

const selectedCluster = computed(() =>
  futureTopicClusters.find((cluster) => cluster.id === selectedClusterId.value) || futureTopicClusters[0],
)

const workspaceRadarNodes = computed(() => {
  const anchors = workspaceTracks.slice(0, 5)
  const placements = [
    { top: '20px', left: '50%', transform: 'translateX(-50%)' },
    { top: '34%', right: '10px' },
    { bottom: '18px', right: '18%' },
    { bottom: '20px', left: '14%' },
    { top: '34%', left: '10px' },
  ]

  return anchors.map((track, index) => ({
    id: track.id,
    index: `0${index + 1}`,
    label: track.lane,
    caption: track.routeLabel || '路径入口',
    summary: track.summary,
    link: track.route ? `${track.route} · ${track.sourceLabel}` : track.sourceLabel,
    tone: index % 2 === 0 ? 'brand' : 'accent',
    style: placements[index] || placements[placements.length - 1],
  }))
})

const relatedCluster = computed(() => {
  if (!selectedItem.value) return null
  return futureTopicClusters.find((cluster) => cluster.category === selectedItem.value.category) || null
})

watch(filteredItems, (items) => {
  if (!items.some((item) => item.id === selectedItemId.value)) {
    selectedItemId.value = items[0]?.id || ''
  }
}, { immediate: true })

onMounted(() => {
  refreshWorkspaceData()
  if (typeof window !== 'undefined') {
    refreshTimer.value = window.setInterval(refreshWorkspaceData, 45000)
    window.addEventListener('storage', onStorageChanged)
    window.addEventListener('focus', refreshWorkspaceData)
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', onVisibilityChanged)
  }
})

onBeforeUnmount(() => {
  if (refreshTimer.value && typeof window !== 'undefined') {
    window.clearInterval(refreshTimer.value)
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('storage', onStorageChanged)
    window.removeEventListener('focus', refreshWorkspaceData)
  }
  if (typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', onVisibilityChanged)
  }
})

function initialMode() {
  if (typeof window === 'undefined') return 'topics'
  const mode = new URLSearchParams(window.location.search).get('mode')
  return viewModes.some((item) => item.id === mode) ? mode : 'topics'
}

function onStorageChanged(event) {
  if (event.key === roundtableArtifactStorageKey) {
    refreshWorkspaceData()
  }
}

function onVisibilityChanged() {
  if (document.visibilityState === 'visible') {
    refreshWorkspaceData()
  }
}

async function refreshWorkspaceData() {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    roundtableArtifacts.value = loadRoundtableArtifacts()
    await Promise.all([
      loadKnowledgeBaseRoundtableArtifacts({ cacheBust: true }),
      refreshXhsWeeklyData(),
      refreshContentOpsAutoData(),
    ])
    lastRefreshAt.value = new Date()
  } finally {
    isRefreshing.value = false
  }
}

async function refreshXhsWeeklyData() {
  if (typeof fetch !== 'function') return
  try {
    const separator = xhsWeeklyDataUrl.includes('?') ? '&' : '?'
    const response = await fetch(`${xhsWeeklyDataUrl}${separator}t=${Date.now()}`, { cache: 'no-store' })
    if (!response.ok) return
    xhsWeeklyData.value = await response.json()
  } catch {
    // Keep the bundled snapshot when the dev server cannot serve a fresh JSON file.
  }
}

async function refreshContentOpsAutoData() {
  if (typeof fetch !== 'function') return
  try {
    const separator = contentOpsAutoDataUrl.includes('?') ? '&' : '?'
    const response = await fetch(`${contentOpsAutoDataUrl}${separator}t=${Date.now()}`, { cache: 'no-store' })
    if (!response.ok) return
    contentOpsAutoData.value = await response.json()
  } catch {
    // Keep the bundled snapshot.
  }
}

function loadRoundtableArtifacts() {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(roundtableArtifactStorageKey) || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.map((item) => ({
      id: item.id,
      origin: 'roundtable',
      type: item.type || '圆桌',
      title: item.title || '圆桌生成内容种子',
      useFor: item.useFor || '从圆桌拆解回流的内容或原型素材',
      source: item.source || '/tools/roundtable',
      topicSeeds: Array.isArray(item.topicSeeds) ? item.topicSeeds : [],
    }))
  } catch {
    return []
  }
}

async function loadKnowledgeBaseRoundtableArtifacts(options = {}) {
  try {
    const suffix = options.cacheBust ? `?t=${Date.now()}` : ''
    const response = await fetch(`/archetype-kb/index.json${suffix}`, { cache: 'no-store' })
    if (!response.ok) throw new Error(`KB ${response.status}`)
    const data = await response.json()
    kbRoundtableArtifacts.value = normalizeKbRoundtableArtifacts(data.roundtable_sessions)
  } catch {
    kbRoundtableArtifacts.value = []
  }
}

function normalizeKbRoundtableArtifacts(sessions = []) {
  if (!Array.isArray(sessions)) return []
  return sessions
    .map((session) => {
      const artifact = session.output?.contentArtifact || session.output?.content_artifact || session.output?.xhsSeed
      if (!artifact) return null
      return {
        id: artifact.id || `kb-artifact-${session.id}`,
        origin: 'roundtable',
        type: artifact.type || 'KB 圆桌',
        title: artifact.title || artifact.hook || session.title || '圆桌样张',
        useFor: artifact.useFor || `${session.problemTitle || session.title} · ${session.archetype?.shortTitle || '原型样张'}`,
        source: artifact.source || session.route || '/tools/roundtable',
        topicSeeds: Array.isArray(artifact.topicSeeds)
          ? artifact.topicSeeds
          : Array.isArray(artifact.slides)
            ? artifact.slides
            : [],
      }
    })
    .filter(Boolean)
}

function openWorkspaceTarget(target) {
  if (target?.mode) {
    activeMode.value = target.mode
    return
  }
  navigateTo(target?.route)
}

const emotionKeywordMap = {
  '恐惧': 'fear', '害怕': 'fear', '担心': 'fear',
  '愤怒': 'anger', '生气': 'anger',
  '委屈': 'grievance', '难过': 'grievance',
  '焦虑': 'anxiety', '紧张': 'anxiety',
  '低落': 'low-energy', '累': 'low-energy', '疲惫': 'low-energy',
  '迷茫': 'confusion', '困惑': 'confusion', '不知道': 'confusion',
}

function extractEmotionKeyword(input) {
  for (const [word, id] of Object.entries(emotionKeywordMap)) {
    if (input.includes(word)) return id
  }
  return null
}

function handleQuickMatch() {
  if (!quickMatchInput.value.trim()) {
    quickMatchResults.value = []
    return
  }
  const emotionId = extractEmotionKeyword(quickMatchInput.value)
  const matched = quickMatchScene(quickMatchInput.value)
  quickMatchResults.value = matched.map((scene) => ({
    scene,
    topicAngle: generateTopicAngle(scene.id, emotionId || ''),
  }))
}

function navigateTo(route) {
  if (!route) return
  if (route === '/tools/content-ops') {
    activeMode.value = 'topics'
    return
  }
  if (typeof window === 'undefined') return
  window.history.pushState({}, '', route)
  window.dispatchEvent(new Event('popstate'))
}

function primaryViews(item) {
  return item.metrics.views ?? item.metrics.reads ?? 0
}

function metricRate(item, rateKey) {
  if (typeof item.metrics[rateKey] === 'number') {
    return item.metrics[rateKey]
  }
  const numeratorKey = rateKey.replace('Rate', 's')
  const numerator = item.metrics[numeratorKey] ?? 0
  const denominator = primaryViews(item)
  if (!denominator) return 0
  return (numerator / denominator) * 100
}

function itemScore(item) {
  const saveRate = metricRate(item, 'saveRate')
  const followRate = metricRate(item, 'followRate')
  const shareRate = metricRate(item, 'shareRate')
  const stay = item.metrics.avgStaySeconds || 0
  const click = item.metrics.ctr || 0

  if (item.channel === 'wechat') {
    return saveRate * 1.8 + followRate * 3 + shareRate * 1.2 + stay * 0.05
  }

  return saveRate * 2.6 + followRate * 3 + shareRate * 1.8 + click * 0.25 + stay * 0.08
}

function performanceLevel(item) {
  const score = itemScore(item)
  if (score >= 26) return { label: '强信号', tone: 'strong' }
  if (score >= 14) return { label: '可加码', tone: 'good' }
  if (score >= 7) return { label: '观察', tone: 'watch' }
  return { label: '重做入口', tone: 'revise' }
}

function formatNumber(value) {
  return numberFormatter.format(Math.round(value || 0))
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(2)}%`
}

function channelLabel(channelId) {
  return channelFilters.find((channel) => channel.id === channelId)?.label || channelId
}

function calendarStatusLabel(status) {
  const labels = {
    done: '完成',
    today: '今天',
    next: '明天',
    draft: '草稿',
    idea: '灵感',
    planned: '计划',
    review: '复盘',
  }
  return labels[status] || status
}

function taskStatusLabel(status) {
  const labels = {
    today: '今天',
    next: '下一步',
    blocked: '待补齐',
  }
  return labels[status] || status
}

function releasePriorityScore(priority) {
  const scores = {
    P0: 0,
    'P0.5': 1,
    P1: 2,
    P2: 3,
    P3: 4,
  }
  return scores[priority] ?? 9
}

function releaseStatusLabel(status) {
  const labels = {
    candidate: '候选',
    topic_locked: '锁题',
    draft_done: '文案',
    prompt_done: '提示词',
    draft_ready_4_0_4_2: '4-0/4-2',
    images_done: '成图',
    qa_passed: '已质检',
    publish_ready: '可发布',
    published: '已发布',
    reviewing_6h: '6h',
    reviewing_24h: '24h',
    reviewing_72h: '72h',
    reviewed: '已复盘',
    qa_blocked: '阻塞',
    paused: '暂停',
  }
  return labels[status] || status
}

function releaseStatusTone(status) {
  if (['published', 'reviewing_6h', 'reviewing_24h', 'reviewing_72h'].includes(status)) return 'published'
  if (['images_done', 'qa_passed', 'publish_ready'].includes(status)) return 'ready'
  if (['prompt_done', 'draft_done', 'topic_locked', 'draft_ready_4_0_4_2'].includes(status)) return 'next'
  if (['qa_blocked', 'paused'].includes(status)) return 'blocked'
  return 'planned'
}

function seriesStatusLabel(status) {
  const labels = {
    published: '已发布',
    ready: '待发布',
    next: '下一篇',
    planned: '计划中',
  }
  return labels[status] || status
}
</script>

<style scoped>
.content-ops-wrap {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: #f4f6f4;
  color: var(--text-primary);
}

.content-ops-scroll {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden auto;
  overscroll-behavior: contain;
}

.ops-shell {
  box-sizing: border-box;
  width: calc(100% - 36px);
  max-width: 1480px;
  margin: 0 auto;
  padding: 22px 0 42px;
}

.ops-header,
.metric-card,
.snapshot-panel,
.published-panel,
.detail-panel,
.insight-panel,
.strategy-card,
.roadmap-card,
.track-card,
.today-task,
.resource-row,
.update-card,
.task-board,
.resource-board,
.return-card,
.overview-card,
.overview-stat,
.series-board,
.series-plan-section,
.recommendation-row,
.cluster-card,
.cluster-detail,
.daily-command-card,
.daily-row,
.compact-calendar-row,
.mini-snapshot-row,
.compact-return-row,
.update-row {
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: var(--shadow-sm);
}

.ops-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 24px;
  padding: 26px;
}

.ops-kicker {
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.4;
  letter-spacing: 0;
  text-transform: uppercase;
}

.ops-header h1,
.section-head h2,
.panel-head h2,
.panel-head h3,
.cluster-detail h3 {
  margin: 8px 0 0;
  color: var(--text-primary);
  font-family: var(--font-serif);
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.ops-header h1 {
  font-size: clamp(36px, 4.4vw, 58px);
}

.ops-header p,
.section-head p,
.track-card p,
.resource-row p,
.today-task p,
.snapshot-panel p,
.decision-box p,
.next-bridge p,
.insight-row p,
.recommendation-row p,
.cluster-card p,
.test-question p,
.daily-row p,
.compact-return-row p,
.mini-snapshot-row p,
.update-row p {
  color: var(--text-secondary);
  line-height: 1.75;
}

.ops-header p {
  max-width: 820px;
  margin: 12px 0 0;
  font-size: 15px;
}

.header-actions,
.panel-head,
.track-top,
.resource-head,
.card-footer {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-actions {
  flex-wrap: wrap;
  justify-content: flex-end;
}

.primary-btn,
.ghost-btn,
.text-btn {
  border: 1px solid var(--border-default);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}

.primary-btn:disabled,
.ghost-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.primary-btn,
.ghost-btn {
  padding: 9px 14px;
}

.primary-btn {
  border-color: var(--brand);
  background: var(--brand);
  color: #fff;
}

.ghost-btn {
  background: #ffffffc7;
  color: var(--text-secondary);
}

.refresh-note {
  color: var(--text-tertiary);
  font-size: 12px;
  line-height: 1.5;
}

.text-btn {
  flex: none;
  background: #204f6712;
  color: var(--brand);
  padding: 7px 10px;
  font-size: 12px;
}

.top-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.metric-card {
  min-width: 0;
  padding: 18px;
}

.metric-card span,
.snapshot-head span,
.decision-box span,
.next-bridge span,
.next-box span,
.resource-head span,
.return-card span,
.test-question span,
.mini-snapshot-row span,
.compact-return-row span,
.update-row span {
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.metric-card strong {
  display: block;
  margin-top: 7px;
  color: var(--brand);
  font-family: var(--font-serif);
  font-size: 34px;
  line-height: 1;
}

.metric-card small,
.card-footer small,
.resource-row small,
.calendar-row small,
.detail-meta span,
.recommendation-row small,
.insight-row small {
  color: var(--text-tertiary);
  font-size: 12px;
  line-height: 1.6;
}

.daily-command-section {
  margin-top: 22px;
}

.daily-command-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1.05fr) minmax(0, 0.95fr) minmax(0, 0.95fr);
  gap: 12px;
}

.daily-command-card {
  min-width: 0;
  padding: 18px;
}

.daily-command-card.focus-card {
  border-color: #204f6738;
  background: #f7fbfb;
}

.daily-list,
.daily-calendar-list,
.mini-snapshot-list,
.compact-return-list,
.update-list {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.daily-row,
.mini-snapshot-row,
.compact-return-row,
.update-row {
  padding: 12px;
  box-shadow: none;
}

.daily-row > div,
.mini-snapshot-row > div:first-child,
.update-row > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.daily-row small {
  color: var(--text-muted);
  font-size: 12px;
}

.daily-row strong,
.compact-calendar-row strong,
.mini-snapshot-row strong,
.compact-return-row strong,
.update-row strong {
  display: block;
  color: var(--text-primary);
  overflow-wrap: anywhere;
}

.daily-row strong {
  margin-top: 8px;
}

.daily-row p,
.compact-return-row p,
.mini-snapshot-row p,
.update-row p {
  margin-top: 6px;
  font-size: 13px;
}

.compact-calendar-row {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 56px;
  align-items: center;
  gap: 9px;
  padding: 11px;
  box-shadow: none;
}

.compact-calendar-row time {
  color: var(--brand);
  font-size: 12px;
  font-weight: 900;
}

.compact-calendar-row small {
  display: block;
  margin-top: 4px;
  color: var(--text-tertiary);
  font-size: 11px;
  line-height: 1.5;
}

.mini-snapshot-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.mini-snapshot-metrics span {
  border: 1px solid #204f6714;
  border-radius: 8px;
  background: #f8fbfb;
  padding: 5px 7px;
  text-transform: none;
}

.compact-return-row > span,
.update-row > div > span {
  color: var(--accent);
}

.update-row small {
  display: block;
  margin-top: 7px;
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.5;
}

.compact-empty {
  margin-top: 14px;
  padding: 14px;
}

.mode-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.mode-tabs button {
  min-width: 0;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: #ffffffb8;
  cursor: pointer;
  padding: 14px 16px;
  text-align: left;
}

.mode-tabs button.active {
  border-color: #204f6745;
  background: #e7f0f2;
}

.mode-tabs strong,
.mode-tabs span {
  display: block;
}

.mode-tabs strong {
  color: var(--text-primary);
}

.mode-tabs span {
  margin-top: 4px;
  color: var(--text-tertiary);
  font-size: 12px;
}

.workspace-section,
.strategy-section,
.roadmap-section,
.update-section,
.planning-section,
.series-plan-section,
.roundtable-return-panel {
  margin-top: 22px;
}

.ops-overview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: 14px;
  margin-top: 16px;
}

.overview-card {
  min-width: 0;
  padding: 18px;
}

.overview-stat-grid,
.series-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.overview-stat {
  min-width: 0;
  padding: 14px;
  box-shadow: none;
}

.overview-stat span,
.series-status {
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.overview-stat strong {
  display: block;
  margin-top: 7px;
  color: var(--brand);
  font-family: var(--font-serif);
  font-size: 28px;
  line-height: 1.05;
  overflow-wrap: anywhere;
}

.overview-stat small {
  display: block;
  margin-top: 7px;
  color: var(--text-tertiary);
  font-size: 12px;
  line-height: 1.5;
}

.progress-list {
  display: grid;
  gap: 11px;
  margin-top: 14px;
}

.progress-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 34px;
  gap: 8px;
  align-items: center;
}

.progress-row strong,
.progress-row small {
  display: block;
}

.progress-row strong {
  color: var(--text-primary);
  font-size: 13px;
}

.progress-row small {
  margin-top: 3px;
  color: var(--text-tertiary);
  font-size: 12px;
  line-height: 1.45;
}

.progress-row > span {
  color: var(--brand);
  font-weight: 900;
  text-align: right;
}

.progress-row i {
  grid-column: 1 / -1;
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: #204f6714;
}

.progress-row em {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #204f67, #bf6f3f);
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 18px;
  margin-bottom: 14px;
}

.section-head h2 {
  font-size: 28px;
}

.section-head p {
  max-width: 620px;
  margin: 0;
  font-size: 13px;
}

.track-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.strategy-grid,
.update-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.strategy-card,
.update-card {
  min-width: 0;
  padding: 16px;
}

.strategy-card > span,
.update-card > span {
  color: var(--accent);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.strategy-card h3,
.roadmap-card h3 {
  margin-top: 10px;
  color: var(--text-primary);
  font-family: var(--font-serif);
  font-size: 20px;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.strategy-card p,
.roadmap-card p,
.update-card p {
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.7;
}

.strategy-card small,
.update-card small {
  display: block;
  margin-top: 10px;
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.55;
}

.strategy-card .tag-row em,
.roadmap-card .tag-row em {
  border: 1px solid #204f671c;
  border-radius: 8px;
  background: #ffffffa8;
  color: var(--text-secondary);
  padding: 5px 8px;
  font-size: 11px;
  font-style: normal;
  line-height: 1.35;
}

.roadmap-list {
  display: grid;
  gap: 10px;
}

.path-radar-section {
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: #ffffffb8;
  padding: 18px;
  margin-bottom: 16px;
}

.path-radar-layout {
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(260px, 0.72fr);
  gap: 14px;
}

.path-radar-canvas {
  position: relative;
  min-height: 320px;
  border: 1px solid var(--border-default);
  border-radius: 16px;
  background: linear-gradient(180deg, #f7fbfc 0%, #eef4f5 100%);
  overflow: hidden;
}

.path-radar-canvas svg {
  width: 100%;
  height: 320px;
  display: block;
}

.radar-center-label,
.radar-center-sub {
  fill: var(--text-primary);
  font-size: 12px;
  font-weight: 700;
}

.radar-center-sub {
  fill: var(--text-muted);
  font-size: 10px;
  font-weight: 600;
}

.radar-node {
  position: absolute;
  min-width: 132px;
  max-width: 180px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--border-default);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: var(--shadow-sm);
}

.radar-node strong,
.radar-detail-head strong {
  display: block;
  color: var(--text-primary);
  font-size: 13px;
}

.radar-node span {
  display: block;
  margin-top: 4px;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.5;
}

.radar-node.brand {
  border-color: #204f6724;
}

.radar-node.accent {
  border-color: #bf6f3f24;
}

.path-radar-list {
  display: grid;
  gap: 10px;
}

.radar-detail-card {
  padding: 14px;
  border: 1px solid var(--border-default);
  border-radius: 12px;
  background: #ffffffd8;
}

.radar-detail-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.radar-detail-head span {
  border-radius: 999px;
  background: #204f6714;
  color: var(--brand);
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 800;
}

.radar-detail-card p {
  margin-top: 10px;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.75;
}

.radar-detail-card small {
  display: block;
  margin-top: 10px;
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.5;
}

.roadmap-card {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 16px;
  padding: 16px;
}

.roadmap-time {
  border-right: 1px solid #204f6714;
  padding-right: 14px;
}

.roadmap-time span {
  display: block;
  color: var(--brand);
  font-family: var(--font-serif);
  font-size: 22px;
  line-height: 1.2;
}

.roadmap-time small {
  display: block;
  margin-top: 6px;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.55;
}

.track-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 330px;
  padding: 18px;
}

.track-top {
  justify-content: space-between;
}

.lane-pill,
.priority-pill,
.count-pill,
.task-status,
.calendar-status,
.channel-pill,
.signal-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.lane-pill {
  padding: 5px 9px;
  background: #204f6712;
  color: var(--brand);
}

.priority-pill,
.count-pill {
  padding: 5px 9px;
  background: #bf6f3f16;
  color: var(--accent);
}

.track-card h3,
.resource-row strong,
.today-task strong,
.return-card strong,
.recommendation-row strong,
.insight-row strong,
.calendar-row strong,
.cluster-card strong {
  color: var(--text-primary);
  overflow-wrap: anywhere;
}

.track-card h3 {
  margin-top: 14px;
  font-family: var(--font-serif);
  font-size: 22px;
  line-height: 1.3;
}

.track-card p {
  margin-top: 10px;
  font-size: 13px;
}

.tag-row,
.seed-tags,
.asset-tags,
.logic-chain {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.tag-row {
  margin-top: 14px;
}

.tag-row span,
.asset-tags span,
.logic-chain span,
.seed-tags em {
  border: 1px solid #204f671c;
  border-radius: 8px;
  background: #ffffffa8;
  color: var(--text-secondary);
  padding: 5px 8px;
  font-size: 11px;
  font-style: normal;
  line-height: 1.35;
}

.update-card strong {
  display: block;
  margin-top: 8px;
  color: var(--text-primary);
  font-size: 15px;
  line-height: 1.35;
}

.next-box {
  margin-top: auto;
  border-left: 3px solid var(--accent);
  background: #bf6f3f12;
  padding: 12px;
}

.next-box strong {
  display: block;
  margin-top: 6px;
  color: var(--text-primary);
  font-size: 13px;
  line-height: 1.65;
}

.card-footer {
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 14px;
}

.card-footer small {
  min-width: 0;
  text-align: right;
  word-break: break-all;
}

.task-resource-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  gap: 14px;
  margin-top: 22px;
}

.series-plan-section {
  padding: 18px;
}

.series-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(340px, 0.92fr);
  gap: 14px;
  margin-top: 14px;
}

.series-board {
  min-width: 0;
  padding: 18px;
  box-shadow: none;
}

.series-list,
.daily-plan-list {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.series-row,
.daily-plan-row {
  display: grid;
  align-items: start;
  gap: 10px;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: #ffffffc9;
  padding: 12px;
}

.series-row {
  grid-template-columns: 64px minmax(0, 1fr);
}

.daily-plan-row {
  grid-template-columns: 88px minmax(0, 1fr) 64px;
}

.series-status {
  justify-content: center;
  border-radius: 999px;
  background: #204f6714;
  color: var(--brand);
  padding: 5px 8px;
  text-align: center;
  letter-spacing: 0;
  text-transform: none;
}

.series-status.ready,
.series-status.next {
  background: #bf6f3f16;
  color: var(--accent);
}

.series-status.published {
  background: #1d6f4c1c;
  color: #1d6f4c;
}

.series-row strong,
.daily-plan-row strong {
  display: block;
  color: var(--text-primary);
  overflow-wrap: anywhere;
}

.series-row p,
.daily-plan-row p {
  margin-top: 5px;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.series-row small {
  display: block;
  margin-top: 6px;
  color: var(--text-tertiary);
  font-size: 12px;
  line-height: 1.5;
}

.daily-plan-row time {
  color: var(--brand);
  font-weight: 900;
  font-size: 12px;
}

.task-board,
.resource-board,
.published-panel,
.detail-panel,
.insight-panel {
  min-width: 0;
  padding: 18px;
}

.panel-head {
  justify-content: space-between;
  align-items: flex-start;
}

.panel-head.compact h3 {
  margin-top: 5px;
  font-size: 22px;
}

.today-task-list,
.resource-list,
.recommendation-list,
.insight-list,
.calendar-list {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.today-task,
.resource-row,
.return-card,
.recommendation-row,
.insight-row {
  padding: 14px;
  box-shadow: none;
}

.today-task > div {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.today-task small {
  color: var(--text-muted);
}

.task-status {
  padding: 4px 8px;
  background: #204f6714;
  color: var(--brand);
}

.task-status.blocked {
  background: #bf6f3f16;
  color: var(--accent);
}

.today-task p,
.resource-row p,
.recommendation-row p,
.insight-row p {
  margin-top: 6px;
  font-size: 13px;
}

.resource-head {
  justify-content: space-between;
  margin-bottom: 9px;
}

.resource-row small {
  display: block;
  margin-top: 9px;
  word-break: break-all;
}

.resource-items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.resource-items span {
  border: 1px solid #204f671a;
  border-radius: 8px;
  background: #f8fbfb;
  color: var(--text-secondary);
  padding: 5px 8px;
  font-size: 11px;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.roundtable-return-panel {
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.64);
  padding: 18px;
}

.roundtable-return-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.return-card p {
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.65;
}

.seed-tags {
  margin-top: 10px;
}

.snapshot-strip {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.snapshot-panel {
  padding: 18px;
}

.snapshot-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.snapshot-head strong {
  display: block;
  margin-top: 4px;
  color: var(--text-primary);
}

.snapshot-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin-top: 14px;
}

.snapshot-metrics div,
.detail-metrics article {
  border: 1px solid #204f6714;
  border-radius: 8px;
  background: #f8fbfb;
  padding: 10px;
}

.snapshot-metrics span,
.detail-metrics span,
.row-metric span {
  display: block;
  color: var(--text-muted);
  font-size: 11px;
}

.snapshot-metrics strong,
.detail-metrics strong,
.row-metric strong {
  display: block;
  margin-top: 4px;
  color: var(--brand);
}

.snapshot-panel p {
  margin-top: 12px;
  font-size: 13px;
}

.control-panel,
.category-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.control-panel {
  align-items: end;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: #ffffffba;
  padding: 14px;
}

.search-field {
  flex: 1 1 320px;
}

.search-field span,
.filter-block > span {
  display: block;
  margin-bottom: 6px;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
}

.search-field input {
  width: 100%;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: #fff;
  color: var(--text-primary);
  outline: none;
  padding: 10px 12px;
}

.segmented-control {
  display: inline-flex;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: #f7f5f0;
  padding: 3px;
}

.segmented-control button,
.category-strip button {
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px 10px;
  font-size: 12px;
}

.segmented-control button.active,
.category-strip button.active {
  background: var(--brand);
  color: #fff;
}

.category-strip button {
  border: 1px solid var(--border-default);
  background: #ffffffba;
}

.category-strip strong {
  margin-left: 6px;
}

.data-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(340px, 0.75fr);
  gap: 14px;
  margin-top: 16px;
}

.content-list {
  display: grid;
  gap: 8px;
  margin-top: 14px;
}

.content-row {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr) 86px 70px 70px 84px;
  align-items: center;
  gap: 10px;
  width: 100%;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: #ffffffc9;
  cursor: pointer;
  padding: 11px;
  text-align: left;
}

.content-row.active {
  border-color: #204f674a;
  background: #e9f1f2;
}

.channel-pill {
  justify-content: center;
  padding: 5px 8px;
  background: #204f6714;
  color: var(--brand);
}

.channel-pill.wechat {
  background: #bf6f3f16;
  color: var(--accent);
}

.row-title {
  min-width: 0;
}

.row-title strong,
.row-title small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-title small {
  margin-top: 4px;
  color: var(--text-tertiary);
  font-size: 11px;
}

.row-metric {
  text-align: right;
}

.signal-badge {
  justify-content: center;
  padding: 5px 8px;
}

.signal-badge.strong {
  background: #1d6f4c1c;
  color: #1d6f4c;
}

.signal-badge.good {
  background: #204f6718;
  color: var(--brand);
}

.signal-badge.watch {
  background: #c986301c;
  color: #9b6422;
}

.signal-badge.revise {
  background: #8f3e3418;
  color: #8f3e34;
}

.detail-stack {
  display: grid;
  align-content: start;
  gap: 14px;
  min-width: 0;
}

.detail-meta,
.detail-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.detail-meta span {
  border-radius: 999px;
  background: #204f6710;
  padding: 5px 8px;
}

.detail-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.decision-box,
.next-bridge,
.test-question {
  margin-top: 14px;
  border-left: 3px solid var(--accent);
  background: #bf6f3f12;
  padding: 12px;
}

.empty-state {
  border: 1px dashed var(--border-strong);
  border-radius: 8px;
  color: var(--text-tertiary);
  padding: 18px;
  text-align: center;
}

.calendar-row {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr) 58px;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: #ffffffc9;
  padding: 12px;
}

.calendar-row time {
  color: var(--brand);
  font-weight: 800;
  font-size: 12px;
}

.calendar-row strong,
.calendar-row small {
  display: block;
  overflow-wrap: anywhere;
}

.calendar-status {
  justify-content: center;
  padding: 5px 8px;
  background: #204f6714;
  color: var(--brand);
}

.planning-section {
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: #ffffffb8;
  padding: 18px;
}

.cluster-layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 14px;
}

.cluster-list {
  display: grid;
  gap: 10px;
}

.cluster-card {
  padding: 14px;
  text-align: left;
  cursor: pointer;
}

.cluster-card.active {
  border-color: #204f674a;
  background: #e9f1f2;
}

.cluster-card div {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cluster-card span {
  border-radius: 999px;
  background: #bf6f3f16;
  color: var(--accent);
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 800;
}

.cluster-card small {
  display: block;
  margin-top: 7px;
  color: var(--text-muted);
}

.cluster-card p {
  margin-top: 8px;
  font-size: 13px;
}

.cluster-detail {
  padding: 18px;
}

.logic-chain {
  margin-top: 14px;
}

.cluster-columns {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.cluster-columns h4 {
  color: var(--text-primary);
  font-size: 14px;
}

.topic-seed-list {
  margin: 10px 0 0;
  padding-left: 20px;
  color: var(--text-secondary);
  line-height: 1.75;
}

.asset-tags {
  margin-top: 10px;
}

@media (max-width: 1180px) {
  .top-metrics,
  .daily-command-grid,
  .strategy-grid,
  .update-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .track-grid,
  .roundtable-return-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .data-workspace,
  .task-resource-grid,
  .cluster-layout,
  .path-radar-layout,
  .ops-overview-grid,
  .series-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .ops-shell {
    width: calc(100% - 24px);
  }

  .ops-header,
  .section-head {
    grid-template-columns: 1fr;
    display: block;
  }

  .header-actions {
    justify-content: flex-start;
    margin-top: 16px;
  }

  .top-metrics,
  .daily-command-grid,
  .mode-tabs,
  .snapshot-strip,
  .overview-stat-grid,
  .series-summary-grid,
  .strategy-grid,
  .update-grid,
  .track-grid,
  .roundtable-return-list,
  .cluster-columns {
    grid-template-columns: 1fr;
  }

  .content-row {
    grid-template-columns: 1fr;
  }

  .row-title strong,
  .row-title small {
    white-space: normal;
  }

  .row-metric {
    text-align: left;
  }
}

@media (max-width: 560px) {
  .ops-shell {
    width: calc(100% - 18px);
    padding-top: 14px;
  }

  .ops-header,
  .metric-card,
  .daily-command-card,
  .overview-card,
  .overview-stat,
  .track-card,
  .task-board,
  .resource-board,
  .planning-section,
  .series-plan-section,
  .series-board,
  .published-panel,
  .detail-panel,
  .insight-panel {
    padding: 14px;
  }

  .snapshot-metrics,
  .detail-metrics {
    grid-template-columns: 1fr;
  }

  .radar-node {
    position: static;
    max-width: none;
    margin-top: 10px;
  }

  .calendar-row {
    grid-template-columns: 1fr;
  }

  .compact-calendar-row {
    grid-template-columns: 1fr;
  }

  .daily-plan-row {
    grid-template-columns: 1fr;
  }

  .roadmap-card {
    grid-template-columns: 1fr;
  }

  .roadmap-time {
    border-right: none;
    border-bottom: 1px solid #204f6714;
    padding-right: 0;
    padding-bottom: 10px;
  }

  .card-footer,
  .resource-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .card-footer small {
    text-align: left;
  }
}

.quick-topic-section {
  margin-top: 22px;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: #ffffffb8;
  padding: 18px;
}

.quick-topic-input-row {
  display: flex;
  gap: 10px;
}

.quick-topic-input-row input {
  flex: 1;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: #fff;
  color: var(--text-primary);
  outline: none;
  padding: 10px 12px;
}

.quick-topic-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.quick-match-card {
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.86);
}

.quick-match-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.match-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: var(--brand);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  flex: none;
}

.quick-match-head strong {
  color: var(--text-primary);
  font-size: 14px;
  overflow-wrap: anywhere;
}

.quick-match-head small {
  color: var(--text-tertiary);
  font-size: 11px;
  margin-left: auto;
  white-space: nowrap;
}

.quick-match-card > p {
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.quick-match-card .tag-row {
  margin-top: 10px;
}

.topic-angle-box {
  margin-top: 12px;
  border-left: 3px solid var(--accent);
  background: #bf6f3f12;
  padding: 10px;
}

.topic-angle-box span {
  display: block;
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.topic-angle-box p {
  margin-top: 6px;
  color: var(--text-primary);
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 1180px) {
  .quick-topic-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .quick-topic-grid {
    grid-template-columns: 1fr;
  }
}

/* ---------- XHS Weekly Analytics ---------- */
.weekly-analytics {
  padding: 24px;
  border-radius: var(--radius-panel);
  border: 1px solid var(--border-default);
  background:
    radial-gradient(circle at top right, rgba(191, 111, 63, 0.06) 0%, rgba(247, 245, 240, 0.92) 38%),
    linear-gradient(180deg, rgba(247, 245, 240, 0.96) 0%, rgba(239, 243, 243, 0.96) 100%);
  margin-bottom: 18px;
}

.weekly-meta-pills {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.weekly-meta-pills .subtle {
  color: var(--text-tertiary);
  background: rgba(255, 255, 255, 0.68);
}

.weekly-summary-strip {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.weekly-summary-card {
  padding: 14px 12px;
  border-radius: var(--radius-card);
  border: 1px solid rgba(32, 79, 103, 0.1);
  background: rgba(255, 255, 255, 0.72);
  text-align: center;
}

.weekly-summary-card span {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.weekly-summary-card strong {
  font-family: var(--font-serif);
  font-size: 22px;
  color: var(--brand);
}

.weekly-table-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.weekly-table-panel {
  padding: 14px;
  border-radius: var(--radius-card);
  border: 1px solid rgba(32, 79, 103, 0.08);
  background: rgba(255, 255, 255, 0.68);
}

.weekly-table-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-subtle);
}

.weekly-mini-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.weekly-table-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 8px;
  align-items: center;
  font-size: 12px;
}

.wtr-title {
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wtr-metric {
  font-weight: 700;
  color: var(--brand);
  white-space: nowrap;
  text-align: right;
  min-width: 48px;
}

.wtr-rate {
  color: var(--text-tertiary);
  white-space: nowrap;
  text-align: right;
  min-width: 44px;
}

.wtr-hint {
  grid-column: 1 / -1;
  font-size: 10px;
  color: var(--accent);
  background: rgba(191, 111, 63, 0.06);
  padding: 3px 6px;
  border-radius: 4px;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.weekly-recs {
  padding: 14px;
  border-radius: var(--radius-card);
  border: 1px solid rgba(191, 111, 63, 0.14);
  background: rgba(191, 111, 63, 0.04);
}

.weekly-recs-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}

.weekly-recs ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.weekly-recs li {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
  padding-left: 14px;
  position: relative;
}

.weekly-recs li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent);
}

@media (max-width: 960px) {
  .weekly-summary-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .weekly-table-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .weekly-analytics {
    padding: 16px;
  }

  .weekly-summary-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .weekly-summary-card strong {
    font-size: 18px;
  }
}
</style>
