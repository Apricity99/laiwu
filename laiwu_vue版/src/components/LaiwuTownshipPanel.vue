<script setup>
import * as echarts from "echarts";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import laiwuTownshipGeoJson from "../assets/maps/laiwu-townships-map.json";
import CollapsiblePanel from "./CollapsiblePanel.vue";
import LineChartCard from "./LineChartCard.vue";
import { getStatusTone } from "../data/dashboard";

const props = defineProps({
  title: {
    type: String,
    default: "\u8857\u9053/\u4e61\u9547\u7ec6\u5316\u5730\u56fe"
  },
  desc: {
    type: String,
    default: "\u57fa\u4e8e\u8857\u9053/\u4e61\u9547\u7c92\u5ea6\u67e5\u770b\u7ad9\u70b9\u6570\u91cf\u3001\u5145\u7535\u91cf\u589e\u957f\u548c\u5f53\u524d\u5145\u7535\u6869\u627f\u8f7d\u72b6\u6001\u3002"
  },
  labels: {
    type: Array,
    required: true
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
  resourceMappings: {
    type: Object,
    default: () => ({})
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
const sideMode = ref("resource");
const selectedStationId = ref("");
let chart;

const townshipFeatures = laiwuTownshipGeoJson.features || [];

const toneColors = {
  safe: "#44b879",
  warning: "#e5a623",
  danger: "#df5b57",
  uncovered: "#67be85"
};

const toneAreaColors = {
  safe: "#c9ead7",
  warning: "#f7dc94",
  danger: "#f4b3af",
  uncovered: "#daf1e2"
};

const toneLabelColors = {
  safe: "#1f8a51",
  warning: "#a66f00",
  danger: "#bd3d38",
  uncovered: "#358e57"
};

const townshipLoadStatus = {
  safe: {
    label: "\u7eff\u8272\u4f4e\u627f\u8f7d",
    desc: "\u5f53\u524d\u5145\u7535\u6869\u627f\u8f7d\u538b\u529b\u8f83\u4f4e\u3002"
  },
  warning: {
    label: "\u9ec4\u8272\u4e2d\u627f\u8f7d",
    desc: "\u5f53\u524d\u5145\u7535\u6869\u627f\u8f7d\u538b\u529b\u4e2d\u7b49\u3002"
  },
  danger: {
    label: "\u7ea2\u8272\u9ad8\u627f\u8f7d",
    desc: "\u5f53\u524d\u5145\u7535\u6869\u627f\u8f7d\u538b\u529b\u8f83\u9ad8\u3002"
  },
  uncovered: {
    label: "\u7eff\u8272\u672a\u8986\u76d6",
    desc: "\u5f53\u524d\u6682\u65e0\u5145\u7535\u7ad9\uff0c\u5c1a\u672a\u5f62\u6210\u627f\u8f7d\u538b\u529b\u3002"
  }
};

const resourceToneMap = {
  high: "danger",
  medium: "warning",
  low: "safe"
};

const resourceZoneMap = computed(() => new Map(props.resourceZones.map((item) => [item.townshipKey, item])));

const townshipView = computed(() =>
  props.townships.map((item) => ({
    ...item,
    latestEnergy: item.energySeries[item.energySeries.length - 1] || 0
  }))
);

const stationView = computed(() =>
  props.stations.map((item) => {
    const tone = getStatusTone(item.use);
    return {
      ...item,
      pileCount: (item.fast || 0) + (item.slow || 0),
      tone,
      zoneLabel: townshipLoadStatus[tone].label
    };
  })
);

const townshipWithPiles = computed(() =>
  townshipView.value.map((item) => {
    const relatedStations = stationView.value.filter((station) => station.townshipKey === item.key);
    const pileCount = relatedStations.reduce((sum, station) => sum + station.pileCount, 0);
    const zone = resourceZoneMap.value.get(item.key);
    const tone = zone ? resourceToneMap[zone.tone] || "safe" : pileCount > 0 ? getStatusTone(item.utilization) : "uncovered";
    return {
      ...item,
      realStationCount: relatedStations.length,
      pileCount,
      tone,
      zoneLabel: zone?.label || townshipLoadStatus[tone].label,
      advice: zone?.remark || townshipLoadStatus[tone].desc
    };
  })
);

const selectedTownship = computed(
  () => townshipWithPiles.value.find((item) => item.key === props.selectedKey) || townshipWithPiles.value[0]
);

const selectedTownshipStations = computed(() =>
  stationView.value.filter((item) => item.townshipKey === selectedTownship.value?.key)
);

const selectedZone = computed(
  () => props.resourceZones.find((item) => item.townshipKey === selectedTownship.value?.key) || null
);

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
  const zoom = Math.min(6, Math.max(1.8, Number((0.62 / ratio).toFixed(2))));

  return { center, zoom };
}

function buildResourcePoints(name, count) {
  const focus = getTownshipFocus(name);
  if (!focus.center) return [];

  const feature = getTownshipFeature(name);
  const points = extractGeometryPoints(feature?.geometry);
  const bounds = points.length ? getBounds(points) : null;
  const lngSpan = Math.max((bounds?.maxLng || focus.center[0]) - (bounds?.minLng || focus.center[0]), 0.012);
  const latSpan = Math.max((bounds?.maxLat || focus.center[1]) - (bounds?.minLat || focus.center[1]), 0.012);
  const radiusLng = lngSpan * 0.2;
  const radiusLat = latSpan * 0.18;

  return Array.from({ length: count }, (_, index) => {
    if (count === 1) {
      return [focus.center[0] - radiusLng * 0.35, focus.center[1] + radiusLat * 0.1];
    }
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    return [
      Number((focus.center[0] + Math.cos(angle) * radiusLng).toFixed(6)),
      Number((focus.center[1] + Math.sin(angle) * radiusLat).toFixed(6))
    ];
  });
}

function buildStationHistory(station, township) {
  const townshipEnergySeries = township?.energySeries || [];
  const lastEnergy = townshipEnergySeries[townshipEnergySeries.length - 1] || 1;
  const latestUse = Number(station?.use || 0);
  const latestLoad = Number(station?.load || 0);

  const loadSeries = townshipEnergySeries.map((value, index) => {
    const scaled = lastEnergy > 0 ? (value / lastEnergy) * latestLoad : latestLoad;
    const offset = index === townshipEnergySeries.length - 1 ? 0 : (index % 3) * 0.12;
    return Number(Math.max(0.5, scaled + offset).toFixed(1));
  });

  const townshipBaseline = townshipEnergySeries.map((value, index) => {
    const scaled = lastEnergy > 0 ? (value / lastEnergy) * latestUse : latestUse;
    const offset = index === townshipEnergySeries.length - 1 ? 0 : index % 2 === 0 ? -2 : 2;
    return Math.max(10, Math.min(99, Math.round(scaled + offset)));
  });

  return {
    loadSeries,
    townshipBaseline
  };
}

const selectedResourceItems = computed(() => {
  const township = selectedTownship.value;
  const stations = selectedTownshipStations.value;
  const zone = selectedZone.value;
  const explicitMappings = props.resourceMappings[township?.key] || [];
  const resourceCount = Math.max(
    zone?.resourceCount || 0,
    explicitMappings.length || 0,
    stations.length ? Math.min(Math.max(stations.length, 1), 3) : 1
  );
  const pointList = buildResourcePoints(township?.name, resourceCount);
  const baseName = zone?.resourceName || `${township?.name || ""} 10kV`;
  const stationCount = stations.length;

  if (explicitMappings.length) {
    return explicitMappings.map((item, index) => {
      const connectedStations = (item.stationIds || item.stationKeys || [])
        .map((stationKey) =>
          stations.find(
            (station) =>
              station.id === stationKey ||
              station.name === stationKey ||
              station.mapLabel === stationKey
          )
        )
        .filter(Boolean);

      return {
        id: item.id || `${township?.key || "township"}-resource-${index + 1}`,
        name: item.name || (resourceCount === 1 ? `${baseName} 资源` : `${baseName} 资源${index + 1}号`),
        townshipKey: township?.key,
        accessMode: item.accessMode || zone?.accessMode || "双间隔接入",
        reserveCapacity: item.reserveCapacity || `${Number((parseFloat(zone?.reserveCapacity) || 6) / Math.max(explicitMappings.length, 1)).toFixed(1)} kV`,
        remark: item.remark || zone?.remark || "当前可支撑多站点协同接入。",
        connectedLabel: item.connectedLabel || connectedStations.map((station) => station.name).join("、") || "暂无",
        value: item.value || pointList[index] || pointList[0],
        connectedStations
      };
    });
  }

  return Array.from({ length: resourceCount }, (_, index) => {
    let connectedStations = [];

    if (stationCount === 1) {
      connectedStations = [stations[0]];
    } else if (stationCount > 1) {
      connectedStations = [stations[index % stationCount], stations[(index + 1) % stationCount]];
      if (stationCount > 2 && index === 0) connectedStations.push(stations[2]);
      connectedStations = [...new Map(connectedStations.map((item) => [item.id, item])).values()];
    }

    const reserveCapacity = Number((parseFloat(zone?.reserveCapacity) || 6) / resourceCount).toFixed(1);

    return {
      id: `${township?.key || "township"}-resource-${index + 1}`,
      name: resourceCount === 1 ? `${baseName} \u8d44\u6e90` : `${baseName} \u8d44\u6e90${index + 1}\u53f7`,
      townshipKey: township?.key,
      accessMode: zone?.accessMode || "\u53cc\u95f4\u9694\u63a5\u5165",
      reserveCapacity: `${reserveCapacity} kV`,
      remark: zone?.remark || "\u5f53\u524d\u53ef\u652f\u6491\u591a\u7ad9\u70b9\u534f\u540c\u63a5\u5165\u3002",
      value: pointList[index],
      connectedStations
    };
  });
});

const selectedStation = computed(() => {
  if (sideMode.value !== "station") return null;
  return selectedTownshipStations.value.find((item) => item.id === selectedStationId.value) || null;
});

const selectedStationTrend = computed(() => {
  if (!selectedStation.value || !selectedTownship.value) {
    return {
      loadSeries: [],
      townshipBaseline: []
    };
  }
  return buildStationHistory(selectedStation.value, selectedTownship.value);
});

const selectedStationResourceNames = computed(() =>
  selectedResourceItems.value
    .filter((item) => item.connectedStations.some((station) => station.id === selectedStation.value?.id))
    .map((item) => item.name)
);

const resourceLinks = computed(() =>
  selectedResourceItems.value.flatMap((resource) =>
    resource.connectedStations.map((station) => ({
      fromName: resource.name,
      toName: station.name,
      coords: [resource.value, [station.lng, station.lat]],
      lineStyle: {
        color:
          selectedStation.value && selectedStation.value.id !== station.id
            ? "rgba(111, 155, 232, 0.18)"
            : "rgba(47, 107, 255, 0.55)",
        width: selectedStation.value && selectedStation.value.id === station.id ? 3 : 2,
        opacity: selectedStation.value && selectedStation.value.id !== station.id ? 0.32 : 0.9
      }
    }))
  )
);

function showResourceView() {
  sideMode.value = "resource";
  selectedStationId.value = "";
}

function showStationView(stationId) {
  sideMode.value = "station";
  selectedStationId.value = stationId;
}

function renderMap() {
  if (!chartRef.value) return;

  if (!chart) {
    chart = echarts.init(chartRef.value);
    chart.on("click", (params) => {
      if (params.data?.key) {
        emit("select", params.data.key);
        return;
      }
      if (params.data?.stationId) {
        emit("select", params.data.townshipKey);
      }
    });
  }

  echarts.registerMap("laiwu-township", laiwuTownshipGeoJson);
  const mapFocus = getTownshipFocus(selectedTownship.value?.name);

  chart.setOption({
    backgroundColor: "transparent",
    animationDurationUpdate: 320,
    tooltip: {
      trigger: "item",
      formatter(params) {
        if (params.seriesName === "10kV resource") {
          return [
            `<strong>${params.data.name}</strong>`,
            `\u63a5\u5165\u5bf9\u8c61\uff1a${params.data.connectedNames || "\u6682\u65e0"}`,
            `\u5bb9\u91cf\uff1a${params.data.reserveCapacity}`,
            params.data.remark ? `\u8bf4\u660e\uff1a${params.data.remark}` : null
          ].filter(Boolean).join("<br/>");
        }

        if (params.seriesName === "resource-link") {
          return [`<strong>${params.data.fromName}</strong>`, `\u63a5\u5165\u7ad9\u70b9\uff1a${params.data.toName}`].join("<br/>");
        }

        if (params.seriesType === "scatter") {
          return [
            `<strong>${params.data.fullName}</strong>`,
            `\u6240\u5728\u4e61\u9547\uff1a${townshipWithPiles.value.find((item) => item.key === params.data.townshipKey)?.name || "-"}`,
            `\u5f53\u524d\u8d1f\u8377\u72b6\u6001\uff1a${params.data.zoneLabel}`,
            `\u73b0\u6709\u5145\u7535\u6869\uff1a${params.data.pileCount} \u4e2a`
          ].join("<br/>");
        }

        return [
          `<strong>${params.name}</strong>`,
          `\u5145\u7535\u7ad9\u6570\u91cf\uff1a${params.data?.realStationCount || 0} \u5ea7`,
          `\u5f53\u524d\u72b6\u6001\uff1a${params.data?.zoneLabel || "-"}`
        ].join("<br/>");
      }
    },
    geo: {
      map: "laiwu-township",
      roam: false,
      layoutCenter: ["50%", "50%"],
      layoutSize: "96%",
      center: mapFocus.center,
      zoom: mapFocus.zoom,
      itemStyle: {
        areaColor: "transparent",
        borderColor: "transparent",
        borderWidth: 0
      },
      label: {
        show: false
      }
    },
    series: [
      {
        type: "map",
        map: "laiwu-township",
        roam: false,
        layoutCenter: ["50%", "50%"],
        layoutSize: "96%",
        center: mapFocus.center,
        zoom: mapFocus.zoom,
        zlevel: 1,
        data: townshipWithPiles.value.map((item) => ({
          key: item.key,
          name: item.name,
          district: item.district,
          zoneLabel: item.zoneLabel,
          realStationCount: item.realStationCount,
          pileCount: item.pileCount,
          value: item.pileCount > 0 ? item.utilization : 0,
          itemStyle: {
            areaColor: toneAreaColors[item.tone],
            borderColor: selectedTownship.value?.key === item.key ? toneColors[item.tone] : "#7f9fcb",
            borderWidth: selectedTownship.value?.key === item.key ? 4.2 : 1,
            opacity: selectedTownship.value?.key === item.key ? 1 : 0.55,
            shadowBlur: selectedTownship.value?.key === item.key ? 22 : 0,
            shadowColor: selectedTownship.value?.key === item.key ? `${toneColors[item.tone]}66` : "transparent"
          },
          label: {
            show: true,
            color: toneLabelColors[item.tone],
            fontSize: selectedTownship.value?.key === item.key ? 11 : 10,
            fontWeight: selectedTownship.value?.key === item.key ? 700 : 500,
            backgroundColor: selectedTownship.value?.key === item.key ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.66)",
            padding: selectedTownship.value?.key === item.key ? [3, 6] : [2, 4],
            borderRadius: 4
          }
        })),
        selectedMode: false
      },
      {
        name: "resource-link",
        type: "lines",
        coordinateSystem: "geo",
        zlevel: 3,
        polyline: false,
        effect: {
          show: true,
          period: 4,
          trailLength: 0.18,
          symbol: "arrow",
          symbolSize: 7,
          color: "#2f6bff"
        },
        data: resourceLinks.value
      },
      {
        name: "10kV resource",
        type: "scatter",
        coordinateSystem: "geo",
        zlevel: 4,
        data: selectedResourceItems.value.map((item) => ({
          ...item,
          connectedNames: item.connectedLabel || item.connectedStations.map((station) => station.name).join("\u3001") || "\u6682\u65e0",
          value: item.value,
          symbolSize: 17,
          itemStyle: {
            color: "#2f6bff",
            borderColor: "#ffffff",
            borderWidth: 2
          },
          label: {
            show: false,
            formatter: `${item.name}\n${item.connectedStations.length}\u7ad9`,
            position: "bottom",
            distance: 6,
            color: "#1f4275",
            fontSize: 10,
            fontWeight: 700,
            backgroundColor: "rgba(255,255,255,0.95)",
            padding: [3, 5],
            borderRadius: 4
          }
        }))
      },
      {
        type: "scatter",
        coordinateSystem: "geo",
        zlevel: 5,
        data: stationView.value.map((item) => ({
          name: item.mapLabel || item.name,
          fullName: item.name,
          stationId: item.id,
          townshipKey: item.townshipKey,
          pileCount: item.pileCount,
          zoneLabel: item.zoneLabel,
          value: [item.lng, item.lat, item.use],
          symbolSize: 14,
          itemStyle: {
            color: toneColors[item.tone],
            borderColor: "#ffffff",
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: `${item.mapLabel || item.name}\n${item.pileCount}\u6869`,
            position: "top",
            distance: 6,
            color: "#355173",
            fontSize: 10,
            fontWeight: 600,
            backgroundColor: "rgba(255,255,255,0.9)",
            padding: [2, 4],
            borderRadius: 4
          }
        })),
        labelLayout: {
          hideOverlap: true,
          moveOverlap: "shiftY"
        }
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

watch(
  () => selectedTownship.value?.key,
  () => {
    showResourceView();
  },
  { immediate: true }
);

watch(
  () => [props.selectedKey, props.townships, props.stations, props.resourceZones, props.resourceMappings, sideMode.value, selectedStationId.value],
  renderMap,
  { deep: true }
);

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
      <slot name="actions">
        <div class="tag">{{ selectedTownship?.name }} / {{ selectedTownship?.zoneLabel }}</div>
      </slot>
    </template>

    <div class="township-map-shell">
      <div ref="chartRef" class="township-map-chart"></div>

      <div class="township-side">
        <template v-if="sideMode === 'resource'">
          <div class="info-card">
            <div class="label">&#24403;&#21069;&#20065;&#38215;</div>
            <strong>{{ selectedTownship?.name }}</strong>
            <p class="muted">{{ selectedTownship?.district }} / {{ selectedTownship?.advice }}</p>
          </div>

          <div class="table-row header compact-table-row township-side-row">
            <span>&#25351;&#26631;</span>
            <span>&#24403;&#21069;&#20540;</span>
          </div>
          <div class="table-row compact-table-row township-side-row">
            <strong>10kV &#38388;&#38548;&#36164;&#28304;</strong>
            <span>{{ selectedResourceItems.length }} &#32452;</span>
          </div>
          <div class="table-row compact-table-row township-side-row">
            <strong>&#25509;&#20837;&#20805;&#30005;&#31449;</strong>
            <span>{{ selectedTownshipStations.length }} &#24231;</span>
          </div>

          <div class="sub-section-title">&#36164;&#28304;&#25509;&#20837;&#35814;&#24773;</div>
          <div class="resource-list compact-resource-list">
            <div v-for="item in selectedResourceItems" :key="item.id" class="resource-card compact-resource-card">
              <div class="resource-card-head">
                <strong>{{ item.name }}</strong>
                <span>{{ item.reserveCapacity }}</span>
              </div>
              <div class="resource-station-line">
                <span class="muted">&#25509;&#20837;&#31449;&#28857;&#65306;</span>
                <span>{{ item.connectedLabel || item.connectedStations.map((station) => station.name).join("、") || "暂无" }}</span>
              </div>
              <div v-if="item.remark" class="resource-station-line">
                <span class="muted">&#35828;&#26126;&#65306;</span>
                <span>{{ item.remark }}</span>
              </div>
            </div>
          </div>

          <div class="station-entry-box">
            <div class="sub-section-title" style="margin-top: 0;">&#20805;&#30005;&#31449;&#21382;&#21490;&#36127;&#33655;</div>
            <div class="station-entry-actions">
              <button
                v-for="item in selectedTownshipStations"
                :key="item.id"
                class="tab-btn station-history-btn"
                @click="showStationView(item.id)"
              >
                {{ item.mapLabel || item.name }}
              </button>
              <div v-if="!selectedTownshipStations.length" class="muted">
                &#24403;&#21069;&#21306;&#22495;&#26242;&#26080;&#20805;&#30005;&#31449;
              </div>
            </div>
          </div>

          <div class="status-note">{{ selectedTownship?.recommendation }}。{{ selectedTownship?.reason }}</div>
        </template>

        <template v-else-if="selectedStation">
          <div class="station-detail-head">
            <button class="tab-btn back-btn" @click="showResourceView()">
              &#36820;&#22238;&#36164;&#28304;&#35814;&#24773;
            </button>
          </div>

          <LineChartCard
            embedded
            :title="`${selectedStation.name}历史负荷曲线`"
            desc="点击下方充电站按钮进入，支持返回资源详情。"
            :labels="labels"
            :primary="selectedStationTrend.loadSeries"
            :secondary="selectedStationTrend.townshipBaseline"
            primary-name="站点负荷(MW)"
            secondary-name="站点利用率(%)"
          />

          <div class="table-row header compact-table-row township-side-row" style="margin-top: 4px;">
            <span>&#31449;&#28857;&#20449;&#24687;</span>
            <span>&#24403;&#21069;&#20540;</span>
          </div>
          <div class="table-row compact-table-row township-side-row">
            <strong>&#24403;&#21069;&#36127;&#33655;</strong>
            <span>{{ selectedStation.load }} MW</span>
          </div>
          <div class="table-row compact-table-row township-side-row">
            <strong>&#21033;&#29992;&#29575;</strong>
            <span>{{ selectedStation.use }}%</span>
          </div>
          <div class="table-row compact-table-row township-side-row">
            <strong>&#20851;&#32852;&#36164;&#28304;</strong>
            <span>{{ selectedStationResourceNames.join("、") || "暂无" }}</span>
          </div>
        </template>
      </div>
    </div>
  </CollapsiblePanel>
</template>

<style scoped>
.resource-list {
  display: grid;
  gap: 10px;
}

.compact-resource-list {
  gap: 8px;
}

.resource-card {
  display: grid;
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #dbe6f4;
  background: rgba(255, 255, 255, 0.86);
}

.compact-resource-card {
  gap: 6px;
  padding: 10px 12px;
}

.resource-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #284a78;
}

.resource-station-line {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px;
  align-items: start;
  color: #355173;
  font-size: 13px;
}

.station-entry-box {
  display: grid;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #dbe6f4;
  background: rgba(255, 255, 255, 0.78);
}

.station-entry-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.station-detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.back-btn,
.station-history-btn {
  flex: none;
}
</style>
