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
  sectionSimulation: "调控仿真与执行策略区",
  sectionSimulationDesc:
      "根据站点目标峰值与当前枪口负荷情况，生成各充电枪的目标功率分配与调节建议，用于支撑站级限峰策略落地执行。",
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
  sectionBenefit: "未来1小时收益评估",
  sectionBenefitDesc:
      "基于当前目标限峰策略，测算未来1小时内基础收益、调控增益及移峰填谷收益，仅用于策略相对价值评估。",
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
  voltageLevel: "10kV",
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
  accessRange: "1000-1500 kVA",
  minAccessPeriod: "18:00-22:00",
  maxAccessSuggestion: "1500 kVA",
  declaredCapacity: 1500,
  pileCount: 8,
  pileMaxPower: 180,
  gunPerPile: "一桩一枪",
  powerFactor: 1
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
      { label: "00:00 - 08:00", value: "1000 - 1200 kW", desc: "夜间谷段，保持基础负荷运行。" },
      { label: "08:00 - 18:00", value: "1000 - 1300 kW", desc: "日间平时段，按中位范围平稳运行。", highlight: true },
      { label: "18:00 - 22:00", value: "1000 - 1500 kW", desc: "晚高峰重点窗口，允许按最大能力接入。" },
      { label: "22:00 - 24:00", value: "1200 - 1500 kW", desc: "夜间负荷恢复，逐步抬升至建议上限。" }
    ],
    touTable: [
      { type: "峰", range: "14:00-18:00", price: 1.25, factor: 0.62, slots: ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"] },
      { type: "平", range: "10:00-14:00 / 18:00-22:00", price: 0.83, factor: 0.34, slots: ["10:00", "11:00", "12:00", "13:00", "18:00"] },
      { type: "谷", range: "22:00-次日08:00", price: 0.48, factor: 0.18, slots: [] }
    ],
    recommendedStrategyGain: 620
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
      { label: "00:00 - 08:00", value: "1000 - 1200 kW", desc: "夜间谷段，保持基础负荷运行。" },
      { label: "08:00 - 18:00", value: "1000 - 1300 kW", desc: "日间平时段，按中位范围平稳运行。", highlight: true },
      { label: "18:00 - 22:00", value: "1000 - 1500 kW", desc: "晚高峰重点窗口，允许按最大能力接入。" },
      { label: "22:00 - 24:00", value: "1200 - 1500 kW", desc: "夜间负荷恢复，逐步抬升至建议上限。" }
    ],
    touTable: [
      { type: "峰", range: "16:30-19:30", price: 1.28, factor: 0.64, slots: ["16:30", "17:00", "17:30", "18:00", "18:30", "19:00"] },
      { type: "平", range: "08:30-16:30 / 19:30-22:00", price: 0.86, factor: 0.36, slots: ["08:30", "09:30", "10:30", "11:30", "12:30", "13:30", "14:30", "15:00", "15:30", "16:00", "19:30", "20:00", "20:30"] },
      { type: "谷", range: "22:00-次日08:00", price: 0.49, factor: 0.18, slots: ["06:30", "07:30"] }
    ],
    recommendedStrategyGain: 680
  }
};

const activeViewConfig = computed(() => pageViewConfigs[pageView.value]);

const historyChartRef = ref(null);
const simulationChartRef = ref(null);
const benefitCompositionChartRef = ref(null);
const benefitShiftRatioChartRef = ref(null);
const benefitCompareChartRef = ref(null);
const gunStrategyChartRef = ref(null);
const chartMap = new Map();
const strategyView = ref("table");
const strategyFilter = ref("all");
const selectedGunId = ref("");
const gunStrategyChartCollapsed = ref(false);
const historyHoverCard = ref({ visible: false, mode: "line", x: 0, y: 0, title: "", label: "", value: "", desc: "" });
const simulationHoverCard = ref({ visible: false, mode: "line", x: 0, y: 0, title: "", label: "", value: "", desc: "" });

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
    maxAccessSuggestion: activeViewConfig.value.station.maxAccessSuggestion,
    declaredCapacity: Number(activeViewConfig.value.station.declaredCapacity),
    pileCount: Number(activeViewConfig.value.station.pileCount),
    pileMaxPower: Number(activeViewConfig.value.station.pileMaxPower),
    gunPerPile: activeViewConfig.value.station.gunPerPile,
    powerFactor: Number(activeViewConfig.value.station.powerFactor)
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
const recommendedStrategyGain = computed(() => activeViewConfig.value.recommendedStrategyGain ?? 620);
const shiftBenefitCard = computed(() => {
  const priceDiff = pageView.value === "evening" ? 0.79 : 0.42;
  const route = pageView.value === "evening" ? "峰 → 谷" : "峰 → 平";
  return {
    route,
    priceDiff,
    shiftEnergy: round(pageState.value?.nextHourShiftEnergy ?? 0, 2),
    benefit: round(pageState.value?.nextHourShiftBenefit ?? 0, 2)
  };
});

const fixedAdvice = computed(() => {
  return {
    badge: text.adviceBadge,
    title: text.adviceTitle,
    desc: text.adviceDesc,
    strategyIntro: text.adviceIntro,
    scopeText: text.adviceScope,
    stationSummary: "展示充电站基础接入信息、容量边界与典型运行策略。",
    basicInfoItems: [
      // { label: "站点名称", value: stationInfo.value.name },
      { label: "接入电压等级", value: stationInfo.value.voltageLevel },
      { label: "充电站报装容量", value: `${stationInfo.value.declaredCapacity} kVA` },
      { label: "充电桩个数", value: `${stationInfo.value.pileCount} 个` },
      { label: "单桩最大功率", value: `${stationInfo.value.pileMaxPower} kW` },
      { label: "充电枪配置", value: `${stationInfo.value.gunPerPile}（共 ${stationInfo.value.fast + stationInfo.value.slow} 枪）` },
      { label: "功率因数", value: `${stationInfo.value.powerFactor}（功率因数按 1.0 取值时，1 kVA≈1 kW）` },
      // { label: "容量换算说明", value: "功率因数按 1.0 取值时，1 kVA≈1 kW。" }
    ],
    powerBounds: {
      title: "充电站容量",
      max: "1500 kVA",
      min: "1000 kVA",
      desc: "充电站最大容量允许在 1000-1500 kVA 区间内变化。"
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

function calculateFutureHourBenefit(controlledSeries) {
  const currentIndex = simulationCurrentIndex.value;
  const nextHourLabels = simulationLabels.value.slice(currentIndex, Math.min(simulationLabels.value.length, currentIndex + 3));
  const laterLabels = simulationLabels.value.slice(Math.min(simulationLabels.value.length, currentIndex + 3), Math.min(simulationLabels.value.length, currentIndex + 7));

  const baseRevenue = round(
      nextHourLabels.reduce((total, label) => {
        const rule = getTouRule(label);
        return total + stationInfo.value.minimumGuarantee * rule.factor * 50;
      }, 0),
      2
  );

  const peakStats = nextHourLabels.reduce(
      (acc, label) => {
        const index = simulationLabels.value.indexOf(label);
        const before = uncontrolledForecast.value[index] ?? stationInfo.value.minimumGuarantee;
        const after = controlledSeries[index] ?? stationInfo.value.minimumGuarantee;
        const deltaMw = Math.max(0, before - after);
        const energy = deltaMw * 0.5;
        const rule = getTouRule(label);
        acc.peakBenefit += energy * rule.price * rule.factor * 1000;
        acc.cutEnergy += energy;
        return acc;
      },
      { peakBenefit: 0, cutEnergy: 0 }
  );

  const recoveredEnergyRaw = laterLabels.reduce((total, label) => {
    const index = simulationLabels.value.indexOf(label);
    const before = uncontrolledForecast.value[index];
    const after = controlledSeries[index];
    if (before == null || after == null) return total;
    return total + Math.max(0, after - before) * 0.5;
  }, 0);

  const shiftEnergy = round(Math.min(peakStats.cutEnergy * 0.45, recoveredEnergyRaw || peakStats.cutEnergy * 0.35), 2);
  const peakRule = getTouRule(nextHourLabels[0]);
  const betterRule = getTouRule(laterLabels[laterLabels.length - 1] || nextHourLabels[nextHourLabels.length - 1]);
  const priceSpread = Math.max((peakRule.price - betterRule.price), 0.18);
  const shiftBenefit = round(shiftEnergy * priceSpread * 1000, 2);
  const otherControlGain = round(Math.max(0, peakStats.peakBenefit), 2);
  const controlGain = round(otherControlGain + shiftBenefit, 2);
  const totalRevenue = round(baseRevenue + controlGain, 2);
  const shiftContributionPercent = controlGain > 0 ? round((shiftBenefit / controlGain) * 100, 2) : 0;

  return {
    baseRevenue,
    cutEnergy: round(peakStats.cutEnergy, 2),
    shiftEnergy,
    otherControlGain,
    shiftBenefit,
    controlGain,
    totalRevenue,
    shiftContributionPercent
  };
}

const gunStrategyBaseRows = computed(() => {
  const configs = {
    afternoon: [
      { id: "A01", current: 180, baseTarget: 140, minTarget: 120, action: "降功率", priority: "低", reason: "停留时间充足，优先降载" },
      { id: "A02", current: 160, baseTarget: 160, minTarget: 150, action: "优先保障", priority: "高", reason: "高时效订单，维持当前功率" },
      { id: "A03", current: 150, baseTarget: 120, minTarget: 105, action: "降功率", priority: "中", reason: "可接受小幅下调，不影响服务" },
      { id: "A04", current: 130, baseTarget: 90, minTarget: 75, action: "降功率", priority: "低", reason: "当前功率较高，优先调整" },
      { id: "B01", current: 170, baseTarget: 150, minTarget: 135, action: "降功率", priority: "中", reason: "预计离站时间充足，可承担部分降载" },
      { id: "B02", current: 120, baseTarget: 120, minTarget: 110, action: "优先保障", priority: "高", reason: "当前订单优先级高，优先保障" },
      { id: "B03", current: 140, baseTarget: 110, minTarget: 95, action: "降功率", priority: "中", reason: "允许柔性下调，分摊总降载量" },
      { id: "B04", current: 0, baseTarget: 0, minTarget: 0, action: "暂缓启动", priority: "低", reason: "延后接入以控制总峰值" }
    ],
    evening: [
      { id: "A01", current: 210, baseTarget: 165, minTarget: 150, action: "降功率", priority: "低", reason: "晚高峰时段，优先承担降载" },
      { id: "A02", current: 190, baseTarget: 190, minTarget: 175, action: "优先保障", priority: "高", reason: "高时效车辆，保持当前功率" },
      { id: "A03", current: 175, baseTarget: 140, minTarget: 125, action: "降功率", priority: "中", reason: "可接受中等幅度下调" },
      { id: "A04", current: 165, baseTarget: 120, minTarget: 110, action: "降功率", priority: "低", reason: "功率较高且时效宽松，优先下调" },
      { id: "B01", current: 205, baseTarget: 180, minTarget: 165, action: "降功率", priority: "中", reason: "预计停留时间较长，可分摊降载" },
      { id: "B02", current: 150, baseTarget: 150, minTarget: 140, action: "保持", priority: "高", reason: "当前订单优先级高，保持不变" },
      { id: "B03", current: 168, baseTarget: 132, minTarget: 120, action: "降功率", priority: "中", reason: "允许柔性下调，维持服务连续性" },
      { id: "B04", current: 92, baseTarget: 76, minTarget: 68, action: "降功率", priority: "低", reason: "低优先级枪口，承担补充调节" }
    ]
  };
  return configs[pageView.value] || configs.afternoon;
});

const gunStrategySummary = computed(() => {
  const currentPredictedTotal = round(pageState.value.beforePeak, 2);
  const targetPeak = round(limitPower.value, 2);
  const needReduction = round(Math.max(0, currentPredictedTotal - targetPeak), 2);
  const strategyType = needReduction >= 1.2 ? "分级降功率策略" : needReduction >= 0.6 ? "优先级柔调" : "限峰保序";
  return {
    targetPeak,
    currentPredictedTotal,
    needReduction,
    participantCount: gunStrategyRows.value.filter((item) => item.action !== "保持").length,
    totalCount: gunStrategyRows.value.length,
    strategyType
  };
});

const gunStrategyRows = computed(() => {
  const reductionRatio = Math.max(0, Math.min(1, (pageState.value.beforePeak - limitPower.value) / Math.max(pageState.value.beforePeak, 1)));
  return gunStrategyBaseRows.value.map((item, index) => {
    const weight = item.action === "优先保障" || item.action === "保持" ? 0 : item.priority === "低" ? 1 : 0.75;
    const dynamicTarget = item.action === "暂缓启动"
        ? 0
        : item.action === "优先保障" || item.action === "保持"
            ? item.baseTarget
            : Math.max(item.minTarget, Math.round(item.current - (item.current - item.baseTarget) * (0.7 + reductionRatio * 0.9)));
    const target = Math.min(item.current, dynamicTarget);
    const delta = target - item.current;
    let action = item.action;
    if (item.action !== "暂缓启动" && item.action !== "优先保障") {
      action = delta < 0 ? "降功率" : "保持";
    }
    const selected = selectedGunId.value === item.id;
    return {
      ...item,
      target,
      delta,
      displayDelta: delta === 0 ? '0 kW' : `${delta < 0 ? '↓' : '↑'} ${Math.abs(delta)} kW`,
      action,
      selected,
      index,
      reason: item.reason,
      compareValue: Math.max(item.current, target),
      weight
    };
  });
});

const filteredGunStrategyRows = computed(() => {
  if (strategyFilter.value === 'adjusted') return gunStrategyRows.value.filter((item) => item.action !== '保持' && item.action !== '优先保障');
  if (strategyFilter.value === 'unchanged') return gunStrategyRows.value.filter((item) => item.action === '保持' || item.action === '优先保障');
  return gunStrategyRows.value;
});

const gunStrategyDispatchSummary = computed(() => {
  const rows = gunStrategyRows.value;
  const reduceCount = rows.filter((item) => item.action === '降功率').length;
  const holdCount = rows.filter((item) => item.action === '保持' || item.action === '优先保障').length;
  const delayCount = rows.filter((item) => item.action === '暂缓启动').length;
  return `本次调控策略按“优先保障高时效车辆、优先下调低优先级枪口、单枪不低于最小服务功率”的原则生成。系统已将 ${gunStrategySummary.value.needReduction.toFixed(2)} MW 的总降载需求映射到 ${gunStrategySummary.value.participantCount} 把充电枪，其中 ${reduceCount} 把执行降功率，${holdCount} 把保持不变或优先保障，${delayCount} 把暂缓启动。`;
});

const pageState = computed(() => {
  const currentIndex = simulationCurrentIndex.value;
  const growthFromMinimumPercent = round(
      stationInfo.value.minimumGuarantee > 0
          ? ((limitPower.value - stationInfo.value.minimumGuarantee) / stationInfo.value.minimumGuarantee) * 100
          : 0,
      1
  );

  const currentAvailable = round(historyAvailable.value[historyAvailable.value.length - 1] ?? 13.12, 2);
  const currentLoad = round(historyActual.value[historyActual.value.length - 1] ?? 12.86, 2);
  const currentDelta = round(currentAvailable - currentLoad, 2);

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

  const historyFlexibleRevenue = round(
      historyLabels.value.reduce((total, label, index) => {
        const adjustableLoad = Math.max(0, historyActual.value[index] - stationInfo.value.minimumGuarantee);
        const rule = getTouRule(label);
        return total + adjustableLoad * rule.factor * 100;
      }, 0),
      2
  );
  const baseRevenue = round(
      historyLabels.value.reduce((total, label) => {
        const rule = getTouRule(label);
        return total + stationInfo.value.minimumGuarantee * rule.factor * 100;
      }, 0),
      2
  );
  const historyTotalRevenue = round(baseRevenue + historyFlexibleRevenue, 2);

  const benefitMetrics = calculateFutureHourBenefit(controlledForecast);
  const recommendedBenefitMetrics = calculateFutureHourBenefit(buildControlledForecast(suggestedLimit));
  const nextHourBaseRevenue = benefitMetrics.baseRevenue;
  const nextHourControlGain = benefitMetrics.controlGain;
  const nextHourShiftBenefit = benefitMetrics.shiftBenefit;
  const nextHourOtherControlGain = benefitMetrics.otherControlGain;
  const nextHourTotalRevenue = benefitMetrics.totalRevenue;
  const nextHourExpectedRevenue = benefitMetrics.controlGain;
  const extraRevenue = benefitMetrics.controlGain;
  const nextHourCutEnergy = benefitMetrics.cutEnergy;
  const nextHourShiftEnergy = benefitMetrics.shiftEnergy;
  const peakBenefit = benefitMetrics.otherControlGain;
  const shiftBenefit = benefitMetrics.shiftBenefit;
  const serviceCost = 0;
  const netBenefit = benefitMetrics.controlGain;
  const shiftContributionPercent = benefitMetrics.shiftContributionPercent;
  const recommendedControlGain = recommendedStrategyGain.value;

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
    nextHourControlGain,
    nextHourShiftBenefit,
    nextHourOtherControlGain,
    recommendedControlGain,
    shiftContributionPercent,
    extraRevenue,
    nextHourCutEnergy,
    nextHourShiftEnergy,
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
        ...(showBefore ? [text.uncontrolledForecast] : []),
        text.futureAvailable,
        ...(showAfter ? [text.controlledForecast] : [])
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

function renderGunStrategyChart() {
  const chart = ensureChart("gunStrategy", gunStrategyChartRef.value);
  if (!chart) return;
  const rows = filteredGunStrategyRows.value;
  chart.off("click");
  chart.setOption({
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params) => {
        const row = rows[params?.[0]?.dataIndex || 0];
        if (!row) return "";
        return [
          `<strong>${row.id}</strong>`,
          `当前功率：${row.current} kW`,
          `目标功率：${row.target} kW`,
          `调整量：${row.displayDelta}`,
          `调控动作：${row.action}`,
          `执行原因：${row.reason}`
        ].join('<br/>');
      }
    },
    legend: {
      top: 0,
      left: "center",
      itemWidth: 16,
      itemHeight: 10,
      textStyle: { color: "#4f6480", fontSize: 12, fontWeight: 600 },
      data: ["当前功率", "目标功率"]
    },
    grid: { left: 70, right: 20, top: 52, bottom: 24, containLabel: true },
    xAxis: {
      type: "value",
      min: 0,
      max: 300,
      name: "kW",
      nameTextStyle: { color: "#6b7f98", padding: [0, 0, 0, 6] },
      splitLine: { lineStyle: { color: "#ebeff5" } },
      axisLabel: { color: "#6b7f98" },
      axisLine: { lineStyle: { color: "#d5dce8" } }
    },
    yAxis: {
      type: "category",
      data: rows.map((item) => item.id),
      axisLabel: { color: "#6b7f98" },
      axisLine: { lineStyle: { color: "#d5dce8" } }
    },
    series: [
      {
        name: "当前功率",
        type: "bar",
        barWidth: 14,
        itemStyle: {
          color: (params) => rows[params.dataIndex]?.selected ? "#244fcf" : "#95b1da",
          borderRadius: [0, 8, 8, 0]
        },
        data: rows.map((item) => item.current)
      },
      {
        name: "目标功率",
        type: "bar",
        barWidth: 14,
        itemStyle: {
          color: (params) => rows[params.dataIndex]?.selected ? "#1d7f59" : "#4cb284",
          borderRadius: [0, 8, 8, 0]
        },
        data: rows.map((item) => item.target)
      }
    ]
  }, { notMerge: true });
  chart.on("click", (params) => {
    const row = rows[params.dataIndex];
    if (!row) return;
    selectedGunId.value = selectedGunId.value === row.id ? "" : row.id;
    renderGunStrategyChart();
  });
}

function renderBenefitChart() {
  const compositionChart = ensureChart("benefitComposition", benefitCompositionChartRef.value);
  const shiftRatioChart = ensureChart("benefitShiftRatio", benefitShiftRatioChartRef.value);
  const compareChart = ensureChart("benefitCompare", benefitCompareChartRef.value);

  if (compositionChart) {
    compositionChart.setOption({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        formatter: ({ name, value, percent }) => `${name}<br/>${Number(value).toFixed(0)} 元 (${percent}%)`
      },
      series: [
        {
          type: "pie",
          radius: ["58%", "78%"],
          center: ["50%", "50%"],
          label: {
            show: true,
            formatter: ({ name, percent }) => `${name}
${percent}%`,
            color: "#4f6480",
            fontSize: 12
          },
          labelLine: {
            length: 12,
            length2: 10,
            lineStyle: { color: "#9fb0c7" }
          },
          itemStyle: { borderColor: "#f7fbff", borderWidth: 4 },
          data: [
            { value: pageState.value.nextHourBaseRevenue, name: "基础收益", itemStyle: { color: "#95b1da" } },
            { value: Math.max(pageState.value.nextHourControlGain, 0.01), name: "调控增益", itemStyle: { color: "#de8b37" } }
          ]
        }
      ],
      graphic: [
        {
          type: "text",
          left: "center",
          top: "39%",
          style: {
            text: `${pageState.value.nextHourTotalRevenue.toFixed(0)} 元`,
            textAlign: "center",
            fill: "#17355c",
            fontSize: 24,
            fontWeight: 700
          }
        },
        {
          type: "text",
          left: "center",
          top: "53%",
          style: {
            text: "未来1小时总收益",
            textAlign: "center",
            fill: "#7288a4",
            fontSize: 13
          }
        },
        {
          type: "text",
          left: "center",
          top: "66%",
          style: {
            text: `基础 ${pageState.value.nextHourBaseRevenue.toFixed(0)} | 增益 ${pageState.value.nextHourControlGain.toFixed(0)}`,
            textAlign: "center",
            fill: "#6a7f98",
            fontSize: 12,
            fontWeight: 600
          }
        }
      ]
    });
  }

  if (shiftRatioChart) {
    shiftRatioChart.setOption({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        formatter: ({ name, value, percent }) => `${name}<br/>${Number(value).toFixed(0)} 元 (${percent}%)`
      },
      series: [
        {
          type: "pie",
          radius: ["58%", "78%"],
          center: ["50%", "50%"],
          label: {
            show: true,
            formatter: ({ name, percent }) => `${name}
${percent}%`,
            color: "#4f6480",
            fontSize: 12
          },
          labelLine: {
            length: 12,
            length2: 10,
            lineStyle: { color: "#9fb0c7" }
          },
          itemStyle: { borderColor: "#f7fbff", borderWidth: 4 },
          data: [
            { value: Math.max(pageState.value.nextHourShiftBenefit, 0.01), name: "移峰填谷收益", itemStyle: { color: "#2d8b68" } },
            { value: Math.max(pageState.value.nextHourOtherControlGain, 0.01), name: "其他调控收益", itemStyle: { color: "#b8c7df" } }
          ]
        }
      ],
      graphic: [
        {
          type: "text",
          left: "center",
          top: "39%",
          style: {
            text: `${pageState.value.nextHourControlGain.toFixed(0)} 元`,
            textAlign: "center",
            fill: "#17355c",
            fontSize: 24,
            fontWeight: 700
          }
        },
        {
          type: "text",
          left: "center",
          top: "53%",
          style: {
            text: "调控收益总额",
            textAlign: "center",
            fill: "#7288a4",
            fontSize: 13
          }
        },
        {
          type: "text",
          left: "center",
          top: "66%",
          style: {
            text: `移峰填谷 ${pageState.value.shiftContributionPercent.toFixed(0)}%`,
            textAlign: "center",
            fill: "#2d8b68",
            fontSize: 12,
            fontWeight: 600
          }
        }
      ]
    });
  }

  if (compareChart) {
    compareChart.setOption({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params) => {
          const item = params?.[0];
          return `${item?.name}<br/>调控收益 ${Number(item?.value || 0).toFixed(0)} 元`;
        }
      },
      grid: { left: 52, right: 16, top: 24, bottom: 38 },
      xAxis: {
        type: "category",
        data: ["推荐策略", "当前策略"],
        axisLine: { lineStyle: { color: "#d5dce8" } },
        axisLabel: { color: "#6b7f98" }
      },
      yAxis: {
        type: "value",
        name: "元",
        nameTextStyle: { color: "#6b7f98", padding: [0, 0, 0, 8] },
        splitLine: { lineStyle: { color: "#ebeff5" } },
        axisLabel: { color: "#6b7f98" }
      },
      series: [
        {
          type: "bar",
          barWidth: 42,
          data: [
            { value: pageState.value.recommendedControlGain, itemStyle: { color: "#7fb48e", borderRadius: [10, 10, 0, 0] } },
            { value: pageState.value.nextHourControlGain, itemStyle: { color: "#2f6bff", borderRadius: [10, 10, 0, 0] } }
          ],
          label: {
            show: true,
            position: "top",
            color: "#17355c",
            fontWeight: 700,
            formatter: ({ value }) => `${Number(value).toFixed(0)}`
          }
        }
      ]
    });
  }
}

async function renderAllCharts() {
  await nextTick();
  renderHistoryChart();
  renderSimulationChart();
  renderGunStrategyChart();
  renderBenefitChart();
}

function handleResize() {
  chartMap.forEach((chart) => chart.resize());
}

watch(limitPower, renderAllCharts);
watch(scenario, renderAllCharts, { deep: true });
watch(simulationMode, renderAllCharts);
watch(strategyFilter, renderAllCharts);
watch(strategyView, renderAllCharts);
watch(selectedGunId, renderAllCharts);
watch(pageView, () => {
  limitPower.value = activeViewConfig.value.initialLimit;
  simulationMode.value = "both";
  sliderHovering.value = false;
  strategyFilter.value = "all";
  strategyView.value = "table";
  selectedGunId.value = "";
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
        <div class="advisory-card station-basic-card merged-info-card">
          <div class="mini-label">{{ text.basicInfo }}</div>
          <div class="station-name">{{ stationInfo.name }}</div>
          <div class="station-basic-inline">{{ fixedAdvice.stationSummary }}</div>
          <div class="merged-info-layout">
            <div>
              <div class="basic-grid station-basic-grid">
                <div v-for="item in fixedAdvice.basicInfoItems" :key="item.label" class="basic-item">
                  <span>{{ item.label }}</span>
                  <strong>{{ item.value }}</strong>
                </div>
              </div>
            </div>
            <div class="capacity-side-block">
              <div class="mini-label small">{{ fixedAdvice.powerBounds.title }}</div>
              <div class="power-bound-grid">
                <div class="basic-item">
                  <span class="metric-label">最大容量</span>
                  <div class="metric-value">{{ fixedAdvice.powerBounds.max }}</div>
                </div>
                <div class="basic-item">
                  <span class="metric-label">最小容量</span>
                  <div class="metric-value">{{ fixedAdvice.powerBounds.min }}</div>
                </div>
              </div>
              <div class="power-track power-capacity-track">
                <span class="left">1000 kVA</span>
                <div class="track-line"><i></i></div>
                <span class="right">1500 kVA</span>
              </div>
              <div class="station-basic-inline muted">{{ fixedAdvice.powerBounds.desc }}</div>
            </div>
          </div>
        </div>

        <div class="advisory-card compact-detail-card">
          <div class="mini-label">{{ fixedAdvice.dailyStrategies.title }}</div>
          <div class="strategy-compact-list">
            <div
                v-for="item in fixedAdvice.dailyStrategies.items"
                :key="item.label"
                class="strategy-compact-row"
                :class="{ active: item.highlight }"
            >
              <span class="strategy-time">{{ item.label }}</span>
              <strong class="strategy-range">{{ item.value }}</strong>
              <span class="strategy-note">
                {{ item.desc }}
                <em v-if="item.highlight">（当前时段）</em>
              </span>
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

      <div class="gun-strategy-section">
        <div class="strategy-section-head">
          <div>
            <div class="strategy-section-title">充电枪调控策略</div>
            <div class="strategy-section-desc">根据站点目标峰值与当前枪口负荷情况，生成各充电枪的目标功率分配与调节建议，用于支撑站级限峰策略落地执行。</div>
          </div>
        </div>

        <div class="strategy-overview-card">
          <div class="group-title">站级策略总览</div>
          <div class="strategy-overview-grid">
            <div class="strategy-overview-item">
              <span>站点目标峰值</span>
              <strong>{{ gunStrategySummary.targetPeak.toFixed(2) }} MW</strong>
              <small>当前调控策略要求站点总功率不超过该值。</small>
            </div>
            <div class="strategy-overview-item">
              <span>当前预计总功率</span>
              <strong>{{ gunStrategySummary.currentPredictedTotal.toFixed(2) }} MW</strong>
              <small>按未调控预测，未来窗口内站点可能达到的总负荷水平。</small>
            </div>
            <div class="strategy-overview-item">
              <span>需总降载量</span>
              <strong>{{ gunStrategySummary.needReduction.toFixed(2) }} MW</strong>
              <small>为满足目标峰值，需要在枪级层面分摊的总降载量。</small>
            </div>
            <div class="strategy-overview-item">
              <span>参与调控枪数</span>
              <strong>{{ gunStrategySummary.participantCount }} / {{ gunStrategySummary.totalCount }} 把</strong>
              <small>当前参与功率下调或延后启动的充电枪数量。</small>
            </div>
            <div class="strategy-overview-item">
              <span>策略类型</span>
              <strong>{{ gunStrategySummary.strategyType }}</strong>
              <small>结合站级目标峰值与枪口优先级生成的执行策略。</small>
            </div>
          </div>
        </div>

        <div class="strategy-principle-card">
          <div class="group-title">策略生成原则</div>
          <div class="strategy-principle-grid">
            <div class="strategy-principle-item">
              <div class="strategy-principle-title">分配原则</div>
              <div class="strategy-principle-text">优先下调低优先级充电枪功率，优先保障高时效订单与高优先级车辆充电需求。</div>
            </div>
            <div class="strategy-principle-item">
              <div class="strategy-principle-title">执行边界</div>
              <div class="strategy-principle-text">单枪目标功率不低于最小服务功率；站点总功率不高于目标峰值；接近最低保障边界时不再继续下调。</div>
            </div>
            <div class="strategy-principle-item">
              <div class="strategy-principle-title">执行方式</div>
              <div class="strategy-principle-text">策略按当前时刻统一下发，后续每 15 分钟滚动校核一次，并支持人工微调。</div>
            </div>
          </div>
        </div>

        <div class="strategy-chart-card">
          <button type="button" class="strategy-chart-toggle" @click="gunStrategyChartCollapsed = !gunStrategyChartCollapsed">
            <div>
              <div class="group-title">充电枪功率分配对比</div>
              <div class="panel-desc">展示当前功率与目标功率的差异，直观反映各充电枪调节幅度。</div>
            </div>
            <span class="strategy-chart-toggle-icon" :class="{ collapsed: gunStrategyChartCollapsed }">⌃</span>
          </button>
          <div v-show="!gunStrategyChartCollapsed" class="chart-wrap collapsible-chart-wrap">
            <div ref="gunStrategyChartRef" class="flex-page-chart flex-page-chart-gun-strategy"></div>
          </div>
        </div>

        <div class="strategy-detail-card">
          <div class="strategy-detail-head">
            <div>
              <div class="group-title">枪级调控明细</div>
              <div class="panel-desc">各充电枪目标功率与执行建议</div>
            </div>
            <div class="strategy-toolbar">
              <div class="strategy-toggle-group">
                <button type="button" class="strategy-toggle" :class="{ active: strategyView === 'table' }" @click="strategyView = 'table'">表格视图</button>
                <button type="button" class="strategy-toggle" :class="{ active: strategyView === 'card' }" @click="strategyView = 'card'">卡片视图</button>
              </div>
              <div class="strategy-toggle-group filter-group">
                <button type="button" class="strategy-toggle" :class="{ active: strategyFilter === 'all' }" @click="strategyFilter = 'all'">全部充电枪</button>
                <button type="button" class="strategy-toggle" :class="{ active: strategyFilter === 'adjusted' }" @click="strategyFilter = 'adjusted'">仅看参与调控</button>
                <button type="button" class="strategy-toggle" :class="{ active: strategyFilter === 'unchanged' }" @click="strategyFilter = 'unchanged'">仅看保持不变</button>
              </div>
            </div>
          </div>

          <div v-if="strategyView === 'table'" class="strategy-table-wrap">
            <table class="strategy-table">
              <thead>
              <tr>
                <th>充电枪编号</th>
                <th>当前功率</th>
                <th>目标功率</th>
                <th>调整量</th>
                <th>调控动作</th>
                <th>优先级</th>
                <th>执行说明</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="item in filteredGunStrategyRows" :key="item.id" :class="{ active: selectedGunId === item.id }" @click="selectedGunId = selectedGunId === item.id ? '' : item.id">
                <td>{{ item.id }}</td>
                <td>{{ item.current }} kW</td>
                <td>{{ item.target }} kW</td>
                <td>{{ item.displayDelta }}</td>
                <td>{{ item.action }}</td>
                <td><span class="priority-tag" :class="item.priority">{{ item.priority }}</span></td>
                <td>{{ item.reason }}</td>
              </tr>
              </tbody>
              <tfoot>
              <tr>
                <td colspan="7">当前总功率：{{ gunStrategySummary.currentPredictedTotal.toFixed(2) }} MW　｜　目标总功率：{{ gunStrategySummary.targetPeak.toFixed(2) }} MW　｜　总降载量：{{ gunStrategySummary.needReduction.toFixed(2) }} MW</td>
              </tr>
              </tfoot>
            </table>
          </div>

          <div v-else class="strategy-card-grid">
            <div v-for="item in filteredGunStrategyRows" :key="item.id" class="strategy-gun-card" :class="{ active: selectedGunId === item.id }" @click="selectedGunId = selectedGunId === item.id ? '' : item.id">
              <div class="strategy-gun-card-head">
                <strong>{{ item.id }}</strong>
                <span class="priority-tag" :class="item.priority">{{ item.priority }}</span>
              </div>
              <div class="strategy-gun-power"><strong>{{ item.current }} kW</strong><span>→</span><strong>{{ item.target }} kW</strong></div>
              <div class="strategy-gun-meta">调整量：{{ item.displayDelta }}</div>
              <div class="strategy-gun-meta">调控动作：{{ item.action }}</div>
              <div class="strategy-gun-desc">执行说明：{{ item.reason }}</div>
            </div>
          </div>

          <div class="strategy-dispatch-card">
            <div class="group-title">策略下发说明</div>
            <div class="conclusion-text">{{ gunStrategyDispatchSummary }}</div>
          </div>
        </div>
      </div>
    </section>
  </CollapsiblePanel>

  <CollapsiblePanel class="section" :title="text.sectionBenefit" :desc="text.sectionBenefitDesc">
    <div class="benefit-layout">
      <div class="benefit-main-card">
        <div class="benefit-core-grid">
          <div class="benefit-core-card">
            <div class="label">未来1小时总收益</div>
            <div class="value">{{ pageState.nextHourTotalRevenue.toFixed(0) }}</div>
            <div class="muted">当前策略下，未来1小时总收益</div>
            <div class="benefit-core-desc">未来1小时总收益 = 基础收益 + 调控增益</div>
          </div>
          <div class="benefit-core-card">
            <div class="label">未来1小时柔性调控增益</div>
            <div class="value">{{ pageState.nextHourControlGain.toFixed(0) }}</div>
            <div class="muted">由限峰、削峰、容量约束规避等带来的收益增量</div>
            <div class="benefit-core-desc">在基础收益之上，由当前的柔性调控策略带来的增量收益</div>
          </div>
          <div class="benefit-core-card">
            <div class="label">未来1小时移峰填谷收益</div>
            <div class="value">{{ pageState.nextHourShiftBenefit.toFixed(0) }}</div>
            <div class="muted">由于将部分充电需求从高价/高负荷时段转移到更优时段而产生的收益</div>
            <div class="benefit-core-desc">通过将高峰时段负荷后移至更优时段形成的价差收益与容量优化收益</div>
          </div>
        </div>

        <div class="benefit-visual-grid">
          <div class="benefit-visual-card">
            <div class="label" style="margin-bottom: 12px;">未来1小时总收益构成</div>
            <div class="chart-wrap">
              <div ref="benefitCompositionChartRef" class="flex-page-chart flex-page-chart-benefit"></div>
            </div>
          </div>

          <div class="benefit-visual-card">
            <div class="label" style="margin-bottom: 12px;">调控收益策略对比</div>
            <div class="chart-wrap">
              <div ref="benefitCompareChartRef" class="flex-page-chart flex-page-chart-benefit"></div>
            </div>
            <div class="benefit-chart-footnote">
              纵轴为调控收益（元），横轴对比推荐策略与当前策略。
            </div>
          </div>
          <div class="benefit-visual-card">
            <div class="label" style="margin-bottom: 12px;">移峰填谷收益占调控收益比例</div>
            <div class="chart-wrap">
              <div ref="benefitShiftRatioChartRef" class="flex-page-chart flex-page-chart-benefit"></div>
            </div>
            <div class="benefit-chart-footnote">
              移峰填谷贡献 {{ pageState.nextHourShiftBenefit.toFixed(0) }} 元，占比 {{ pageState.shiftContributionPercent.toFixed(0) }}%
            </div>
          </div>

        </div>
      </div>

      <div class="benefit-side-column">
        <div class="tou-card benefit-tou-card">
          <div class="label" style="margin-bottom:12px;">{{ text.touTitle }}</div>
          <div class="benefit-table-notes">
            <div class="benefit-rate-header">
              <span>{{ text.periodType }}</span>
              <span>{{ text.periodRange }}</span>
              <span>{{ text.mockPrice }}</span>
            </div>
            <div
                v-for="item in touTable"
                :key="item.type"
                class="benefit-rate-row"
            >
              <span
                  class="benefit-rate-type"
                  :class="item.type === '峰' ? 'peak' : item.type === '平' ? 'flat' : 'valley'"
              >
                {{ item.type }}
              </span>
              <span class="benefit-rate-range">{{ item.range }}</span>
              <span class="benefit-rate-price">{{ item.price.toFixed(2) }} 元/kVA</span>
            </div>
          </div>
        </div>

        <div class="tou-card shift-benefit-card">
          <div class="label" style="margin-bottom:12px;">移峰填谷收益说明</div>
          <div class="shift-benefit-content">
            <div class="shift-benefit-row">
              <span class="shift-benefit-row-label">测算依据</span>
              <p>测算依据：移峰电量 × 时段价差 + 容量优化带来的策略收益</p>
            </div>
          </div>
          <div class="shift-benefit-meta">
            <div class="shift-benefit-meta-item">
              <span>预计移峰电量</span>
              <strong>{{ shiftBenefitCard.shiftEnergy.toFixed(2) }} MWh</strong>
            </div>
            <div class="shift-benefit-meta-item">
              <span>对应价差区间</span>
              <strong>{{ shiftBenefitCard.route }}，价差 {{ shiftBenefitCard.priceDiff.toFixed(2) }} 元/kVA</strong>
            </div>
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
  grid-template-columns: 58px minmax(0, 1fr) 110px 90px;
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


.station-basic-extra {
  margin-top: 18px;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(205, 219, 238, 0.9);
  background: rgba(255, 255, 255, 0.78);
}

.station-basic-extra-main {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
}

.station-basic-extra-label {
  color: #7a8da6;
  font-size: 14px;
  line-height: 1;
}

.station-basic-extra strong {
  font-size: 32px;
  line-height: 1;
  font-weight: 800;
  color: #1f4f97;
  letter-spacing: -0.02em;
}

.station-basic-extra small {
  color: #56708f;
  font-size: 14px;
}
.station-basic-card {
  grid-column: span 2;
}

.merged-info-card {
  display: flex;
  flex-direction: column;
}

.merged-info-layout {
  margin-top: 14px;
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.85fr);
  gap: 18px;
  align-items: stretch;
}

.capacity-side-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mini-label.small {
  align-self: flex-start;
}

.station-basic-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.compact-detail-card {
  min-height: 128px;
  display: flex;
  flex-direction: column;
}

.strategy-compact-list {
  margin-top: 14px;
  display: grid;
  gap: 8px;
  flex: 1;
  align-content: center;
}

.strategy-compact-row {
  display: grid;
  grid-template-columns: 92px 112px minmax(0, 160px);
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px dashed rgba(197, 214, 235, 0.9);
}

.strategy-compact-row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.strategy-compact-row.active {
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(47, 107, 255, 0.18);
  background: rgba(47, 107, 255, 0.08);
}

.strategy-time {
  color: #5f7692;
  font-size: 13px;
}

.strategy-range {
  color: #17355c;
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
}

.strategy-note {
  color: #6c829b;
  font-size: 12px;
  line-height: 1.5;
  max-width: 160px;
}

.strategy-note em {
  margin-left: 6px;
  color: #2f6bff;
  font-style: normal;
  font-weight: 600;
}

.mini-label {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  width: fit-content;
  max-width: max-content;
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

.tou-card .label {
  margin-bottom: 14px;
  color: #17355c;
  font-size: 16px;
  font-weight: 700;
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

.flex-page-chart-gun-strategy {
  height: 100%;
  min-height: 360px;
}

.gun-strategy-section {
  margin-top: 22px;
  display: grid;
  gap: 16px;
}

.strategy-section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.strategy-section-title {
  font-size: 22px;
  font-weight: 700;
  color: #17355c;
}

.strategy-section-desc {
  margin-top: 6px;
  color: #6b7f98;
  line-height: 1.7;
}

.strategy-overview-card,
.strategy-principle-card,
.strategy-chart-card,
.strategy-detail-card,
.strategy-dispatch-card {
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid rgba(197, 214, 235, 0.8);
  background: linear-gradient(180deg, rgba(249, 252, 255, 0.96), rgba(241, 247, 255, 0.88));
  box-shadow: 0 10px 24px rgba(38, 74, 118, 0.06);
}

.strategy-overview-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0;
  margin-top: 10px;
}

.strategy-overview-item {
  padding: 10px 14px;
  position: relative;
}

.strategy-overview-item + .strategy-overview-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 1px;
  background: rgba(197, 214, 235, 0.9);
}

.strategy-overview-item span,
.strategy-overview-item small {
  display: block;
}

.strategy-overview-item span {
  color: #6b7f98;
  font-size: 13px;
}

.strategy-overview-item strong {
  display: block;
  margin-top: 8px;
  font-size: 24px;
  color: #17355c;
}

.strategy-overview-item small {
  margin-top: 8px;
  color: #7b8ea8;
  line-height: 1.6;
}

.strategy-principle-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 12px;
}

.strategy-principle-item {
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.78);
}

.strategy-principle-title {
  font-size: 15px;
  font-weight: 700;
  color: #17355c;
}

.strategy-principle-text {
  margin-top: 10px;
  color: #5e7591;
  line-height: 1.8;
}

.strategy-chart-head,
.strategy-detail-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
}

.strategy-toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.strategy-toggle-group {
  display: inline-flex;
  padding: 4px;
  border-radius: 999px;
  background: rgba(225, 234, 246, 0.9);
  gap: 4px;
}

.strategy-toggle {
  border: 0;
  background: transparent;
  color: #54708f;
  padding: 8px 12px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
}

.strategy-toggle.active {
  background: #2f6bff;
  color: #fff;
  box-shadow: 0 8px 18px rgba(47, 107, 255, 0.22);
}

.strategy-table-wrap {
  margin-top: 14px;
  overflow-x: auto;
}

.strategy-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(255, 255, 255, 0.74);
  border-radius: 16px;
  overflow: hidden;
}

.strategy-table th,
.strategy-table td {
  padding: 12px 14px;
  border-bottom: 1px solid rgba(223, 231, 242, 0.95);
  text-align: left;
  color: #49627f;
  font-size: 13px;
}

.strategy-table th {
  background: rgba(235, 242, 251, 0.92);
  color: #56708f;
  font-weight: 700;
}

.strategy-table tbody tr {
  cursor: pointer;
}

.strategy-table tbody tr.active,
.strategy-table tbody tr:hover {
  background: rgba(47, 107, 255, 0.06);
}

.strategy-table tfoot td {
  color: #17355c;
  font-weight: 700;
  background: rgba(245, 249, 255, 0.92);
}

.priority-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 42px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.priority-tag.高 {
  color: #2f6bff;
  background: rgba(47, 107, 255, 0.12);
}

.priority-tag.中 {
  color: #c97716;
  background: rgba(222, 139, 55, 0.14);
}

.priority-tag.低 {
  color: #7b8ea8;
  background: rgba(145, 161, 185, 0.16);
}

.strategy-card-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.strategy-gun-card {
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(223, 231, 242, 0.95);
  cursor: pointer;
}

.strategy-gun-card.active {
  border-color: rgba(47, 107, 255, 0.42);
  box-shadow: 0 10px 22px rgba(47, 107, 255, 0.12);
}

.strategy-gun-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.strategy-gun-card-head strong {
  color: #17355c;
  font-size: 16px;
}

.strategy-gun-power {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  color: #17355c;
}

.strategy-gun-power strong {
  font-size: 18px;
}

.strategy-gun-meta,
.strategy-gun-desc {
  margin-top: 10px;
  color: #5e7591;
  line-height: 1.7;
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
  position: sticky;
  top: 10px;
  z-index: 30;
  background: linear-gradient(180deg, rgba(249, 252, 255, 0.98), rgba(241, 247, 255, 0.96));
  box-shadow: 0 14px 28px rgba(38, 74, 118, 0.12);
}

.strategy-chart-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.strategy-chart-toggle-icon {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: rgba(47, 107, 255, 0.08);
  color: #2f6bff;
  font-size: 16px;
  line-height: 1;
  transition: transform 0.2s ease;
}

.strategy-chart-toggle-icon.collapsed {
  transform: rotate(180deg);
}

.collapsible-chart-wrap {
  margin-top: 12px;
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
}

.benefit-table-notes {
  display: grid;
  grid-template-rows: auto repeat(3, minmax(126px, 1fr));
  gap: 10px;
  flex: 1;
}

.benefit-rate-header {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) minmax(160px, 0.68fr);
  padding: 0 12px;
  color: #7c8fa8;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  align-items: center;
}

.benefit-rate-row {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) minmax(160px, 0.68fr);
  align-items: center;
  padding: 20px 22px;
  min-height: 108px;
  border-radius: 16px;
  border: 1px solid rgba(210, 220, 235, 0.92);
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
  border-radius: 12px;
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
  font-size: 20px;
  font-weight: 800;
  text-align: center;
}

.benefit-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(320px, 0.62fr);
  gap: 18px;
  align-items: stretch;
}

.benefit-main-card {
  height: 100%;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid rgba(197, 214, 235, 0.8);
  background: linear-gradient(180deg, rgba(249, 252, 255, 0.96), rgba(241, 247, 255, 0.88));
  box-shadow: 0 10px 24px rgba(38, 74, 118, 0.06);
}

.benefit-core-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.benefit-core-card {
  padding: 16px 18px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(197, 214, 235, 0.7);
}

.benefit-core-card .label {
  color: #6b7f98;
  font-size: 14px;
}

.benefit-core-card .value {
  margin-top: 8px;
  color: #245dff;
  font-size: 38px;
  font-weight: 700;
  line-height: 1;
}

.benefit-core-card .muted {
  margin-top: 8px;
  color: #5f7795;
  line-height: 1.6;
  font-size: 14px;
}

.benefit-core-desc {
  margin-top: 10px;
  color: #5f7693;
  line-height: 1.7;
  font-size: 13px;
}

.benefit-visual-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 16px;
}

.benefit-visual-card {
  padding: 16px 18px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(197, 214, 235, 0.7);
}

.benefit-chart-footnote {
  margin-top: 10px;
  color: #6b7f98;
  font-size: 12px;
  line-height: 1.7;
}

.benefit-side-column {
  display: flex;
  flex-direction: column;
  gap: 18px;
  height: 100%;
  align-items: stretch;
}

.shift-benefit-card {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
}

.shift-benefit-content {
  display: grid;
  gap: 12px;
}

.shift-benefit-row {
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(210, 220, 235, 0.88);
  background: rgba(255, 255, 255, 0.82);
}

.shift-benefit-row.highlight {
  background: linear-gradient(180deg, rgba(239, 246, 255, 0.96), rgba(230, 239, 255, 0.92));
  border-color: rgba(127, 180, 142, 0.38);
}

.shift-benefit-row-label {
  display: block;
  margin-bottom: 6px;
  color: #6b7f98;
  font-size: 13px;
  font-weight: 700;
}

.shift-benefit-row p {
  margin: 0;
  color: #314962;
  font-size: 14px;
  line-height: 1.7;
}

.shift-benefit-row strong {
  color: #245dff;
}

.shift-benefit-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: auto;
}

.shift-benefit-meta-item {
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(205, 219, 238, 0.9);
}

.shift-benefit-meta-item span {
  display: block;
  color: #6b7f98;
  font-size: 13px;
}

.shift-benefit-meta-item strong {
  display: block;
  margin-top: 6px;
  color: #17355c;
  font-size: 18px;
  line-height: 1.4;
}

@media (max-width: 720px) {
  .summary-metrics,
  .sim-compare-grid,
  .sim-summary-row,
  .history-layout,
  .simulation-content-grid,
  .benefit-layout,
  .benefit-core-grid,
  .benefit-visual-grid,
  .benefit-side-column,
  .advisory-layout,
  .advisory-left-stack,
  .advisory-grid,
  .advisory-rule-bar,
  .basic-grid,
  .power-bound-grid,
  .merged-info-layout,
  .flex-table {
    grid-template-columns: 1fr;
  }


  .station-basic-card {
    grid-column: auto;
  }

  .strategy-compact-row {
    grid-template-columns: 1fr;
  }

  .strategy-note {
    max-width: none;
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
