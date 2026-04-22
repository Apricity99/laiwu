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
  peakDrop: "峰值下降量",
  riskChange: "风险变化",
  riskCleared: "风险解除",
  riskStill: "风险未解除",
  beforeTargetLine: "调控前目标限峰线",
  afterTargetLine: "调控后目标限峰线",
  simSliderTitle: "调整调控后目标限峰值",
  simSliderDesc:
      "滑块总范围为 0-最大功率，实际可滑动区间为最低保障功率至最大功率，绿色为系统推荐范围。",
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

function sanitizeText(value, fallback) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return fallback;
  if (/[À-ɏ]/.test(raw)) return fallback;
  return raw;
}

const stationFallback = {
  name: "莱芜北郊重卡充电站",
  region: "莱城区",
  voltageLevel: "10kV",
  ratedPower: 10,
  contractUpper: 10,
  minimumGuarantee: 5,
  currentTime: "14:00",
  sceneType: "新接入重卡充电站",
  distribution: "集中式接入",
  fast: 8,
  slow: 0,
  operator: "莱芜电网",
  operationStatus: "正常运行",
  currentLoad: 8.2,
  currentUse: 82
};

const historyChartRef = ref(null);
const simulationChartRef = ref(null);
const benefitChartRef = ref(null);
const chartMap = new Map();

// 当前操作员设定的目标限峰值，页面所有摘要指标和仿真图都由它联动。
const limitPower = ref(7.0);
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

const stationOptions = computed(() => scenario.value?.stations || []);
const selectedStation = computed(
    () => stationOptions.value.find((item) => item.id === "laibei") || stationOptions.value[0] || null
);

const stationInfo = computed(() => {
  const station = selectedStation.value || {};
  return {
    name: sanitizeText(station.name, stationFallback.name),
    region: sanitizeText(station.district, stationFallback.region),
    voltageLevel: stationFallback.voltageLevel,
    ratedPower: stationFallback.ratedPower,
    contractUpper: stationFallback.contractUpper,
    minimumGuarantee: stationFallback.minimumGuarantee,
    currentTime: simulationCurrentTimeLabel.value,
    sceneType: sanitizeText(station.sceneType, stationFallback.sceneType),
    distribution: sanitizeText(station.distribution, stationFallback.distribution),
    fast: Number(station.fast || stationFallback.fast),
    slow: Number(station.slow || stationFallback.slow),
    operator: sanitizeText(station.operator, stationFallback.operator),
    operationStatus: sanitizeText(station.operationStatus, stationFallback.operationStatus),
    currentLoad: Number(station.load || stationFallback.currentLoad),
    currentUse: Number(station.use || stationFallback.currentUse)
  };
});

const historyLabelsFallback = ["04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];
const historyActualFallback = [6.32, 6.46, 6.58, 6.5, 6.36, 6.48, 6.66, 6.57, 6.45, 6.62, 6.91];
const historyAvailableFallback = [7.54, 7.46, 7.42, 7.5, 7.66, 7.82, 7.74, 7.63, 7.54, 7.38, 7.09];
const simulationLabelsFallback = ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"];
const uncontrolledForecastFallback = [null, null, null, null, 8.2, 8.55, 8.9, 9.1, 8.95, 8.4, 7.9, 7.5, 7.2];
const futureAvailableFallback = [null, null, null, null, 6.0, 6.1, 6.0, 5.9, 5.8, 6.1, 6.4, 6.8, 7.2];

const touTable = [
  { type: "峰", range: "14:00-18:00", price: 1.25, factor: 0.62 },
  { type: "平", range: "10:00-14:00 / 18:00-22:00", price: 0.83, factor: 0.34 },
  { type: "谷", range: "22:00-次日08:00", price: 0.48, factor: 0.18 }
];

const fixedAdvice = computed(() => {
  const totalPiles = Number(stationInfo.value.fast || 0) + Number(stationInfo.value.slow || 0);
  return {
    badge: text.adviceBadge,
    title: text.adviceTitle,
    desc: text.adviceDesc,
    strategyIntro: text.adviceIntro,
    scopeText: text.adviceScope,
    stationBasic: [
      { label: text.stationName, value: stationInfo.value.name },
      { label: text.stationRegion, value: stationInfo.value.region },
      { label: text.stationVoltage, value: stationInfo.value.voltageLevel },
      { label: text.stationType, value: stationInfo.value.sceneType }
    ],
    powerBounds: {
      ratedPower: stationInfo.value.ratedPower,
      minimumGuarantee: stationInfo.value.minimumGuarantee,
      contractUpper: stationInfo.value.contractUpper,
      rangeText: `${stationInfo.value.minimumGuarantee}-${stationInfo.value.ratedPower} MW`
    },
    generalRules: [
      "最大功率不超过站点协议上限，任何时刻都不能突破额定边界。",
      "最低保障功率用于维持基础补能服务，原则上不得低于 5 MW。",
      "操作员调节的是当前时刻之后的目标限峰线，下方评估结果会随之联动。"
    ],
    stationFacts: [
      { label: "充电枪数量", value: `${totalPiles} 把`, desc: `快充 ${stationInfo.value.fast} / 慢充 ${stationInfo.value.slow}` },
      { label: "当前利用率", value: `${stationInfo.value.currentUse}%`, desc: stationInfo.value.operationStatus },
      { label: "接入方式", value: stationInfo.value.distribution, desc: "该字段优先读取 dashboard 场景台账数据。" }
    ],
    typicalRanges: [
      { label: "00:00-06:00", range: "5-7 MW", desc: "夜间以基础补能为主，可承接低时效订单。" },
      { label: "06:00-12:00", range: "6-8 MW", desc: "白天平稳运行，兼顾园区与区域配送需求。" },
      { label: "12:00-18:00", range: "5-7 MW", desc: "午后及傍晚受配网容量挤压，需优先执行柔性限峰。" },
      { label: "18:00-24:00", range: "6-9 MW", desc: "晚高峰后逐步恢复，结合实时可用容量释放负荷。" }
    ],
    sourceText: text.sourceNote
  };
});

function round(value, digits = 2) {
  return Number(Number(value || 0).toFixed(digits));
}

function sum(list = []) {
  return list.reduce((total, value) => total + Number(value || 0), 0);
}

function buildScaledSeries(source = [], targetPeak = 8.2, minValue = 5) {
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
  const scaled = buildScaledSeries(source.slice(4, 15), 6.92, 6.18);
  const pattern = [-0.3, -0.18, -0.02, -0.1, -0.26, -0.08, 0.12, 0.04, -0.08, 0.08, 0.24];
  const pivot = scaled[Math.floor(scaled.length / 2)] || 6.6;
  return scaled.map((item, index) => {
    const shaped = 6.58 + pattern[index] + (item - pivot) * 0.22;
    return round(Math.max(6.22, Math.min(6.95, shaped)), 2);
  });
}

function buildHistoryAvailableSeries(actualList = [], source = [], fallback = historyAvailableFallback) {
  if (!Array.isArray(source) || !source.length) return fallback;
  const scaled = buildScaledSeries(source.slice(4, 15), 7.86, 7.06);
  const gapPattern = [1.06, 1, 0.84, 0.9, 1.1, 1.18, 1.02, 0.96, 0.88, 0.76, 0.18];
  return actualList.map((actual, index) => {
    const baseline = actual ?? 6.8;
    const candidate = (scaled[index] ?? baseline + 0.8) - 0.08;
    return round(Math.max(candidate, baseline + gapPattern[index]), 2);
  });
}

function buildTargetLineSeries(actualList = [], availableList = [], preferred = 7.0) {
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
  if (["14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"].includes(label)) return touTable[0];
  if (["10:00", "11:00", "12:00", "13:00", "18:00"].includes(label)) return touTable[1];
  return touTable[2];
}

const dashboardLabels = computed(() => scenario.value?.loadSeries?.labels || []);
const simulationCurrentIndex = computed(() => 4);
const simulationCurrentTimeLabel = computed(() => simulationLabels.value[simulationCurrentIndex.value] || stationFallback.currentTime);

const historyLabels = computed(() =>
    dashboardLabels.value.length ? dashboardLabels.value.slice(4, 15) : historyLabelsFallback
);

const historyActual = computed(() => {
  const source = scenario.value?.loadSeries?.actual;
  return buildHistoryActualSeries(source, historyActualFallback);
});

const historyAvailable = computed(() => {
  const source = scenario.value?.loadSeries?.forecast;
  return buildHistoryAvailableSeries(historyActual.value, source, historyAvailableFallback);
});

const simulationLabels = computed(() => simulationLabelsFallback);

const historicalSegment = computed(() => {
  const latest = historyActual.value.slice(-3);
  const a = latest[0] ?? 8.4;
  const b = latest[1] ?? 8.3;
  const c = latest[2] ?? 8.2;
  return [a, b, b, c, c, null, null, null, null, null, null, null, null];
});

const simulationTimeline = computed(() => simulationLabels.value);

const simulationHistoryActual = computed(() => [6.92, 6.84, 6.7, 6.78, 6.88, ...Array(8).fill(null)]);

const simulationHistoryAvailable = computed(() => [7.62, 7.48, 7.34, 7.22, 7.06, ...Array(8).fill(null)]);

const simulationHistoryTarget = computed(() => [7.18, 7.08, 6.98, 6.96, 6.94, ...Array(8).fill(null)]);

const uncontrolledForecast = computed(() => [null, null, null, null, 6.02, 6.58, 6.96, 7.44, 7.86, 8.26, 8.02, 7.68, 7.24]);

const futureAvailable = computed(() => [null, null, null, null, 6.08, 6.13, 6.11, 6.08, 6.04, 5.98, 5.95, 6.02, 6.1]);

function buildControlledForecast(limitMw) {
  const futureHours = ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"];
  const shiftedTemplate = [8.2, 7.4, 6.9, 6.4, 6.1, 5.95, 5.9, 5.85, 5.8];

  const controlledMap = futureHours.map((label, index) => {
    const available = futureAvailable.value[simulationLabels.value.indexOf(label)];
    const hardLimit = Math.min(limitMw, available ?? limitMw);
    const target = Math.max(stationInfo.value.minimumGuarantee, Math.min(shiftedTemplate[index], hardLimit));
    return [label, round(target, 2)];
  });

  return simulationLabels.value.map((label) => {
    const matched = controlledMap.find((item) => item[0] === label);
    return matched ? matched[1] : null;
  });
}

const pageState = computed(() => {
  // 百分比按“相对最低保障功率提升了多少”来算，便于操作员理解当前放开的力度。
  const growthFromMinimumPercent = round(
      stationInfo.value.minimumGuarantee > 0
          ? ((limitPower.value - stationInfo.value.minimumGuarantee) / stationInfo.value.minimumGuarantee) * 100
          : 0,
      1
  );

  const currentAvailable = round(historyAvailable.value[historyAvailable.value.length - 1] ?? 7.12, 2);
  const currentLoad = round(historyActual.value[historyActual.value.length - 1] ?? 6.94, 2);
  const currentDelta = round(currentAvailable - currentLoad, 2);
  const targetLineHistory = buildTargetLineSeries(historyActual.value, historyAvailable.value, Math.min(limitPower.value, currentAvailable - 0.12));

  const controlledForecast = buildControlledForecast(limitPower.value);

  const riskHours = simulationLabels.value.filter((label, index) => {
    const uncontrolled = uncontrolledForecast.value[index];
    const available = futureAvailable.value[index];
    return uncontrolled != null && available != null && uncontrolled > available;
  });

  const currentControlled = controlledForecast[4];
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

  const nextHourLabels = ["14:00", "14:30", "15:00"];
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

  const shiftWindowLabels = ["16:30", "17:00", "17:30", "18:00"];
  const shiftEnergy =
      shiftWindowLabels.reduce((total, label) => {
        const index = simulationLabels.value.indexOf(label);
        const base = uncontrolledForecast.value[index];
        const after = controlledForecast[index];
        return total + Math.max(0, after - Math.min(base ?? 0, after));
      }, 0) * 0.5;

  const peakBenefit = round(nextHourDelta.peakBenefit, 2);
  const shiftBenefit = round(shiftEnergy * 0.83 * 0.34 * 1000, 2);
  const serviceCost = round(-48, 2);
  const netBenefit = round(peakBenefit + shiftBenefit + serviceCost, 2);

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
      ? `若不调控，未来 ${riskHours.join("、")} 时段将超过可用容量；按当前策略调控后，峰值下降至 ${predictedPeakAfter.toFixed(2)} MW。`
      : `按当前策略，未来 4 小时内站点峰值可控制在 ${predictedPeakAfter.toFixed(2)} MW，整体处于可用容量边界内。`;

  const simulationTargetBefore = simulationTimeline.value.map((_, index) => {
    if (index <= 4) {
      return round(Math.min(stationInfo.value.contractUpper - 0.2, (simulationHistoryAvailable.value[index] ?? stationInfo.value.contractUpper) - 0.15), 2);
    }
    return stationInfo.value.contractUpper;
  });

  const simulationTargetAfter = simulationTimeline.value.map((_, index) => {
    if (index < 4) return null;
    if (index === 4) return round(Math.min(limitPower.value, futureAvailable.value[4] ?? limitPower.value), 2);
    const available = futureAvailable.value[index];
    return round(Math.min(limitPower.value, Math.max(stationInfo.value.minimumGuarantee, (available ?? limitPower.value) - 0.05)), 2);
  });

  const simulationTargetBeforeSeries = simulationTimeline.value.map((_, index) => (index < 4 ? null : simulationTargetBefore[index]));
  const simulationTargetAfterSeries = simulationTimeline.value.map((_, index) => (index < 4 ? null : simulationTargetAfter[index]));
  const simulationMinimumLine = simulationTimeline.value.map(() => stationInfo.value.minimumGuarantee);
  const simulationMaximumLine = simulationTimeline.value.map(() => stationInfo.value.ratedPower);
  const recommendedLimitMin = round(Math.max(stationInfo.value.minimumGuarantee, currentAvailable - 0.3), 2);
  const recommendedLimitMax = Math.max(
      recommendedLimitMin,
      round(Math.min(stationInfo.value.ratedPower, currentAvailable + 0.4), 2)
  );
  const sliderMinPercent = round((stationInfo.value.minimumGuarantee / stationInfo.value.ratedPower) * 100, 2);
  const sliderValuePercent = round((limitPower.value / stationInfo.value.ratedPower) * 100, 2);
  const sliderRecommendedLeftPercent = round((recommendedLimitMin / stationInfo.value.ratedPower) * 100, 2);
  const sliderRecommendedWidthPercent = round(
      ((recommendedLimitMax - recommendedLimitMin) / stationInfo.value.ratedPower) * 100,
      2
  );
  const sliderRecommendedRightPercent = round(sliderRecommendedLeftPercent + sliderRecommendedWidthPercent, 2);

  const futureWindowIndexes = simulationTimeline.value.map((_, index) => index).filter((index) => index >= 4);
  const beforeCapacityMarginList = futureWindowIndexes.map((index) =>
      round((futureAvailable.value[index] ?? stationInfo.value.contractUpper) - (uncontrolledForecast.value[index] ?? 0), 2)
  );
  const afterCapacityMarginList = futureWindowIndexes.map((index) =>
      round((futureAvailable.value[index] ?? stationInfo.value.contractUpper) - (controlledForecast[index] ?? 0), 2)
  );
  const beforeOverSlots = beforeCapacityMarginList.filter((item) => item < 0).length;
  const afterOverSlots = afterCapacityMarginList.filter((item) => item < 0).length;
  const beforeMinGap = Math.min(...beforeCapacityMarginList);
  const afterMinGap = Math.min(...afterCapacityMarginList);
  const beforePeak = predictedPeakBefore;
  const afterPeak = predictedPeakAfter;
  const simulationConclusion = `当前策略可将未来峰值由 ${beforePeak.toFixed(2)} MW 压降至 ${afterPeak.toFixed(2)} MW，越限风险由“${beforeOverSlots > 0 ? "存在" : "不存在"}”变为“${afterOverSlots > 0 ? "仍存在" : "解除"}”。`;

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
    afterTargetValue: round(Math.min(limitPower.value, futureAvailable.value[4] ?? limitPower.value), 2),
    beforePeak,
    afterPeak,
    beforeMinGap,
    afterMinGap,
    beforeOverSlots,
    afterOverSlots,
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

  const minimumLine = historyLabels.value.map(() => stationInfo.value.minimumGuarantee);
  const maximumLine = historyLabels.value.map(() => stationInfo.value.ratedPower);

  chart.setOption({
    backgroundColor: "transparent",
    tooltip: { trigger: "axis" },
    legend: {
      top: 0,
      itemWidth: 16,
      itemHeight: 10,
      itemGap: 14,
      textStyle: { color: "#4f6480" }
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
      splitLine: { lineStyle: { color: "#ebeff5" } },
      axisLabel: { color: "#6b7f98" }
    },
    series: [
      {
        name: text.historyActual,
        type: "line",
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
        smooth: false,
        data: minimumLine,
        symbol: "none",
        lineStyle: { width: 2.2, color: "#7184a0", type: "dashed" },
        z: 2
      },
      {
        name: text.maxPowerLine,
        type: "line",
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

  const mode = simulationMode.value;
  const showBefore = mode === "both" || mode === "before";
  const showAfter = mode === "both" || mode === "after";
  const currentTime = simulationCurrentTimeLabel.value;
  const series = [
    {
      name: "simulationOverlay",
      type: "line",
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
      smooth: false,
      data: pageState.value.simulationMaximumLine,
      symbol: "none",
      lineStyle: { width: 2.4, color: "#d56b3d", type: "solid" },
      z: 3
    },
    {
      name: text.minGuaranteeLine,
      type: "line",
      smooth: false,
      data: pageState.value.simulationMinimumLine,
      symbol: "none",
      lineStyle: { width: 2.2, color: "#6f7f95", type: "dashed" },
      z: 2
    },
    {
      name: text.historyActual,
      type: "line",
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
      smooth: true,
      data: futureAvailable.value,
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
      smooth: false,
      data: pageState.value.simulationTargetBeforeSeries,
      symbol: "none",
      lineStyle: { width: 2.6, color: "#f0ad57", type: "dashed" },
      z: 5
    });
    series.push({
      name: text.uncontrolledForecast,
      type: "line",
      smooth: true,
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
      smooth: false,
      data: pageState.value.simulationTargetAfterSeries,
      symbol: "none",
      lineStyle: { width: 2.6, color: "#c8781c", type: "dotted" },
      z: 5
    });
    series.push({
      name: text.controlledForecast,
      type: "line",
      smooth: true,
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
    tooltip: { trigger: "axis" },
    legend: [
      {
        top: 0,
        left: "center",
        itemWidth: 18,
        itemHeight: 10,
        itemGap: 16,
        textStyle: { color: "#4f6480" },
        data: [text.historyActual, text.historyAvailable, text.targetLine, text.minGuaranteeLine, text.maxPowerLine]
      },
      {
        top: 30,
        left: "center",
        itemWidth: 18,
        itemHeight: 10,
        itemGap: 16,
        textStyle: { color: "#4f6480" },
        data: [text.uncontrolledForecast, text.beforeTargetLine, text.futureAvailable]
      },
      {
        top: 60,
        left: "center",
        itemWidth: 18,
        itemHeight: 10,
        itemGap: 16,
        textStyle: { color: "#4f6480" },
        data: [text.controlledForecast, text.afterTargetLine]
      }
    ],
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
      min: 4.8,
      max: 10.2,
      splitNumber: 6,
      splitLine: { lineStyle: { color: "#ebeff5" } },
      axisLabel: { color: "#6b7f98" }
    },
    series
  });
}

function renderBenefitChart() {
  const chart = ensureChart("benefit", benefitChartRef.value);
  if (!chart) return;

  const { baseRevenue, historyFlexibleRevenue, historyTotalRevenue, nextHourExpectedRevenue } = pageState.value;

  chart.setOption({
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      formatter: ({ name, value, percent }) => `${name}<br/>${Number(value).toFixed(0)} 元 (${percent}%)`
    },
    legend: {
      top: 8,
      left: "center",
      itemWidth: 16,
      itemHeight: 10,
      textStyle: { color: "#4f6480" }
    },
    graphic: [
      {
        type: "text",
        left: "center",
        top: "43%",
        style: {
          text: `${historyTotalRevenue.toFixed(0)} 元`,
          textAlign: "center",
          fill: "#17355c",
          fontSize: 24,
          fontWeight: 700
        }
      },
      {
        type: "text",
        left: "center",
        top: "55%",
        style: {
          text: "历史总收益",
          textAlign: "center",
          fill: "#7288a4",
          fontSize: 13
        }
      },
      {
        type: "text",
        left: "center",
        top: "67%",
        style: {
          text: `未来1小时预期收益 ${nextHourExpectedRevenue.toFixed(0)} 元`,
          textAlign: "center",
          fill: "#de8b37",
          fontSize: 13,
          fontWeight: 600
        }
      }
    ],
    series: [
      {
        name: "收益结构",
        type: "pie",
        radius: ["56%", "76%"],
        center: ["50%", "55%"],
        avoidLabelOverlap: false,
        label: {
          show: true,
          formatter: ({ name, percent }) => `${name}\n${percent}%`,
          color: "#4f6480",
          fontSize: 12
        },
        labelLine: {
          length: 12,
          length2: 10,
          lineStyle: { color: "#9fb0c7" }
        },
        itemStyle: {
          borderColor: "#f7fbff",
          borderWidth: 4
        },
        data: [
          { value: baseRevenue, name: text.baseRevenue, itemStyle: { color: "#95b1da" } },
          { value: historyFlexibleRevenue, name: text.flexRevenue, itemStyle: { color: "#2d8b68" } }
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
  <CollapsiblePanel class="section" :collapsible="false" :title="fixedAdvice.title" :desc="fixedAdvice.desc">
    <div class="advisory-layout">
      <div class="advisory-left-stack">
        <div class="advisory-hero">
          <div class="mini-label">{{ text.adviceMini }}</div>
          <div class="advisory-title">{{ text.adviceHeadline }}</div>
          <p class="advisory-text">{{ fixedAdvice.strategyIntro }}</p>
          <p class="advisory-text">{{ fixedAdvice.scopeText }}</p>
          <div class="advisory-rule-bar">
            <span>{{ text.minimumGuarantee }} {{ fixedAdvice.powerBounds.minimumGuarantee }} MW</span>
            <strong>{{ "可调区间" }} {{ fixedAdvice.powerBounds.rangeText }}</strong>
            <span>{{ "额定上限" }} {{ fixedAdvice.powerBounds.ratedPower }} MW</span>
          </div>
          <ul class="advisory-list">
            <li v-for="item in fixedAdvice.generalRules" :key="item">{{ item }}</li>
          </ul>
          <div class="data-source-note">{{ fixedAdvice.sourceText }}</div>
        </div>

        <div class="advisory-card power-card">
          <div class="mini-label">{{ text.powerBounds }}</div>
          <div class="power-bound-grid">
            <div>
              <span class="metric-label">{{ text.maxPowerLine }}</span>
              <div class="metric-value">{{ fixedAdvice.powerBounds.ratedPower }}<small>MW</small></div>
            </div>
            <div>
              <span class="metric-label">{{ text.minimumGuarantee }}</span>
              <div class="metric-value">{{ fixedAdvice.powerBounds.minimumGuarantee }}<small>MW</small></div>
            </div>
          </div>
          <div class="power-track">
            <span class="left">{{ fixedAdvice.powerBounds.minimumGuarantee }} MW</span>
            <div class="track-line"><i></i></div>
            <span class="right">{{ fixedAdvice.powerBounds.ratedPower }} MW</span>
          </div>
          <div class="muted">{{ "协议上限" }} {{ fixedAdvice.powerBounds.contractUpper }} MW{{ "，可调节区间固定展示，不随本页联动修改。" }}</div>
        </div>
      </div>

      <div class="advisory-grid">
        <div class="advisory-card station-basic-card">
          <div class="mini-label">{{ text.basicInfo }}</div>
          <div class="station-name">{{ stationInfo.name }}</div>
          <div class="basic-grid">
            <div v-for="item in fixedAdvice.stationBasic" :key="item.label" class="basic-item">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </div>

        <div class="advisory-card">
          <div class="mini-label">{{ text.stationFacts }}</div>
          <div v-for="item in fixedAdvice.stationFacts" :key="item.label" class="rule-row">
            <div>
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
            <div class="muted">{{ item.desc }}</div>
          </div>
        </div>

        <div class="advisory-card">
          <div class="mini-label">{{ text.typicalRanges }}</div>
          <div class="period-head">
            <span>{{ "时段" }}</span>
            <span>{{ "功率范围" }}</span>
          </div>
          <div v-for="item in fixedAdvice.typicalRanges" :key="item.label" class="period-row">
            <div>
              <strong>{{ item.label }}</strong>
              <div class="muted">{{ item.desc }}</div>
            </div>
            <span class="range-chip">{{ item.range }}</span>
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
    <section class="dual-grid simulation-layout" style="margin-top:0;">
      <div class="simulation-main-panel">
        <div class="sim-toolbar">
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

        <div class="chart-wrap simulation-chart-wrap">
          <div ref="simulationChartRef" class="flex-page-chart flex-page-chart-simulation"></div>
        </div>

        <div class="range-card simulation-range-card" style="margin-top:14px;">
          <header class="sim-slider-header">
            <span>{{ text.simSliderTitle }}</span>
            <div class="sim-slider-header-value">
              <strong>{{ Number(limitPower).toFixed(2) }} MW</strong>
              <small>较最低保障功率 +{{ pageState.growthFromMinimumPercent.toFixed(1) }}%</small>
            </div>
          </header>
          <div class="sim-slider-summary">
            <div class="sim-slider-summary-item total">
              <span>{{ "总范围" }}</span>
              <strong>0 - {{ stationInfo.ratedPower.toFixed(1) }} MW</strong>
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
                <span>{{ text.minimumGuarantee }}</span>
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
                <span>较最低保障功率 +{{ pageState.growthFromMinimumPercent.toFixed(1) }}%</span>
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
              <span class="sim-slider-scale-mark align-start" style="left:0%;margin-top: 0">0 MW</span>
              <span class="sim-slider-scale-mark align-center" :style="{ left: `${pageState.sliderMinPercent}%` }">{{ stationInfo.minimumGuarantee.toFixed(1) }} MW</span>
              <span class="sim-slider-scale-mark align-center" :style="{ left: `${pageState.sliderRecommendedLeftPercent}%` }">{{ pageState.recommendedLimitMin.toFixed(1) }} MW</span>
              <span class="sim-slider-scale-mark align-center" :style="{ left: `${pageState.sliderRecommendedRightPercent}%` }">{{ pageState.recommendedLimitMax.toFixed(1) }} MW</span>
              <span class="sim-slider-scale-mark align-end" style="left:100%;">{{ stationInfo.ratedPower.toFixed(1) }} MW</span>
            </div>
<!--            <div class="sim-slider-scale sim-slider-scale-desc">-->
<!--              <span class="sim-slider-scale-mark align-start" style="left:0%;">{{ "禁调区" }}</span>-->
<!--              <span class="sim-slider-scale-mark align-center" :style="{ left: `${pageState.sliderMinPercent}%` }">{{ "最低保障点" }}</span>-->
<!--              <span class="sim-slider-scale-mark align-center" :style="{ left: `${pageState.sliderRecommendedLeftPercent}%` }">{{ "推荐起点" }}</span>-->
<!--              <span class="sim-slider-scale-mark align-center" :style="{ left: `${pageState.sliderRecommendedRightPercent}%` }">{{ "推荐终点" }}</span>-->
<!--              <span class="sim-slider-scale-mark align-end" style="left:100%;">{{ "最大功率" }}</span>-->
<!--            </div>-->
          </div>
          <div class="muted">{{ text.simSliderDesc }}</div>
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
              <div class="sim-compare-item"><span>{{ text.overDuration }}</span><strong>{{ (pageState.afterOverSlots * 0.5).toFixed(1) }} {{ "小时" }}</strong></div>
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
        </div>

        <div class="summary-group sim-summary-note-card">
          <div class="conclusion-text">{{ pageState.summaryText }}</div>
        </div>

        <div class="summary-group conclusion-block">
          <div class="group-title">{{ text.simConclusionTitle }}</div>
          <div class="conclusion-text">{{ pageState.simulationConclusion }}</div>
        </div>
      </div>
    </section>
  </CollapsiblePanel>

  <CollapsiblePanel class="section" :title="text.sectionBenefit" :desc="text.sectionBenefitDesc">
    <div class="benefit-layout">
      <div class="benefit-metric-column">
        <div class="stat-card compact">
          <div class="label">{{ text.totalRevenue }}</div>
          <div class="value">{{ pageState.historyTotalRevenue.toFixed(0) }}</div>
          <div class="muted">{{ "元 · 历史总收益 = 基础收益 + 历史柔性收益" }}</div>
        </div>
        <div class="stat-card compact">
          <div class="label">{{ text.baseRevenue }}</div>
          <div class="value">{{ pageState.baseRevenue.toFixed(0) }}</div>
          <div class="muted">{{ "元 · 基于最低保障功率的历史基础收入" }}</div>
        </div>
        <div class="stat-card compact">
          <div class="label">{{ text.flexRevenue }}</div>
          <div class="value">{{ pageState.historyFlexibleRevenue.toFixed(0) }}</div>
          <div class="muted">{{ "元 · 由柔性调节贡献的历史增量收益" }}</div>
        </div>
        <div class="stat-card compact">
          <div class="label">{{ text.nextHourRevenue }}</div>
          <div class="value">{{ pageState.nextHourExpectedRevenue.toFixed(0) }}</div>
          <div class="muted">{{ "元 · 模拟测算，仅用于策略评估" }}</div>
        </div>
      </div>

      <div class="benefit-chart-card">
        <div class="label" style="margin-bottom:12px;">{{ text.benefitBuild }}</div>
        <div class="chart-wrap benefit-chart-wrap">
          <div ref="benefitChartRef" class="flex-page-chart flex-page-chart-benefit"></div>
        </div>
        <div class="benefit-note-list">
          <div class="muted">{{ "基础收益：按最低保障功率持续提供服务所得的基线收益。" }}</div>
          <div class="muted">{{ "历史柔性收益：历史时段中超出最低保障功率的柔性出力贡献。" }}</div>
          <div class="muted">{{ "环形图仅用于对比历史总收益内部的收益结构。" }}</div>
        </div>
      </div>

      <div class="tou-card benefit-tou-card">
        <div class="label" style="margin-bottom:12px;">{{ text.touTitle }}</div>
        <div class="notes benefit-table-notes">
          <div class="table-row header flex-table">
            <span>{{ text.periodType }}</span>
            <span>{{ text.periodRange }}</span>
            <span>{{ text.mockPrice }}</span>
          </div>
          <div v-for="item in touTable" :key="item.type" class="table-row flex-table">
            <strong>{{ item.type }}</strong>
            <span>{{ item.range }}</span>
            <span>{{ item.price.toFixed(2) }} {{ "元/kWh" }}</span>
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
  min-height: 270px;
}

.flex-table {
  grid-template-columns: 72px minmax(0, 1fr) 132px;
}

.advisory-layout {
  display: grid;
  grid-template-columns: minmax(320px, 0.95fr) minmax(0, 1.45fr);
  gap: 18px;
}

.advisory-left-stack {
  display: grid;
  gap: 18px;
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.advisory-card {
  padding: 20px;
}

.power-card {
  padding: 20px;
}

.station-basic-card {
  grid-column: 1 / -1;
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

.simulation-side-panel {
  display: flex;
  flex-direction: column;
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
}

.simulation-layout {
  grid-template-columns: minmax(0, 1.72fr) minmax(360px, 0.92fr);
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
  margin-bottom: 12px;
}


.simulation-main-panel {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  height: 100%;
}

.simulation-chart-wrap {
  flex: 1;
  display: flex;
  min-height: 0;
}

.simulation-range-card {
  flex-shrink: 0;
}

.sim-summary-note-card {
  background: linear-gradient(180deg, rgba(241, 247, 255, 0.96), rgba(233, 241, 252, 0.9));
}

.sim-toggle-group {
  display: inline-flex;
  padding: 4px;
  border-radius: 999px;
  background: rgba(225, 234, 246, 0.9);
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
  grid-template-columns: minmax(220px, 0.54fr) minmax(0, 0.96fr) minmax(420px, 1.08fr);
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

.benefit-chart-wrap {
  flex: 1;
  display: flex;
  min-height: 0;
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
  gap: 12px;
  flex: 1;
}

@media (max-width: 720px) {
  .summary-metrics,
  .sim-compare-grid,
  .sim-summary-row,
  .history-layout,
  .simulation-layout,
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

  .simulation-main-panel,
  .simulation-side-panel,
  .benefit-chart-card,
  .benefit-tou-card {
    height: auto;
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
