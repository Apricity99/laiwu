<script setup>
import * as echarts from "echarts";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import CollapsiblePanel from "../components/CollapsiblePanel.vue";
import { useDashboardStore } from "../stores/dashboard";

const store = useDashboardStore();
const scenario = computed(() => store.scenario);

const text = {
  adviceTitle: "柔性调节策略说明",
  adviceDesc: "先明确站点功率边界、保障要求和典型时段规则，再开展后续限峰与收益评估。",
  adviceBadge: "固定规则说明",
  adviceMini: "柔性调节策略说明",
  adviceHeadline: "明确柔性边界，开展调控分析",
  adviceIntro:
      "柔性调节针对新接入站点生效。站点在保障基础充电服务的前提下，需根据配网实时可用容量动态调整输出功率，并在容量紧张时主动执行限峰。",
  adviceScope:
      "当前页面仅对新接入重卡充电站进行柔性调节分析。已有站点作为背景配网占用参与容量测算，但不作为本页调控对象。",
  sourceNote:
      "站点名称、区域、枪口数量、利用率等字段优先从 dashboard 场景数据读取；功率边界采用本页柔性接入协议口径。",
  sectionBase: "站点基础信息",
  sectionBaseDesc: "展示新接入站点的基础功率边界和当前柔性接入规则。",
  sectionHistory: "历史负荷与当前限峰分析",
  sectionHistoryDesc:
      "左侧展示最近 10 小时历史负荷、可用容量与边界线；右侧聚合当前运行状态、调控边界、历史判断与调节建议。",
  sectionSimulation: "调控仿真区",
  sectionSimulationDesc:
      "保留前 2 小时历史曲线，并展示未来 4 小时未调控、调控后和预测可用容量的变化。",
  simWindowHint: "对比未来 4 小时窗口内调控前后峰值与容量裕度变化",
  showBoth: "全部展示",
  showBefore: "仅看未调控",
  showAfter: "仅看调控后",
  recRange: "推荐范围",
  simEffectTitle: "调控效果摘要",
  simConclusionTitle: "仿真结论",
  beforeCard: "调控前",
  afterCard: "调控后",
  predPeak: "预测负荷峰值",
  minCapGap: "最小容量差值",
  overLimit: "是否越限",
  overDuration: "越限时长",
  effectiveDuration: "有效调控时长",
  peakDrop: "峰值下降量",
  riskChange: "风险变化",
  riskCleared: "风险解除",
  riskStill: "风险未解除",
  beforeTargetLine: "调控前目标限峰线",
  afterTargetLine: "调控后目标限峰线",
  simSliderTitle: "调整调控后目标限峰值",
  simSliderDesc:
      "滑轨显示起点按最低保障功率下浮 4 MW 展示，实际可调区间仍为最低保障功率至最大功率，绿色为系统推荐范围。",
  sectionBenefit: "收益分析",
  sectionBenefitDesc:
      "历史收益与未来 1 小时策略收益采用模拟测算口径，仅用于评估当前限峰策略的相对价值。",
  stationName: "站点名称",
  stationRegion: "所属区域",
  stationVoltage: "接入电压等级",
  stationType: "站点类型",
  ratedPower: "站点额定功率",
  contractUpper: "协议上限",
  minimumGuarantee: "最低保障功率",
  flexibleRule: "柔性接入规则",
  dynamicPeak: "按容量动态限峰",
  powerBounds: "功率边界",
  stationFacts: "站点运行画像",
  basicInfo: "站点基本情况",
  typicalRanges: "典型时段功率范围",
  targetLimit: "目标限峰值",
  historyActual: "历史真实负荷",
  historyAvailable: "历史可用容量",
  minGuaranteeLine: "最低保障功率",
  maxPowerLine: "最大功率",
  targetLine: "目标限峰线",
  currentTime: "当前时刻",
  uncontrolledForecast: "未调控预测负荷",
  controlledForecast: "调控后预测负荷",
  futureAvailable: "预测可用容量",
  currentStateGroup: "当前运行状态",
  controlBoundaryGroup: "当前调控边界",
  historyJudgeGroup: "历史判断",
  conclusionGroup: "当前结论",
  currentLoad: "当前站点负荷",
  currentAvailable: "当前可用容量",
  currentDelta: "当前负载差值",
  remainAdjustable: "剩余可下调空间",
  recentPeak: "最近2小时历史峰值",
  recentAverageLoad: "最近2小时平均负荷",
  recentAverageAvailable: "最近2小时平均可用容量",
  historyRevenue: "历史柔性收益",
  nextHourRevenue: "未来 1 小时预期收益",
  baseRevenue: "基础收益",
  totalRevenue: "历史总收益",
  flexRevenue: "历史柔性收益",
  nextHourCut: "未来 1 小时削减电量",
  nextHourShift: "未来 1 小时移峰电量",
  benefitBuild: "收益对比",
  touTitle: "分时电价说明表",
  periodType: "时段类型",
  periodRange: "时间范围",
  mockPrice: "模拟电价",
  peakBenefit: "峰时压降收益",
  shiftBenefit: "平谷转移收益",
  serviceCost: "服务保障成本",
  netBenefit: "净收益",
  positiveBenefit: "正向收益",
  costLabel: "成本",
  placeholder: "占位",
  statusNormal: "正常",
  statusNear: "接近越限",
  statusOver: "已越限"
};

const stationFallback = {
  name: "张家洼新建充电站",
  region: "莱芜区张家洼街道",
  voltageLevel: "10-15 kV",
  ratedPower: 15,
  contractUpper: 15,
  minimumGuarantee: 10,
  currentTime: "14:00",
  sceneType: "新建重卡充电站",
  distribution: "街道级集中接入",
  fast: 8,
  slow: 0,
  operator: "莱芜电网",
  operationStatus: "正常运行",
  currentLoad: 12.8,
  currentUse: 82,
  accessRange: "10-15 kV",
  minAccessPeriod: "18:00-22:00",
  maxAccessSuggestion: "15 kV"
};

const pageView = ref("afternoon");
const pageViewOptions = [
  { key: "afternoon", label: "午后场景" },
  { key: "evening", label: "晚高峰场景" }
];

const pageViewConfigs = {
  afternoon: {
    currentIndex: 5,
    initialLimit: 12.8,
    station: {
      ...stationFallback,
      currentTime: "14:00",
      currentLoad: 12.8,
      currentUse: 82,
      minAccessPeriod: "18:00-22:00"
    },
    historyLabels: ["04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"],
    historyActual: [10.82, 11.06, 11.42, 11.68, 11.94, 12.18, 12.44, 12.62, 12.74, 12.58, 12.86],
    historyAvailable: [12.44, 12.62, 12.88, 13.06, 13.28, 13.46, 13.62, 13.74, 13.86, 13.42, 13.12],
    simulationLabels: ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"],
    simulationHistoryActual: [12.26, 12.38, 12.52, 12.68, 12.82, 13.16, ...Array(7).fill(null)],
    simulationHistoryAvailable: [13.46, 13.34, 13.22, 13.12, 13.02, 13.08, ...Array(7).fill(null)],
    simulationHistoryTarget: [12.74, 12.66, 12.58, 12.54, 12.48, 12.52, ...Array(7).fill(null)],
    uncontrolledForecast: [null, null, null, null, null, 13.16, 13.48, 13.86, 14.12, 14.38, 14.24, 13.98, 13.62],
    futureAvailable: [null, null, null, null, null, 13.08, 13.02, 12.94, 12.88, 12.96, 13.14, 13.42, 13.76],
    controlledTemplate: [13.04, 13.18, 13.36, 13.62, 13.86, 14.04, 13.82, 13.28],
    dailyStrategies: [
      { label: "00:00-08:00", value: "10-12 kV", desc: "夜间保持基础接入。" },
      { label: "08:00-18:00", value: "10-13 kV", desc: "日间按中位范围平稳运行。" },
      { label: "18:00-22:00", value: "10-15 kV", desc: "重点窗口内按建议边界组织接入。" },
      { label: "22:00-24:00", value: "12-15 kV", desc: "夜间恢复后逐步抬升至建议上限。" }
    ],
    touTable: [
      { type: "峰", range: "14:00-18:00", price: 1.25, factor: 0.62, slots: ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"] },
      { type: "平", range: "10:00-14:00 / 18:00-22:00", price: 0.83, factor: 0.34, slots: ["10:00", "11:00", "12:00", "13:00", "18:00"] },
      { type: "谷", range: "22:00-次日08:00", price: 0.48, factor: 0.18, slots: [] }
    ]
  },
  evening: {
    currentIndex: 5,
    initialLimit: 12.6,
    station: {
      ...stationFallback,
      currentTime: "16:30",
      currentLoad: 14.24,
      currentUse: 93,
      minAccessPeriod: "16:30-20:30"
    },
    historyLabels: ["06:30", "07:30", "08:30", "09:30", "10:30", "11:30", "12:30", "13:30", "14:30", "15:30", "16:30"],
    historyActual: [10.86, 11.08, 11.28, 11.54, 11.82, 12.10, 12.42, 12.76, 13.12, 13.68, 14.38],
    historyAvailable: [12.92, 13.04, 13.16, 13.28, 13.36, 13.42, 13.36, 13.28, 13.18, 13.06, 12.96],
    simulationLabels: ["14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"],
    simulationHistoryActual: [13.12, 13.48, 13.86, 14.12, 14.38, 14.24, null, null, null, null, null, null, null],
    simulationHistoryAvailable: [13.18, 13.08, 13.02, 12.98, 12.96, 13.14, null, null, null, null, null, null, null],
    simulationHistoryTarget: [12.62, 12.72, 12.80, 12.84, 12.80, 12.74, null, null, null, null, null, null, null],
    uncontrolledForecast: [null, null, null, null, null, 14.24, 13.98, 13.62, 13.36, 13.08, 12.92, 12.76, 12.62],
    futureAvailable: [null, null, null, null, null, 13.14, 13.42, 13.76, 13.88, 13.96, 14.02, 14.08, 14.12],
    controlledTemplate: [13.82, 13.28, 13.08, 12.96, 12.88, 12.78, 12.66, 12.58],
    dailyStrategies: [
      { label: "00:00-08:00", value: "10-12 kV", desc: "夜间维持基础服务保障。" },
      { label: "08:00-16:30", value: "10-13 kV", desc: "白天按中位接入能力平稳运行。" },
      { label: "16:30-20:30", value: "10-15 kV", desc: "晚高峰窗口执行重点调控与接入协同。" },
      { label: "20:30-24:00", value: "11-14 kV", desc: "高峰回落后逐步恢复常态运行。" }
    ],
    touTable: [
      { type: "峰", range: "16:30-19:30", price: 1.28, factor: 0.64, slots: ["16:30", "17:00", "17:30", "18:00", "18:30", "19:00"] },
      { type: "平", range: "08:30-16:30 / 19:30-22:00", price: 0.86, factor: 0.36, slots: ["08:30", "09:30", "10:30", "11:30", "12:30", "13:30", "14:30", "15:00", "15:30", "16:00", "19:30", "20:00", "20:30"] },
      { type: "谷", range: "22:00-次日08:00", price: 0.49, factor: 0.18, slots: ["06:30", "07:30"] }
    ]
  }
};

const activeViewConfig = computed(() => pageViewConfigs[pageView.value]);

const historyChartRef = ref(null);
const simulationChartRef = ref(null);
const benefitChartRef = ref(null);
const chartMap = new Map();
const historyHoverCard = ref({ visible: false, mode: "line", x: 0, y: 0, title: "", label: "", value: "", desc: "" });
const simulationHoverCard = ref({ visible: false, mode: "line", x: 0, y: 0, title: "", label: "", value: "", desc: "" });

// 当前操作员设定的目标限峰值，页面所有摘要指标和仿真图都由它联动。
const limitPower = ref(activeViewConfig.value.initialLimit);
const sliderHovering = ref(false);

function updateLimitPower(rawValue) {
  const nextValue = Number(rawValue);
  if (Number.isNaN(nextValue)) return;
  limitPower.value = round(
      Math.min(stationInfo.value.ratedPower, Math.max(stationInfo.value.minimumGuarantee, nextValue)),
      2
  );
}
// 仿真图区的展示模式：展示调控前、调控后或两者同时展示。
const simulationMode = ref("both");

const stationInfo = computed(() => {
  return {
    name: activeViewConfig.value.station.name,
    region: activeViewConfig.value.station.region,
    voltageLevel: activeViewConfig.value.station.voltageLevel,
    ratedPower: activeViewConfig.value.station.ratedPower,
    contractUpper: activeViewConfig.value.station.contractUpper,
    minimumGuarantee: activeViewConfig.value.station.minimumGuarantee,
    currentTime: simulationCurrentTimeLabel.value,
    sceneType: activeViewConfig.value.station.sceneType,
    distribution: activeViewConfig.value.station.distribution,
    fast: Number(activeViewConfig.value.station.fast),
    slow: Number(activeViewConfig.value.station.slow),
    operator: activeViewConfig.value.station.operator,
    operationStatus: activeViewConfig.value.station.operationStatus,
    currentLoad: Number(activeViewConfig.value.station.currentLoad),
    currentUse: Number(activeViewConfig.value.station.currentUse),
    accessRange: activeViewConfig.value.station.accessRange,
    minAccessPeriod: activeViewConfig.value.station.minAccessPeriod,
    maxAccessSuggestion: activeViewConfig.value.station.maxAccessSuggestion
  };
});

const displayRangeStart = computed(() => round(Math.max(0, stationInfo.value.minimumGuarantee - 4), 2));

const historyLabelsFallback = pageViewConfigs.afternoon.historyLabels;
const historyActualFallback = pageViewConfigs.afternoon.historyActual;
const historyAvailableFallback = pageViewConfigs.afternoon.historyAvailable;
const simulationLabelsFallback = pageViewConfigs.afternoon.simulationLabels;
const uncontrolledForecastFallback = pageViewConfigs.afternoon.uncontrolledForecast;
const futureAvailableFallback = pageViewConfigs.afternoon.futureAvailable;

const touTable = computed(() => activeViewConfig.value.touTable);

const fixedAdvice = computed(() => {
  return {
    badge: text.adviceBadge,
    title: text.adviceTitle,
    desc: text.adviceDesc,
    strategyIntro: text.adviceIntro,
    scopeText: text.adviceScope,
    stationStrategy:
      pageView.value === "afternoon"
        ? "按 10-15 kV 接入口径展示，18:00-22:00 作为重点接入窗口，日常按建议边界执行。"
        : "按 10-15 kV 接入口径展示，16:30 起进入晚高峰调控口径，重点兼顾限峰与收益协同。",
    powerBounds: {
      ratedPower: stationInfo.value.ratedPower,
      minimumGuarantee: stationInfo.value.minimumGuarantee,
      contractUpper: stationInfo.value.contractUpper,
      accessRange: stationInfo.value.accessRange,
      minAccessPeriod: stationInfo.value.minAccessPeriod,
      maxAccessSuggestion: stationInfo.value.maxAccessSuggestion,
      rangeStart: "10 kV",
      rangeEnd: "15 kV"
    },
    dailyStrategies: {
      title: "日常调控策略",
      items: activeViewConfig.value.dailyStrategies
    },
    sourceText: "站点名称与接入信息采用当前界面配置口径展示。"
  };
});

function round(value, digits = 2) {
  return Number(Number(value || 0).toFixed(digits));
}

function formatSignedPercent(value) {
  const numeric = Number(value || 0);
  return `${numeric >= 0 ? "+" : ""}${numeric.toFixed(1)}%`;
}

function getHoverCardState(chartKey) {
  return chartKey === "history" ? historyHoverCard : simulationHoverCard;
}

function hideHoverCard(chartKey) {
  const state = getHoverCardState(chartKey);
  state.value = { visible: false, mode: "line", x: 0, y: 0, title: "", label: "", value: "", desc: "" };
}

function sum(list = []) {
  return list.reduce((total, value) => total + Number(value || 0), 0);
}

function buildScaledSeries(source = [], targetPeak = 13.8, minValue = 10.5) {
  if (!Array.isArray(source) || !source.length) return [];
  const valid = source.map((item) => Number(item || 0));
  const max = Math.max(...valid, 1);
  return valid.map((item, index) => {
    const wave = 0.92 + Math.sin((index + 1) * 0.55) * 0.08;
    return round(Math.max(minValue, (item / max) * targetPeak * wave), 2);
  });
}

function buildHistoryActualSeries(source = [], fallback = historyActualFallback) {
  if (!Array.isArray(source) || !source.length) return fallback;
  const scaled = buildScaledSeries(source.slice(4, 15), 13.68, 10.68);
  const pattern = [-0.52, -0.34, -0.12, 0.08, 0.22, 0.36, 0.52, 0.66, 0.74, 0.58, 0.84];
  const pivot = scaled[Math.floor(scaled.length / 2)] || 12.3;
  return scaled.map((item, index) => {
    const shaped = 11.92 + pattern[index] + (item - pivot) * 0.26;
    return round(Math.max(10.72, Math.min(13.92, shaped)), 2);
  });
}

function buildHistoryAvailableSeries(actualList = [], source = [], fallback = historyAvailableFallback) {
  if (!Array.isArray(source) || !source.length) return fallback;
  const scaled = buildScaledSeries(source.slice(4, 15), 14.62, 12.44);
  const gapPattern = [1.48, 1.44, 1.36, 1.28, 1.22, 1.18, 1.12, 1.06, 0.98, 0.84, 0.26];
  return actualList.map((actual, index) => {
    const baseline = actual ?? 12.1;
    const candidate = (scaled[index] ?? baseline + 1.1) - 0.04;
    return round(Math.max(candidate, baseline + gapPattern[index]), 2);
  });
}

function buildTargetLineSeries(actualList = [], availableList = [], preferred = 12.8) {
  const ratioPattern = [0.42, 0.46, 0.52, 0.48, 0.44, 0.5, 0.58, 0.54, 0.48, 0.56, 0.6];
  const driftPattern = [-0.04, -0.01, 0.04, 0.01, -0.03, 0.02, 0.07, 0.05, -0.01, 0.04, 0.03];
  return actualList.map((actual, index) => {
    const available = availableList[index] ?? actual + 0.7;
    const gap = Math.max(available - actual, 0.24);
    const lower = actual + 0.08;
    const upper = available - 0.1;
    const rawTarget = actual + gap * (ratioPattern[index] ?? 0.5) + (driftPattern[index] ?? 0);
    const anchor = index === actualList.length - 1 ? Math.min(preferred, upper) : rawTarget;
    return round(Math.max(lower, Math.min(anchor, upper)), 2);
  });
}

function formatHalfHour(date) {
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = date.getMinutes() >= 30 ? "30" : "00";
  return `${hours}:${minutes}`;
}

function alignToHalfHour(date) {
  const aligned = new Date(date);
  aligned.setSeconds(0, 0);
  aligned.setMinutes(aligned.getMinutes() >= 30 ? 30 : 0);
  return aligned;
}

function addMinutes(date, minutes) {
  const next = new Date(date);
  next.setMinutes(next.getMinutes() + minutes);
  return next;
}

function getTouRule(label) {
  return touTable.value.find((item) => item.slots.includes(label)) || touTable.value[2];
}

function getSeriesDescription(name) {
  const descriptionMap = {
    [text.historyActual]: "站点各时刻的实际运行负荷。",
    [text.historyAvailable]: "配网在对应时刻可提供给站点的可用容量。",
    [text.minGuaranteeLine]: "保障基础充电服务必须维持的最低功率线。",
    [text.maxPowerLine]: "当前站点按接入条件允许达到的最大功率边界。",
    [text.targetLine]: "历史分析中用于判断限峰强度的目标控制线。",
    [text.beforeTargetLine]: "未调控场景下的目标限峰基准线。",
    [text.afterTargetLine]: "调控执行后的目标限峰线。",
    [text.uncontrolledForecast]: "不采取调控时的未来负荷预测。",
    [text.controlledForecast]: "执行调控策略后的未来负荷预测。",
    [text.futureAvailable]: "未来时段配网侧可释放给站点的容量预测。"
  };

  return descriptionMap[name] || "当前图层对应的分析指标。";
}

function getLineSeriesPoints(chart, seriesIndex) {
  const option = chart?.getOption?.();
  const series = option?.series?.[seriesIndex];
  const xLabels = option?.xAxis?.[0]?.data || [];
  if (!series || series.type !== "line" || series.silent) return [];

  return (series.data || [])
      .map((item, index) => {
        const rawValue = Array.isArray(item) ? item[item.length - 1] : item;
        const value = Number(rawValue);
        if (rawValue == null || Number.isNaN(value)) return null;
        const label = xLabels[index];
        const x = chart.convertToPixel({ xAxisIndex: 0 }, label);
        const y = chart.convertToPixel({ yAxisIndex: 0 }, value);
        if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
        return { seriesIndex, dataIndex: index, x, y, label, value, seriesName: series.name };
      })
      .filter(Boolean);
}

function getDistanceToSegment(px, py, p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  if (dx === 0 && dy === 0) return Math.hypot(px - p1.x, py - p1.y);

  const t = Math.max(0, Math.min(1, ((px - p1.x) * dx + (py - p1.y) * dy) / (dx * dx + dy * dy)));
  const nearestX = p1.x + t * dx;
  const nearestY = p1.y + t * dy;

  return Math.hypot(px - nearestX, py - nearestY);
}

function findNearestLineHover(chart, offsetX, offsetY) {
  const option = chart?.getOption?.();
  const seriesList = option?.series || [];
  let nearestPoint = null;
  let nearestLine = null;

  seriesList.forEach((series, seriesIndex) => {
    if (series?.type !== "line" || series?.silent) return;

    const points = getLineSeriesPoints(chart, seriesIndex);
    points.forEach((point) => {
      const distance = Math.hypot(offsetX - point.x, offsetY - point.y);
      if (!nearestPoint || distance < nearestPoint.distance) {
        nearestPoint = { ...point, distance, mode: "point" };
      }
    });

    for (let index = 0; index < points.length - 1; index += 1) {
      const start = points[index];
      const end = points[index + 1];
      const distance = getDistanceToSegment(offsetX, offsetY, start, end);
      if (!nearestLine || distance < nearestLine.distance) {
        const dataIndex =
            Math.hypot(offsetX - start.x, offsetY - start.y) <= Math.hypot(offsetX - end.x, offsetY - end.y)
                ? start.dataIndex
                : end.dataIndex;
        nearestLine = { seriesIndex, dataIndex, distance, mode: "line" };
      }
    }
  });

  if (nearestPoint && nearestPoint.distance <= 5) return nearestPoint;
  if (nearestLine && nearestLine.distance <= 14) return nearestLine;
  if (nearestPoint && nearestPoint.distance <= 10) return nearestPoint;
  return null;
}

function buildHoverCardPayload(chartKey, hit, offsetX, offsetY) {
  const chart = chartMap.get(chartKey);
  const option = chart?.getOption?.();
  const series = option?.series?.[hit.seriesIndex];
  const desc = getSeriesDescription(series?.name || "");
  const points = getLineSeriesPoints(chart, hit.seriesIndex);
  const point = points.find((item) => item.dataIndex === hit.dataIndex);
  const rawValue = point?.value;
  const value = typeof rawValue === "number" ? `${rawValue.toFixed(2)} MW` : "";

  return {
    visible: true,
    mode: hit.mode,
    x: offsetX,
    y: offsetY,
    title: series?.name || "",
    label: hit.mode === "point" ? point?.label || "" : "",
    value: hit.mode === "point" ? value : "",
    desc
  };
}

function bindChartHoverMode(chartKey, chart) {
  if (!chart || chart.__hoverModeBound) return;

  chart.getZr().on("mousemove", (event) => {
    const offsetX = event.offsetX ?? event.zrX;
    const offsetY = event.offsetY ?? event.zrY;
    if (!Number.isFinite(offsetX) || !Number.isFinite(offsetY)) return;

    const hit = findNearestLineHover(chart, offsetX, offsetY);
    if (!hit) {
      hideHoverCard(chartKey);
      return;
    }

    getHoverCardState(chartKey).value = buildHoverCardPayload(chartKey, hit, offsetX, offsetY);
  });

  chart.getZr().on("globalout", () => {
    hideHoverCard(chartKey);
  });

  chart.__hoverModeBound = true;
}

const dashboardLabels = computed(() => activeViewConfig.value.historyLabels || scenario.value?.loadSeries?.labels || []);
const simulationCurrentIndex = computed(() => activeViewConfig.value.currentIndex ?? 4);
const simulationCurrentTimeLabel = computed(() => simulationLabels.value[simulationCurrentIndex.value] || activeViewConfig.value.station.currentTime);

const historyLabels = computed(() => activeViewConfig.value.historyLabels || (dashboardLabels.value.length ? dashboardLabels.value.slice(4, 15) : historyLabelsFallback));

const historyActual = computed(() => activeViewConfig.value.historyActual);

const historyAvailable = computed(() => activeViewConfig.value.historyAvailable);

const simulationLabels = computed(() => activeViewConfig.value.simulationLabels || simulationLabelsFallback);

const historicalSegment = computed(() => {
  const latest = historyActual.value.slice(-3);
  const a = latest[0] ?? 12.4;
  const b = latest[1] ?? 12.6;
  const c = latest[2] ?? 12.8;
  return [a, b, b, c, c, null, null, null, null, null, null, null, null];
});

const simulationTimeline = computed(() => simulationLabels.value);

const simulationHistoryActual = computed(() => activeViewConfig.value.simulationHistoryActual);

const simulationHistoryAvailable = computed(() => activeViewConfig.value.simulationHistoryAvailable);

const simulationHistoryTarget = computed(() => activeViewConfig.value.simulationHistoryTarget);

const uncontrolledForecast = computed(() => activeViewConfig.value.uncontrolledForecast || uncontrolledForecastFallback);

const futureAvailable = computed(() => activeViewConfig.value.futureAvailable || futureAvailableFallback);
const simulationFutureAvailableSeries = computed(() =>
  futureAvailable.value.map((value, index) => (index < simulationCurrentIndex.value ? null : value))
);

function buildControlledForecast(limitMw) {
  const currentIndex = simulationCurrentIndex.value;
  const futureHours = simulationLabels.value.slice(currentIndex);
  const shiftedTemplate = activeViewConfig.value.controlledTemplate;

  const controlledMap = futureHours.map((label, index) => {
    const uncontrolled = uncontrolledForecast.value[simulationLabels.value.indexOf(label)] ?? shiftedTemplate[index];
    const hardLimit = Math.min(limitMw, uncontrolled);
    const available = futureAvailable.value[simulationLabels.value.indexOf(label)];
    const eveningTaper = pageView.value === "evening" ? index * 0.04 : 0;
    const templateValue =
      pageView.value === "evening"
        ? Math.min(shiftedTemplate[index] ?? hardLimit, (available ?? hardLimit) - 0.28)
        : (shiftedTemplate[index] ?? hardLimit);
    const target = Math.max(
      stationInfo.value.minimumGuarantee,
      Math.min(templateValue, hardLimit - eveningTaper)
    );
    return [label, round(target, 2)];
  });

  return simulationLabels.value.map((label) => {
    const matched = controlledMap.find((item) => item[0] === label);
    return matched ? matched[1] : null;
  });
}

const pageState = computed(() => {
  const currentIndex = simulationCurrentIndex.value;
  // 百分比按“相对最低保障功率提升了多少”来算，便于操作员理解当前放开的力度。
  const growthFromMinimumPercent = round(
      stationInfo.value.minimumGuarantee > 0
          ? ((limitPower.value - stationInfo.value.minimumGuarantee) / stationInfo.value.minimumGuarantee) * 100
          : 0,
      1
  );

  const currentAvailable = round(historyAvailable.value[historyAvailable.value.length - 1] ?? 13.12, 2);
  const currentLoad = round(historyActual.value[historyActual.value.length - 1] ?? 12.86, 2);
  const currentDelta = round(currentAvailable - currentLoad, 2);
  const targetLineHistory = buildTargetLineSeries(historyActual.value, historyAvailable.value, Math.min(limitPower.value, currentAvailable - 0.12));

  const controlledForecast = buildControlledForecast(limitPower.value);

  const riskHours = simulationLabels.value.filter((label, index) => {
    const uncontrolled = uncontrolledForecast.value[index];
    const available = futureAvailable.value[index];
    return uncontrolled != null && available != null && uncontrolled > available;
  });

  const currentControlled = controlledForecast[currentIndex];
  const suggestedLimit = round(
      Math.max(
          stationInfo.value.minimumGuarantee,
          Math.min(stationInfo.value.contractUpper, currentAvailable - 0.18)
      ),
      2
  );
  const predictedPeakBefore = Math.max(...uncontrolledForecast.value.filter((item) => item != null));
  const predictedPeakAfter = Math.max(...controlledForecast.filter((item) => item != null));
  const peakReduction = round(predictedPeakBefore - predictedPeakAfter, 2);
  const remainingAdjustableSpace = round(limitPower.value - stationInfo.value.minimumGuarantee, 2);
  const recentHistoryActual = historyActual.value.slice(-3);
  const recentHistoryAvailable = historyAvailable.value.slice(-3);
  const recentPeak = round(Math.max(...recentHistoryActual), 2);
  const recentAverageLoad = round(sum(recentHistoryActual) / Math.max(recentHistoryActual.length, 1), 2);
  const recentAverageAvailable = round(sum(recentHistoryAvailable) / Math.max(recentHistoryAvailable.length, 1), 2);

  // 历史柔性收益：历史真实负荷中高于最低保障功率的部分，按分时收益系数粗略估算。
  const historyFlexibleRevenue = round(
      historyLabels.value.reduce((total, label, index) => {
        const adjustableLoad = Math.max(0, historyActual.value[index] - stationInfo.value.minimumGuarantee);
        const rule = getTouRule(label);
        return total + adjustableLoad * rule.factor * 100;
      }, 0),
      2
  );
  // 基础收益：假设站点始终只提供最低保障功率时可获得的历史基础收入。
  const baseRevenue = round(
      historyLabels.value.reduce((total, label) => {
        const rule = getTouRule(label);
        return total + stationInfo.value.minimumGuarantee * rule.factor * 100;
      }, 0),
      2
  );
  const historyTotalRevenue = round(baseRevenue + historyFlexibleRevenue, 2);

  const nextHourLabels = simulationLabels.value.slice(currentIndex, currentIndex + 3);
  const nextHourDelta = nextHourLabels.reduce(
      (acc, label) => {
        const index = simulationLabels.value.indexOf(label);
        const before = uncontrolledForecast.value[index];
        const after = controlledForecast[index];
        const deltaMw = Math.max(0, before - after);
        const energy = deltaMw * 0.5;
        const rule = getTouRule(label);
        acc.peakBenefit += energy * rule.price * rule.factor * 1000;
        acc.cutEnergy += energy;
        return acc;
      },
      { peakBenefit: 0, cutEnergy: 0 }
  );

  const shiftWindowLabels = simulationLabels.value.slice(
      Math.min(simulationLabels.value.length, currentIndex + 4),
      Math.min(simulationLabels.value.length, currentIndex + 8)
  );
  const shiftEnergy =
      shiftWindowLabels.reduce((total, label) => {
        const index = simulationLabels.value.indexOf(label);
        const base = uncontrolledForecast.value[index];
        const after = controlledForecast[index];
        return total + Math.max(0, after - Math.min(base ?? 0, after));
      }, 0) * 0.5;

  const peakBenefit = round(nextHourDelta.peakBenefit, 2);
  const shiftRule = getTouRule(shiftWindowLabels[0] || simulationLabels.value[8] || nextHourLabels[nextHourLabels.length - 1]);
  const shiftBenefit = round(shiftEnergy * shiftRule.price * shiftRule.factor * 1000, 2);
  const serviceCost = round(-48, 2);
  const nextHourBaseRevenue = round(
      nextHourLabels.reduce((total, label) => {
        const rule = getTouRule(label);
        return total + stationInfo.value.minimumGuarantee * rule.factor * 50;
      }, 0),
      2
  );
  const nextHourExpectedRevenue = round(
      nextHourLabels.reduce((total, label) => {
        const index = simulationLabels.value.indexOf(label);
        const after = controlledForecast[index] ?? stationInfo.value.minimumGuarantee;
        const incrementalPower = Math.max(0, after - stationInfo.value.minimumGuarantee);
        const rule = getTouRule(label);
        return total + incrementalPower * 0.5 * rule.price * 60;
      }, 0),
      2
  );
  const netBenefit = nextHourExpectedRevenue;
  const nextHourTotalRevenue = round(nextHourBaseRevenue + nextHourExpectedRevenue, 2);
  const extraRevenue = nextHourExpectedRevenue;

  const normalizedRiskStatus =
      currentDelta < 0 ? text.statusOver : currentDelta <= 0.25 ? text.statusNear : text.statusNormal;
  const riskHint =
      normalizedRiskStatus === text.statusOver
          ? "当前站点负荷已高于可用容量，需要立即压降负荷。"
          : normalizedRiskStatus === text.statusNear
              ? `当前容量余量仅 ${currentDelta.toFixed(2)} MW，已接近限峰边界。`
              : "当前仍有一定容量余量，可继续保持观察。";
  const suggestion =
      normalizedRiskStatus === text.statusOver
          ? `当前站点负荷已超出可用容量 ${Math.abs(currentDelta).toFixed(2)} MW，建议立即将目标限峰值下调至 ${suggestedLimit.toFixed(2)} MW 左右。`
          : normalizedRiskStatus === text.statusNear
              ? `当前运行仅剩 ${currentDelta.toFixed(2)} MW 裕度，负荷已非常接近可用容量，建议将目标限峰值尽快收紧至 ${suggestedLimit.toFixed(2)} MW 并持续监测。`
              : `当前运行仍有 ${currentDelta.toFixed(2)} MW 裕度，可维持现有限峰值并继续观察。`;

  const summaryText = riskHours.length
      ? `若不调控，未来 ${riskHours.join("、")} 时段将超过可用容量；按当前策略调控后，峰值可压降至 ${predictedPeakAfter.toFixed(2)} MW。`
      : `按当前策略，未来 4 小时内站点峰值可控制在 ${predictedPeakAfter.toFixed(2)} MW，整体保持在可用容量边界内。`;

  const simulationTargetBefore = simulationTimeline.value.map((_, index) => {
    if (index <= currentIndex) {
      return round(Math.min(stationInfo.value.contractUpper - 0.2, (simulationHistoryAvailable.value[index] ?? stationInfo.value.contractUpper) - 0.15), 2);
    }
    if (pageView.value === "evening") {
      const uncontrolled = uncontrolledForecast.value[index] ?? stationInfo.value.contractUpper;
      return round(Math.min(stationInfo.value.contractUpper, uncontrolled + 0.16), 2);
    }
    return stationInfo.value.contractUpper;
  });

  const simulationTargetAfter = simulationTimeline.value.map((_, index) => {
    if (index < currentIndex) return null;
    if (index === currentIndex) {
      return round(
        Math.min(
          limitPower.value,
          Math.max(stationInfo.value.minimumGuarantee, (futureAvailable.value[currentIndex] ?? limitPower.value) - 0.04)
        ),
        2
      );
    }
    const available = futureAvailable.value[index];
    if (pageView.value === "evening") {
      const step = index - currentIndex;
      const taperedTarget = limitPower.value - step * 0.05;
      return round(
        Math.min(
          Math.max(stationInfo.value.minimumGuarantee, controlledForecast[index] + 0.08),
          taperedTarget,
          Math.max(stationInfo.value.minimumGuarantee, (available ?? limitPower.value) - 0.03)
        ),
        2
      );
    }
    return round(Math.min(limitPower.value, Math.max(stationInfo.value.minimumGuarantee, (available ?? limitPower.value) - 0.05)), 2);
  });

  const simulationTargetBeforeSeries = simulationTimeline.value.map((_, index) => (index < currentIndex ? null : simulationTargetBefore[index]));
  const simulationTargetAfterSeries = simulationTimeline.value.map((_, index) => (index < currentIndex ? null : simulationTargetAfter[index]));
  const simulationMinimumLine = simulationTimeline.value.map(() => stationInfo.value.minimumGuarantee);
  const simulationMaximumLine = simulationTimeline.value.map(() => stationInfo.value.ratedPower);
  const futureWindowIndexes = simulationTimeline.value.map((_, index) => index).filter((index) => index >= currentIndex);
  const safeFutureWindow = futureWindowIndexes
      .map((index) => futureAvailable.value[index])
      .filter((value) => value != null);
  const safeReferenceCap = safeFutureWindow.length ? Math.min(...safeFutureWindow) : currentAvailable;
  const recommendedLimitMax = round(
      Math.min(stationInfo.value.ratedPower, Math.max(stationInfo.value.minimumGuarantee, safeReferenceCap - 0.05)),
      2
  );
  const recommendedLimitMin = round(
      Math.max(stationInfo.value.minimumGuarantee, recommendedLimitMax - 0.4),
      2
  );
  const sliderBaseSpan = Math.max(stationInfo.value.ratedPower - displayRangeStart.value, 1);
  const sliderMinPercent = round(((stationInfo.value.minimumGuarantee - displayRangeStart.value) / sliderBaseSpan) * 100, 2);
  const sliderValuePercent = round(((limitPower.value - displayRangeStart.value) / sliderBaseSpan) * 100, 2);
  const sliderRecommendedLeftPercent = round(((recommendedLimitMin - displayRangeStart.value) / sliderBaseSpan) * 100, 2);
  const sliderRecommendedWidthPercent = round(
      ((recommendedLimitMax - recommendedLimitMin) / sliderBaseSpan) * 100,
      2
  );
  const sliderRecommendedRightPercent = round(sliderRecommendedLeftPercent + sliderRecommendedWidthPercent, 2);
  const beforeCapacityMarginList = futureWindowIndexes.map((index) =>
      round((futureAvailable.value[index] ?? stationInfo.value.contractUpper) - (uncontrolledForecast.value[index] ?? 0), 2)
  );
  const afterCapacityMarginList = futureWindowIndexes.map((index) =>
      round((futureAvailable.value[index] ?? stationInfo.value.contractUpper) - (controlledForecast[index] ?? 0), 2)
  );
  const beforeOverSlots = beforeCapacityMarginList.filter((item) => item < 0).length;
  const afterOverSlots = afterCapacityMarginList.filter((item) => item < 0).length;
  let effectiveControlSlots = 0;
  afterCapacityMarginList.forEach((margin, index) => {
    if (effectiveControlSlots === index && margin >= 0) {
      effectiveControlSlots += 1;
    }
  });
  const beforeMinGap = Math.min(...beforeCapacityMarginList);
  const afterMinGap = Math.min(...afterCapacityMarginList);
  const beforePeak = predictedPeakBefore;
  const afterPeak = predictedPeakAfter;
  const simulationConclusion = `未来峰值由 ${beforePeak.toFixed(2)} MW 降至 ${afterPeak.toFixed(2)} MW，越限风险由“${beforeOverSlots > 0 ? "存在" : "不存在"}”调整为“${afterOverSlots > 0 ? "仍存在" : "解除"}”。`;

  return {
    growthFromMinimumPercent,
    sliderMinPercent,
    sliderValuePercent,
    sliderRecommendedLeftPercent,
    sliderRecommendedWidthPercent,
    sliderRecommendedRightPercent,
    targetLineHistory,
    controlledForecast,
    currentAvailable,
    currentLoad,
    currentDelta,
    currentControlled,
    suggestedLimit,
    predictedPeakBefore,
    predictedPeakAfter,
    peakReduction,
    remainingAdjustableSpace,
    recentPeak,
    recentAverageLoad,
    recentAverageAvailable,
    baseRevenue,
    historyTotalRevenue,
    historyFlexibleRevenue,
    nextHourExpectedRevenue: netBenefit,
    nextHourBaseRevenue,
    nextHourTotalRevenue,
    extraRevenue,
    nextHourCutEnergy: round(nextHourDelta.cutEnergy, 2),
    nextHourShiftEnergy: round(shiftEnergy, 2),
    peakBenefit,
    shiftBenefit,
    serviceCost,
    netBenefit,
    riskStatus: normalizedRiskStatus,
    riskHint,
    suggestion,
    simulationTargetBefore,
    simulationTargetAfter,
    simulationTargetBeforeSeries,
    simulationTargetAfterSeries,
    simulationMinimumLine,
    simulationMaximumLine,
    recommendedLimitMin,
    recommendedLimitMax,
    beforeTargetValue: stationInfo.value.contractUpper,
    afterTargetValue: round(Math.min(limitPower.value, futureAvailable.value[currentIndex] ?? limitPower.value), 2),
    beforePeak,
    afterPeak,
    beforeMinGap,
    afterMinGap,
    beforeOverSlots,
    afterOverSlots,
    effectiveControlDuration: round(effectiveControlSlots * 0.5, 1),
    peakDrop: round(beforePeak - afterPeak, 2),
    riskChanged: beforeOverSlots > 0 && afterOverSlots === 0 ? text.riskCleared : text.riskStill,
    simulationConclusion,
    riskHours,
    summaryText
  };
});

function ensureChart(key, element) {
  if (!element) return null;
  if (!chartMap.has(key)) chartMap.set(key, echarts.init(element));
  return chartMap.get(key);
}

function renderHistoryChart() {
  const chart = ensureChart("history", historyChartRef.value);
  if (!chart) return;
  bindChartHoverMode("history", chart);

  const minimumLine = historyLabels.value.map(() => stationInfo.value.minimumGuarantee);
  const maximumLine = historyLabels.value.map(() => stationInfo.value.ratedPower);

  chart.setOption({
    backgroundColor: "transparent",
    tooltip: { show: false },
    legend: {
      top: 0,
      itemWidth: 24,
      itemHeight: 14,
      itemGap: 18,
      textStyle: { color: "#4f6480", fontSize: 13, fontWeight: 600 }
    },
    grid: { left: 42, right: 12, top: 58, bottom: 24, containLabel: true },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: historyLabels.value,
      axisLine: { lineStyle: { color: "#d5dce8" } },
      axisLabel: { color: "#6b7f98" }
    },
    yAxis: {
      type: "value",
      min: 9.6,
      max: 15.4,
      splitLine: { lineStyle: { color: "#ebeff5" } },
      axisLabel: { color: "#6b7f98" }
    },
    series: [
      {
        name: text.historyActual,
        type: "line",
        triggerLineEvent: true,
        smooth: true,
        data: historyActual.value,
        symbol: "circle",
        symbolSize: 8,
        lineStyle: { width: 4, color: "#2f6bff" },
        itemStyle: { color: "#2f6bff", borderColor: "#ffffff", borderWidth: 2 },
        z: 4
      },
      {
        name: text.historyAvailable,
        type: "line",
        triggerLineEvent: true,
        smooth: true,
        data: historyAvailable.value,
        symbol: "diamond",
        symbolSize: 8,
        lineStyle: { width: 3.2, color: "#59b585", type: "dashed" },
        itemStyle: { color: "#59b585", borderColor: "#ffffff", borderWidth: 2 },
        z: 5
      },
      {
        name: text.minGuaranteeLine,
        type: "line",
        triggerLineEvent: true,
        smooth: false,
        data: minimumLine,
        symbol: "none",
        lineStyle: { width: 2.2, color: "#7184a0", type: "dashed" },
        z: 2
      },
      {
        name: text.maxPowerLine,
        type: "line",
        triggerLineEvent: true,
        smooth: false,
        data: maximumLine,
        symbol: "none",
        lineStyle: { width: 2.5, color: "#df8a3d", type: "solid" },
        markArea: {
          silent: true,
          itemStyle: { color: "rgba(120, 190, 138, 0.12)" },
          data: [[
            { xAxis: historyLabels.value[0], yAxis: stationInfo.value.minimumGuarantee },
            { xAxis: historyLabels.value[historyLabels.value.length - 1], yAxis: stationInfo.value.ratedPower }
          ]]
        },
        z: 1
      },
      {
        name: text.targetLine,
        type: "line",
        triggerLineEvent: true,
        smooth: true,
        data: pageState.value.targetLineHistory,
        symbol: "triangle",
        symbolSize: 7,
        lineStyle: { width: 3.4, color: "#de8d36", type: "solid" },
        itemStyle: { color: "#de8d36", borderColor: "#ffffff", borderWidth: 2 },
        markLine: {
          silent: true,
          symbol: ["none", "none"],
          lineStyle: { color: "#8ea1b8", type: "dashed", width: 1.6 },
          label: {
            show: true,
            formatter: `${text.currentTime}
${historyLabels.value[historyLabels.value.length - 1]}`,
            position: "insideEndTop",
            color: "#4f6480",
            backgroundColor: "rgba(255,255,255,0.92)",
            padding: [4, 6],
            borderRadius: 4
          },
          data: [{ xAxis: historyLabels.value[historyLabels.value.length - 1] }]
        },
        z: 4
      }
    ]
  });
}

function renderSimulationChart() {
  const chart = ensureChart("simulation", simulationChartRef.value);
  if (!chart) return;
  bindChartHoverMode("simulation", chart);

  const mode = simulationMode.value;
  const showBefore = mode === "both" || mode === "before";
  const showAfter = mode === "both" || mode === "after";
  const currentTime = simulationCurrentTimeLabel.value;
  const series = [
    {
      name: "simulationOverlay",
      type: "line",
      triggerLineEvent: true,
      smooth: false,
      data: pageState.value.simulationMaximumLine,
      symbol: "none",
      silent: true,
      tooltip: { show: false },
      lineStyle: { width: 0, opacity: 0 },
      itemStyle: { opacity: 0 },
      emphasis: { disabled: true },
      markArea: {
        silent: true,
        label: {
          show: true,
          position: "insideTop",
          color: "#5e7088",
          fontSize: 12,
          padding: [2, 6]
        },
        data: [
          [
            {
              name: "历史区",
              xAxis: simulationTimeline.value[0],
              yAxis: stationInfo.value.minimumGuarantee,
              itemStyle: { color: "rgba(74, 124, 214, 0.08)" }
            },
            { xAxis: currentTime, yAxis: stationInfo.value.ratedPower }
          ],
          [
            {
              name: "未来区",
              xAxis: currentTime,
              yAxis: stationInfo.value.minimumGuarantee,
              itemStyle: { color: "rgba(223, 154, 50, 0.1)" }
            },
            { xAxis: simulationTimeline.value[simulationTimeline.value.length - 1], yAxis: stationInfo.value.ratedPower }
          ]
        ]
      },
      markLine: {
        silent: true,
        symbol: ["none", "none"],
        lineStyle: { color: "#8ea1b8", type: "dashed", width: 1.8 },
        label: {
          show: true,
          formatter: `${text.currentTime}
${currentTime}`,
          position: "insideEndTop",
          color: "#4f6480",
          backgroundColor: "rgba(255,255,255,0.92)",
          padding: [4, 6],
          borderRadius: 4
        },
        data: [{ xAxis: currentTime }]
      },
      z: 1
    },
    {
      name: text.maxPowerLine,
      type: "line",
      triggerLineEvent: true,
      smooth: false,
      data: pageState.value.simulationMaximumLine,
      symbol: "none",
      lineStyle: { width: 2.4, color: "#d56b3d", type: "solid" },
      z: 3
    },
    {
      name: text.minGuaranteeLine,
      type: "line",
      triggerLineEvent: true,
      smooth: false,
      data: pageState.value.simulationMinimumLine,
      symbol: "none",
      lineStyle: { width: 2.2, color: "#6f7f95", type: "dashed" },
      z: 2
    },
    {
      name: text.historyActual,
      type: "line",
      triggerLineEvent: true,
      smooth: true,
      data: simulationHistoryActual.value,
      symbol: "circle",
      symbolSize: 8,
      lineStyle: { width: 3.6, color: "#245dff", type: "solid" },
      itemStyle: { color: "#245dff", borderColor: "#ffffff", borderWidth: 2 },
      z: 4
    },
    {
      name: text.historyAvailable,
      type: "line",
      triggerLineEvent: true,
      smooth: true,
      data: simulationHistoryAvailable.value,
      symbol: "diamond",
      symbolSize: 8,
      lineStyle: { width: 3.2, color: "#4aa37b", type: "dashed" },
      itemStyle: { color: "#4aa37b", borderColor: "#ffffff", borderWidth: 2 },
      z: 4
    },
    {
      name: text.targetLine,
      type: "line",
      triggerLineEvent: true,
      smooth: true,
      data: simulationHistoryTarget.value,
      symbol: "triangle",
      symbolSize: 8,
      lineStyle: { width: 3.2, color: "#de8d36", type: "solid" },
      itemStyle: { color: "#de8d36", borderColor: "#ffffff", borderWidth: 2 },
      z: 4
    },
    {
      name: text.futureAvailable,
      type: "line",
      triggerLineEvent: true,
      smooth: true,
      connectNulls: true,
      data: simulationFutureAvailableSeries.value,
      symbol: "roundRect",
      symbolSize: 7,
      lineStyle: { width: 3.2, color: "#2f9f73", type: "dashed" },
      itemStyle: { color: "#2f9f73", borderColor: "#ffffff", borderWidth: 2 },
      z: 4
    }
  ];

  if (showBefore) {
    series.push({
      name: text.beforeTargetLine,
      type: "line",
      triggerLineEvent: true,
      smooth: false,
      data: pageState.value.simulationTargetBeforeSeries,
      symbol: "none",
      lineStyle: { width: 2.6, color: "#f0ad57", type: "dashed" },
      z: 5
    });
    series.push({
      name: text.uncontrolledForecast,
      type: "line",
      triggerLineEvent: true,
      smooth: true,
      connectNulls: true,
      data: uncontrolledForecast.value,
      symbol: "emptyCircle",
      symbolSize: 7,
      lineStyle: { width: 3.4, color: "#84a9ff", type: "dashed" },
      itemStyle: { color: "#ffffff", borderColor: "#84a9ff", borderWidth: 2 },
      z: 6
    });
  }

  if (showAfter) {
    series.push({
      name: text.afterTargetLine,
      type: "line",
      triggerLineEvent: true,
      smooth: false,
      data: pageState.value.simulationTargetAfterSeries,
      symbol: "none",
      lineStyle: { width: 2.6, color: "#c8781c", type: "dotted" },
      z: 5
    });
    series.push({
      name: text.controlledForecast,
      type: "line",
      triggerLineEvent: true,
      smooth: true,
      connectNulls: true,
      data: pageState.value.controlledForecast,
      symbol: "rect",
      symbolSize: 8,
      lineStyle: { width: 3.6, color: "#3d78f4", type: "solid" },
      itemStyle: { color: "#3d78f4", borderColor: "#ffffff", borderWidth: 2 },
      z: 6
    });
  }

  chart.setOption({
    backgroundColor: "transparent",
    tooltip: { show: false },
    legend: {
      type: "scroll",
      top: 0,
      left: 6,
      right: 12,
      itemWidth: 20,
      itemHeight: 12,
      itemGap: 10,
      pageIconSize: 10,
      pageTextStyle: { color: "#7b8ea8" },
      textStyle: { color: "#4f6480", fontSize: 12, fontWeight: 600 },
      data: [
        text.historyActual,
        text.historyAvailable,
        text.targetLine,
        text.minGuaranteeLine,
        text.maxPowerLine,
        ...(showBefore ? [text.uncontrolledForecast, text.beforeTargetLine] : []),
        text.futureAvailable,
        ...(showAfter ? [text.controlledForecast, text.afterTargetLine] : [])
      ]
    },
    grid: { left: 42, right: 18, top: 112, bottom: 34, containLabel: true },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: simulationTimeline.value,
      axisLine: { lineStyle: { color: "#d5dce8" } },
      axisLabel: { color: "#6b7f98" }
    },
    yAxis: {
      type: "value",
      min: 9.6,
      max: 15.4,
      splitNumber: 6,
      splitLine: { lineStyle: { color: "#ebeff5" } },
      axisLabel: { color: "#6b7f98" }
    },
    series
  }, { notMerge: true });
}

function renderBenefitChart() {
  const chart = ensureChart("benefit", benefitChartRef.value);
  if (!chart) return;
  const width = chart.getWidth();
  const compact = width < 760;
  const leftCenter = compact ? "26%" : "28%";
  const rightCenter = compact ? "74%" : "72%";
  const centerY = compact ? "44%" : "45%";
  const ringInnerRadius = compact ? "38%" : "40%";
  const ringOuterRadius = compact ? "62%" : "66%";

  const {
    baseRevenue,
    historyFlexibleRevenue,
    historyTotalRevenue,
    nextHourBaseRevenue,
    nextHourExpectedRevenue,
    nextHourTotalRevenue,
    extraRevenue
  } = pageState.value;

  chart.setOption({
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      formatter: ({ name, value, percent }) => `${name}<br/>${Number(value).toFixed(0)} 元 (${percent}%)`
    },
    title: [
      {
        left: leftCenter,
        top: compact ? "36.5%" : "37.5%",
        textAlign: "center",
        textVerticalAlign: "middle",
        text: `{label|未来1小时收益}\n{value|${nextHourTotalRevenue.toFixed(0)} 元}\n{desc|基础 ${nextHourBaseRevenue.toFixed(0)} | 增量 ${extraRevenue.toFixed(0)}}`,
        textStyle: {
          rich: {
            label: {
              color: "#6f86a0",
              fontSize: 13,
              fontWeight: 600,
              lineHeight: 22
            },
            value: {
              color: "#17355c",
              fontSize: compact ? 24 : 28,
              fontWeight: 700,
              lineHeight: compact ? 34 : 38
            },
            desc: {
              color: "#7c90aa",
              fontSize: compact ? 11 : 12,
              fontWeight: 500,
              lineHeight: 18
            }
          }
        }
      },
      {
        left: rightCenter,
        top: compact ? "36.5%" : "37.5%",
        textAlign: "center",
        textVerticalAlign: "middle",
        text: `{label|历史累计收益}\n{value|${historyTotalRevenue.toFixed(0)} 元}\n{desc|基础 ${baseRevenue.toFixed(0)} | 柔性 ${historyFlexibleRevenue.toFixed(0)}}`,
        textStyle: {
          rich: {
            label: {
              color: "#6f86a0",
              fontSize: 13,
              fontWeight: 600,
              lineHeight: 22
            },
            value: {
              color: "#17355c",
              fontSize: compact ? 24 : 28,
              fontWeight: 700,
              lineHeight: compact ? 34 : 38
            },
            desc: {
              color: "#7c90aa",
              fontSize: compact ? 11 : 12,
              fontWeight: 500,
              lineHeight: 18
            }
          }
        }
      }
    ],
    legend: { show: false },
    series: [
      {
        name: "历史总收益",
        type: "pie",
        radius: [ringInnerRadius, ringOuterRadius],
        center: [rightCenter, centerY],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        emphasis: { scale: false },
        itemStyle: {
          borderColor: "#f7fbff",
          borderWidth: 5,
          borderRadius: 8
        },
        data: [
          { value: baseRevenue, name: text.baseRevenue, itemStyle: { color: "#95b1da" } },
          { value: historyFlexibleRevenue, name: text.flexRevenue, itemStyle: { color: "#2d8b68" } }
        ]
      },
      {
        name: "未来1小时收益",
        type: "pie",
        radius: [ringInnerRadius, ringOuterRadius],
        center: [leftCenter, centerY],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        emphasis: { scale: false },
        itemStyle: {
          borderColor: "#f7fbff",
          borderWidth: 5,
          borderRadius: 8
        },
        data: [
          { value: nextHourBaseRevenue, name: text.baseRevenue, itemStyle: { color: "#c6d4ea" } },
          { value: Math.max(nextHourExpectedRevenue, 0.01), name: "未来额外收益", itemStyle: { color: "#de8b37" } }
        ]
      }
    ]
  });
}

async function renderAllCharts() {
  await nextTick();
  renderHistoryChart();
  renderSimulationChart();
  renderBenefitChart();
}

function handleResize() {
  chartMap.forEach((chart) => chart.resize());
}

watch(limitPower, renderAllCharts);
watch(scenario, renderAllCharts, { deep: true });
watch(simulationMode, renderAllCharts);
watch(pageView, () => {
  limitPower.value = activeViewConfig.value.initialLimit;
  simulationMode.value = "both";
  sliderHovering.value = false;
  renderAllCharts();
});

onMounted(() => {
  renderAllCharts();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  chartMap.forEach((chart) => chart.dispose());
  chartMap.clear();
});
</script>

<template>
  <CollapsiblePanel class="section" :collapsible="false" title="" desc="">
    <div class="advisory-layout">
      <div class="view-switch-bar">
        <div class="view-switch-meta">
          <span class="mini-label">{{ "分析场景" }}</span>
          <strong>{{ pageView === "afternoon" ? "午后调控评估" : "晚高峰调控评估" }}</strong>
          <span>{{ "当前时点" }} {{ simulationCurrentTimeLabel }}</span>
        </div>
        <div class="view-switch-group">
          <button
            v-for="item in pageViewOptions"
            :key="item.key"
            type="button"
            class="view-switch-btn"
            :class="{ active: pageView === item.key }"
            @click="pageView = item.key"
          >
            {{ item.label }}
          </button>
        </div>
      </div>
      <div class="advisory-grid">
        <div class="advisory-card station-basic-card">
          <div class="mini-label">{{ text.basicInfo }}</div>
          <div class="station-name">{{ stationInfo.name }}</div>
          <div class="station-basic-inline">{{ fixedAdvice.stationStrategy }}</div>
        </div>

        <div class="advisory-card power-card">
          <div class="mini-label">{{ "功率边界" }}</div>
          <div class="power-bound-grid">
            <div>
              <span class="metric-label">{{ "接入范围" }}</span>
              <div class="metric-value">{{ fixedAdvice.powerBounds.accessRange }}</div>
            </div>
            <div>
              <span class="metric-label">{{ "最大接入建议" }}</span>
              <div class="metric-value">{{ fixedAdvice.powerBounds.maxAccessSuggestion }}</div>
            </div>
          </div>
          <div class="power-track">
            <span class="left">{{ fixedAdvice.powerBounds.rangeStart }}</span>
            <div class="track-line"><i></i></div>
            <span class="right">{{ fixedAdvice.powerBounds.rangeEnd }}</span>
          </div>
          <div class="muted">{{ "当前按" }} {{ fixedAdvice.powerBounds.accessRange }} {{ "边界进行展示。" }}</div>
        </div>

        <div class="advisory-card compact-detail-card">
          <div class="mini-label">{{ fixedAdvice.dailyStrategies.title }}</div>
          <div class="strategy-compact-list">
            <div v-for="item in fixedAdvice.dailyStrategies.items" :key="item.label" class="strategy-compact-row">
              <span class="strategy-time">{{ item.label }}</span>
              <strong class="strategy-range">{{ item.value }}</strong>
              <span class="strategy-note">{{ item.desc }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </CollapsiblePanel>


  <CollapsiblePanel class="section" :title="text.sectionHistory" :desc="text.sectionHistoryDesc">
    <section class="dual-grid history-layout" style="margin-top:0;">
      <div class="history-chart-card">
        <div class="chart-wrap history-chart-wrap">
          <div ref="historyChartRef" class="flex-page-chart flex-page-chart-history"></div>
          <div
              v-if="historyHoverCard.visible"
              class="chart-hover-card"
              :class="historyHoverCard.mode"
              :style="{ left: `${historyHoverCard.x}px`, top: `${historyHoverCard.y}px` }"
          >
            <div class="chart-hover-title">{{ historyHoverCard.title }}</div>
            <div v-if="historyHoverCard.label" class="chart-hover-label">{{ historyHoverCard.label }}</div>
            <div v-if="historyHoverCard.value" class="chart-hover-value">{{ historyHoverCard.value }}</div>
            <div class="chart-hover-desc">{{ historyHoverCard.desc }}</div>
          </div>
        </div>
      </div>

      <div class="history-side-panel">
        <div class="summary-group">
          <div class="group-title">{{ text.currentStateGroup }}</div>
          <div class="summary-metrics">
            <div class="summary-item">
              <span>{{ text.currentLoad }}</span>
              <strong>{{ pageState.currentLoad.toFixed(2) }}<small>MW</small></strong>
            </div>
            <div class="summary-item">
              <span>{{ text.currentAvailable }}</span>
              <strong>{{ pageState.currentAvailable.toFixed(2) }}<small>MW</small></strong>
            </div>
            <div class="summary-item">
              <span>{{ text.currentDelta }}</span>
              <strong :class="{ danger: pageState.currentDelta < 0 }">
                {{ pageState.currentDelta.toFixed(2) }}<small>MW</small>
              </strong>
            </div>
          </div>
          <div class="status-pill-row">
            <span class="status-pill" :class="pageState.riskStatus">{{ pageState.riskStatus }}</span>
            <span class="muted">{{ pageState.riskHint }}</span>
          </div>
        </div>

        <div class="summary-group">
          <div class="group-title">{{ text.controlBoundaryGroup }}</div>
          <div class="summary-metrics">
            <div class="summary-item">
              <span>{{ text.targetLimit }}</span>
              <strong>{{ Number(limitPower).toFixed(2) }}<small>MW</small></strong>
            </div>
            <div class="summary-item">
              <span>{{ text.minimumGuarantee }}</span>
              <strong>{{ stationInfo.minimumGuarantee.toFixed(2) }}<small>MW</small></strong>
            </div>
            <div class="summary-item">
              <span>{{ text.remainAdjustable }}</span>
              <strong>{{ pageState.remainingAdjustableSpace.toFixed(2) }}<small>MW</small></strong>
            </div>
          </div>
        </div>

        <div class="summary-group">
          <div class="group-title">{{ text.historyJudgeGroup }}</div>
          <div class="summary-metrics">
            <div class="summary-item">
              <span>{{ text.recentPeak }}</span>
              <strong>{{ pageState.recentPeak.toFixed(2) }}<small>MW</small></strong>
            </div>
            <div class="summary-item">
              <span>{{ text.recentAverageLoad }}</span>
              <strong>{{ pageState.recentAverageLoad.toFixed(2) }}<small>MW</small></strong>
            </div>
            <div class="summary-item">
              <span>{{ text.recentAverageAvailable }}</span>
              <strong>{{ pageState.recentAverageAvailable.toFixed(2) }}<small>MW</small></strong>
            </div>
          </div>
        </div>

        <div class="summary-group conclusion-block">
          <div class="group-title">{{ text.conclusionGroup }}</div>
          <div class="conclusion-text">{{ pageState.suggestion }}</div>
          <div class="suggestion-chip-row">
            <span class="suggestion-chip">{{ "建议限峰值" }} {{ pageState.suggestedLimit.toFixed(2) }} MW</span>
          </div>
        </div>
      </div>
    </section>
  </CollapsiblePanel>

  <CollapsiblePanel class="section" :title="text.sectionSimulation" :desc="text.sectionSimulationDesc">
    <section class="simulation-layout" style="margin-top:0;">
      <div class="range-card simulation-range-card">
        <header class="sim-slider-header">
          <span>{{ text.simSliderTitle }}</span>
          <div class="sim-slider-header-value">
            <strong>{{ Number(limitPower).toFixed(2) }} MW</strong>
            <small>较最低保障功率 {{ formatSignedPercent(pageState.growthFromMinimumPercent) }}</small>
          </div>
        </header>
          <div class="sim-slider-summary">
            <div class="sim-slider-summary-item total">
              <span>{{ "总范围" }}</span>
            <strong>{{ displayRangeStart.toFixed(1) }} - {{ stationInfo.ratedPower.toFixed(1) }} MW</strong>
            </div>
            <div class="sim-slider-summary-item adjustable">
              <span>{{ "可调区间" }}</span>
            <strong>{{ stationInfo.minimumGuarantee.toFixed(1) }} - {{ stationInfo.ratedPower.toFixed(1) }} MW</strong>
            </div>
          <div class="sim-slider-summary-item recommend">
            <span>{{ text.recRange }}</span>
            <strong>{{ pageState.recommendedLimitMin.toFixed(1) }} - {{ pageState.recommendedLimitMax.toFixed(1) }} MW</strong>
          </div>
        </div>
        <div class="sim-slider-wrap">
          <div
              class="sim-slider-track"
              @mouseenter="sliderHovering = true"
              @mouseleave="sliderHovering = false"
          >
            <div class="sim-slider-base"></div>
            <div class="sim-slider-adjustable-zone" :style="{ left: `${pageState.sliderMinPercent}%`, width: `${100 - pageState.sliderMinPercent}%` }"></div>
            <div class="sim-slider-disabled-zone" :style="{ width: `${pageState.sliderMinPercent}%` }"></div>
            <div class="sim-slider-fill" :style="{ left: `${pageState.sliderMinPercent}%`, width: `${Math.max(0, pageState.sliderValuePercent - pageState.sliderMinPercent)}%` }"></div>
            <div
                class="sim-slider-recommend"
                :style="{
                left: `${pageState.sliderRecommendedLeftPercent}%`,
                width: `${pageState.sliderRecommendedWidthPercent}%`
              }"
            ></div>
            <div class="sim-slider-boundary minimum" :style="{ left: `${pageState.sliderMinPercent}%` }">
              <span>{{ "调控下限" }}</span>
            </div>
            <div class="sim-slider-boundary maximum" style="left:100%;">
              <span>{{ text.maxPowerLine }}</span>
            </div>
            <div
                v-show="sliderHovering"
                class="sim-slider-tooltip"
                :style="{ left: `clamp(16px, ${pageState.sliderValuePercent}%, calc(100% - 16px))` }"
            >
              <strong>{{ Number(limitPower).toFixed(2) }} MW</strong>
              <span>较最低保障功率 {{ formatSignedPercent(pageState.growthFromMinimumPercent) }}</span>
            </div>
            <input
                :value="limitPower"
                class="sim-slider-input"
                type="range"
                :min="stationInfo.minimumGuarantee"
                :max="stationInfo.ratedPower"
                :step="0.1"
                :style="{ left: `${pageState.sliderMinPercent}%`, width: `${100 - pageState.sliderMinPercent}%` }"
                @input="updateLimitPower($event.target.value)"
                @focus="sliderHovering = true"
                @blur="sliderHovering = false"
                @mousedown="sliderHovering = true"
                @mouseup="sliderHovering = false"
            />
          </div>
          <div class="sim-slider-scale sim-slider-scale-major" style="margin-top: 0">
            <span class="sim-slider-scale-mark align-start" style="left:0%;margin-top: 0">{{ displayRangeStart.toFixed(1) }} MW</span>
            <span class="sim-slider-scale-mark align-center" :style="{ left: `${pageState.sliderMinPercent}%` }">{{ stationInfo.minimumGuarantee.toFixed(1) }} MW</span>
            <span class="sim-slider-scale-mark align-center" :style="{ left: `${pageState.sliderRecommendedLeftPercent}%` }">{{ pageState.recommendedLimitMin.toFixed(1) }} MW</span>
            <span class="sim-slider-scale-mark align-center" :style="{ left: `${pageState.sliderRecommendedRightPercent}%` }">{{ pageState.recommendedLimitMax.toFixed(1) }} MW</span>
            <span class="sim-slider-scale-mark align-end" style="left:100%;">{{ stationInfo.ratedPower.toFixed(1) }} MW</span>
          </div>
        </div>
        <div class="muted">{{ text.simSliderDesc }}</div>
      </div>

      <div class="simulation-content-grid">
        <div class="simulation-main-panel">
          <div class="chart-wrap simulation-chart-wrap">
            <div class="sim-toolbar sim-toolbar-overlay">
              <div class="sim-toggle-group">
                <button type="button" class="sim-toggle" :class="{ active: simulationMode === 'both' }" @click="simulationMode = 'both'">
                  {{ text.showBoth }}
                </button>
                <button type="button" class="sim-toggle" :class="{ active: simulationMode === 'before' }" @click="simulationMode = 'before'">
                  {{ text.showBefore }}
                </button>
                <button type="button" class="sim-toggle" :class="{ active: simulationMode === 'after' }" @click="simulationMode = 'after'">
                  {{ text.showAfter }}
                </button>
              </div>
            </div>
            <div ref="simulationChartRef" class="flex-page-chart flex-page-chart-simulation"></div>
            <div
                v-if="simulationHoverCard.visible"
                class="chart-hover-card"
                :class="simulationHoverCard.mode"
                :style="{ left: `${simulationHoverCard.x}px`, top: `${simulationHoverCard.y}px` }"
            >
              <div class="chart-hover-title">{{ simulationHoverCard.title }}</div>
              <div v-if="simulationHoverCard.label" class="chart-hover-label">{{ simulationHoverCard.label }}</div>
              <div v-if="simulationHoverCard.value" class="chart-hover-value">{{ simulationHoverCard.value }}</div>
              <div class="chart-hover-desc">{{ simulationHoverCard.desc }}</div>
            </div>
          </div>
        </div>

        <div class="simulation-side-panel">
          <div class="sim-result-panel">
            <div class="sim-result-caption">{{ text.simWindowHint }}</div>
            <div class="group-title">{{ text.simEffectTitle }}</div>
            <div class="sim-compare-grid">
              <div class="sim-compare-card before">
                <div class="sim-compare-title">{{ text.beforeCard }}</div>
                <div class="sim-compare-item"><span>{{ text.targetLimit }}</span><strong>{{ pageState.beforeTargetValue.toFixed(2) }} MW</strong></div>
                <div class="sim-compare-item"><span>{{ text.predPeak }}</span><strong>{{ pageState.beforePeak.toFixed(2) }} MW</strong></div>
                <div class="sim-compare-item"><span>{{ text.minCapGap }}</span><strong>{{ pageState.beforeMinGap.toFixed(2) }} MW</strong></div>
                <div class="sim-compare-item"><span>{{ text.overLimit }}</span><strong>{{ pageState.beforeOverSlots > 0 ? "是" : "否" }}</strong></div>
                <div class="sim-compare-item"><span>{{ text.overDuration }}</span><strong>{{ (pageState.beforeOverSlots * 0.5).toFixed(1) }} {{ "小时" }}</strong></div>
              </div>
              <div class="sim-compare-card after">
              <div class="sim-compare-title">{{ text.afterCard }}</div>
              <div class="sim-compare-item"><span>{{ text.targetLimit }}</span><strong>{{ pageState.afterTargetValue.toFixed(2) }} MW</strong></div>
              <div class="sim-compare-item"><span>{{ text.predPeak }}</span><strong>{{ pageState.afterPeak.toFixed(2) }} MW</strong></div>
              <div class="sim-compare-item"><span>{{ text.minCapGap }}</span><strong>{{ pageState.afterMinGap.toFixed(2) }} MW</strong></div>
              <div class="sim-compare-item"><span>{{ text.overLimit }}</span><strong>{{ pageState.afterOverSlots > 0 ? "是" : "否" }}</strong></div>
                <div class="sim-compare-item"><span>{{ text.effectiveDuration }}</span><strong>{{ pageState.effectiveControlDuration.toFixed(1) }} {{ "小时" }}</strong></div>
              </div>
            </div>
            <div class="sim-summary-row">
              <div class="sim-summary-item">
                <span>{{ text.peakDrop }}</span>
                <strong>{{ pageState.peakDrop.toFixed(2) }} MW</strong>
              </div>
              <div class="sim-summary-item">
                <span>{{ text.riskChange }}</span>
                <strong>{{ pageState.riskChanged }}</strong>
              </div>
              <div class="sim-summary-item">
                <span>{{ text.minCapGap }}</span>
                <strong>{{ pageState.afterMinGap.toFixed(2) }} MW</strong>
              </div>
            </div>
            <div class="sim-message-card warning">
              <div class="sim-message-label">{{ "风险提示" }}</div>
              <div class="sim-message-text">{{ pageState.summaryText }}</div>
            </div>
            <div class="sim-message-card conclusion">
              <div class="sim-message-label">{{ text.simConclusionTitle }}</div>
              <div class="sim-message-text">{{ pageState.simulationConclusion }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </CollapsiblePanel>

  <CollapsiblePanel class="section" :title="text.sectionBenefit" :desc="text.sectionBenefitDesc">
    <div class="benefit-layout">
      <div class="benefit-metric-column">
        <div class="stat-card compact primary">
          <div class="label">{{ "未来1小时总收益" }}</div>
          <div class="value">{{ pageState.nextHourTotalRevenue.toFixed(0) }}</div>
          <div class="muted">{{ "元 · 未来1小时总收益 = 基础收益 + 额外收益" }}</div>
        </div>
        <div class="stat-card compact">
          <div class="label">{{ "未来1小时额外收益" }}</div>
          <div class="value">{{ pageState.nextHourExpectedRevenue.toFixed(0) }}</div>
          <div class="muted">{{ "元 · 在基础收益之上，由调控抬升带来的增量收益" }}</div>
        </div>
        <div class="stat-card compact">
          <div class="label">{{ text.totalRevenue }}</div>
          <div class="value">{{ pageState.historyTotalRevenue.toFixed(0) }}</div>
          <div class="muted">{{ "元 · 历史总收益 = 基础收益 + 历史柔性收益" }}</div>
        </div>
        <div class="stat-card compact">
          <div class="label">{{ text.baseRevenue }}</div>
          <div class="value">{{ pageState.baseRevenue.toFixed(0) }}</div>
          <div class="muted">{{ "元 · 基于最低保障功率持续运行形成的历史基础收益" }}</div>
        </div>
      </div>

      <div class="benefit-chart-card">
        <div class="benefit-chart-header">
          <div class="label">{{ text.benefitBuild }}</div>
          <div class="benefit-chart-chip">{{ "先看未来1小时收益" }}</div>
        </div>
        <div class="chart-wrap benefit-chart-wrap">
          <div ref="benefitChartRef" class="flex-page-chart flex-page-chart-benefit"></div>
        </div>
        <div class="benefit-summary-strip">
          <div class="benefit-summary-main">
            <span>{{ "额外收益" }}</span>
            <strong>{{ pageState.extraRevenue.toFixed(0) }} {{ "元" }}</strong>
          </div>
          <div class="benefit-summary-sub">
            <span>{{ "未来1小时总收益" }}</span>
            <strong>{{ pageState.nextHourTotalRevenue.toFixed(0) }} {{ "元" }}</strong>
          </div>
        </div>
        <div class="benefit-note-list">
          <div class="muted">{{ "基础收益：以最低保障功率持续运行形成的基线收益。" }}</div>
          <div class="muted">{{ "额外收益：在基础收益之上，随着调控水平抬升而增加的增量收益。" }}</div>
          <div class="muted">{{ "左侧展示未来1小时收益结构，右侧展示累计历史收益结构。" }}</div>
        </div>
      </div>

      <div class="tou-card benefit-tou-card">
        <div class="label" style="margin-bottom:12px;">{{ text.touTitle }}</div>
        <div class="notes benefit-table-notes">
          <div class="table-row header flex-table benefit-rate-header">
            <span>{{ text.periodType }}</span>
            <span>{{ text.periodRange }}</span>
            <span>{{ text.mockPrice }}</span>
          </div>
          <div v-for="item in touTable" :key="item.type" class="table-row flex-table benefit-rate-row">
            <strong
                class="benefit-rate-type"
                :class="item.type === '峰' ? 'peak' : item.type === '平' ? 'flat' : 'valley'"
            >
              {{ item.type }}
            </strong>
            <span class="benefit-rate-range">{{ item.range }}</span>
            <span class="benefit-rate-price">{{ item.price.toFixed(2) }} {{ "元/kWh" }}</span>
          </div>
        </div>
      </div>
    </div>
  </CollapsiblePanel>
</template>

<style scoped>
.flex-page-chart {
  width: 100%;
}

.flex-page-chart-history {
  height: 100%;
  min-height: clamp(520px, 64vh, 700px);
}

.flex-page-chart-simulation {
  height: 100%;
  min-height: clamp(420px, 58vh, 620px);
}

.flex-page-chart-benefit {
  height: 100%;
  min-height: 380px;
}

.flex-table {
  grid-template-columns: 58px minmax(0, 1fr) 98px;
}

.advisory-layout {
  display: block;
  width: 100%;
}

.view-switch-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  padding: 14px 18px;
  border-radius: 18px;
  border: 1px solid rgba(197, 214, 235, 0.8);
  background: linear-gradient(180deg, rgba(249, 252, 255, 0.96), rgba(241, 247, 255, 0.88));
}

.view-switch-meta {
  display: grid;
  gap: 4px;
}

.view-switch-meta strong {
  color: #17355c;
  font-size: 18px;
  font-weight: 700;
}

.view-switch-meta span:last-child {
  color: #6b7f98;
  font-size: 13px;
}

.view-switch-group {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border-radius: 14px;
  background: rgba(231, 240, 255, 0.92);
}

.view-switch-btn {
  padding: 9px 16px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #547092;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
}

.view-switch-btn.active {
  background: #ffffff;
  color: #245dff;
  box-shadow: 0 8px 18px rgba(57, 104, 199, 0.12);
}

.advisory-hero,
.advisory-card {
  border-radius: 22px;
  border: 1px solid rgba(197, 214, 235, 0.8);
  background: linear-gradient(180deg, rgba(249, 252, 255, 0.96), rgba(241, 247, 255, 0.88));
  box-shadow: 0 12px 28px rgba(38, 74, 118, 0.08);
}

.advisory-hero {
  padding: 24px;
}

.advisory-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  align-items: stretch;
  width: 100%;
}

.advisory-card {
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
}

.power-card {
  padding: 20px;
}

.station-basic-card {
  grid-column: auto;
}

.compact-detail-card {
  min-height: 128px;
}

.strategy-compact-list {
  margin-top: 14px;
  display: grid;
  gap: 8px;
}

.strategy-compact-row {
  display: grid;
  grid-template-columns: 92px 84px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px dashed rgba(197, 214, 235, 0.9);
}

.strategy-compact-row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.strategy-time {
  color: #5f7692;
  font-size: 13px;
}

.strategy-range {
  color: #17355c;
  font-size: 15px;
  font-weight: 700;
}

.strategy-note {
  color: #6c829b;
  font-size: 12px;
  line-height: 1.5;
}

.mini-label {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(47, 107, 255, 0.1);
  color: #2f6bff;
  font-size: 12px;
  font-weight: 600;
}

.advisory-title,
.station-name {
  margin-top: 14px;
  font-size: 22px;
  font-weight: 700;
  color: #17355c;
}

.advisory-text {
  margin: 12px 0 0;
  line-height: 1.75;
  color: #56708f;
}

.station-basic-inline {
  margin-top: 14px;
  color: #56708f;
  font-size: 15px;
  line-height: 1.75;
}

.advisory-rule-bar {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(231, 240, 255, 0.8);
  color: #31527d;
}

.advisory-list {
  margin: 16px 0 0;
  padding-left: 18px;
  color: #48627f;
  line-height: 1.8;
}

.data-source-note {
  margin-top: 16px;
  font-size: 12px;
  color: #7b8ea8;
}

.basic-grid,
.power-bound-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.basic-item,
.rule-row,
.period-row {
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.72);
}

.basic-item span,
.metric-label,
.period-head,
.rule-row span {
  color: #6a7f98;
  font-size: 13px;
}

.basic-item strong,
.rule-row strong,
.period-row strong {
  display: block;
  margin-top: 6px;
  color: #17355c;
}

.metric-value {
  margin-top: 8px;
  font-size: 26px;
  font-weight: 700;
  color: #17355c;
}

.metric-value small {
  margin-left: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #7b8ea8;
}

.power-track {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}

.track-line {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(45, 139, 104, 0.22), rgba(47, 107, 255, 0.3));
}

.track-line i {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #2f6bff;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 4px rgba(47, 107, 255, 0.18);
}

.period-head,
.period-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
}

.period-head {
  margin-top: 16px;
  padding: 0 4px;
}

.period-row + .period-row,
.rule-row + .rule-row {
  margin-top: 10px;
}

.range-chip {
  align-self: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(47, 107, 255, 0.1);
  color: #2f6bff;
  font-weight: 600;
}

.history-side-panel {
  display: grid;
  gap: 14px;
  height: 100%;
}

.history-layout {
  grid-template-columns: minmax(0, 1.65fr) minmax(320px, 0.95fr);
  align-items: stretch;
}

.history-chart-card {
  display: flex;
  align-items: stretch;
  min-height: 100%;
  height: 100%;
  padding: 6px 0;
}

.history-chart-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
}

.simulation-layout {
  display: grid;
  gap: 16px;
}

.simulation-content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.68fr) minmax(340px, 0.92fr);
  gap: 16px;
  align-items: stretch;
}

.summary-group {
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid rgba(197, 214, 235, 0.8);
  background: linear-gradient(180deg, rgba(249, 252, 255, 0.96), rgba(241, 247, 255, 0.88));
  box-shadow: 0 10px 24px rgba(38, 74, 118, 0.06);
}

.group-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 700;
  color: #17355c;
}

.summary-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.summary-item {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.76);
}

.summary-item span {
  display: block;
  color: #6b7f98;
  font-size: 13px;
}

.summary-item strong {
  display: block;
  margin-top: 8px;
  color: #17355c;
  font-size: 24px;
  font-weight: 700;
}

.summary-item strong small {
  margin-left: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #7b8ea8;
}

.summary-item strong.danger {
  color: #d74d3c;
}

.status-pill-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 84px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.status-pill.正常 {
  color: #1f7a55;
  background: rgba(45, 139, 104, 0.12);
}

.status-pill.接近越限 {
  color: #c97716;
  background: rgba(222, 139, 55, 0.14);
}

.status-pill.已越限 {
  color: #d74d3c;
  background: rgba(223, 106, 71, 0.14);
}

.conclusion-block {
  background: linear-gradient(180deg, rgba(255, 248, 235, 0.98), rgba(255, 243, 221, 0.96));
}

.conclusion-text {
  color: #5d4c31;
  line-height: 1.8;
}

.suggestion-chip-row {
  margin-top: 12px;
}

.suggestion-chip {
  display: inline-flex;
  align-items: center;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(222, 139, 55, 0.16);
  color: #a55b18;
  font-size: 13px;
  font-weight: 700;
}

.tou-card {
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid rgba(197, 214, 235, 0.8);
  background: linear-gradient(180deg, rgba(249, 252, 255, 0.96), rgba(241, 247, 255, 0.88));
  box-shadow: 0 10px 24px rgba(38, 74, 118, 0.06);
}

.sim-toolbar {
  display: flex;
  justify-content: flex-end;
}

.sim-toolbar-overlay {
  position: absolute;
  top: 42px;
  right: 12px;
  z-index: 6;
  margin-bottom: 0;
}


.simulation-main-panel {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  height: 100%;
}

.simulation-side-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.simulation-chart-wrap {
  flex: 1;
  display: flex;
  min-height: 0;
  position: relative;
}

.chart-hover-card {
  position: absolute;
  min-width: 170px;
  max-width: 240px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(200, 213, 230, 0.96);
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 12px 28px rgba(45, 72, 109, 0.18);
  transform: translate(14px, calc(-100% - 12px));
  pointer-events: none;
  z-index: 8;
}

.chart-hover-title {
  color: #17355c;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
}

.chart-hover-label {
  margin-top: 4px;
  color: #7a8ea7;
  font-size: 12px;
}

.chart-hover-value {
  margin-top: 4px;
  color: #2f6bff;
  font-size: 14px;
  font-weight: 700;
}

.chart-hover-desc {
  margin-top: 5px;
  color: #5f748f;
  font-size: 12px;
  line-height: 1.6;
}

.simulation-range-card {
  width: 100%;
}

.sim-toggle-group {
  display: inline-flex;
  padding: 4px;
  border-radius: 999px;
  background: rgba(239, 244, 251, 0.94);
  border: 1px solid rgba(199, 213, 232, 0.92);
  box-shadow: 0 8px 20px rgba(56, 88, 132, 0.12);
  gap: 4px;
}

.sim-toggle {
  border: 0;
  background: transparent;
  color: #54708f;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
}

.sim-toggle.active {
  background: #2f6bff;
  color: #fff;
  box-shadow: 0 8px 18px rgba(47, 107, 255, 0.22);
}

.sim-slider-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.sim-slider-header-value {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.sim-slider-header-value strong {
  font-size: 20px;
  color: #1d3557;
  line-height: 1;
}

.sim-slider-header-value small {
  color: #2f6bff;
  font-size: 12px;
  font-weight: 600;
}

.sim-slider-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;
}

.sim-slider-summary-item {
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(200, 212, 228, 0.9);
  background: linear-gradient(180deg, rgba(248, 251, 255, 0.98), rgba(240, 245, 252, 0.94));
}

.sim-slider-summary-item span {
  display: block;
  color: #6b7f98;
  font-size: 11px;
  margin-bottom: 3px;
}

.sim-slider-summary-item strong {
  color: #1d3557;
  font-size: 13px;
}

.sim-slider-summary-item.adjustable {
  border-color: rgba(47, 107, 255, 0.22);
  background: linear-gradient(180deg, rgba(241, 247, 255, 0.98), rgba(229, 239, 255, 0.94));
}

.sim-slider-summary-item.recommend {
  border-color: rgba(52, 168, 83, 0.24);
  background: linear-gradient(180deg, rgba(240, 250, 243, 0.98), rgba(229, 246, 234, 0.95));
}

.sim-slider-wrap {
  margin-top: 14px;
}

.sim-slider-track {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 64px;
  padding-top: 20px;
}

.sim-slider-base,
.sim-slider-adjustable-zone,
.sim-slider-disabled-zone,
.sim-slider-fill,
.sim-slider-recommend {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 999px;
  pointer-events: none;
}

.sim-slider-base {
  left: 0;
  right: 0;
  height: 14px;
  background: linear-gradient(90deg, rgba(215, 223, 235, 0.95), rgba(196, 207, 223, 0.96));
  box-shadow: inset 0 1px 3px rgba(93, 108, 133, 0.16);
}

.sim-slider-adjustable-zone {
  height: 14px;
  background: linear-gradient(90deg, rgba(227, 236, 255, 0.9), rgba(214, 229, 255, 0.95));
  box-shadow: inset 0 0 0 1px rgba(47, 107, 255, 0.08);
}

.sim-slider-disabled-zone {
  left: 0;
  height: 14px;
  background: repeating-linear-gradient(
      135deg,
      rgba(157, 170, 191, 0.28),
      rgba(157, 170, 191, 0.28) 8px,
      rgba(203, 211, 223, 0.55) 8px,
      rgba(203, 211, 223, 0.55) 16px
  );
}

.sim-slider-fill {
  height: 14px;
  background: linear-gradient(90deg, rgba(83, 145, 255, 0.92), rgba(47, 107, 255, 0.98));
  box-shadow: 0 0 0 1px rgba(47, 107, 255, 0.12), 0 6px 14px rgba(47, 107, 255, 0.18);
  z-index: 2;
}

.sim-slider-track input[type="range"] {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  height: 44px;
  margin: 0;
  padding: 0;
  background: transparent;
  appearance: none;
  -webkit-appearance: none;
  z-index: 4;
}

.sim-slider-track input[type="range"]::-webkit-slider-runnable-track {
  height: 14px;
  background: transparent;
}

.sim-slider-track input[type="range"]::-moz-range-track {
  height: 14px;
  background: transparent;
  border: none;
}

.sim-slider-track input[type="range"]::-webkit-slider-thumb {
  width: 24px;
  height: 24px;
  margin-top: -5px;
  border: 4px solid #ffffff;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #8db6ff, #2f6bff 70%);
  box-shadow: 0 8px 18px rgba(47, 107, 255, 0.3);
  cursor: pointer;
  -webkit-appearance: none;
}

.sim-slider-track input[type="range"]::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border: 4px solid #ffffff;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #8db6ff, #2f6bff 70%);
  box-shadow: 0 8px 18px rgba(47, 107, 255, 0.3);
  cursor: pointer;
}

.sim-slider-recommend {
  height: 18px;
  border: 1px solid rgba(34, 132, 70, 0.42);
  background: linear-gradient(90deg, rgba(111, 212, 146, 0.86), rgba(41, 153, 84, 0.96));
  box-shadow: 0 0 0 2px rgba(104, 201, 134, 0.16), 0 6px 14px rgba(45, 154, 87, 0.22);
  z-index: 1;
}

.sim-slider-boundary {
  position: absolute;
  top: 12px;
  width: 0;
  height: 42px;
  border-left: 1px dashed rgba(107, 127, 152, 0.78);
  z-index: 1;
}

.sim-slider-boundary span {
  position: absolute;
  top: -20px;
  transform: translateX(-50%);
  white-space: nowrap;
  color: #6b7f98;
  font-size: 12px;
  font-weight: 600;
}

.sim-slider-tooltip {
  position: absolute;
  top: -8px;
  transform: translate(-50%, -100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 132px;
  padding: 8px 10px;
  border-radius: 12px;
  background: rgba(18, 35, 61, 0.94);
  color: #ffffff;
  box-shadow: 0 10px 24px rgba(18, 35, 61, 0.24);
  pointer-events: none;
  z-index: 5;
}

.sim-slider-tooltip::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -6px;
  width: 10px;
  height: 10px;
  background: rgba(18, 35, 61, 0.94);
  transform: translateX(-50%) rotate(45deg);
}

.sim-slider-tooltip strong {
  font-size: 14px;
  line-height: 1.2;
}

.sim-slider-tooltip span {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.82);
}

.sim-slider-scale {
  position: relative;
  color: #6b7f98;
  font-size: 12px;
}

.sim-slider-scale-major {
  min-height: 18px;
  margin-top: 6px;
  font-weight: 600;
}

.sim-slider-scale-desc {
  min-height: 18px;
  margin-top: 2px;
}

.sim-slider-scale-mark {
  position: absolute;
  top: 0;
  white-space: nowrap;
}

.sim-slider-scale-mark.align-start {
  transform: translateX(0);
  text-align: left;
}

.sim-slider-scale-mark.align-center {
  transform: translateX(-50%);
  text-align: center;
}

.sim-slider-scale-mark.align-end {
  transform: translateX(-100%);
  text-align: right;
}

.sim-result-panel {
  flex: 1;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(197, 214, 235, 0.8);
  background: linear-gradient(180deg, rgba(249, 252, 255, 0.96), rgba(241, 247, 255, 0.88));
  box-shadow: 0 10px 24px rgba(38, 74, 118, 0.06);
}

.sim-result-caption {
  margin-bottom: 10px;
  color: #7b8ea8;
  font-size: 12px;
}

.sim-message-card {
  margin-top: 14px;
  padding: 14px 14px 15px;
  border-radius: 14px;
  border: 1px solid rgba(198, 212, 232, 0.9);
  background: rgba(255, 255, 255, 0.82);
}

.sim-message-card.warning {
  background: linear-gradient(180deg, rgba(255, 247, 235, 0.98), rgba(255, 242, 222, 0.96));
  border-color: rgba(225, 164, 84, 0.34);
}

.sim-message-card.conclusion {
  background: linear-gradient(180deg, rgba(240, 248, 255, 0.98), rgba(231, 241, 255, 0.95));
  border-color: rgba(92, 142, 228, 0.28);
}

.sim-message-label {
  margin-bottom: 8px;
  color: #17355c;
  font-size: 12px;
  font-weight: 700;
}

.sim-message-text {
  color: #4f5f74;
  line-height: 1.75;
}

.sim-compare-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.sim-compare-card {
  padding: 14px;
  border-radius: 16px;
  border: 1px solid transparent;
}

.sim-compare-card.before {
  background: rgba(255, 244, 240, 0.9);
  border-color: rgba(223, 106, 71, 0.35);
}

.sim-compare-card.after {
  background: rgba(238, 248, 243, 0.95);
  border-color: rgba(45, 139, 104, 0.28);
}

.sim-compare-title {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 700;
  color: #17355c;
}

.sim-compare-item + .sim-compare-item {
  margin-top: 10px;
}

.sim-compare-item span {
  display: block;
  color: #6b7f98;
  font-size: 12px;
}

.sim-compare-item strong {
  display: block;
  margin-top: 4px;
  color: #17355c;
  font-size: 18px;
}

.sim-summary-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.sim-summary-item {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.78);
}

.sim-summary-item span {
  display: block;
  color: #6b7f98;
  font-size: 12px;
}

.sim-summary-item strong {
  display: block;
  margin-top: 6px;
  color: #17355c;
  font-size: 18px;
}

.benefit-layout {
  display: grid;
  grid-template-columns: minmax(220px, 0.5fr) minmax(0, 1.22fr) minmax(300px, 0.68fr);
  gap: 18px;
  align-items: stretch;
}

.benefit-metric-column {
  display: grid;
  grid-template-rows: repeat(4, minmax(0, 1fr));
  gap: 12px;
  height: 100%;
}

.stat-card {
  padding: 14px 18px;
  border-radius: 18px;
  border: 1px solid rgba(197, 214, 235, 0.8);
  background: linear-gradient(180deg, rgba(249, 252, 255, 0.96), rgba(241, 247, 255, 0.88));
  box-shadow: 0 10px 24px rgba(38, 74, 118, 0.06);
}

.stat-card.primary {
  border-color: rgba(74, 121, 226, 0.32);
  background: linear-gradient(180deg, rgba(241, 247, 255, 0.98), rgba(229, 239, 255, 0.94));
  box-shadow: 0 14px 28px rgba(57, 104, 199, 0.12);
}

.stat-card.compact {
  min-height: 112px;
}

.stat-card .label {
  color: #6b7f98;
  font-size: 14px;
}

.stat-card .value {
  margin-top: 8px;
  color: #1f4f97;
  font-size: 38px;
  font-weight: 700;
  line-height: 1;
}

.stat-card.primary .value {
  color: #245dff;
}

.stat-card .muted {
  margin-top: 8px;
  color: #5f7795;
  line-height: 1.6;
  font-size: 14px;
}

.benefit-chart-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid rgba(197, 214, 235, 0.8);
  background: linear-gradient(180deg, rgba(249, 252, 255, 0.96), rgba(241, 247, 255, 0.88));
  box-shadow: 0 10px 24px rgba(38, 74, 118, 0.06);
}

.benefit-chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.benefit-chart-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(47, 107, 255, 0.1);
  color: #2f6bff;
  font-size: 12px;
  font-weight: 700;
}

.benefit-chart-wrap {
  flex: 1;
  display: flex;
  min-height: 0;
  min-height: 380px;
}

.benefit-summary-strip {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 12px;
  margin-top: 12px;
}

.benefit-summary-main,
.benefit-summary-sub {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(205, 219, 238, 0.92);
}

.benefit-summary-main span,
.benefit-summary-sub span {
  display: block;
  color: #6b7f98;
  font-size: 13px;
}

.benefit-summary-main strong,
.benefit-summary-sub strong {
  display: block;
  margin-top: 6px;
  color: #17355c;
  font-size: 22px;
  line-height: 1.1;
}

.benefit-summary-main {
  background: linear-gradient(180deg, rgba(239, 246, 255, 0.96), rgba(230, 239, 255, 0.92));
}

.benefit-summary-main strong {
  color: #245dff;
}

.benefit-note-list {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.benefit-tou-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.benefit-table-notes {
  display: grid;
  grid-template-rows: auto repeat(3, minmax(0, 1fr));
  gap: 10px;
  flex: 1;
}

.benefit-rate-header {
  display: grid;
  grid-template-columns: 58px minmax(0, 0.88fr) minmax(132px, 0.62fr);
  padding: 0 10px;
  color: #7c8fa8;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  align-items: center;
}

.benefit-rate-row {
  display: grid;
  grid-template-columns: 58px minmax(0, 0.88fr) minmax(132px, 0.62fr);
  align-items: center;
  padding: 15px 16px;
  border-radius: 14px;
  border: 1px solid rgba(210, 220, 235, 0.9);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(247, 250, 255, 0.94));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
  text-align: center;
  justify-items: center;
}

.benefit-rate-type {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  font-size: 20px;
  font-weight: 700;
}

.benefit-rate-type.peak {
  background: rgba(235, 146, 48, 0.12);
  color: #de8b37;
}

.benefit-rate-type.flat {
  background: rgba(82, 124, 204, 0.12);
  color: #3c6fc6;
}

.benefit-rate-type.valley {
  background: rgba(45, 139, 104, 0.12);
  color: #2d8b68;
}

.benefit-rate-range {
  color: #314962;
  font-size: 15px;
  line-height: 1.7;
  font-weight: 500;
  text-align: center;
}

.benefit-rate-price {
  color: #17355c;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
}

@media (max-width: 720px) {
  .summary-metrics,
  .sim-compare-grid,
  .sim-summary-row,
  .history-layout,
  .simulation-content-grid,
  .benefit-layout,
  .advisory-layout,
  .advisory-left-stack,
  .advisory-grid,
  .advisory-rule-bar,
  .basic-grid,
  .power-bound-grid,
  .flex-table {
    grid-template-columns: 1fr;
  }

  .status-pill-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .view-switch-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .view-switch-group {
    width: 100%;
    flex-wrap: wrap;
  }

  .sim-toolbar {
    justify-content: flex-start;
  }

  .sim-toggle-group {
    flex-wrap: wrap;
    border-radius: 16px;
  }

  .sim-slider-scale {
    flex-direction: column;
  }

  .simulation-layout {
    gap: 12px;
  }

  .simulation-main-panel,
  .simulation-side-panel,
  .benefit-chart-card,
  .benefit-tou-card {
    height: auto;
  }

  .benefit-summary-strip {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .sim-slider-summary {
    grid-template-columns: 1fr;
  }

  .sim-slider-track {
    min-height: 84px;
  }

  .sim-slider-scale-major,
  .sim-slider-scale-desc {
    grid-template-columns: repeat(5, minmax(56px, 1fr));
    overflow-x: auto;
  }
}

</style>
