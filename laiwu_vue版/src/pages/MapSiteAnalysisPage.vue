<script setup>
import { computed, ref, watch } from "vue";
import CollapsiblePanel from "../components/CollapsiblePanel.vue";
import FlexibleAccessControlPanel from "../components/FlexibleAccessControlPanel.vue";
import LaiwuTownshipPanel from "../components/LaiwuTownshipPanel.vue";
import LaiwuTownshipStationSnapshot from "../components/LaiwuTownshipStationSnapshot.vue";
import LineChartCard from "../components/LineChartCard.vue";
import MetricGrid from "../components/MetricGrid.vue";
import { useDashboardStore } from "../stores/dashboard";

const store = useDashboardStore();
const scenario = computed(() => store.scenario);
const selectedTownshipKey = ref("");
const selectedFlexibleKey = ref("");

const siteResourceZones = [
  {
    townshipKey: "fengcheng",
    tone: "high",
    resourceCount: 3,
    resourceName: "凤城核心片区10kV资源",
    label: "红色低剩余资源区",
    accessMode: "多站并联接入，当前 10kV 剩余量偏紧",
    totalCapacity: "30 kVA",
    usedCapacity: "22 kVA",
    reserveCapacity: "8 kVA",
    remark: "城区片区虽然有 3 组间隔资源，但已接出占用较高，因此剩余总量偏少"
  },
  {
    townshipKey: "pengquan",
    tone: "medium",
    resourceCount: 2,
    resourceName: "鹏泉综合片区10kV资源",
    label: "黄色中剩余资源区",
    accessMode: "2 组资源协同，支持单站扩容和预留接入",
    totalCapacity: "20 kVA",
    usedCapacity: "9 kVA",
    reserveCapacity: "11 kVA",
    remark: "社区与园区混合负荷，当前仍保留一定 10kV 剩余量，处于黄色中位。"
  },
  {
    townshipKey: "gaozhuang",
    tone: "medium",
    resourceCount: 2,
    resourceName: "高庄开发区10kV资源",
    label: "黄色中剩余资源区",
    accessMode: "2 组资源分区接入，可承接现有站和后续快充扩建",
    totalCapacity: "20 kVA",
    usedCapacity: "10 kVA",
    reserveCapacity: "10 kVA",
    remark: "开发区接入负荷增长较快，现状仍有中等规模 10kV 剩余量。"
  },
  {
    townshipKey: "zhangjiawa",
    tone: "medium",
    resourceCount: 2,
    resourceName: "张家洼工业片区10kV资源",
    label: "黄色中剩余资源区",
    accessMode: "1 主 1 备双间隔接入",
    totalCapacity: "20 kVA",
    usedCapacity: "8 kVA",
    reserveCapacity: "12 kVA",
    remark: "工业周边补能需求稳定，当前剩余量中等，适合继续观察。"
  },
  {
    townshipKey: "kouzhen",
    tone: "high",
    resourceCount: 3,
    resourceName: "口镇高速服务区10kV资源",
    label: "红色低剩余资源区",
    accessMode: "多站接入，大功率场景下 10kV 剩余量偏紧",
    totalCapacity: "30 kVA",
    usedCapacity: "24 kVA",
    reserveCapacity: "6 kVA",
    remark: "高速服务区已有较多接出使用，虽然资源点不少，但剩余总量已经偏少。"
  },
  {
    townshipKey: "hezhuang",
    tone: "low",
    resourceCount: 1,
    resourceName: "和庄预留10kV资源",
    label: "绿色高剩余资源区",
    accessMode: "3 组资源预留，适合后续多站接入",
    totalCapacity: "30 kVA",
    usedCapacity: "7 kVA",
    reserveCapacity: "23 kVA",
    remark: "整体接出较少，剩余总量充足，可作为后续乡镇新建站的重点接入区。"
  },
  {
    townshipKey: "zhaili",
    tone: "low",
    resourceCount: 1,
    resourceName: "寨里预留10kV资源",
    label: "绿色高剩余资源区",
    accessMode: "3 组资源预留，可支持后续站点成片接入",
    totalCapacity: "30 kVA",
    usedCapacity: "9 kVA",
    reserveCapacity: "21 kVA",
    remark: "区域需求仍在培育期，已接出占用不高，因此剩余总量较高。"
  },
  {
    townshipKey: "miaoshan",
    tone: "low",
    resourceCount: 1,
    resourceName: "苗山预留10kV资源",
    label: "绿色高剩余资源区",
    accessMode: "3 组资源预留",
    totalCapacity: "30 kVA",
    usedCapacity: "10 kVA",
    reserveCapacity: "20 kVA",
    remark: "现阶段接出使用较少，适合为后续新站和扩站预留容量。"
  },
  {
    townshipKey: "dawangzhuang",
    tone: "low",
    resourceCount: 1,
    resourceName: "大王庄预留10kV资源",
    label: "绿色高剩余资源区",
    accessMode: "3 组资源预留",
    totalCapacity: "30 kVA",
    usedCapacity: "12 kVA",
    reserveCapacity: "18 kVA",
    remark: "示范期内站点少，已接出负荷低，因此 10kV 剩余量较大。"
  },
  {
    townshipKey: "yangzhuang",
    tone: "low",
    resourceCount: 1,
    resourceName: "杨庄预留10kV资源",
    label: "绿色高剩余资源区",
    accessMode: "3 组资源预留",
    totalCapacity: "30 kVA",
    usedCapacity: "11 kVA",
    reserveCapacity: "19 kVA",
    remark: "资源总量较高，且当前接出占用不大，适合作为高剩余资源点。"
  },
  {
    townshipKey: "fangxia",
    tone: "medium",
    resourceCount: 2,
    resourceName: "方下物流片区10kV资源",
    label: "黄色中剩余资源区",
    accessMode: "双间隔接入，便于物流站点后续扩容",
    totalCapacity: "20 kVA",
    usedCapacity: "9 kVA",
    reserveCapacity: "11 kVA",
    remark: "物流走廊负荷有增长趋势，当前剩余量处于中间区间。"
  },
  {
    townshipKey: "chayekou",
    tone: "low",
    resourceCount: 1,
    resourceName: "茶业口预留10kV资源",
    label: "绿色高剩余资源区",
    accessMode: "3 组资源预留",
    totalCapacity: "30 kVA",
    usedCapacity: "9 kVA",
    reserveCapacity: "21 kVA",
    remark: "旅游季节性较强，但当前接出较少，10kV 剩余量高。"
  },
  {
    townshipKey: "xueye",
    tone: "medium",
    resourceCount: 2,
    resourceName: "雪野旅游片区10kV资源",
    label: "黄色中剩余资源区",
    accessMode: "双间隔接入，支持景区和服务区分开供电",
    totalCapacity: "20 kVA",
    usedCapacity: "8 kVA",
    reserveCapacity: "12 kVA",
    remark: "考虑旅游出行波动，现状剩余量仍有一定弹性，但未达到绿色区。"
  },
  {
    townshipKey: "yangli",
    tone: "low",
    resourceCount: 1,
    resourceName: "羊里预留10kV资源",
    label: "绿色高剩余资源区",
    accessMode: "3 组资源预留",
    totalCapacity: "30 kVA",
    usedCapacity: "10 kVA",
    reserveCapacity: "20 kVA",
    remark: "当前剩余资源充足，可满足首站接入并保留后续扩建空间。"
  },
  {
    townshipKey: "niuquan",
    tone: "medium",
    resourceCount: 2,
    resourceName: "牛泉工贸片区10kV资源",
    label: "黄色中剩余资源区",
    accessMode: "双间隔接入，可兼顾工贸和周边乡镇需求",
    totalCapacity: "20 kVA",
    usedCapacity: "9 kVA",
    reserveCapacity: "11 kVA",
    remark: "工贸运输需求有增长预期，当前剩余量仍可支持后续新增接入。"
  },
  {
    townshipKey: "aishan",
    tone: "high",
    resourceCount: 3,
    resourceName: "艾山钢城片区10kV资源",
    label: "红色低剩余资源区",
    accessMode: "多站接入，10kV 剩余量偏紧",
    totalCapacity: "20 kVA",
    usedCapacity: "15 kVA",
    reserveCapacity: "5 kVA",
    remark: "钢城片区负荷高，虽然有 2 组资源，但已接出较多，剩余量依然偏低。"
  },
  {
    townshipKey: "wenyuan",
    tone: "high",
    resourceCount: 3,
    resourceName: "汶源枢纽片区10kV资源",
    label: "红色低剩余资源区",
    accessMode: "双资源接入，现状扩容空间有限",
    totalCapacity: "20 kVA",
    usedCapacity: "16 kVA",
    reserveCapacity: "4 kVA",
    remark: "汶源是钢城区核心示范区，当前协议剩余量最紧张，因此划为红区。"
  },
  {
    townshipKey: "lixin",
    tone: "medium",
    resourceCount: 2,
    resourceName: "里辛工业片区10kV资源",
    label: "黄色中剩余资源区",
    accessMode: "双间隔接入",
    totalCapacity: "20 kVA",
    usedCapacity: "8 kVA",
    reserveCapacity: "12 kVA",
    remark: "中近期适合新增站点，当前 10kV 剩余量处于中位。"
  },
  {
    townshipKey: "yanzhuang",
    tone: "low",
    resourceCount: 1,
    resourceName: "颜庄预留10kV资源",
    label: "绿色高剩余资源区",
    accessMode: "3 组资源预留",
    totalCapacity: "30 kVA",
    usedCapacity: "10 kVA",
    reserveCapacity: "20 kVA",
    remark: "保持高剩余资源预留状态，待需求进一步提升后分步接入。"
  },
  {
    townshipKey: "xinzhuang",
    tone: "high",
    resourceCount: 3,
    resourceName: "辛庄增长片区10kV资源",
    label: "红色低剩余资源区",
    accessMode: "双资源接入，增长片区剩余量偏紧",
    totalCapacity: "20 kVA",
    usedCapacity: "15 kVA",
    reserveCapacity: "5 kVA",
    remark: "需求增速快，虽然有两路资源接入，但已接出占比高，因此剩余量偏紧。"
  }
];

const townshipResourceMappings = {
  zhangjiawa: [
    {
      id: "zhangjiawa-resource-1",
      name: "张家洼10kV资源1号",
      reserveCapacity: "7.5 kVA",
      accessMode: "接入充电站一座/10kVA",
      remark: "张家洼莱北充电站使用资源点 1，站点侧两路资源合计 15kVA。",
      stationIds: ["laibei"]
    },
    {
      id: "zhangjiawa-resource-2",
      name: "张家洼10kV资源2号",
      reserveCapacity: "7.5 kVA",
      accessMode: "接入充电站一座/10kVA",
      remark: "张家洼莱北充电站使用资源点 2，与资源点 1 合计形成 15kVA 站点接入能力。",
      stationIds: ["laibei"]
    },
    {
      id: "zhangjiawa-resource-3",
      name: "张家洼10kV资源3号",
      reserveCapacity: "5.0 kVA",
      accessMode: "民生负荷保障",
      remark: "该资源点用于民生用电，当前按 5kVA 保障，不接入充电站。",
      connectedLabel: "民生负荷 5kVA"
    }
  ]
};

watch(
    () => store.scenarioKey,
    () => {
      selectedTownshipKey.value = scenario.value.mapTopic.townships[0]?.key || "";
      selectedFlexibleKey.value = siteResourceZones.find((item) => item.tone === "medium")?.townshipKey || "";
    },
    { immediate: true }
);

const townshipStationStats = computed(() =>
    scenario.value.mapTopic.townships.map((township) => {
      const relatedStations = scenario.value.stations.filter((item) => item.townshipKey === township.key);
      return {
        ...township,
        stationCount: relatedStations.length,
        pileCount: relatedStations.reduce((sum, item) => sum + (item.fast || 0) + (item.slow || 0), 0)
      };
    })
);

const resourceSummary = computed(() =>
    townshipStationStats.value.map((township) => {
      const zone = siteResourceZones.find((item) => item.townshipKey === township.key);
      return {
        ...township,
        tone: zone?.tone || "low",
        resourceCount: zone?.resourceCount || 1
      };
    })
);

const namedResourceZones = computed(() =>
    siteResourceZones.map((zone) => {
      const township = scenario.value.mapTopic.townships.find((item) => item.key === zone.townshipKey);
      return {
        ...zone,
        name: township?.name || zone.townshipKey,
        district: township?.district || "-"
      };
    })
);

const siteMetrics = computed(() => {
  const townships = resourceSummary.value;
  return [
    {
      label: "覆盖乡镇",
      value: String(townships.length),
      unit: "个",
      sub: "真实乡镇边界覆盖"
    },
    {
      label: "有站点乡镇",
      value: String(townships.filter((item) => item.stationCount > 0).length),
      unit: "个",
      sub: "当前已有充电站"
    },
    {
      label: "低覆盖乡镇",
      value:  String(townships.filter((item) => item.stationCount === 0).length),
      unit: "个",
      sub: "可作为布点关注区域"
    },
    {
      label: "高承载乡镇",
      value: String(townships.filter((item) => item.pileCount > 0 && item.utilization >= 85).length),
      unit: "个",
      sub: "优先关注增站或扩容"
    }
  ];
});

const selectedTownship = computed(
    () => scenario.value.mapTopic.townships.find((item) => item.key === selectedTownshipKey.value) || scenario.value.mapTopic.townships[0]
);

const townshipTrendSeries = computed(() => {
  const township = selectedTownship.value;
  const relatedStations = scenario.value.stations.filter((item) => item.townshipKey === township.key);
  const stationCount = relatedStations.length;
  const pileCount = relatedStations.reduce((sum, item) => sum + (item.fast || 0) + (item.slow || 0), 0);
  const maxEnergy = Math.max(...township.energySeries, 0);
  const carryStateSeries = pileCount > 0
      ? township.energySeries.map((value) => (maxEnergy > 0 ? Math.round((value / maxEnergy) * township.utilization) : 0))
      : Array.from({ length: scenario.value.mapTopic.townshipLabels.length }, () => 0);

  return {
    stationSeries: Array.from({ length: scenario.value.mapTopic.townshipLabels.length }, () => stationCount || 0),
    pileSeries: township.pileSeries || Array.from({ length: scenario.value.mapTopic.townshipLabels.length }, () => pileCount || 0),
    energySeries: township.energySeries,
    carryStateSeries
  };
});

const townshipSummary = computed(() => {
  const township = selectedTownship.value;
  const latestEnergy = township.energySeries[township.energySeries.length - 1];
  const previousEnergy = township.energySeries[township.energySeries.length - 2];
  const relatedStations = scenario.value.stations.filter((item) => item.townshipKey === township.key);
  const pileCount = relatedStations.reduce((sum, item) => sum + (item.fast || 0) + (item.slow || 0), 0);
  const zone = siteResourceZones.find((item) => item.townshipKey === township.key);

  return [
    { label: "充电站数量", value: `${relatedStations.length}`, desc: "基于当前前端演示中的真实站点台账统计" },
    { label: "充电桩数量", value: `${pileCount}`, desc: "快充桩与慢充桩数量汇总" },
    {
      label: "10kV资源组数",
      value: `${zone?.resourceCount || 1}`,
      desc: zone?.accessMode || "单组资源接入"
    },
    {
      label: "当前充电量",
      value: `${latestEnergy}`,
      desc: `较上一期 ${latestEnergy - previousEnergy >= 0 ? "+" : ""}${latestEnergy - previousEnergy} MWh`
    }
  ];
});

const flexibleControlLabels = ["00:00", "06:00", "10:00", "14:00", "18:00", "22:00"];

const flexibleControlAreas = computed(() =>
    siteResourceZones
        .filter((item) => item.tone === "medium")
        .map((zone, index) => {
          const township = scenario.value.mapTopic.townships.find((item) => item.key === zone.townshipKey);
          const relatedStations = scenario.value.stations.filter((item) => item.townshipKey === zone.townshipKey);
          const reserve = parseFloat(zone.reserveCapacity) || 10;
          const baseCap = Number((reserve / Math.max(relatedStations.length + 1, 2)).toFixed(1));
          const thresholdSeries = [
            Number((reserve * 0.94).toFixed(1)),
            Number((reserve * 0.82).toFixed(1)),
            Number((reserve * 0.58).toFixed(1)),
            Number((reserve * 0.72).toFixed(1)),
            Number((reserve * 0.46).toFixed(1)),
            Number((reserve * 1.08).toFixed(1))
          ];
          const baselineSeries = Array.from({ length: flexibleControlLabels.length }, () =>
              Number((baseCap * Math.max(relatedStations.length, 1)).toFixed(1))
          );

          const stationStrategies = relatedStations.map((station, stationIndex) => {
            const protocolCap = `${Number((baseCap + stationIndex * 0.3).toFixed(1))} kVA`;
            const nightCap = `${Number((baseCap + reserve / Math.max(relatedStations.length, 2) + 1.2).toFixed(1))} kVA`;
            const reduceHour = stationIndex % 2 === 0 ? "18:00" : "10:00";
            const stationShortName = station.mapLabel || station.name.replace("充电站", "");

            return {
              stationId: station.id,
              stationName: station.name,
              stationShortName,
              lng: station.lng,
              lat: station.lat,
              protocolCap,
              nightCap,
              maxAccessText: `协议按 ${protocolCap} 接入，22:00 后可上浮至 ${nightCap}`,
              reduceText: `${reduceHour} 前后建议降至 ${Number((baseCap - 0.4).toFixed(1))} kVA，释放同区资源余量`
            };
          });

          const peakStation = stationStrategies[0]?.stationName || "当前区域重点站";

          return {
            key: zone.townshipKey,
            name: township?.name || zone.townshipKey,
            district: township?.district || "-",
            resourceCount: zone.resourceCount,
            reserveCapacity: zone.reserveCapacity,
            thresholdSeries,
            baselineSeries,
            reduceWindow: "10:00 / 18:00",
            strategySummary: `黄色资源区，优先在夜间释放超协议接入空间，白天分时限额。`,
            regionAdvice: `${peakStation} 可在夜间临时超过协议接入；10:00 与 18:00 建议回落，保证区域内其余 10kV 资源留有冗余。`,
            stationStrategies
          };
        })
);

const flexibleThresholdLabels = ["00:00", "06:00", "10:00", "14:00", "18:00", "22:00"];

const flexibleScenarioInputs = {
  pengquan: {
    totalCapacity: 30,
    otherLoadProtocolMax: 20,
    otherLoadUsageSeries: [15, 16, 17, 18, 20, 20]
  },
  gaozhuang: {
    totalCapacity: 30,
    otherLoadProtocolMax: 20,
    otherLoadUsageSeries: [15, 16, 17, 18, 20, 20]
  },
  zhangjiawa: {
    totalCapacity: 30,
    otherLoadProtocolMax: 20,
    otherLoadUsageSeries: [15, 16, 18, 20, 19, 15],
    stationProtocolMax: 15,
    stationUsageSeries: [10, 11, 13, 15, 14, 10]
  },
  fangxia: {
    totalCapacity: 30,
    otherLoadProtocolMax: 20,
    otherLoadUsageSeries: [15, 16, 17, 18, 20, 20]
  },
  xueye: {
    totalCapacity: 30,
    otherLoadProtocolMax: 20,
    otherLoadUsageSeries: [15, 16, 17, 18, 20, 20]
  },
  niuquan: {
    totalCapacity: 30,
    otherLoadProtocolMax: 20,
    otherLoadUsageSeries: [15, 16, 17, 18, 20, 20]
  },
  lixin: {
    totalCapacity: 30,
    otherLoadProtocolMax: 20,
    otherLoadUsageSeries: [15, 16, 17, 18, 20, 20]
  }
};

const flexibleControlAreasV2 = computed(() =>
  siteResourceZones
    .filter((item) => item.tone === "medium")
    .map((zone) => {
      const township = scenario.value.mapTopic.townships.find((item) => item.key === zone.townshipKey);
      const relatedStations = scenario.value.stations.filter((item) => item.townshipKey === zone.townshipKey);
      const scenarioInput = flexibleScenarioInputs[zone.townshipKey] || {
        totalCapacity: 30,
        otherLoadProtocolMax: 20,
        otherLoadUsageSeries: [15, 16, 17, 18, 20, 20]
      };
      const totalCapacity = scenarioInput.totalCapacity;
      const protocolTotal = scenarioInput.otherLoadProtocolMax;
      const weightSeed = relatedStations.map((_, index) => 1 + (relatedStations.length - index - 1) * 0.08);
      const weightSum = weightSeed.reduce((sum, item) => sum + item, 0) || 1;
      const usageTotalSeries = scenarioInput.otherLoadUsageSeries.map((value) => Number(value.toFixed(1)));
      const thresholdSeries = usageTotalSeries.map((value) => Number(Math.max(0, totalCapacity - value).toFixed(1)));
      const baselineSeries = flexibleThresholdLabels.map(() => Number(totalCapacity.toFixed(1)));
      const actualMin = Number(Math.min(...usageTotalSeries).toFixed(1));
      const actualMax = Number(Math.max(...usageTotalSeries).toFixed(1));
      const maxAccessValue = Number(Math.max(0, totalCapacity - actualMin).toFixed(1));
      const minAccessValue = Number(Math.max(0, totalCapacity - protocolTotal).toFixed(1));
      const minAccessIndices = usageTotalSeries
        .map((value, index) => ({ value, index }))
        .filter((item) => item.value === protocolTotal)
        .map((item) => item.index);
      const minAccessWindowText = minAccessIndices.length
        ? `${flexibleThresholdLabels[minAccessIndices[0]]}-${flexibleThresholdLabels[minAccessIndices[minAccessIndices.length - 1]]}`
        : flexibleThresholdLabels[usageTotalSeries.findIndex((value) => value === actualMax)];

      const stationStrategies = relatedStations.map((station, index) => {
        const weight = weightSeed[index] || 1;
        const share = weight / weightSum;
        const stationProtocolTotal = scenarioInput.stationProtocolMax ?? protocolTotal;
        const stationUsageSeriesBase = Array.isArray(scenarioInput.stationUsageSeries) && scenarioInput.stationUsageSeries.length === usageTotalSeries.length
          ? scenarioInput.stationUsageSeries
          : usageTotalSeries;
        const protocolCapValue = Number(((stationProtocolTotal || totalCapacity * 0.42) * share).toFixed(1));
        const stationShortName = station.mapLabel || station.name.replace(/\u5145\u7535\u7ad9/g, "");
        const usageSeries = stationUsageSeriesBase.map((value) => Number((value * share).toFixed(1)));

        return {
          stationId: station.id,
          stationName: station.name,
          stationShortName,
          lng: station.lng,
          lat: station.lat,
          protocolCap: `${protocolCapValue} kVA`,
          usageSeries,
          usageRange: `${Number(Math.min(...usageSeries).toFixed(1))}-${Number(Math.max(...usageSeries).toFixed(1))} kVA`
        };
      });

      const leadStation = stationStrategies[0]?.stationName || "\u5f53\u524d\u533a\u57df\u91cd\u70b9\u7ad9";
      const minThreshold = Number(Math.min(...thresholdSeries).toFixed(1));
      const maxThreshold = Number(Math.max(...thresholdSeries).toFixed(1));

      return {
        key: zone.townshipKey,
        name: township?.name || zone.townshipKey,
        district: township?.district || "-",
        resourceCount: zone.resourceCount,
        totalCapacity: `${totalCapacity} kVA`,
        usedCapacity: `${protocolTotal} kVA`,
        reserveCapacity: `${maxAccessValue} kVA`,
        usageTotalSeries,
        thresholdSeries,
        baselineSeries,
        reduceWindow: minAccessWindowText,
        buildCap: `${maxAccessValue} kVA`,
        accessRange: `${minAccessValue}-${maxAccessValue} kVA`,
        minAccessWindow: minAccessWindowText,
        strategySummary: "\u4e09\u6761\u66f2\u7ebf\u5206\u522b\u8868\u793a10kV\u8d44\u6e90\u603b\u91cf\u3001\u5df2\u6709\u7ad9\u70b9\u4f7f\u7528\u7535\u529b\u603b\u91cf\u548c\u65b0\u7ad9\u63a5\u5165\u9608\u503c\u66f2\u7ebf\u3002",
        maxAccessText: `\u65b0\u5efa\u7ad9\u70b9\u6700\u5927\u63a5\u5165\u5efa\u8bae\u6309 ${maxAccessValue} kVA \u63a7\u5236\u3002`,
        reduceText: `${minAccessWindowText} 为民生和已有站点协议用满 ${protocolTotal} kVA 的时段，因此建议新站执行最小接入 ${minAccessValue} kVA。`,
        detailText: `新站接入范围最小值取“总量-民生及其他站点协议最大总量”，最大值取“总量-民生及已有站点实际最少使用”，即 ${minAccessValue}-${maxAccessValue} kVA。`,
        regionAdvice: `${township?.name || zone.townshipKey} 区域示例按总资源 ${totalCapacity} kVA绘制，民生及已有站点协议最多使用 ${protocolTotal} kVA、实际最少使用 ${actualMin} kVA，因此新站接入范围建议为 ${minAccessValue}-${maxAccessValue} kV；其中 ${minAccessWindowText} 为从图中读出的“其他负荷用满”时段，新站应执行最小接入。${leadStation} 可作为该区域负荷参考站点。当前阈值最低为 ${minThreshold} kV、最高为 ${maxThreshold} kV。`,
        stationStrategies
      };
    })
);
</script>

<template>
  <MetricGrid :items="siteMetrics" />

  <LaiwuTownshipStationSnapshot
      class="overview-map-hero"
      title="莱芜乡镇/街道10kV间隔资源分区图"
      desc="红黄绿区域表示区域内 10kV 电力资源协议剩余量分区：按资源总量减去已接出使用后的剩余总和计算。红色表示剩余少，黄色表示中等，绿色表示剩余多。"
      :stations="scenario.stations"
      :townships="scenario.mapTopic.townships"
      :resource-zones="siteResourceZones"
      collapsible
  />

  <LaiwuTownshipPanel
      class="section"
      title="乡镇/街道细化决策研判"
      desc="按乡镇/街道查看真实站点分布、现有充电桩数量、历史充电量和承载状态，用于判断是否需要新增充电站。"
      :labels="scenario.mapTopic.townshipLabels"
      :stations="scenario.stations"
      :townships="scenario.mapTopic.townships"
      :resource-zones="siteResourceZones"
      :resource-mappings="townshipResourceMappings"
      :selected-key="selectedTownshipKey"
      @select="selectedTownshipKey = $event"
      collapsible
  >
    <template #actions>
      <div class="tabs single-line-tabs">
        <button
            v-for="item in scenario.mapTopic.townships"
            :key="item.key"
            class="tab-btn"
            :class="{ active: item.key === selectedTownshipKey }"
            @click="selectedTownshipKey = item.key"
        >
          {{ item.name }}
        </button>
      </div>
    </template>
  </LaiwuTownshipPanel>

  <FlexibleAccessControlPanel
      v-if="false"
      class="section"
      title="柔性调节管控"
      desc="针对黄色资源区域展示分时柔性阈值曲线，并给出分站最大接入与关键时点降载策略。"
      :labels="flexibleThresholdLabels"
      :resource-zones="namedResourceZones"
      :areas="flexibleControlAreasV2"
      :selected-key="selectedFlexibleKey"
      @select="selectedFlexibleKey = $event"
      collapsible
  />

  <CollapsiblePanel
      class="section"
      title="乡镇/街道历史趋势"
      desc="合并展示当前选中乡镇/街道的站点、充电桩、充电量和承载状态历史趋势。"
  >
    <section class="dual-grid township-trend-grid" style="margin-top: 0;">
      <LineChartCard
          :title="`${selectedTownship.name}历史充电站数量`"
          desc="按现有真实充电站台账回填展示；无站点乡镇按 0 展示。"
          :labels="scenario.mapTopic.townshipLabels"
          :primary="townshipTrendSeries.stationSeries"
          primary-name="充电站数量"
          :embedded="true"
      />
      <LineChartCard
          :title="`${selectedTownship.name}历史充电桩数量`"
          desc="按现有真实充电桩台账回填展示；无站点乡镇按 0 展示。"
          :labels="scenario.mapTopic.townshipLabels"
          :primary="townshipTrendSeries.pileSeries"
          primary-name="充电桩数量"
          :embedded="true"
      />
      <LineChartCard
          :title="`${selectedTownship.name}历史充电量`"
          desc="用于判断该乡镇充电需求增长速度与负荷抬升趋势。"
          :labels="scenario.mapTopic.townshipLabels"
          :primary="townshipTrendSeries.energySeries"
          primary-name="充电量(MWh)"
          :embedded="true"
      />
      <LineChartCard
          :title="`${selectedTownship.name}历史承载状态`"
          desc="按历史充电量走势换算展示，用于观察乡镇充电桩承载压力变化。"
          :labels="scenario.mapTopic.townshipLabels"
          :primary="townshipTrendSeries.carryStateSeries"
          primary-name="承载状态(%)"
          :embedded="true"
      />
    </section>
  </CollapsiblePanel>

  <CollapsiblePanel
      class="section"
      title="乡镇摘要"
      desc="汇总当前选中乡镇的站点、充电桩、10kV资源和充电量状态。"
  >
    <section class="card-grid township-summary-grid">
      <div v-for="item in townshipSummary" :key="item.label" class="stat-card">
        <div class="label">{{ item.label }}</div>
        <div class="value" style="font-size: 24px;">{{ item.value }}</div>
        <div class="muted">{{ item.desc }}</div>
      </div>
    </section>
  </CollapsiblePanel>
  <FlexibleAccessControlPanel
      class="section"
      title="柔性调节管控"
      desc="针对黄色资源区域展示分时柔性阈值曲线，并给出分站最大接入与关键时点降载策略"
      :labels="flexibleThresholdLabels"
      :resource-zones="namedResourceZones"
      :areas="flexibleControlAreasV2"
      :selected-key="selectedFlexibleKey"
      @select="selectedFlexibleKey = $event"
      collapsible
  />
</template>
