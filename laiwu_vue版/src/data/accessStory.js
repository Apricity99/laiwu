export const planningStory = {
  focusTownshipKey: "gaozhuang",
  intro:
    "以高庄街道重卡物流园站为主线：先在黄色资源区完成接入研判，明确预测接入窗口、白天受限时段和接入边界，再在站点建成后转入柔性调节与潜力评估。",
  profiles: {
    pengquan: {
      candidateName: "鹏泉综合物流重卡充电站",
      scene: "园区配送与城区补能协同",
      demandDriver: "社区配送与园区车队叠加增长，夜间停车补能需求抬升。",
      plannedPiles: "6 快充 / 2 慢充",
      ratedPower: 8,
      contractPower: 7.2,
      annualDemand: "3,900 MWh",
      buildPeriod: "近期滚动接入",
      forecastLabels: ["00:00", "06:00", "10:00", "14:00", "18:00", "22:00"],
      demandSeries: [3.1, 4.2, 5.4, 5.8, 6.1, 4.4],
      recommendedSeries: [6.2, 6.4, 4.9, 4.7, 4.4, 6.8],
      thresholdSeries: [7.1, 6.9, 5.3, 5.0, 4.7, 7.4],
      constraints: [
        { label: "白天控制", value: "4.4-4.9 MW", desc: "10:00-18:00 与现有城区站点共用资源，建议控制在中位接入区间。" },
        { label: "夜间上浮", value: "6.8 MW", desc: "22:00 后可释放园区停车补能能力，承接深谷负荷。" },
        { label: "接入限制", value: "不得突破 7.2 MW", desc: "合同容量上限由黄色资源区预留能力决定。" }
      ],
      steps: [
        "识别园区夜间停车需求与城区配送补能缺口。",
        "在黄色资源区内预留单站接入能力，避免挤占既有城区站。",
        "按昼夜双限额设计接入策略，白天限额、夜间放开。"
      ]
    },
    gaozhuang: {
      candidateName: "高庄物流园重卡充电站",
      scene: "开发区物流园夜间停车补能",
      demandDriver: "开发区货运车队夜停比例高，午后园区短驳与晚间集中补能需求并存。",
      plannedPiles: "8 快充 / 2 慢充",
      ratedPower: 10,
      contractPower: 8.5,
      annualDemand: "5,400 MWh",
      buildPeriod: "近期优先接入",
      forecastLabels: ["00:00", "06:00", "10:00", "14:00", "18:00", "22:00"],
      demandSeries: [4.2, 5.1, 6.4, 7.1, 7.6, 5.3],
      recommendedSeries: [7.5, 7.8, 6.0, 5.8, 5.5, 8.0],
      thresholdSeries: [8.4, 8.1, 6.3, 6.0, 5.6, 8.7],
      constraints: [
        { label: "最优接入窗口", value: "22:00-06:00", desc: "夜间其他负荷回落，允许按 7.8-8.0 MW 释放物流补能需求。" },
        { label: "白天限制时段", value: "10:00 / 18:00", desc: "与开发区既有负荷叠加，建议将站点功率压至 5.5-6.0 MW。" },
        { label: "接入边界", value: "5.0-8.5 MW", desc: "最小值由资源紧张时段倒算，最大值由接入批复与设备设计共同确定。" }
      ],
      steps: [
        "先在高庄街道黄色资源区锁定拟接入站点和负荷场景。",
        "按分时资源余量预测新站可接入功率曲线，形成昼夜差异化方案。",
        "将接入批复上限、最低服务保障和白天限峰规则传递到后续调节评估。"
      ]
    },
    zhangjiawa: {
      candidateName: "张家洼工业走廊重卡充电站",
      scene: "工业企业运输车辆补能",
      demandDriver: "工业运输车辆补能稳定增长，夜间补能和清晨发车形成刚性窗口。",
      plannedPiles: "6 快充 / 2 慢充",
      ratedPower: 9,
      contractPower: 7.8,
      annualDemand: "4,500 MWh",
      buildPeriod: "近期滚动建设",
      forecastLabels: ["00:00", "06:00", "10:00", "14:00", "18:00", "22:00"],
      demandSeries: [3.8, 4.6, 5.7, 6.2, 6.8, 4.9],
      recommendedSeries: [6.8, 7.0, 5.4, 5.0, 4.8, 7.2],
      thresholdSeries: [7.9, 7.6, 5.8, 5.3, 5.0, 8.0],
      constraints: [
        { label: "夜间补能窗口", value: "22:00-06:00", desc: "适合承接工业车辆集中回场补能。" },
        { label: "白天控制", value: "4.8-5.4 MW", desc: "白天需为片区工业负荷保留裕度。" },
        { label: "接入限制", value: "不超过 7.8 MW", desc: "按双间隔接入设计执行批复上限。" }
      ],
      steps: [
        "识别工业运输回场补能节奏。",
        "按双间隔资源能力设计接入上限。",
        "将白天限额与夜间放开规则同步到后续运营约束。"
      ]
    },
    fangxia: {
      candidateName: "方下物流枢纽重卡充电站",
      scene: "物流走廊中转补能",
      demandDriver: "物流园与工业片区之间形成中转补能需求，深谷窗口明显。",
      plannedPiles: "6 快充 / 2 慢充",
      ratedPower: 8,
      contractPower: 7.0,
      annualDemand: "4,100 MWh",
      buildPeriod: "中近期接入",
      forecastLabels: ["00:00", "06:00", "10:00", "14:00", "18:00", "22:00"],
      demandSeries: [3.0, 3.9, 4.9, 5.6, 5.9, 4.1],
      recommendedSeries: [6.1, 6.3, 4.8, 4.6, 4.3, 6.7],
      thresholdSeries: [7.0, 6.8, 5.1, 4.9, 4.5, 7.2],
      constraints: [
        { label: "可接入窗口", value: "00:00-06:00 / 22:00", desc: "夜间资源余量充足，可承接中转车辆深谷补能。" },
        { label: "受限时段", value: "10:00-18:00", desc: "需为片区工业负荷留足冗余。" },
        { label: "接入限制", value: "不超过 7.0 MW", desc: "按双间隔资源配置控制单站规模。" }
      ],
      steps: [
        "识别中转物流站的深谷补能场景。",
        "限定白天接入上限，保证其他负荷安全。",
        "预留夜间释放空间，形成移峰填谷站型。"
      ]
    },
    xueye: {
      candidateName: "雪野服务配套重卡充电站",
      scene: "旅游服务与货运补能兼顾",
      demandDriver: "景区服务车辆与货运补能并存，周末与假日波动较大。",
      plannedPiles: "4 快充 / 2 慢充",
      ratedPower: 7,
      contractPower: 6.2,
      annualDemand: "3,500 MWh",
      buildPeriod: "中期接入",
      forecastLabels: ["00:00", "06:00", "10:00", "14:00", "18:00", "22:00"],
      demandSeries: [2.6, 3.5, 4.8, 5.2, 5.5, 3.7],
      recommendedSeries: [5.8, 5.9, 4.4, 4.2, 4.0, 6.0],
      thresholdSeries: [6.7, 6.5, 4.9, 4.5, 4.2, 6.8],
      constraints: [
        { label: "旅游高峰控制", value: "14:00-18:00 4.0-4.2 MW", desc: "景区服务负荷抬升时需压缩新站接入功率。" },
        { label: "夜间上浮", value: "6.0 MW", desc: "夜间可释放服务区型补能能力。" },
        { label: "接入限制", value: "不超过 6.2 MW", desc: "按景区配网预留容量控制。" }
      ],
      steps: [
        "识别旅游与货运叠加场景。",
        "设置景区高峰控制和夜间补能放开双边界。",
        "将季节性波动纳入后续运营调节规则。"
      ]
    },
    niuquan: {
      candidateName: "牛泉工贸协同重卡充电站",
      scene: "工贸车队协同补能",
      demandDriver: "工贸运输需求平稳抬升，白天稳定、夜间具备集中补能潜力。",
      plannedPiles: "5 快充 / 2 慢充",
      ratedPower: 7.5,
      contractPower: 6.6,
      annualDemand: "3,700 MWh",
      buildPeriod: "中期预留接入",
      forecastLabels: ["00:00", "06:00", "10:00", "14:00", "18:00", "22:00"],
      demandSeries: [2.8, 3.7, 4.6, 5.0, 5.4, 3.9],
      recommendedSeries: [5.9, 6.1, 4.7, 4.5, 4.2, 6.3],
      thresholdSeries: [6.8, 6.6, 5.0, 4.8, 4.4, 7.0],
      constraints: [
        { label: "推荐接入区间", value: "4.2-6.6 MW", desc: "白天适中接入，夜间上浮至合同上限。" },
        { label: "关键约束", value: "18:00 前后压峰", desc: "晚间居民与工业叠加时段需留足裕度。" },
        { label: "接入限制", value: "不超过 6.6 MW", desc: "按工贸片区黄色资源配置确定。" }
      ],
      steps: [
        "识别工贸运输稳定需求。",
        "按白天压峰、夜间释放形成接入方案。",
        "为后续柔性调节保留足够控制空间。"
      ]
    },
    lixin: {
      candidateName: "里辛工业协同重卡充电站",
      scene: "钢城工业运输补能",
      demandDriver: "钢城工业运输车辆补能需求持续抬升，夜间集中回场明显。",
      plannedPiles: "6 快充 / 2 慢充",
      ratedPower: 8.5,
      contractPower: 7.4,
      annualDemand: "4,300 MWh",
      buildPeriod: "近期可接入",
      forecastLabels: ["00:00", "06:00", "10:00", "14:00", "18:00", "22:00"],
      demandSeries: [3.4, 4.2, 5.1, 5.9, 6.3, 4.5],
      recommendedSeries: [6.5, 6.7, 5.1, 4.9, 4.7, 7.0],
      thresholdSeries: [7.5, 7.2, 5.4, 5.1, 4.9, 7.8],
      constraints: [
        { label: "夜间释放", value: "6.7-7.0 MW", desc: "钢城工业车辆夜间回场补能可按上限运行。" },
        { label: "白天约束", value: "4.7-5.1 MW", desc: "白天需为既有工业站与民生负荷保留容量。" },
        { label: "接入限制", value: "不超过 7.4 MW", desc: "由片区协议容量和设备设计共同约束。" }
      ],
      steps: [
        "识别钢城工业运输补能窗口。",
        "建立白天约束与夜间释放并行的接入设计。",
        "将夜间富余能力延续到后续柔性收益测算。"
      ]
    }
  }
};

const focusPlanningProfile = planningStory.profiles[planningStory.focusTownshipKey];
const planningRecommendedMin = Math.min(...focusPlanningProfile.recommendedSeries);
const planningRecommendedMax = Math.max(...focusPlanningProfile.recommendedSeries);
const planningThresholdUpper = Math.min(
  focusPlanningProfile.contractPower,
  Math.max(...focusPlanningProfile.thresholdSeries)
);
const planningDaytimeRecommended = focusPlanningProfile.recommendedSeries.slice(2, 5);
const planningDaytimeMin = Math.min(...planningDaytimeRecommended);
const planningDaytimeMax = Math.max(...planningDaytimeRecommended);

export const flexibilityStory = {
  station: {
    townshipKey: planningStory.focusTownshipKey,
    stationName: focusPlanningProfile.candidateName,
    region: "莱芜区高庄街道",
    voltageLevel: "10kV",
    ratedPower: focusPlanningProfile.ratedPower,
    contractUpper: planningRecommendedMax,
    hardUpper: planningThresholdUpper,
    minimumGuarantee: planningRecommendedMin,
    currentTime: "14:00",
    sceneType: "新接入重卡物流园站",
    distribution: "园区集中式接入",
    fast: 8,
    slow: 2,
    operator: "莱芜电网",
    operationStatus: "建成投运（试运行）",
    currentLoad: 6.02,
    currentUse: 74,
    initialLimit: 5.8
  },
  planningThresholds: {
    recommendedLower: planningRecommendedMin,
    recommendedUpper: planningRecommendedMax,
    daytimeRecommendedLower: planningDaytimeMin,
    daytimeRecommendedUpper: planningDaytimeMax,
    hardUpper: planningThresholdUpper,
    optimalWindow: "22:00-06:00",
    limitedWindow: "10:00-18:00"
  },
  planningCarryOver: [
    { label: "常态调节下限", value: `${planningRecommendedMin.toFixed(1)} MW`, sub: "承接乡镇/街道历史趋势中的接入推荐下限" },
    { label: "常态调节上限", value: `${planningRecommendedMax.toFixed(1)} MW`, sub: "承接乡镇/街道历史趋势中的接入推荐上限" },
    { label: "白天限峰要求", value: `${planningDaytimeMin.toFixed(1)}-${planningDaytimeMax.toFixed(1)} MW`, sub: "10:00-18:00 资源紧张时段执行" },
    { label: "批复阈值上限", value: `${planningThresholdUpper.toFixed(1)} MW`, sub: "超过该值需重新校核接入条件，不作为常态调节区间" }
  ],
  controlRules: [
    `新站建成后，常态调节区间按接入推荐阈值执行，即 ${planningRecommendedMin.toFixed(1)}-${planningRecommendedMax.toFixed(1)} MW。`,
    `10:00-18:00 需优先满足开发区既有负荷和民生容量，因此目标限峰值应收敛至 ${planningDaytimeMin.toFixed(1)}-${planningDaytimeMax.toFixed(1)} MW。`,
    `22:00-06:00 可恢复至 ${planningRecommendedMax.toFixed(1)} MW 左右承接夜间停车补能，但仍不得突破 ${planningThresholdUpper.toFixed(1)} MW 批复阈值。`,
    "柔性调节的目标不是简单压降，而是在白天压峰、夜间增充之间实现总收益最大化。"
  ],
  evaluationFocus: [
    { label: "评估目标", value: "验证新站是否能在不越限前提下承接夜间补能", desc: "关注峰值是否回落到可用容量以内。" },
    { label: "主要约束", value: "接入推荐阈值 + 批复上限 + 白天限峰", desc: "三类约束共同决定当前可调区间。" },
    { label: "调节方向", value: "白天压峰、夜间释放", desc: "利用重卡停车时间长的特点做移峰填谷。" }
  ],
  typicalRanges: [
    { label: "00:00-06:00", range: "7.5-8.0 MW", desc: "夜间停车补能集中释放，可按深谷补能策略运行。" },
    { label: "06:00-10:00", range: "6.2-7.2 MW", desc: "兼顾清晨发车与园区出车需求，保持平稳出力。" },
    { label: "10:00-18:00", range: `${planningDaytimeMin.toFixed(1)}-${planningDaytimeMax.toFixed(1)} MW`, desc: "承接乡镇/街道历史趋势中的白天接入推荐阈值。" },
    { label: "18:00-24:00", range: "5.8-7.0 MW", desc: "晚高峰后逐步恢复，22:00 后回到夜间补能窗口。" }
  ],
  historyLabels: ["04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"],
  historyActual: [5.72, 5.86, 6.01, 5.94, 5.88, 6.05, 6.28, 6.46, 6.58, 5.88, 6.02],
  historyAvailable: [7.86, 7.72, 7.54, 7.41, 7.33, 7.18, 6.98, 6.84, 6.68, 6.24, 6.12],
  simulationLabels: ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"],
  simulationHistoryActual: [6.34, 6.26, 6.18, 6.08, 6.02, null, null, null, null, null, null, null, null],
  simulationHistoryAvailable: [6.88, 6.72, 6.58, 6.34, 6.12, null, null, null, null, null, null, null, null],
  simulationHistoryTarget: [6.18, 6.1, 6.02, 5.94, 5.86, null, null, null, null, null, null, null, null],
  uncontrolledForecast: [null, null, null, null, 6.2, 6.58, 6.94, 7.32, 7.68, 7.94, 8.12, 8.24, 7.86],
  futureAvailable: [null, null, null, null, 6.08, 6.06, 6.04, 5.98, 5.94, 5.88, 5.92, 6.08, 6.22],
  controlledTemplate: [5.96, 5.92, 5.88, 5.82, 5.76, 5.72, 5.7, 5.76, 5.84]
};
