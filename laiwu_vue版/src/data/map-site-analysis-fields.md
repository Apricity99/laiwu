# Map Site Analysis 展示数据字段记录

这份文档记录当前“站点分析页”里可直接修改的展示数据字段，方便后面只改数据、不改组件逻辑。

主要涉及文件：
- [MapSiteAnalysisPage.vue](/C:/Users/sduu90/Desktop/1/laiwu/laiwu_vue版/src/pages/MapSiteAnalysisPage.vue)
- [LaiwuTownshipStationSnapshot.vue](/C:/Users/sduu90/Desktop/1/laiwu/laiwu_vue版/src/components/LaiwuTownshipStationSnapshot.vue)
- [LaiwuTownshipPanel.vue](/C:/Users/sduu90/Desktop/1/laiwu/laiwu_vue版/src/components/LaiwuTownshipPanel.vue)
- [FlexibleAccessControlPanel.vue](/C:/Users/sduu90/Desktop/1/laiwu/laiwu_vue版/src/components/FlexibleAccessControlPanel.vue)

---

## 1. 乡镇/街道 10kV 资源分区主数据

定义位置：
- [MapSiteAnalysisPage.vue](/C:/Users/sduu90/Desktop/1/laiwu/laiwu_vue版/src/pages/MapSiteAnalysisPage.vue) 里的 `siteResourceZones`

用途：
- 乡镇/街道 10kV 分区图
- 乡镇/街道细化决策研判
- 柔性调节管控底图颜色

数据结构：

```js
{
  townshipKey: "",
  tone: "medium",
  resourceCount: 2,
  resourceName: "",
  label: "",
  accessMode: "",
  totalCapacity: "20 kV",
  usedCapacity: "9 kV",
  reserveCapacity: "11 kV",
  remark: ""
}
```

字段说明：
- `townshipKey`
  乡镇/街道唯一标识，要和 `scenario.mapTopic.townships[].key` 对上。
- `tone`
  区域颜色分级。
  - `high`：红色，低剩余资源区
  - `medium`：黄色，中剩余资源区
  - `low`：绿色，高剩余资源区
- `resourceCount`
  该区域有几组 10kV 资源。
- `resourceName`
  区域资源总名称，用于资源详情默认命名。
- `label`
  区域标签文案，例如“黄色中剩余资源区”。
- `accessMode`
  接入方式说明，会显示在乡镇摘要和资源详情里。
- `totalCapacity`
  资源总量。
- `usedCapacity`
  已协议接出量。
- `reserveCapacity`
  当前剩余量。
- `remark`
  区域说明文案，会用于地图说明和右侧摘要说明。

---

## 2. 乡镇面板资源-站点映射数据

定义位置：
- [MapSiteAnalysisPage.vue](/C:/Users/sduu90/Desktop/1/laiwu/laiwu_vue版/src/pages/MapSiteAnalysisPage.vue) 里的 `townshipResourceMappings`

用途：
- 控制 [LaiwuTownshipPanel.vue](/C:/Users/sduu90/Desktop/1/laiwu/laiwu_vue版/src/components/LaiwuTownshipPanel.vue) 中
  - 每组资源的名称
  - 每组资源接入哪些站点
  - 每组资源剩余容量
  - 地图资源点连线关系

不填时：
- 组件会回退到“自动推导”的默认逻辑。

建议优先改这里的情况：
- 你想手工指定“资源 1 接哪些站、资源 2 接哪些站”
- 你想明确做多对多关系
- 你不想用组件自动分配的站点映射

数据结构：

```js
const townshipResourceMappings = {
  pengquan: [
    {
      id: "pengquan-resource-1",
      name: "鹏泉综合片区10kV资源1号",
      reserveCapacity: "5.5 kV",
      accessMode: "双间隔接入",
      remark: "可支撑片区内两个站点协同接入。",
      stationKeys: ["站点名称A", "站点名称B"]
    }
  ]
};
```

字段说明：
- `pengquan`
  外层 key 是 `townshipKey`。
- `id`
  资源条目的唯一 id。
- `name`
  资源名称，显示在右侧资源详情和地图资源 tooltip 中。
- `reserveCapacity`
  该组资源的可用容量。
- `accessMode`
  该组资源的接入方式说明。
- `remark`
  该组资源的补充说明。
- `stationKeys`
  该组资源接入哪些站点。
  支持填写：
  - 站点 `id`
  - 站点 `name`
  - 站点 `mapLabel`

可选字段：
- `stationIds`
  和 `stationKeys` 用法类似，也可以直接写站点 id。
- `value`
  地图资源点坐标，格式是 `[lng, lat]`。不填时组件会自动摆点。

---

## 3. 柔性调节管控时间轴

定义位置：
- [MapSiteAnalysisPage.vue](/C:/Users/sduu90/Desktop/1/laiwu/laiwu_vue版/src/pages/MapSiteAnalysisPage.vue) 里的 `flexibleThresholdLabels`

当前结构：

```js
const flexibleThresholdLabels = [
  "00:00",
  "06:00",
  "10:00",
  "14:00",
  "18:00",
  "22:00"
];
```

说明：
- 柔性调节管控三线图的横轴时间点。
- `otherLoadUsageSeries` 长度必须和这个数组一致。

---

## 4. 柔性调节管控原始输入数据

定义位置：
- [MapSiteAnalysisPage.vue](/C:/Users/sduu90/Desktop/1/laiwu/laiwu_vue版/src/pages/MapSiteAnalysisPage.vue) 里的 `flexibleScenarioInputs`

这是现在柔性调节管控最重要的“数据入口”。
后面你如果要改单个黄色区域的图和建议，优先改这里。

数据结构：

```js
const flexibleScenarioInputs = {
  pengquan: {
    totalCapacity: 30,
    otherLoadProtocolMax: 20,
    otherLoadUsageSeries: [15, 16, 17, 18, 20, 20]
  }
};
```

字段说明：
- `pengquan`
  外层 key 是 `townshipKey`，对应某个黄色区域。
- `totalCapacity`
  该区域总资源量，例如 `30`。
- `otherLoadProtocolMax`
  民生及其他已有站点的协议最大总量。
  用来计算：
  - 新站最小接入值
  - 新站接入范围下限
- `otherLoadUsageSeries`
  民生及已有站点的实际使用总量曲线。
  用来计算：
  - 三线图中的“已有站点使用总量”
  - 新站接入阈值曲线
  - 新站接入范围上限
  - 从图中读出的“最小接入时段”

当前逻辑口径：
- 新站接入范围下限 = `totalCapacity - otherLoadProtocolMax`
- 新站接入范围上限 = `totalCapacity - min(otherLoadUsageSeries)`
- 最小接入时段 = 图中 `otherLoadUsageSeries === otherLoadProtocolMax` 的时间段
- 新站接入阈值曲线 = `totalCapacity - otherLoadUsageSeries`

如果某个区域没有单独配置：
- 会回退到默认示例数据。

---

## 5. 柔性调节管控展示数据

定义位置：
- [MapSiteAnalysisPage.vue](/C:/Users/sduu90/Desktop/1/laiwu/laiwu_vue版/src/pages/MapSiteAnalysisPage.vue) 里的 `flexibleControlAreasV2`

说明：
- 这是根据 `flexibleScenarioInputs` 和站点数据计算出来的展示数据。
- 通常不建议直接改这里，优先改第 4 节的原始输入数据。

每个区域对象主要字段：

```js
{
  key: "",
  name: "",
  district: "",
  resourceCount: 0,
  totalCapacity: "30 kV",
  usedCapacity: "20 kV",
  reserveCapacity: "15 kV",
  usageTotalSeries: [],
  thresholdSeries: [],
  baselineSeries: [],
  reduceWindow: "",
  buildCap: "15 kV",
  accessRange: "10-15 kV",
  minAccessWindow: "18:00-22:00",
  strategySummary: "",
  maxAccessText: "",
  reduceText: "",
  detailText: "",
  regionAdvice: "",
  stationStrategies: []
}
```

字段说明：
- `usageTotalSeries`
  图中的“已有站点使用总量”。
- `thresholdSeries`
  图中的“新站接入阈值”。
- `baselineSeries`
  图中的“10kV资源总量”。
- `buildCap`
  新站最大接入建议值。
- `accessRange`
  新站接入范围，例如 `10-15 kV`。
- `minAccessWindow`
  从图上读出的最小接入时段。
- `maxAccessText`
  右侧新建站建议卡中的“最大接入建议”文案。
- `reduceText`
  右侧新建站建议卡中的“最小接入时段说明”文案。
- `detailText`
  补充说明文案。
- `stationStrategies`
  地图上已有站点点位和 tooltip 参考数据。

---

## 6. 柔性调节管控站点参考数据

定义位置：
- [MapSiteAnalysisPage.vue](/C:/Users/sduu90/Desktop/1/laiwu/laiwu_vue版/src/pages/MapSiteAnalysisPage.vue) 里的 `flexibleControlAreasV2[].stationStrategies`

用途：
- [FlexibleAccessControlPanel.vue](/C:/Users/sduu90/Desktop/1/laiwu/laiwu_vue版/src/components/FlexibleAccessControlPanel.vue) 地图上的已有站点点位
- 鼠标悬浮提示

字段结构：

```js
{
  stationId: "",
  stationName: "",
  stationShortName: "",
  lng: 0,
  lat: 0,
  protocolCap: "4.8 kV",
  usageSeries: [],
  usageRange: "3.2-4.8 kV"
}
```

字段说明：
- `stationId`
  站点 id。
- `stationName`
  站点全名。
- `stationShortName`
  地图上显示的短名。
- `lng` / `lat`
  地图坐标。
- `protocolCap`
  该站点的协议容量参考值。
- `usageSeries`
  该站点随时间变化的使用曲线。
- `usageRange`
  该站点使用区间摘要，用于 tooltip。

---

## 7. 乡镇/街道细化决策研判组件使用字段

组件位置：
- [LaiwuTownshipPanel.vue](/C:/Users/sduu90/Desktop/1/laiwu/laiwu_vue版/src/components/LaiwuTownshipPanel.vue)

主要外部输入：

```js
labels
stations
townships
resourceZones
resourceMappings
selectedKey
```

说明：
- `resourceZones`
  控制资源数量、资源名称、剩余容量、说明文案。
- `resourceMappings`
  控制“资源接哪些站”的显式映射。
- `selectedKey`
  控制当前选中的乡镇。

---

## 8. 乡镇/街道 10kV 分区图使用字段

组件位置：
- [LaiwuTownshipStationSnapshot.vue](/C:/Users/sduu90/Desktop/1/laiwu/laiwu_vue版/src/components/LaiwuTownshipStationSnapshot.vue)

主要使用字段：

```js
{
  townshipKey: "",
  tone: "medium",
  resourceCount: 2,
  resourceName: "",
  accessMode: "",
  totalCapacity: "",
  usedCapacity: "",
  reserveCapacity: "",
  remark: ""
}
```

说明：
- 地图颜色、分区说明、资源摘要都直接依赖 `siteResourceZones`。
- 如果你要统一分区图、乡镇研判和柔性调节底图，优先改 `siteResourceZones`。

---

## 9. 页面交互状态字段

定义位置：
- [MapSiteAnalysisPage.vue](/C:/Users/sduu90/Desktop/1/laiwu/laiwu_vue版/src/pages/MapSiteAnalysisPage.vue)

当前状态字段：

```js
const selectedTownshipKey = ref("");
const selectedFlexibleKey = ref("");
```

说明：
- `selectedTownshipKey`
  控制乡镇细化研判、历史趋势、乡镇摘要。
- `selectedFlexibleKey`
  控制柔性调节管控当前选中的黄色区域。

---

## 10. 最常改字段速查

如果后面只是改数据，最常用的是这几组：

```js
townshipKey
tone
resourceCount
resourceName
label
accessMode
totalCapacity
usedCapacity
reserveCapacity
remark

stationKeys
stationIds
reserveCapacity
value

otherLoadProtocolMax
otherLoadUsageSeries

usageTotalSeries
thresholdSeries
baselineSeries
buildCap
accessRange
minAccessWindow
maxAccessText
reduceText
detailText

stationId
stationName
stationShortName
lng
lat
protocolCap
usageSeries
usageRange
```

---

## 11. 推荐修改顺序

如果你后面只改展示数据，优先改这三处：
1. `siteResourceZones`
2. `townshipResourceMappings`
3. `flexibleScenarioInputs`

对应关系：
- 想改分区颜色、资源总量、已接出、剩余量：改 `siteResourceZones`
- 想改资源和充电站的接入关系：改 `townshipResourceMappings`
- 想改柔性调节三线图和新建站建议：改 `flexibleScenarioInputs`
