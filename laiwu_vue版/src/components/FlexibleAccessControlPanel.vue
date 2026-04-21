<script setup>
import * as echarts from "echarts";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import laiwuTownshipGeoJson from "../assets/maps/laiwu-townships-map.json";
import CollapsiblePanel from "./CollapsiblePanel.vue";
import LineChartCard from "./LineChartCard.vue";

const props = defineProps({
  title: {
    type: String,
    default: "柔性调节管控"
  },
  desc: {
    type: String,
    default: "针对黄色资源区域展示新建站点接入建议。"
  },
  labels: {
    type: Array,
    required: true
  },
  resourceZones: {
    type: Array,
    default: () => []
  },
  areas: {
    type: Array,
    required: true
  },
  selectedKey: {
    type: String,
    default: ""
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

const emit = defineEmits(["select"]);

const chartRef = ref(null);
let chart;

const townshipFeatures = laiwuTownshipGeoJson.features || [];

const toneConfig = {
  high: {
    area: "#f3a7a4",
    color: "#df5b57",
    labelBg: "#fff3f2",
    labelText: "#c43d39"
  },
  medium: {
    area: "#f6d67b",
    color: "#e5a623",
    labelBg: "#fff8e8",
    labelText: "#b67800"
  },
  low: {
    area: "#cfeeda",
    color: "#59b97c",
    labelBg: "#effaf2",
    labelText: "#2c8b4e"
  }
};

const selectedArea = computed(() => props.areas.find((item) => item.key === props.selectedKey) || props.areas[0] || null);
const resourceZoneNameMap = computed(() => new Map(props.resourceZones.map((item) => [item.name, item])));

const summaryMetrics = computed(() => [
  {
    label: "接入范围",
    value: selectedArea.value?.accessRange || "-"
  },
  {
    label: "最小接入时段",
    value: selectedArea.value?.minAccessWindow || "-"
  },
  {
    label: "最大接入建议",
    value: selectedArea.value?.buildCap || "-"
  }
]);

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

const fullMapBounds = (() => {
  const points = townshipFeatures.flatMap((feature) => extractGeometryPoints(feature.geometry));
  return getBounds(points);
})();

function getTownshipFeature(name) {
  return townshipFeatures.find((item) => item.properties?.name === name);
}

function getTownshipFocus(name) {
  const feature = getTownshipFeature(name);
  if (!feature) return { center: undefined, zoom: 1 };

  const points = extractGeometryPoints(feature.geometry);
  if (!points.length) return { center: undefined, zoom: 1 };

  const bounds = getBounds(points);
  const center = [
    Number(((bounds.minLng + bounds.maxLng) / 2).toFixed(6)),
    Number(((bounds.minLat + bounds.maxLat) / 2).toFixed(6))
  ];

  const lngSpan = Math.max(bounds.maxLng - bounds.minLng, 0.01);
  const latSpan = Math.max(bounds.maxLat - bounds.minLat, 0.01);
  const globalLngSpan = Math.max(fullMapBounds.maxLng - fullMapBounds.minLng, 0.01);
  const globalLatSpan = Math.max(fullMapBounds.maxLat - fullMapBounds.minLat, 0.01);
  const ratio = Math.max(lngSpan / globalLngSpan, latSpan / globalLatSpan);
  const zoom = Math.min(5.2, Math.max(1.65, Number((0.52 / ratio).toFixed(2))));

  return { center, zoom };
}

function renderMap() {
  if (!chartRef.value) return;

  if (!chart) {
    chart = echarts.init(chartRef.value);
    chart.on("click", (params) => {
      if (params.data?.key) emit("select", params.data.key);
    });
  }

  echarts.registerMap("laiwu-township-flex", laiwuTownshipGeoJson);
  const focus = getTownshipFocus(selectedArea.value?.name);

  chart.setOption({
    backgroundColor: "transparent",
    animationDurationUpdate: 320,
    tooltip: {
      trigger: "item",
      formatter(params) {
        if (params.seriesType === "scatter") {
          return [
            `<strong>${params.data.fullName}</strong>`,
            `协议上限：${params.data.protocolCap}`,
            `已有站使用区间：${params.data.usageRange || "-"}`,
            "说明：该站仅作为新建站接入测算参考"
          ].join("<br/>");
        }

        return [
          `<strong>${params.name}</strong>`,
          `资源组数：${params.data?.resourceCount || 0}`,
          `剩余容量：${params.data?.reserveCapacity || "-"}`,
          `策略摘要：${params.data?.strategySummary || "-"}`
        ].join("<br/>");
      }
    },
    geo: {
      map: "laiwu-township-flex",
      roam: false,
      layoutCenter: ["50%", "50%"],
      layoutSize: "90%",
      center: focus.center,
      zoom: focus.zoom,
      itemStyle: {
        areaColor: "transparent",
        borderColor: "transparent",
        borderWidth: 0
      }
    },
    series: [
      {
        type: "map",
        map: "laiwu-township-flex",
        roam: false,
        layoutCenter: ["50%", "50%"],
        layoutSize: "90%",
        center: focus.center,
        zoom: focus.zoom,
        data: townshipFeatures.map((feature) => {
          const name = feature.properties?.name;
          const zone = resourceZoneNameMap.value.get(name);
          const area = props.areas.find((item) => item.name === name);
          const isSelected = area?.key === selectedArea.value?.key;
          const tone = zone?.tone || "low";
          const palette = toneConfig[tone];

          return {
            name,
            key: area?.key,
            resourceCount: area?.resourceCount || 0,
            reserveCapacity: area?.reserveCapacity || "-",
            strategySummary: area?.strategySummary || "",
            itemStyle: {
              areaColor: palette.area,
              borderColor: isSelected ? "#c78600" : palette.color,
              borderWidth: isSelected ? 3 : 1,
              opacity: 1,
              shadowBlur: isSelected ? 18 : 0,
              shadowColor: isSelected ? "rgba(199, 134, 0, 0.32)" : "transparent"
            },
            label: {
              show: true,
              color: isSelected ? "#8b5a00" : palette.labelText,
              fontSize: isSelected ? 11 : 10,
              fontWeight: isSelected ? 700 : 600,
              backgroundColor: isSelected ? "rgba(255,255,255,0.9)" : palette.labelBg,
              padding: [2, 4],
              borderRadius: 4
            }
          };
        })
      },
      {
        type: "scatter",
        coordinateSystem: "geo",
        zlevel: 5,
        data: (selectedArea.value?.stationStrategies || []).map((item) => ({
          fullName: item.stationName,
          protocolCap: item.protocolCap,
          usageRange: item.usageRange,
          value: [item.lng, item.lat],
          symbolSize: 13,
          itemStyle: {
            color: "#d88a00",
            borderColor: "#ffffff",
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: `${item.stationShortName}\n${item.protocolCap}`,
            position: "top",
            distance: 6,
            color: "#5c4720",
            fontSize: 10,
            fontWeight: 700,
            backgroundColor: "rgba(255,255,255,0.9)",
            padding: [2, 4],
            borderRadius: 4
          }
        }))
      }
    ]
  });
}

function handleResize() {
  if (chart) chart.resize();
}

onMounted(() => {
  renderMap();
  window.addEventListener("resize", handleResize);
});

watch(() => [props.areas, props.selectedKey], renderMap, { deep: true });

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  if (chart) chart.dispose();
});
</script>

<template>
  <CollapsiblePanel
    :title="title"
    :desc="desc"
    :collapsible="collapsible"
    :default-open="defaultOpen"
  >
    <template #actions>
      <div class="tabs single-line-tabs">
        <button
          v-for="item in areas"
          :key="item.key"
          class="tab-btn"
          :class="{ active: item.key === selectedArea?.key }"
          @click="emit('select', item.key)"
        >
          {{ item.name }}
        </button>
      </div>
    </template>

    <div class="township-map-shell">
      <div ref="chartRef" class="township-map-chart flex-control-map-chart"></div>

      <div class="township-side flex-control-side">
        <div class="flex-side-top">
          <div class="info-card compact-info-card">
            <div class="label">柔性调控区域</div>
            <strong>{{ selectedArea?.name }}</strong>
            <p class="muted">{{ selectedArea?.district }}</p>
          </div>
        </div>

        <div class="chart-panel">
          <LineChartCard
            embedded
            :title="`${selectedArea?.name || ''}阈值曲线`"
            desc="按时间展示区域10kV资源总量、已有站点使用总量和新站接入阈值。"
            :labels="labels"
            :primary="selectedArea?.baselineSeries || []"
            :secondary="selectedArea?.usageTotalSeries || []"
            :tertiary="selectedArea?.thresholdSeries || []"
            primary-name="10kV资源总量(kV)"
            secondary-name="已有站点使用总量(kV)"
            tertiary-name="新站接入阈值(kV)"
          />
        </div>

        <div class="strategy-metric-grid">
          <div
            v-for="item in summaryMetrics"
            :key="item.label"
            class="strategy-metric-card"
          >
            <div class="label">{{ item.label }}</div>
            <strong>{{ item.value }}</strong>
          </div>
        </div>

        <div class="strategy-card">
          <div class="strategy-card-head">
            <div>
              <strong>{{ selectedArea?.name }}新建站</strong>
              <div class="muted">基于当前区域负荷曲线生成接入建议</div>
            </div>
            <span class="strategy-badge">{{ selectedArea?.buildCap }}</span>
          </div>
          <div class="strategy-copy">
            <p>{{ selectedArea?.maxAccessText }}</p>
            <p>{{ selectedArea?.reduceText }}</p>
          </div>
        </div>
      </div>
    </div>
  </CollapsiblePanel>
</template>

<style scoped>
.flex-control-map-chart {
  min-height: 280px;
}

.flex-control-side {
  gap: 12px;
}

.flex-side-top {
  display: grid;
  gap: 10px;
}

.chart-panel {
  padding: 12px;
  border-radius: 14px;
  border: 1px solid #dbe6f4;
  background: rgba(255, 255, 255, 0.86);
}

.strategy-card {
  display: grid;
  gap: 10px;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid #dbe6f4;
  background: rgba(255, 255, 255, 0.9);
}

.strategy-metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.strategy-metric-card {
  display: grid;
  gap: 6px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #dbe6f4;
  background: rgba(255, 255, 255, 0.92);
}

.strategy-metric-card strong {
  color: #284a78;
  font-size: 16px;
}

.strategy-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  color: #355173;
}

.strategy-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #eef4ff;
  color: #2955a6;
  font-weight: 700;
}

.strategy-copy {
  display: grid;
  gap: 8px;
  color: #355173;
  line-height: 1.6;
}

.strategy-copy p {
  margin: 0;
}

@media (max-width: 900px) {
  .strategy-metric-grid {
    grid-template-columns: 1fr;
  }
}
</style>
