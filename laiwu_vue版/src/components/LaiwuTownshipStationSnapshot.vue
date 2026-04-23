<script setup>
import * as echarts from "echarts";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import laiwuTownshipGeoJson from "../assets/maps/laiwu-townships-map.json";
import CollapsiblePanel from "./CollapsiblePanel.vue";

const props = defineProps({
  title: {
    type: String,
    default: "莱芜乡镇/街道充电站数量分区图"
  },
  desc: {
    type: String,
    default: "按乡镇/街道展示 10kV 资源剩余量分区。"
  },
  stations: {
    type: Array,
    required: true
  },
  townships: {
    type: Array,
    required: true
  },
  resourceZones: {
    type: Array,
    default: () => []
  },
  collapsible: {
    type: Boolean,
    default: false
  },
  defaultOpen: {
    type: Boolean,
    default: true
  }
});

const chartRef = ref(null);
const activeTone = ref("high");
const selectedTownshipKey = ref("");
let chart;

const townshipFeatures = laiwuTownshipGeoJson.features || [];

const toneConfig = {
  high: {
    label: "红色低剩余资源区",
    marker: "红色区",
    desc: "区域内 10kV 资源接出后剩余总量较少，新增站点接入空间紧张。",
    color: "#df5b57",
    area: "#f3a7a4",
    labelBg: "#fff3f2",
    labelText: "#c43d39"
  },
  medium: {
    label: "黄色中剩余资源区",
    marker: "黄色区",
    desc: "区域内 10kV 资源接出后仍有一定剩余量，可承接局部新增接入。",
    color: "#e5a623",
    area: "#f6d67b",
    labelBg: "#fff8e8",
    labelText: "#b67800"
  },
  low: {
    label: "绿色高剩余资源区",
    marker: "绿色区",
    desc: "区域内 10kV 资源接出后剩余总量充足，适合新增站点或后续扩容。",
    color: "#59b97c",
    area: "#cfeeda",
    labelBg: "#effaf2",
    labelText: "#2c8b4e"
  }
};

const resourceOffsetMap = {
  1: [[0.008, 0.01]],
  2: [[-0.01, 0.012], [0.012, -0.002]],
  3: [[-0.012, 0.012], [0.01, 0.012], [0.002, -0.012]]
};

function getQuantityTone(stationCount) {
  if (stationCount >= 2) return "high";
  if (stationCount >= 1) return "medium";
  return "low";
}

function extractGeometryPoints(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return geometry.coordinates.flat();
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flat(2);
  return [];
}

function getBounds(points) {
  return points.reduce(
      (acc, [lng, lat]) => ({
        minLng: Math.min(acc.minLng, lng),
        maxLng: Math.max(acc.maxLng, lng),
        minLat: Math.min(acc.minLat, lat),
        maxLat: Math.max(acc.maxLat, lat)
      }),
      {
        minLng: Infinity,
        maxLng: -Infinity,
        minLat: Infinity,
        maxLat: -Infinity
      }
  );
}

const townshipCenterMap = new Map(
    townshipFeatures.map((feature) => {
      const points = extractGeometryPoints(feature.geometry);
      const bounds = getBounds(points);
      return [
        feature.properties?.name,
        [
          Number(((bounds.minLng + bounds.maxLng) / 2).toFixed(6)),
          Number(((bounds.minLat + bounds.maxLat) / 2).toFixed(6))
        ]
      ];
    })
);

const fullMapBounds = (() => {
  const points = townshipFeatures.flatMap((feature) => extractGeometryPoints(feature.geometry));
  return getBounds(points);
})();

const isResourceMode = computed(() => props.resourceZones.length > 0);
const resourceZoneMap = computed(() => new Map(props.resourceZones.map((item) => [item.townshipKey, item])));

const townshipSummary = computed(() =>
    props.townships
        .map((item) => {
          const relatedStations = props.stations.filter((station) => station.townshipKey === item.key);
          const stationCount = relatedStations.length;
          const pileCount = relatedStations.reduce((sum, station) => sum + (station.fast || 0) + (station.slow || 0), 0);
          const zone = resourceZoneMap.value.get(item.key);
          const tone = zone?.tone || getQuantityTone(stationCount);
          const resourceCount = zone?.resourceCount || 2;
          return {
            key: item.key,
            name: item.name,
            district: item.district,
            stationCount,
            pileCount,
            tone,
            toneLabel: zone?.label || toneConfig[tone].label,
            toneDesc: zone?.desc || toneConfig[tone].desc,
            resourceCount,
            resourceName: zone?.resourceName || `${item.name}10kV资源点`,
            accessMode: zone?.accessMode || (resourceCount > 1 ? "多站并联接入" : "单站接入"),
            remark: zone?.remark || toneConfig[tone].desc,
            totalCapacity: zone?.totalCapacity || `${resourceCount * 10} kVA`,
            usedCapacity: zone?.usedCapacity || `${resourceCount * 4} kVA`,
            reserveCapacity: zone?.reserveCapacity || `${resourceCount * 6} kVA`,
            stationIds: zone?.stationIds || relatedStations.map((station) => station.id)
          };
        })
        .sort((a, b) => {
          if (isResourceMode.value) {
            return b.resourceCount - a.resourceCount || b.stationCount - a.stationCount || b.pileCount - a.pileCount;
          }
          return b.stationCount - a.stationCount || b.pileCount - a.pileCount;
        })
);

const quantityStats = computed(() => [
  {
    key: "high",
    label: toneConfig.high.label,
    count: townshipSummary.value.filter((item) => item.tone === "high").length,
    desc: toneConfig.high.desc
  },
  {
    key: "medium",
    label: toneConfig.medium.label,
    count: townshipSummary.value.filter((item) => item.tone === "medium").length,
    desc: toneConfig.medium.desc
  },
  {
    key: "low",
    label: toneConfig.low.label,
    count: townshipSummary.value.filter((item) => item.tone === "low").length,
    desc: toneConfig.low.desc
  }
]);

const topTownships = computed(() => townshipSummary.value.slice(0, 6));

const selectedTownshipDetail = computed(
    () => townshipSummary.value.find((item) => item.key === selectedTownshipKey.value) || null
);

const detailTone = computed(() => {
  if (activeTone.value) return activeTone.value;
  if (selectedTownshipDetail.value) return selectedTownshipDetail.value.tone;
  return "high";
});

const toneDetailSummary = computed(() => {
  const tone = detailTone.value;
  const items = townshipSummary.value.filter((item) => item.tone === tone);
  const totalStations = items.reduce((sum, item) => sum + item.stationCount, 0);
  const totalResources = items.reduce((sum, item) => sum + item.resourceCount, 0);
  const totalUsed = items.reduce((sum, item) => sum + parseFloat(item.usedCapacity), 0);
  const totalReserve = items.reduce((sum, item) => sum + parseFloat(item.reserveCapacity), 0);

  return {
    tone,
    label: toneConfig[tone].label,
    desc: toneConfig[tone].desc,
    townshipCount: items.length,
    totalStations,
    totalResources,
    totalUsed: `${totalUsed.toFixed(0)} kVA`,
    totalReserve: `${totalReserve.toFixed(0)} kVA`,
    examples: items.slice(0, 5)
  };
});

const focusSummary = computed(() => {
  const selected = selectedTownshipDetail.value;
  if (selected && isResourceMode.value) {
    return `${selected.name} 10kV剩余量 ${selected.reserveCapacity}`;
  }

  const focus = topTownships.value[0];
  if (!focus) return "暂无乡镇分区信息";
  if (isResourceMode.value) {
    return `${focus.name} 10kV剩余量 ${focus.reserveCapacity}`;
  }
  return `${focus.name} ${focus.stationCount} 座站`;
});

const resourceOverlay = computed(() => {
  if (!isResourceMode.value) {
    return { stations: [], resources: [] };
  }

  const resourcePoints = [];
  const stationPoints = [];

  townshipSummary.value.forEach((township) => {
    const center = townshipCenterMap.get(township.name);
    if (!center) return;

    const relatedStations = props.stations.filter((station) =>
        township.stationIds.includes(station.id) || station.townshipKey === township.key
    );
    const count = Math.max(1, township.resourceCount);
    const offsets = resourceOffsetMap[count] || resourceOffsetMap[3];
    const resources = Array.from({ length: count }, (_, index) => {
      const offset = offsets[index] || offsets[offsets.length - 1];
      const coord = [
        Number((center[0] + offset[0]).toFixed(6)),
        Number((center[1] + offset[1]).toFixed(6))
      ];
      const resourceName = count === 1 ? `${township.name} 10kV资源` : `${township.name} 10kV资源${index + 1}`;

      const point = {
        name: resourceName,
        value: coord,
        tone: township.tone,
        township: township.name,
        resourceName,
        resourceCount: township.resourceCount,
        reserveCapacity: township.reserveCapacity,
        totalCapacity: township.totalCapacity,
        usedCapacity: township.usedCapacity,
        accessMode: township.accessMode
      };

      resourcePoints.push(point);
      return point;
    });

    relatedStations.forEach((station, index) => {
      const resource = resources[index % resources.length];
      stationPoints.push({
        name: station.name,
        value: [station.lng, station.lat],
        tone: township.tone,
        township: township.name,
        operator: station.operator,
        resourceName: resource.resourceName
      });
    });
  });

  return { stations: stationPoints, resources: resourcePoints };
});

function getMapFocus() {
  if (!activeTone.value) {
    return { center: undefined, zoom: 1 };
  }

  const focusTownships = townshipSummary.value.filter((item) => item.tone === activeTone.value);
  if (!focusTownships.length) {
    return { center: undefined, zoom: 1 };
  }

  const points = townshipFeatures
      .filter((feature) => focusTownships.some((item) => item.name === feature.properties?.name))
      .flatMap((feature) => extractGeometryPoints(feature.geometry));

  if (!points.length) {
    return { center: undefined, zoom: 1 };
  }

  const bounds = getBounds(points);
  const center = [
    Number(((bounds.minLng + bounds.maxLng) / 2).toFixed(6)),
    Number(((bounds.minLat + bounds.maxLat) / 2).toFixed(6))
  ];

  const lngSpan = Math.max(bounds.maxLng - bounds.minLng + 0.03, 0.04);
  const latSpan = Math.max(bounds.maxLat - bounds.minLat + 0.03, 0.04);
  const globalLngSpan = Math.max(fullMapBounds.maxLng - fullMapBounds.minLng, 0.01);
  const globalLatSpan = Math.max(fullMapBounds.maxLat - fullMapBounds.minLat, 0.01);
  const ratio = Math.max(lngSpan / globalLngSpan, latSpan / globalLatSpan);
  const zoom = Math.min(7, Math.max(1.2, Number((0.82 / ratio).toFixed(2))));

  return { center, zoom };
}

function formatRegionTooltip(params) {
  return [
    `<strong>${params.data?.name || params.name}</strong>`,
    `所属区域：${params.data?.district || "-"}`,
    `充电站数量：${params.data?.stationCount || 0} 座`,
    `充电桩数量：${params.data?.pileCount || 0} 个`,
    isResourceMode.value ? `10kV资源点：${params.data?.resourceCount || 0} 组` : `分区状态：${params.data?.toneLabel || "-"}`,
    isResourceMode.value ? `10kV剩余量：${params.data?.reserveCapacity || "-"}` : null
  ].filter(Boolean).join("<br/>");
}

function formatResourceTooltip(params) {
  return [
    `<strong>${params.data?.resourceName || params.name}</strong>`,
    `所属乡镇：${params.data?.township || "-"}`,
    `资源类型：10kV间隔资源`,
    `10kV资源总量：${params.data?.totalCapacity || "-"}`,
    `已接出：${params.data?.usedCapacity || "-"}`,
    `10kV剩余量：${params.data?.reserveCapacity || "-"}`,
    `接入方式：${params.data?.accessMode || "-"}`
  ].join("<br/>");
}

function formatStationTooltip(params) {
  return [
    `<strong>${params.data?.name || params.name}</strong>`,
    `所属乡镇：${params.data?.township || "-"}`,
    `运营方：${params.data?.operator || "-"}`,
    `接入资源：${params.data?.resourceName || "-"}`
  ].join("<br/>");
}

function toggleLegend(key) {
  activeTone.value = key;
  renderChart();
}

function renderChart() {
  if (!chartRef.value) return;
  if (!chart) {
    chart = echarts.init(chartRef.value);
  }

  echarts.registerMap("laiwu-township-quantity", laiwuTownshipGeoJson);
  const mapFocus = getMapFocus();
  const mapSeriesData = townshipSummary.value.map((item) => ({
    name: item.name,
    district: item.district,
    stationCount: item.stationCount,
    pileCount: item.pileCount,
    toneLabel: item.toneLabel,
    resourceCount: item.resourceCount,
    reserveCapacity: item.reserveCapacity,
    value: isResourceMode.value ? item.resourceCount : item.stationCount,
    itemStyle: {
      areaColor: toneConfig[item.tone].area,
      borderColor: toneConfig[item.tone].color,
      borderWidth: item.stationCount > 0 || isResourceMode.value ? 2 : 1.4,
      opacity: 1,
      shadowBlur: selectedTownshipKey.value === item.key ? 18 : 0,
      shadowColor: selectedTownshipKey.value === item.key ? "rgba(22, 48, 88, 0.35)" : "transparent",
      shadowOffsetY: selectedTownshipKey.value === item.key ? -4 : 0
    },
    label: {
      show: true,
      color: toneConfig[item.tone].labelText,
      fontSize: 10,
      fontWeight: 500,
      backgroundColor: toneConfig[item.tone].labelBg,
      borderColor: `${toneConfig[item.tone].color}88`,
      borderWidth: 1,
      borderRadius: 4,
      padding: [2, 4]
    },
    emphasis: {
      itemStyle: {
        areaColor: toneConfig[item.tone].area,
        borderColor: toneConfig[item.tone].color,
        borderWidth: 2,
        opacity: 1,
        shadowBlur: 22,
        shadowColor: "rgba(22, 48, 88, 0.35)",
        shadowOffsetY: -6
      },
      label: {
        color: toneConfig[item.tone].labelText,
        fontWeight: 500,
        backgroundColor: toneConfig[item.tone].labelBg
      }
    }
  }));

  const series = [
    {
      type: "map",
      map: "laiwu-township-quantity",
      roam: false,
      layoutCenter: ["50%", "50%"],
      layoutSize: "95%",
      center: mapFocus.center,
      zoom: mapFocus.zoom,
      data: mapSeriesData,
      itemStyle: {
        areaColor: "#dfeaf8",
        borderColor: "#7f9fcb",
        borderWidth: 1.2
      },
      emphasis: {
        itemStyle: {
          borderColor: "#2f66c5",
          borderWidth: 1.8
        },
        label: {
          fontWeight: 500
        }
      }
    }
  ];

  if (isResourceMode.value) {
    series.push(
        {
          type: "scatter",
          coordinateSystem: "geo",
          zlevel: 3,
          symbol: "diamond",
          symbolSize: 12,
          itemStyle: {
            color: "#1d4f91",
            borderColor: "#ffffff",
            borderWidth: 1.5
          },
          label: {
            show: false
          },
          data: resourceOverlay.value.resources,
          tooltip: {
            formatter: formatResourceTooltip
          }
        },
        {
          type: "effectScatter",
          coordinateSystem: "geo",
          zlevel: 4,
          symbolSize: 9,
          rippleEffect: {
            scale: 3.2,
            brushType: "stroke"
          },
          itemStyle: {
            color: "#123b76",
            borderColor: "#ffffff",
            borderWidth: 1.2
          },
          data: resourceOverlay.value.stations,
          tooltip: {
            formatter: formatStationTooltip
          }
        }
    );
  }

  chart.setOption({
    backgroundColor: "transparent",
    animationDurationUpdate: 320,
    geo: {
      map: "laiwu-township-quantity",
      roam: false,
      layoutCenter: ["50%", "50%"],
      layoutSize: "95%",
      center: mapFocus.center,
      zoom: mapFocus.zoom,
      silent: true,
      itemStyle: {
        areaColor: "transparent",
        borderColor: "transparent"
      }
    },
    tooltip: {
      trigger: "item",
      formatter(params) {
        if (params.seriesType === "scatter") return formatResourceTooltip(params);
        if (params.seriesType === "effectScatter") return formatStationTooltip(params);
        return formatRegionTooltip(params);
      }
    },
    series
  });

  chart.off("mouseover");
  chart.off("click");
  chart.off("globalout");

  chart.on("mouseover", (params) => {
    if (params.seriesType === "map" && params.data?.name) {
      const matched = townshipSummary.value.find((item) => item.name === params.data.name);
      if (matched) {
        selectedTownshipKey.value = matched.key;
      }
    }
  });

  chart.on("click", (params) => {
    if (params.seriesType === "map" && params.data?.name) {
      const matched = townshipSummary.value.find((item) => item.name === params.data.name);
      if (matched) {
        selectedTownshipKey.value = matched.key;
        renderChart();
      }
    }
  });

  chart.on("globalout", () => {
    renderChart();
  });
}

function handleResize() {
  if (chart) chart.resize();
}

onMounted(() => {
  renderChart();
  window.addEventListener("resize", handleResize);
});

watch(() => [props.stations, props.townships, props.resourceZones], renderChart, { deep: true });

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  if (chart) chart.dispose();
});
</script>

<template>
  <CollapsiblePanel
      class="map-snapshot-card"
      :title="title"
      :desc="desc"
      :collapsible="collapsible"
      :default-open="defaultOpen"
  >
    <template #actions>
      <div class="tag">{{ focusSummary }}</div>
    </template>

    <div class="map-snapshot-layout">
      <div ref="chartRef" class="mini-map-chart"></div>

      <div class="map-snapshot-side">
        <div class="zone-stat-grid">
          <button
              v-for="item in quantityStats"
              :key="item.key"
              type="button"
              class="zone-stat-card interactive"
              :class="[`quantity-${item.key}`, { active: detailTone === item.key }]"
              @click="toggleLegend(item.key)"
          >
            <div class="label">{{ item.label }}</div>
            <strong>{{ item.count }} 个乡镇</strong>
          </button>
        </div>

        <div class="map-side-table">
          <div class="sub-section-title">
            {{ isResourceMode ? "分区详细信息" : "乡镇/街道站点分区" }}
          </div>

          <template v-if="isResourceMode">
            <div class="info-card" style="margin-bottom: 12px;">
              <div class="label">{{ toneDetailSummary.label }}</div>
              <strong>{{ toneDetailSummary.desc }}</strong>
              <p class="muted">点击右侧红黄绿分区卡片可切换该分区详细信息，点击地图区域可同步更新右上角当前区域。</p>
            </div>

            <div class="table-row compact-table-row">
              <strong>覆盖乡镇</strong>
              <span>{{ toneDetailSummary.townshipCount }} 个</span>
            </div>
            <div class="table-row compact-table-row">
              <strong>10kV资源点</strong>
              <span>{{ toneDetailSummary.totalResources }} 组</span>
            </div>
            <div class="table-row compact-table-row">
              <strong>已接出使用</strong>
              <span>{{ toneDetailSummary.totalUsed }}</span>
            </div>
            <div class="table-row compact-table-row">
              <strong>10kV剩余量</strong>
              <span>{{ toneDetailSummary.totalReserve }}</span>
            </div>
            <div class="table-row compact-table-row">
              <strong>接入站点数</strong>
              <span>{{ toneDetailSummary.totalStations }} 座</span>
            </div>

            <div class="sub-section-title" style="margin-top: 12px;">典型乡镇</div>
            <div
                v-for="item in toneDetailSummary.examples"
                :key="item.key"
                class="table-row compact-table-row"
            >
              <strong>{{ item.name }}</strong>
              <span class="muted">10kV资源总量 {{ item.totalCapacity }} / 已接出 {{ item.usedCapacity }} / 10kV剩余量 {{ item.reserveCapacity }}</span>
            </div>
          </template>

          <template v-else>
            <div class="table-row header compact-table-row five-cols township-quantity-cols">
              <span>乡镇/街道</span>
              <span>区域</span>
              <span>分区</span>
              <span>站点</span>
              <span>充电桩</span>
            </div>
            <div v-for="item in topTownships" :key="item.key" class="table-row compact-table-row five-cols township-quantity-cols">
              <strong>{{ item.name }}</strong>
              <span>{{ item.district }}</span>
              <span class="tag" :class="`quantity-${item.tone}`">{{ item.toneLabel }}</span>
              <span>{{ item.stationCount }} 座</span>
              <span>{{ item.pileCount }} 个</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </CollapsiblePanel>
</template>