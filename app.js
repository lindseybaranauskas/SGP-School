// ============================================================
// SGP VP Assignment Dashboard
// Notebook-generated JSON data
// Scenario-aware dynamic rendering
// No embedded mock data
// ============================================================

const MODEL_DATA_PATHS = {
  summaryMetrics: "data/summary_metrics.json",
  scenarioSummaryMetrics: "data/scenario_summary_metrics.json",
  leaderWorkloadSummary: "data/leader_workload_summary.json",
  leaderDrilldown: "data/leader_drilldown.json",
  newOpportunities: "data/new_opportunities.json",
  sensitivityResults: "data/sensitivity_results.json",
  networkNodesEdges: "data/network_nodes_edges.json",
  optimizedAssignments: "data/optimized_assignments.json",
  scenarioLeaderWorkloads: "data/scenario_leader_workloads.json",
  scenarioOpportunityAssignments: "data/scenario_opportunity_assignments.json",
  scenarioLeaderDrilldown: "data/scenario_leader_drilldown.json",
  scenarioNetworkNodesEdges: "data/scenario_network_nodes_edges.json",
  scenarioOptimizedAssignments: "data/scenario_optimized_assignments.json"
};

const PREVIEW_LIMIT = 5;
const DEFAULT_CAPACITY = 1;

let dashboardData = null;
let activeNetworkFilter = "all";

let expandedTables = {
  opportunities: false,
  sensitivity: false,
  leader: false
};

// ============================================================
// DOM references
// ============================================================

const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");
const navCards = document.querySelectorAll(".nav-card");

const scenarioSelect = document.getElementById("scenarioSelect");
const scenarioWorkloadView = document.getElementById("scenarioWorkloadView");
const drilldownLeaderSelect = document.getElementById("drilldownLeaderSelect");
const opportunitySearch = document.getElementById("opportunitySearch");
const opportunityReviewFilter = document.getElementById("opportunityReviewFilter");

// ============================================================
// Utility helpers
// ============================================================

function getEl(id) {
  return document.getElementById(id);
}

function setHtml(id, html) {
  const el = getEl(id);
  if (el) el.innerHTML = html;
}

function setText(id, text) {
  const el = getEl(id);
  if (el) el.textContent = text ?? "";
}

function pickValue(obj, keys, fallback = undefined) {
  if (!obj) return fallback;

  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      return obj[key];
    }
  }

  return fallback;
}

function pickNumber(obj, keys, fallback = 0) {
  const value = pickValue(obj, keys, fallback);
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === "") return [];

  if (typeof value === "string") {
    return value
      .split(/[;,|]/)
      .map(item => item.trim())
      .filter(Boolean);
  }

  return [value];
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function normalizeServiceLine(value) {
  if (value === null || value === undefined) return "";

  const cleaned = String(value).trim().toUpperCase();

  if (cleaned === "EVS") return "EVS";
  if (cleaned === "CNS") return "CNS";

  if (
    cleaned.includes("ENVIRONMENTAL") ||
    cleaned.includes("HOUSEKEEP") ||
    cleaned.includes("JANITORIAL")
  ) {
    return "EVS";
  }

  if (
    cleaned.includes("CULINARY") ||
    cleaned.includes("NUTRITION") ||
    cleaned.includes("FOOD") ||
    cleaned.includes("DINING")
  ) {
    return "CNS";
  }

  return "";
}

function formatNumber(value, decimals = 1) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "--";

  return number.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function formatPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0%";

  if (number <= 2) {
    return `${Math.round(number * 100)}%`;
  }

  return `${Math.round(number)}%`;
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = typeof key === "function" ? key(item) : item[key];
    const label = value || "--";
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
}

function average(items, key) {
  if (!items.length) return 0;

  const total = items.reduce((sum, item) => {
    return sum + Number(item[key] || 0);
  }, 0);

  return total / items.length;
}

function getBadgeClass(value) {
  const text = String(value || "").toLowerCase();

  if (
    text.includes("over") ||
    text.includes("review") ||
    text.includes("required") ||
    text.includes("elevated") ||
    text.includes("risk")
  ) {
    return "risk";
  }

  if (
    text.includes("near") ||
    text.includes("medium") ||
    text.includes("moderate") ||
    text.includes("watch") ||
    text.includes("in progress")
  ) {
    return "warning";
  }

  if (
    text.includes("retained") ||
    text.includes("within") ||
    text.includes("available") ||
    text.includes("added") ||
    text.includes("complete") ||
    text.includes("contained") ||
    text.includes("clear") ||
    text.includes("assigned")
  ) {
    return "good";
  }

  return "neutral";
}

function getStatus(workload, capacity) {
  const safeCapacity = Number(capacity || DEFAULT_CAPACITY);
  const utilization = Number(workload || 0) / safeCapacity;

  if (utilization > 1) return "Over Capacity";
  if (utilization >= 0.95) return "Near Capacity";
  if (utilization <= 0.75) return "Available Capacity";
  return "Within Capacity";
}

function getStatusFromPct(percentValue) {
  const pct = Number(percentValue);

  if (!Number.isFinite(pct)) return "Within Capacity";
  if (pct > 100) return "Over Capacity";
  if (pct >= 95) return "Near Capacity";
  if (pct <= 75) return "Available Capacity";
  return "Within Capacity";
}

function getRiskLabel(overCapacityCount) {
  if (overCapacityCount >= 4) return "Elevated";
  if (overCapacityCount >= 2) return "Moderate";
  return "Contained";
}

function getComplexityLabel(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "Medium";
  if (number >= 1) return "High";
  if (number <= -0.5) return "Low";
  return "Medium";
}

function getScenarioNameFromRow(row) {
  return pickValue(
    row,
    [
      "Scenario",
      "scenario",
      "scenario_name",
      "scenarioName",
      "Scenario Name",
      "scenario_label",
      "scenarioLabel",
      "name"
    ],
    ""
  );
}

// ============================================================
// Data loading
// ============================================================

async function fetchModelJson(path, fallback) {
  try {
    const response = await fetch(path, { cache: "no-store" });

    if (!response.ok) {
      console.warn(`Could not load ${path}. Status: ${response.status}`);
      return fallback;
    }

    return await response.json();
  } catch (error) {
    console.warn(`Unable to load ${path}`, error);
    return fallback;
  }
}

async function loadModelOutputs() {
  const [
    summaryMetrics,
    scenarioSummaryMetrics,
    leaderWorkloadSummary,
    leaderDrilldown,
    newOpportunities,
    sensitivityResults,
    networkNodesEdges,
    optimizedAssignments,
    scenarioLeaderWorkloads,
    scenarioOpportunityAssignments,
    scenarioLeaderDrilldown,
    scenarioNetworkNodesEdges,
    scenarioOptimizedAssignments
  ] = await Promise.all([
    fetchModelJson(MODEL_DATA_PATHS.summaryMetrics, {}),
    fetchModelJson(MODEL_DATA_PATHS.scenarioSummaryMetrics, []),
    fetchModelJson(MODEL_DATA_PATHS.leaderWorkloadSummary, []),
    fetchModelJson(MODEL_DATA_PATHS.leaderDrilldown, []),
    fetchModelJson(MODEL_DATA_PATHS.newOpportunities, []),
    fetchModelJson(MODEL_DATA_PATHS.sensitivityResults, []),
    fetchModelJson(MODEL_DATA_PATHS.networkNodesEdges, { nodes: [], edges: [] }),
    fetchModelJson(MODEL_DATA_PATHS.optimizedAssignments, []),
    fetchModelJson(MODEL_DATA_PATHS.scenarioLeaderWorkloads, {}),
    fetchModelJson(MODEL_DATA_PATHS.scenarioOpportunityAssignments, {}),
    fetchModelJson(MODEL_DATA_PATHS.scenarioLeaderDrilldown, {}),
    fetchModelJson(MODEL_DATA_PATHS.scenarioNetworkNodesEdges, {}),
    fetchModelJson(MODEL_DATA_PATHS.scenarioOptimizedAssignments, {})
  ]);

  return {
    summaryMetrics,
    scenarioSummaryMetrics,
    leaderWorkloadSummary,
    leaderDrilldown,
    newOpportunities,
    sensitivityResults,
    networkNodesEdges,
    optimizedAssignments,
    scenarioLeaderWorkloads,
    scenarioOpportunityAssignments,
    scenarioLeaderDrilldown,
    scenarioNetworkNodesEdges,
    scenarioOptimizedAssignments
  };
}

// ============================================================
// Scenario-aware data access
// ============================================================

function getScenarioRows(dataset, scenarioName) {
  if (!dataset) return [];

  if (Array.isArray(dataset)) {
    const hasScenarioColumn = dataset.some(row => getScenarioNameFromRow(row));

    if (!hasScenarioColumn) return dataset;

    return dataset.filter(row => {
      return normalizeKey(getScenarioNameFromRow(row)) === normalizeKey(scenarioName);
    });
  }

  if (isPlainObject(dataset)) {
    if (Array.isArray(dataset[scenarioName])) return dataset[scenarioName];

    const matchedKey = Object.keys(dataset).find(key => {
      return normalizeKey(key) === normalizeKey(scenarioName);
    });

    if (matchedKey && Array.isArray(dataset[matchedKey])) {
      return dataset[matchedKey];
    }
  }

  return [];
}

function getScenarioObject(dataset, scenarioName, fallback = null) {
  if (!dataset) return fallback;

  if (isPlainObject(dataset)) {
    if (dataset[scenarioName]) return dataset[scenarioName];

    const matchedKey = Object.keys(dataset).find(key => {
      return normalizeKey(key) === normalizeKey(scenarioName);
    });

    if (matchedKey) return dataset[matchedKey];
  }

  return fallback;
}

function getAllScenarioNames() {
  if (!dashboardData) return [];

  const fromSummary = toArray(dashboardData.summaryMetrics.available_scenarios);
  const fromScenarioSummary = dashboardData.scenarioSummaryRows
    .map(row => getScenarioNameFromRow(row))
    .filter(Boolean);
  const fromLeaderWorkloads = isPlainObject(dashboardData.rawModelOutputs.scenarioLeaderWorkloads)
    ? Object.keys(dashboardData.rawModelOutputs.scenarioLeaderWorkloads)
    : [];
  const fromOpportunityAssignments = isPlainObject(dashboardData.rawModelOutputs.scenarioOpportunityAssignments)
    ? Object.keys(dashboardData.rawModelOutputs.scenarioOpportunityAssignments)
    : [];
  const fromDrilldown = isPlainObject(dashboardData.rawModelOutputs.scenarioLeaderDrilldown)
    ? Object.keys(dashboardData.rawModelOutputs.scenarioLeaderDrilldown)
    : [];
  const fromNetwork = isPlainObject(dashboardData.rawModelOutputs.scenarioNetworkNodesEdges)
    ? Object.keys(dashboardData.rawModelOutputs.scenarioNetworkNodesEdges)
    : [];
  const fromScenariosObject = dashboardData.scenarios ? Object.keys(dashboardData.scenarios) : [];

  const names = [
    ...fromSummary,
    ...fromScenarioSummary,
    ...fromLeaderWorkloads,
    ...fromOpportunityAssignments,
    ...fromDrilldown,
    ...fromNetwork,
    ...fromScenariosObject
  ].filter(Boolean);

  return [...new Set(names)];
}

function getSelectedScenarioName() {
  return scenarioSelect?.value || getAllScenarioNames()[0] || "";
}

function isCompareAllMode() {
  return getSelectedScenarioName() === "__all";
}

function getSingleScenarioName() {
  if (isCompareAllMode()) {
    return getAllScenarioNames().includes("Balanced Growth")
      ? "Balanced Growth"
      : getAllScenarioNames()[0];
  }

  return getSelectedScenarioName();
}

function getSelectedScenario() {
  return dashboardData.scenarios[getSingleScenarioName()] || Object.values(dashboardData.scenarios)[0];
}

// ============================================================
// Scenario summary helpers
// ============================================================

function getScenarioCandidateScore(row) {
  return pickNumber(
    row,
    [
      "Candidate Objective Score",
      "candidate_objective_score",
      "candidate_score",
      "candidateScore",
      "Base Objective Score",
      "base_objective_score",
      "baseline_score",
      "baselineScore"
    ],
    0
  );
}

function getScenarioOptimizedScore(row) {
  return pickNumber(
    row,
    [
      "Optimized Objective Score",
      "optimized_objective_score",
      "optimized_score",
      "optimizedScore",
      "objectiveScore",
      "score"
    ],
    0
  );
}

function getScenarioViolations(row) {
  return pickNumber(
    row,
    [
      "Optimized Capacity Violations",
      "optimized_capacity_violations",
      "Constraint Violations",
      "constraint_violations",
      "capacity_violations",
      "capacityViolations",
      "violations"
    ],
    0
  );
}

function getScenarioImprovement(row) {
  const explicitImprovement = pickValue(
    row,
    [
      "Percent Improvement Vs Base",
      "percent_improvement_vs_base",
      "percentImprovementVsBase",
      "Improvement",
      "improvement"
    ],
    null
  );

  if (explicitImprovement !== null) {
    const number = Number(explicitImprovement);
    return Number.isFinite(number) ? number : 0;
  }

  const candidate = getScenarioCandidateScore(row);
  const optimized = getScenarioOptimizedScore(row);

  if (!candidate) return 0;

  return ((candidate - optimized) / candidate) * 100;
}

function getScenarioReassignmentCount(row) {
  return pickNumber(
    row,
    [
      "Reassignment Count",
      "reassignment_count",
      "reassignments",
      "Reassignments",
      "candidate_to_optimized_change_count"
    ],
    0
  );
}

function getScenarioOverCapacityCount(row) {
  return pickNumber(
    row,
    [
      "Optimized Over Capacity Count",
      "optimized_over_capacity_count",
      "optimizedOverCapacityCount",
      "Over Capacity",
      "over_capacity"
    ],
    0
  );
}

function getScenarioNearCapacityCount(row) {
  return pickNumber(
    row,
    [
      "Optimized Near Capacity Count",
      "optimized_near_capacity_count",
      "optimizedNearCapacityCount",
      "Near Capacity",
      "near_capacity"
    ],
    0
  );
}

function getScenarioNewOpportunityCount(row) {
  return pickNumber(
    row,
    [
      "New Opportunity Count",
      "new_opportunity_count",
      "Total New Opportunities",
      "total_new_opportunities"
    ],
    0
  );
}

// ============================================================
// Model-output adapter
// ============================================================

function buildLeaderContextFromAssignments(assignments) {
  const context = {};

  assignments.forEach(row => {
    const recordType = String(pickValue(row, ["Record Type", "record_type"], "")).toLowerCase();
    const vp = pickValue(row, ["Assigned VP", "VP ID", "Leader", "leader_name"], null);

    if (!vp) return;

    if (!context[vp]) {
      context[vp] = {
        regions: {},
        serviceLines: {},
        currentFacilities: 0
      };
    }

    const region = pickValue(row, ["Region", "region"], null);
    const serviceLine = normalizeServiceLine(pickValue(row, ["Service Line", "service_line"], ""));

    if (region) {
      context[vp].regions[region] = (context[vp].regions[region] || 0) + 1;
    }

    if (serviceLine) {
      context[vp].serviceLines[serviceLine] = (context[vp].serviceLines[serviceLine] || 0) + 1;
    }

    if (recordType === "current") {
      context[vp].currentFacilities += 1;
    }
  });

  return context;
}

function mostCommonKey(countObject, fallback = "--") {
  const entries = Object.entries(countObject || {});
  if (!entries.length) return fallback;

  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

function keysFromCountObject(countObject) {
  return Object.keys(countObject || {}).filter(Boolean);
}

function buildLeaders(leaderSummary, leaderDrilldown, optimizedAssignments) {
  const assignmentContext = buildLeaderContextFromAssignments(optimizedAssignments);

  const drilldownByLeader = new Map(
    leaderDrilldown.map(row => {
      const key = pickValue(row, ["Leader", "VP ID", "leader_name", "VP Name"], "");
      return [String(key), row];
    })
  );

  return leaderSummary.map(row => {
    const leaderName = pickValue(row, ["Leader", "VP ID", "leader_name", "VP Name"], "Unknown Leader");
    const drilldown = drilldownByLeader.get(String(leaderName)) || {};
    const context = assignmentContext[leaderName] || {};

    const serviceMix = pickValue(drilldown, ["Service Mix", "service_mix"], {});
    const serviceLinesFromMix =
      serviceMix && typeof serviceMix === "object" && !Array.isArray(serviceMix)
        ? Object.keys(serviceMix)
        : [];

    const serviceLines = [
      ...new Set([
        ...toArray(pickValue(row, ["Service_Lines", "Service Lines", "Service Line", "service_lines"], [])),
        ...toArray(pickValue(drilldown, ["Service_Lines", "Service Lines", "Service Line", "service_lines"], [])),
        ...serviceLinesFromMix,
        ...keysFromCountObject(context.serviceLines)
      ].map(normalizeServiceLine).filter(Boolean))
    ];

    const baseline = pickNumber(
      row,
      ["Base Workload", "base Workload", "baseline_workload", "Baseline Workload", "Current Workload"],
      0
    );

    const optimized = pickNumber(
      row,
      ["Optimized Workload", "optimized_workload", "Final Workload"],
      baseline
    );

    const capacity = pickNumber(row, ["Capacity", "capacity"], DEFAULT_CAPACITY);

    const baselineUtilPct = pickNumber(
      row,
      ["Baseline Utilization %", "baseline_utilization_pct"],
      (baseline / capacity) * 100
    );

    const optimizedUtilRaw = pickNumber(
      row,
      ["Capacity Utilization", "Optimized Utilization %", "optimized_utilization_pct"],
      optimized / capacity
    );

    const optimizedUtilPct = optimizedUtilRaw <= 2 ? optimizedUtilRaw * 100 : optimizedUtilRaw;

    const region = pickValue(
      row,
      ["Region", "region", "Market", "Division"],
      pickValue(
        drilldown,
        ["Region", "region", "Market", "Division"],
        mostCommonKey(context.regions, "--")
      )
    );

    const facilityCount = pickNumber(
      row,
      ["Base Facility Count", "base Facility Count", "Current Facility Count", "facility_count", "Facility Count"],
      context.currentFacilities || 0
    );

    return {
      name: leaderName,
      baseline,
      optimized,
      capacity,
      baselineUtilPct,
      optimizedUtilPct,
      region,
      serviceLines,
      serviceLine: serviceLines[0] || "--",
      facilityCount,
      capacityStatus: pickValue(row, ["Capacity Status", "capacity_status"], getStatusFromPct(baselineUtilPct)),
      optimizedStatus: getStatusFromPct(optimizedUtilPct),
      change: Number((optimized - baseline).toFixed(2))
    };
  });
}

function normalizeScenarioLeaderRow(row) {
  const leaderName = pickValue(row, ["Leader", "VP ID", "leader_name", "VP Name", "name"], "Unknown Leader");

  const baseline = pickNumber(
    row,
    ["Base Workload", "base Workload", "baseline_workload", "Baseline Workload", "Current Workload"],
    0
  );

  const optimized = pickNumber(
    row,
    ["Optimized Workload", "optimized_workload", "Final Workload"],
    baseline
  );

  const capacity = pickNumber(row, ["Capacity", "capacity"], DEFAULT_CAPACITY);

  const baselineUtilPct = pickNumber(
    row,
    ["Baseline Utilization %", "baseline_utilization_pct"],
    (baseline / capacity) * 100
  );

  const rawOptimizedUtil = pickNumber(
    row,
    ["Capacity Utilization", "Optimized Utilization %", "optimized_utilization_pct"],
    optimized / capacity
  );

  const optimizedUtilPct = rawOptimizedUtil <= 2 ? rawOptimizedUtil * 100 : rawOptimizedUtil;

  const serviceMix = pickValue(row, ["Service Mix", "service_mix"], {});
  const serviceLinesFromMix =
    serviceMix && typeof serviceMix === "object" && !Array.isArray(serviceMix)
      ? Object.keys(serviceMix)
      : [];

  const serviceLines = [
    ...new Set(
      [
        ...toArray(pickValue(row, ["Service_Lines", "Service Lines", "Service Line", "service_lines"], [])),
        ...serviceLinesFromMix
      ]
        .map(normalizeServiceLine)
        .filter(Boolean)
    )
  ];

  return {
    name: leaderName,
    baseline,
    optimized,
    capacity,
    baselineUtilPct,
    optimizedUtilPct,
    region: pickValue(row, ["Region", "region", "Market", "Division"], "--"),
    serviceLines,
    serviceLine: serviceLines[0] || "--",
    facilityCount: pickNumber(row, ["Base Facility Count", "base Facility Count", "Current Facility Count", "facility_count", "Facility Count"], 0),
    capacityStatus: pickValue(row, ["Capacity Status", "capacity_status"], getStatusFromPct(baselineUtilPct)),
    optimizedStatus: pickValue(row, ["Capacity Status", "optimized_capacity_status", "Optimized Capacity Status", "capacity_status"], getStatusFromPct(optimizedUtilPct)),
    change: Number((optimized - baseline).toFixed(2))
  };
}

function buildOpportunities(opportunityRows) {
  return opportunityRows.map(row => {
    const id = pickValue(row, ["Facility ID", "Opportunity ID", "id", "opportunity_id"], "Opportunity");

    const assignedVp = pickValue(
      row,
      ["Recommended VP", "Assigned VP", "assigned_vp", "assigned_leader", "recommended_vp"],
      "--"
    );

    const currentVp = pickValue(row, ["Current VP", "current_vp"], null);
    const serviceLine = normalizeServiceLine(pickValue(row, ["Service Line", "service_line"], ""));
    const assignmentCost = pickNumber(row, ["Assignment Score", "Assignment Cost", "assignment_score", "score", "Score"], 0);
    const region = pickValue(row, ["Region", "region"], "--");

    const isReviewRaw = pickValue(row, ["Review Required", "review", "Is Reassignment", "is_reassignment"], false);
    const isReview =
      isReviewRaw === true ||
      String(isReviewRaw).toLowerCase() === "true" ||
      String(isReviewRaw).toLowerCase() === "yes" ||
      String(isReviewRaw) === "1";

    return {
      scenarioName: getScenarioNameFromRow(row),
      id: String(id).startsWith("Opportunity") ? String(id) : `Opportunity ${id}`,
      baseLeader: currentVp || assignedVp,
      altLeader: assignedVp,
      leader: assignedVp,
      region,
      serviceLine,
      facilityType: pickValue(row, ["Facility Type", "facility_type"], "New Opportunity"),
      complexity: getComplexityLabel(pickValue(row, ["Facility Complexity Score", "complexity"], null)),
      workload: Number(assignmentCost).toFixed(2),
      score: Number(assignmentCost).toFixed(2),
      impact: pickValue(row, ["Impact", "impact", "capacity_status"], assignedVp === "--" ? "Review Required" : "Assigned"),
      review: isReview || assignedVp === "--"
    };
  });
}

function buildServiceLineScope(assignments, leaders) {
  const currentAssignments = assignments.filter(row => {
    const recordType = String(pickValue(row, ["Record Type", "record_type"], "")).toLowerCase();
    return recordType === "current" || recordType === "";
  });

  const serviceLines = ["EVS", "CNS"];
  const totalFacilities = currentAssignments.length || 1;

  return serviceLines.map(serviceLine => {
    const rows = currentAssignments.filter(row => {
      return normalizeServiceLine(pickValue(row, ["Service Line", "service_line"], "")) === serviceLine;
    });

    const activeVpSet = new Set(
      rows
        .map(row => pickValue(row, ["Assigned VP", "VP ID", "Leader"], ""))
        .filter(Boolean)
    );

    const relatedLeaders = leaders.filter(leader => {
      return leader.serviceLines.includes(serviceLine);
    });

    const overCapacity = relatedLeaders.filter(leader => {
      return leader.baselineUtilPct > 100;
    }).length;

    const avgWorkload = relatedLeaders.length
      ? relatedLeaders.reduce((sum, leader) => sum + Number(leader.baseline || 0), 0) / relatedLeaders.length
      : 0;

    const avgUtilization = relatedLeaders.length
      ? relatedLeaders.reduce((sum, leader) => sum + Number(leader.baselineUtilPct || 0), 0) / relatedLeaders.length
      : 0;

    return {
      serviceLine,
      facilities: rows.length,
      activeVPs: activeVpSet.size || relatedLeaders.length,
      avgUtilization: `${Math.round(avgUtilization)}%`,
      avgWorkload: Number(avgWorkload.toFixed(2)),
      leadersOverCapacity: overCapacity,
      networkShare: `${Math.round((rows.length / totalFacilities) * 100)}%`,
      risk: getRiskLabel(overCapacity)
    };
  });
}

function inferRegionFromAssignment(row) {
  const explicitRegion = pickValue(
    row,
    ["Region", "region", "Market", "market", "Division", "division", "Territory", "territory"],
    null
  );

  if (explicitRegion) return explicitRegion;

  const lat = Number(pickValue(row, ["Latitude", "latitude", "lat"], null));
  const lng = Number(pickValue(row, ["Longitude", "longitude", "lng", "lon"], null));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return "Unassigned Region";
  }

  if (lng <= -115) return "West";
  if (lng <= -100) return "Southwest";
  if (lng <= -88 && lat >= 37) return "Midwest";
  if (lng <= -88 && lat < 37) return "Southwest";
  if (lng <= -75 && lat >= 38) return "Northeast";
  if (lng <= -75 && lat < 38) return "Southeast";
  if (lat >= 38) return "Northeast";

  return "Southeast";
}

function buildRegionalScopeFromAssignments(assignments, leaders) {
  const currentAssignments = assignments.filter(row => {
    const recordType = String(pickValue(row, ["Record Type", "record_type"], "")).toLowerCase();
    return recordType === "current" || recordType === "";
  });

  const grouped = currentAssignments.reduce((acc, row) => {
    const region = inferRegionFromAssignment(row);

    if (!acc[region]) {
      acc[region] = {
        assignments: [],
        vpSet: new Set()
      };
    }

    acc[region].assignments.push(row);

    const assignedVp = pickValue(row, ["Assigned VP", "VP ID", "Leader", "leader_name"], null);
    if (assignedVp) acc[region].vpSet.add(assignedVp);

    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([region, group]) => {
      const regionalLeaders = leaders.filter(leader => {
        return group.vpSet.has(leader.name);
      });

      const overCapacity = regionalLeaders.filter(leader => {
        return Number(leader.baselineUtilPct || 0) > 100;
      }).length;

      const avgUtilization = regionalLeaders.length
        ? regionalLeaders.reduce((sum, leader) => sum + Number(leader.baselineUtilPct || 0), 0) / regionalLeaders.length
        : 0;

      const highestUtilization = regionalLeaders.length
        ? Math.max(...regionalLeaders.map(leader => Number(leader.baselineUtilPct || 0)))
        : 0;

      return {
        region,
        facilities: group.assignments.length,
        activeVPs: group.vpSet.size,
        avgUtilization: `${Math.round(avgUtilization)}%`,
        highestUtilization: `${Math.round(highestUtilization)}%`,
        leadersOverCapacity: overCapacity,
        risk: getRiskLabel(overCapacity)
      };
    })
    .sort((a, b) => b.facilities - a.facilities);
}

function buildLeaderDetailsFromRows(leaderDrilldownRows, opportunities) {
  const details = {};

  leaderDrilldownRows.forEach(row => {
    const leaderName = pickValue(row, ["Leader", "VP ID", "leader_name"], "Unknown Leader");

    const assignedFacilities = toArray(
      pickValue(row, ["Assigned Facilities", "assigned_facilities"], [])
    );

    const assignedOpportunities = toArray(
      pickValue(row, ["Assigned Opportunities", "assigned_opportunities"], [])
    );

    details[leaderName] = [
      ...assignedFacilities.map(item => ({
        name: `Facility ${pickValue(item, ["Facility ID", "id"], "")}`,
        type: "Existing Facility",
        serviceLine: normalizeServiceLine(pickValue(item, ["Service Line", "service_line"], "")),
        facilityType: "Existing Facility",
        region: pickValue(item, ["Region", "region"], inferRegionFromAssignment(item)),
        workload: Number(pickValue(item, ["Assignment Cost", "workload"], 0)).toFixed(2),
        status: "Retained"
      })),
      ...assignedOpportunities.map(item => ({
        name: `Opportunity ${pickValue(item, ["Facility ID", "Opportunity ID", "id"], "")}`,
        type: "New Opportunity",
        serviceLine: normalizeServiceLine(pickValue(item, ["Service Line", "service_line"], "")),
        facilityType: "New Opportunity",
        region: pickValue(item, ["Region", "region"], inferRegionFromAssignment(item)),
        workload: Number(pickValue(item, ["Assignment Cost", "workload"], 0)).toFixed(2),
        status: "Added"
      }))
    ];
  });

  opportunities.forEach(opp => {
    const leaderName = opp.leader || opp.altLeader || opp.baseLeader;
    if (!leaderName || leaderName === "--") return;

    if (!details[leaderName]) details[leaderName] = [];

    const exists = details[leaderName].some(item => item.name === opp.id);

    if (!exists) {
      details[leaderName].push({
        name: opp.id,
        type: "New Opportunity",
        serviceLine: opp.serviceLine,
        facilityType: opp.facilityType,
        region: opp.region,
        workload: opp.workload,
        status: opp.review ? "Review Required" : "Added"
      });
    }
  });

  return details;
}

function buildScenarioObject(scenarioRows, summaryMetrics, leaders, opportunities) {
  const scenarios = {};

  const strategyMap = {
    "Balanced Growth": "Balanced tradeoff",
    "Capacity Protection": "Reduce overload risk",
    "Geographic Efficiency": "Improve territory alignment",
    "Service Line Fit": "Improve EVS/CNS alignment",
    "Minimize Disruption": "Preserve current relationships"
  };

  const priorityMap = {
    "Balanced Growth": "Balance workload, geography, EVS/CNS fit, and disruption",
    "Capacity Protection": "Protect VP capacity first",
    "Geographic Efficiency": "Reduce geographic spread and travel burden",
    "Service Line Fit": "Match opportunities to service-line familiarity",
    "Minimize Disruption": "Reduce implementation change"
  };

  scenarioRows.forEach(row => {
    const name = getScenarioNameFromRow(row);
    if (!name) return;

    const optimizedScore = getScenarioOptimizedScore(row);
    const violations = getScenarioViolations(row);
    const improvement = getScenarioImprovement(row);

    const scenarioLeaderRows = getScenarioRows(
      dashboardData?.rawModelOutputs?.scenarioLeaderWorkloads || {},
      name
    ).map(normalizeScenarioLeaderRow);

    const leaderRowsForMetrics = scenarioLeaderRows.length ? scenarioLeaderRows : leaders;

    const avgOptimizedUtilization = leaderRowsForMetrics.length
      ? leaderRowsForMetrics.reduce((sum, leader) => sum + Number(leader.optimizedUtilPct || 0), 0) / leaderRowsForMetrics.length
      : 0;

    const highestOptimizedUtilization = leaderRowsForMetrics.length
      ? Math.max(...leaderRowsForMetrics.map(leader => Number(leader.optimizedUtilPct || 0)))
      : 0;

    const optimizedOverCapacity = leaderRowsForMetrics.filter(leader => {
      return Number(leader.optimizedUtilPct || 0) > 100;
    }).length;

    const scenarioOpportunities = getScenarioRows(
      dashboardData?.rawModelOutputs?.scenarioOpportunityAssignments || {},
      name
    );

    scenarios[name] = {
      strategy: pickValue(row, ["Strategy Type", "strategy_type", "strategy"], strategyMap[name] || "Model-generated scenario"),
      priority: priorityMap[name] || "Evaluate model-generated assignment tradeoffs",
      recommendationHeadline:
        name === "Balanced Growth"
          ? "Balanced Growth is the recommended default scenario."
          : `${name} scenario highlights a different optimization tradeoff.`,
      recommendationDetail:
        "This scenario is generated from the Python model output and compared against the current-state baseline.",
      optimizedMetrics: {
        totalLeaders: pickNumber(row, ["Total Leaders", "total_leaders", "Leader Count", "leader_count"], summaryMetrics.total_leaders ?? summaryMetrics.leader_count ?? leaderRowsForMetrics.length),
        newOpportunities: getScenarioNewOpportunityCount(row) || scenarioOpportunities.length || opportunities.length,
        reassignments: getScenarioReassignmentCount(row),
        leadersOverCapacity: getScenarioOverCapacityCount(row) || optimizedOverCapacity,
        nearCapacity: getScenarioNearCapacityCount(row),
        averageUtilization: `${Math.round(avgOptimizedUtilization)}%`,
        highestUtilization: `${Math.round(highestOptimizedUtilization)}%`,
        workloadImprovement: `${improvement.toFixed(1)}%`,
        objectiveScore: Number.isFinite(optimizedScore) ? optimizedScore.toFixed(2) : "--",
        constraintViolations: violations
      },
      baselineNarrative: [
        "The current-state baseline reflects existing VP assignments before scenario optimization.",
        "Capacity, service-line alignment, and assignment concentration are evaluated before growth is absorbed.",
        "Current-state values come from the notebook-generated facilities model."
      ],
      optimizedNarrative: [
        "The optimized state reflects model-generated assignments for the selected scenario.",
        "Scenario results compare baseline conditions against optimized model output.",
        "Capacity violations and objective score are used to support executive tradeoff review."
      ],
      optimizedScore,
      violations,
      improvement
    };
  });

  return scenarios;
}

function buildDashboardDataFromModel(modelOutputs) {
  const summaryMetrics = modelOutputs.summaryMetrics || {};

  const scenarioSummaryRows = toArray(modelOutputs.scenarioSummaryMetrics).length
    ? toArray(modelOutputs.scenarioSummaryMetrics)
    : toArray(summaryMetrics.scenario_summaries).length
      ? toArray(summaryMetrics.scenario_summaries)
      : toArray(modelOutputs.sensitivityResults);

  const leaderSummary = toArray(modelOutputs.leaderWorkloadSummary);
  const leaderDrilldown = toArray(modelOutputs.leaderDrilldown);
  const opportunitiesRaw = toArray(modelOutputs.newOpportunities);
  const optimizedAssignments = toArray(modelOutputs.optimizedAssignments);

  const leaders = buildLeaders(leaderSummary, leaderDrilldown, optimizedAssignments);
  const opportunities = buildOpportunities(opportunitiesRaw);

  const baseOverCapacity = leaders.filter(leader => Number(leader.baselineUtilPct || 0) > 100).length;

  const totalLeaders = summaryMetrics.total_leaders ?? summaryMetrics.leader_count ?? leaders.length;

  const existingFacilities =
    summaryMetrics.total_facilities ??
    summaryMetrics.current_facility_count ??
    optimizedAssignments.filter(row => {
      return String(pickValue(row, ["Record Type", "record_type"], "")).toLowerCase() === "current";
    }).length;

  const averageUtilization = leaders.length
    ? leaders.reduce((sum, leader) => sum + Number(leader.baselineUtilPct || 0), 0) / leaders.length
    : 0;

  const highestUtilization = leaders.length
    ? Math.max(...leaders.map(leader => Number(leader.baselineUtilPct || 0)))
    : 0;

  const currentState = {
    totalLeaders,
    existingFacilities,
    leadersOverCapacity:
      summaryMetrics.base_over_capacity_count ??
      baseOverCapacity,
    averageUtilization: `${Math.round(averageUtilization)}%`,
    highestUtilization: `${Math.round(highestUtilization)}%`,
    currentRiskAreas: summaryMetrics.base_capacity_violations ?? baseOverCapacity,
    serviceLineScope: buildServiceLineScope(optimizedAssignments, leaders),
    regionalScope: buildRegionalScopeFromAssignments(optimizedAssignments, leaders),
    observations: [
      {
        title: "Capacity pressure is uneven",
        body: "The current model identifies leaders who are over capacity, near capacity, or available for additional work."
      },
      {
        title: "Service-line scope is limited to EVS and CNS",
        body: "The dashboard treats EVS and CNS as the only valid service lines for this project."
      },
      {
        title: "Regional coverage is model-driven",
        body: "Region values are inferred from notebook-exported assignment and facility data."
      },
      {
        title: "Reoptimization matters",
        body: "Current assignments are compared against optimized assignments generated by the model."
      }
    ]
  };

  const baseData = {
    currentState,
    leaders,
    opportunities,
    scenarioSummaryRows,
    leaderDetails: buildLeaderDetailsFromRows(leaderDrilldown, opportunities),
    decisionLog: [],
    summaryMetrics,
    rawModelOutputs: modelOutputs
  };

  dashboardData = {
    ...baseData,
    scenarios: {}
  };

  dashboardData.scenarios = buildScenarioObject(
    scenarioSummaryRows,
    summaryMetrics,
    leaders,
    opportunities
  );

  return dashboardData;
}

// ============================================================
// Rendering helpers
// ============================================================

function renderKpis(containerId, rows) {
  setHtml(containerId, rows.map(row => `
    <div class="metric-card">
      <span>${row.label}</span>
      <strong>${row.value}</strong>
      ${row.note ? `<small>${row.note}</small>` : ""}
    </div>
  `).join(""));
}

function renderPills(containerId, rows) {
  setHtml(containerId, rows.map(row => `
    <span class="pill">${row.label} <strong>${row.value}</strong></span>
  `).join(""));
}

function renderCompactWorkload(containerId, rows, mode = "current") {
  setHtml(containerId, rows.map(row => {
    const pct = mode === "current"
      ? Number(row.baselineUtilPct || 0)
      : Number(row.optimizedUtilPct || 0);

    const fillClass = pct > 100 ? "red" : pct >= 95 ? "yellow" : "green";
    const status = getStatusFromPct(pct);

    return `
      <div class="compact-row">
        <strong>${row.name}</strong>
        <div class="bar-track">
          <div class="bar-fill ${fillClass}" style="width:${Math.min(pct, 120)}%"></div>
        </div>
        <span>${Math.round(pct)}%</span>
        <span class="badge ${getBadgeClass(status)}">${status}</span>
      </div>
    `;
  }).join(""));
}

function renderDualWorkload(containerId, rows) {
  setHtml(containerId, `
    <div class="workload-legend">
      <span><i class="legend-dot baseline-dot"></i>Current / Baseline</span>
      <span><i class="legend-dot optimized-dot"></i>Optimized / Selected Scenario</span>
    </div>

    ${rows.map(row => {
      const baselinePct = Number(row.baselineUtilPct || 0);
      const optimizedPct = Number(row.optimizedUtilPct || 0);

      const baselineClass = baselinePct > 100 ? "red" : baselinePct >= 95 ? "yellow" : "green";
      const optimizedClass = optimizedPct > 100 ? "red" : optimizedPct >= 95 ? "yellow" : "green";

      return `
        <div class="compact-row">
          <strong>${row.name}</strong>
          <div>
            <div class="bar-label-row">
              <span>Current</span>
              <span>${Math.round(baselinePct)}%</span>
            </div>
            <div class="bar-track" title="Current / Baseline">
              <div class="bar-fill ${baselineClass}" style="width:${Math.min(baselinePct, 120)}%"></div>
            </div>

            <div class="bar-label-row">
              <span>Optimized</span>
              <span>${Math.round(optimizedPct)}%</span>
            </div>
            <div class="bar-track" title="Optimized / Selected Scenario">
              <div class="bar-fill ${optimizedClass}" style="width:${Math.min(optimizedPct, 120)}%"></div>
            </div>
          </div>
          <span>${Math.round(baselinePct)}% → ${Math.round(optimizedPct)}%</span>
          <span class="badge ${getBadgeClass(row.optimizedStatus)}">${row.optimizedStatus}</span>
        </div>
      `;
    }).join("")}
  `);
}

function renderPreviewTable(tbodyId, statusId, buttonId, rows, expandedKey, renderRow) {
  const expanded = expandedTables[expandedKey];
  const visibleRows = expanded ? rows : rows.slice(0, PREVIEW_LIMIT);

  setHtml(tbodyId, visibleRows.map(renderRow).join(""));

  const status = getEl(statusId);
  const button = getEl(buttonId);

  if (!status || !button) return;

  if (rows.length <= PREVIEW_LIMIT) {
    status.textContent = `Showing ${rows.length} rows`;
    button.classList.add("hidden");
  } else {
    status.textContent = expanded
      ? `Showing all ${rows.length} rows`
      : `Showing first ${visibleRows.length} of ${rows.length} rows`;

    button.textContent = expanded ? "Show less" : "Show all";
    button.classList.remove("hidden");
  }
}

// ============================================================
// Tab switching
// ============================================================

function switchTab(tabId) {
  tabButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.tab === tabId);
  });

  tabPanels.forEach(panel => {
    panel.classList.toggle("active", panel.id === tabId);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ============================================================
// Current state
// ============================================================

function renderCurrentState() {
  const cs = dashboardData.currentState;

  renderKpis("currentStateKpis", [
    { label: "Total VP Network", value: cs.totalLeaders },
    { label: "Existing Facilities", value: cs.existingFacilities },
    { label: "VPs Over Capacity", value: cs.leadersOverCapacity },
    { label: "Avg Utilization", value: cs.averageUtilization },
    { label: "Highest Utilization", value: cs.highestUtilization },
    { label: "Risk Areas", value: cs.currentRiskAreas }
  ]);

  const priorityRows = [...dashboardData.leaders]
    .sort((a, b) => Number(b.baselineUtilPct || 0) - Number(a.baselineUtilPct || 0))
    .slice(0, 8);

  renderCompactWorkload("currentWorkloadList", priorityRows, "current");

  setHtml("serviceLineScopeCards", cs.serviceLineScope.map(item => `
    <div class="scope-card">
      <div class="scope-card-header">
        <h3>${item.serviceLine}</h3>
        <span class="scope-share">${item.networkShare}</span>
      </div>
      <div class="scope-stat-grid">
        <div class="scope-stat"><span>Facilities</span><strong>${item.facilities}</strong></div>
        <div class="scope-stat"><span>Active VPs</span><strong>${item.activeVPs}</strong></div>
        <div class="scope-stat"><span>Avg Workload</span><strong>${item.avgWorkload}</strong></div>
        <div class="scope-stat"><span>Avg Util.</span><strong>${item.avgUtilization}</strong></div>
        <div class="scope-stat"><span>VPs Over Capacity</span><strong>${item.leadersOverCapacity}</strong></div>
        <div class="scope-stat"><span>Risk</span><strong><span class="badge ${getBadgeClass(item.risk)}">${item.risk}</span></strong></div>
      </div>
    </div>
  `).join(""));

  setHtml("regionalScopeCards", cs.regionalScope.map(item => `
    <div class="scope-card">
      <div class="scope-card-header">
        <h3>${item.region}</h3>
        <span class="badge ${getBadgeClass(item.risk)}">${item.risk}</span>
      </div>
      <div class="scope-stat-grid">
        <div class="scope-stat"><span>Facilities</span><strong>${item.facilities}</strong></div>
        <div class="scope-stat"><span>Active VPs</span><strong>${item.activeVPs}</strong></div>
        <div class="scope-stat"><span>Avg Util.</span><strong>${item.avgUtilization}</strong></div>
        <div class="scope-stat"><span>Highest</span><strong>${item.highestUtilization}</strong></div>
      </div>
    </div>
  `).join(""));

  setHtml("currentStateObservations", cs.observations.map(item => `
    <div class="observation-card">
      <h3>${item.title}</h3>
      <p>${item.body}</p>
    </div>
  `).join(""));
}

// ============================================================
// Home
// ============================================================

function renderHome() {
  const scenario = dashboardData.scenarios["Balanced Growth"] || Object.values(dashboardData.scenarios)[0];
  const cs = dashboardData.currentState;

  setText("homeRecommendationHeadline", scenario?.recommendationHeadline || "Model outputs loaded");
  setText("homeRecommendationDetail", scenario?.recommendationDetail || "Dashboard is populated from notebook-generated JSON files.");

  renderKpis("homeKpis", [
    { label: "Total VP Network", value: cs.totalLeaders },
    { label: "Existing Facilities", value: cs.existingFacilities },
    { label: "New Opportunities", value: scenario?.optimizedMetrics?.newOpportunities ?? dashboardData.opportunities.length },
    { label: "Recommended Changes", value: scenario?.optimizedMetrics?.reassignments ?? "--" },
    { label: "Capacity Risk", value: `${cs.leadersOverCapacity} → ${scenario?.optimizedMetrics?.leadersOverCapacity ?? "--"}` },
    { label: "Objective Score", value: scenario?.optimizedMetrics?.objectiveScore ?? "--" }
  ]);
}

// ============================================================
// Scenarios
// ============================================================

function renderDashboard() {
  renderHome();
  renderCurrentState();
  renderScenario();
}

function renderScenario() {
  if (isCompareAllMode()) {
    renderAllScenarioMode();
  } else {
    renderSingleScenarioMode();
  }

  renderOpportunitySection();
  renderWorkloadSection();
  renderSensitivitySection();
  renderLeaderDrilldown();
  renderNetwork();
}

function renderSingleScenarioMode() {
  const scenarioName = getSingleScenarioName();
  const scenario = dashboardData.scenarios[scenarioName];
  const cs = dashboardData.currentState;
  const optimized = scenario.optimizedMetrics;

  setText("summaryTitle", "Current state vs optimized state");
  setText("summaryIntro", "Side-by-side comparison of the baseline network and selected scenario.");
  setText("recommendationHeadline", scenario.recommendationHeadline);
  setText("recommendationDetail", `${scenario.priority}. ${scenario.recommendationDetail}`);

  getEl("singleScenarioSummary")?.classList.remove("hidden");
  getEl("allScenarioSummary")?.classList.add("hidden");

  setHtml("scenarioComparisonCards", `
    <div class="compare-card">
      <span>Current State</span>
      <div class="score-grid">
        <div class="score-item">
          <span>Total VPs</span>
          <strong>${cs.totalLeaders}</strong>
        </div>
        <div class="score-item">
          <span>Facilities</span>
          <strong>${cs.existingFacilities}</strong>
        </div>
        <div class="score-item">
          <span>Over Capacity</span>
          <strong>${cs.leadersOverCapacity}</strong>
        </div>
        <div class="score-item">
          <span>Risk Areas</span>
          <strong>${cs.currentRiskAreas}</strong>
        </div>
      </div>
    </div>

    <div class="compare-card">
      <span>${scenarioName}</span>
      <div class="score-grid">
        <div class="score-item">
          <span>New Opportunities</span>
          <strong>${optimized.newOpportunities}</strong>
        </div>
        <div class="score-item">
          <span>Reassignments</span>
          <strong>${optimized.reassignments}</strong>
        </div>
        <div class="score-item">
          <span>Over Capacity</span>
          <strong>${optimized.leadersOverCapacity}</strong>
        </div>
        <div class="score-item">
          <span>Objective Score</span>
          <strong>${optimized.objectiveScore}</strong>
        </div>
      </div>
    </div>

    <div class="compare-card">
      <span>Net Change</span>
      <div class="score-grid">
        <div class="score-item">
          <span>Capacity Risk</span>
          <strong>${cs.leadersOverCapacity} → ${optimized.leadersOverCapacity}</strong>
        </div>
        <div class="score-item">
          <span>Violations</span>
          <strong>${cs.currentRiskAreas} → ${optimized.constraintViolations}</strong>
        </div>
        <div class="score-item">
          <span>Avg Util.</span>
          <strong>${cs.averageUtilization} → ${optimized.averageUtilization}</strong>
        </div>
        <div class="score-item">
          <span>Highest Util.</span>
          <strong>${cs.highestUtilization} → ${optimized.highestUtilization}</strong>
        </div>
      </div>
    </div>
  `);

  setHtml("baselineNarrative", scenario.baselineNarrative.map(item => `<li>${item}</li>`).join(""));
  setHtml("optimizedNarrative", scenario.optimizedNarrative.map(item => `<li>${item}</li>`).join(""));
}

function renderAllScenarioMode() {
  setText("summaryTitle", "Current state vs all optimized scenarios");
  setText("summaryIntro", "Compact comparison of every scenario against the current-state baseline.");
  setText("recommendationHeadline", "Compare All Scenarios");
  setText("recommendationDetail", "This mode shows each strategy side by side so leadership can compare tradeoffs before drilling into a single recommendation.");

  getEl("singleScenarioSummary")?.classList.add("hidden");
  getEl("allScenarioSummary")?.classList.remove("hidden");

  setHtml("allScenarioSummary", getAllScenarioNames().map(name => scenarioCard(name)).join(""));
}

function scenarioCard(name) {
  const scenario = dashboardData.scenarios[name];
  if (!scenario) return "";

  const m = scenario.optimizedMetrics;

  return `
    <div class="scenario-card">
      <h3>${name}</h3>
      <div class="strategy">${scenario.strategy}</div>
      <div class="score-grid">
        <div class="score-item"><span>Score</span><strong>${m.objectiveScore}</strong></div>
        <div class="score-item"><span>Violations</span><strong>${m.constraintViolations}</strong></div>
        <div class="score-item"><span>Over Cap.</span><strong>${m.leadersOverCapacity}</strong></div>
        <div class="score-item"><span>Changes</span><strong>${m.reassignments}</strong></div>
      </div>
    </div>
  `;
}

function currentStateScenarioCard() {
  const cs = dashboardData.currentState;

  return `
    <div class="scenario-card current-state-card">
      <h3>Current State</h3>
      <div class="strategy">Baseline network before optimization</div>
      <div class="score-grid">
        <div class="score-item"><span>Total VPs</span><strong>${cs.totalLeaders}</strong></div>
        <div class="score-item"><span>Facilities</span><strong>${cs.existingFacilities}</strong></div>
        <div class="score-item"><span>Over Cap.</span><strong>${cs.leadersOverCapacity}</strong></div>
        <div class="score-item"><span>Risk Areas</span><strong>${cs.currentRiskAreas}</strong></div>
      </div>
    </div>
  `;
}

// ============================================================
// Opportunities
// ============================================================

function getScenarioOpportunityRows(scenarioName = getSingleScenarioName()) {
  const rawRows = getScenarioRows(
    dashboardData.rawModelOutputs.scenarioOpportunityAssignments,
    scenarioName
  );

  const sourceRows = rawRows.length
    ? rawRows
    : dashboardData.opportunities;

  return buildOpportunities(sourceRows).map(row => ({
    ...row,
    leader: row.leader || row.altLeader || row.baseLeader
  }));
}

function renderOpportunitySection() {
  const rows = getScenarioOpportunityRows();

  const total = rows.length;
  const evs = rows.filter(row => row.serviceLine === "EVS").length;
  const cns = rows.filter(row => row.serviceLine === "CNS").length;
  const assigned = rows.filter(row => row.leader && row.leader !== "--").length;
  const needsReview = rows.filter(row => row.review || !row.leader || row.leader === "--").length;

  renderPills("opportunitySummary", [
    { label: "Total", value: total },
    { label: "Assigned", value: assigned },
    { label: "Needs Review", value: needsReview }
  ]);

  renderPills("opportunityServiceMix", [
    { label: "EVS", value: evs },
    { label: "CNS", value: cns }
  ]);

  renderOpportunityTable();
}

function renderOpportunityTable() {
  const query = String(opportunitySearch?.value || "").toLowerCase();
  const reviewFilter = opportunityReviewFilter?.value || "all";

  const rows = getScenarioOpportunityRows().filter(row => {
    const matchesSearch = [
      row.id,
      row.leader,
      row.region,
      row.serviceLine,
      row.facilityType,
      row.complexity,
      row.impact,
      row.score
    ].join(" ").toLowerCase().includes(query);

    const matchesReview =
      reviewFilter === "all" ||
      (reviewFilter === "review" && row.review) ||
      (reviewFilter === "clear" && !row.review);

    return matchesSearch && matchesReview;
  });

  renderPreviewTable(
    "opportunityTable",
    "opportunityTableStatus",
    "toggleOpportunityTable",
    rows,
    "opportunities",
    row => `
      <tr>
        <td>${row.id}</td>
        <td>${row.leader}</td>
        <td>${row.serviceLine || "--"}</td>
        <td>${row.facilityType}</td>
        <td>${row.complexity}</td>
        <td>${row.workload}</td>
        <td><span class="badge ${getBadgeClass(row.impact)}">${row.impact}</span></td>
        <td><span class="badge ${row.review ? "risk" : "good"}">${row.review ? "Review Required" : "Clear"}</span></td>
      </tr>
    `
  );
}

// ============================================================
// Workload
// ============================================================

function getScenarioLeaderRows(scenarioName = getSingleScenarioName()) {
  const scenarioRows = getScenarioRows(
    dashboardData.rawModelOutputs.scenarioLeaderWorkloads,
    scenarioName
  );

  if (scenarioRows.length) {
    return scenarioRows.map(normalizeScenarioLeaderRow);
  }

  return dashboardData.leaders;
}

function renderWorkloadSection() {
  if (isCompareAllMode()) {
    setText(
      "scenarioWorkloadCaption",
      "Compare-all mode summarizes scenario strategy. Select a single scenario for VP-level workload bars."
    );

    setHtml("workloadList", getAllScenarioNames().map(name => {
      const scenario = dashboardData.scenarios[name];

      return `
        <div class="compact-row">
          <strong>${name}</strong>
          <span>${scenario.strategy}</span>
          <span>${scenario.optimizedMetrics.averageUtilization}</span>
          <span class="badge ${getBadgeClass(scenario.optimizedMetrics.leadersOverCapacity > 2 ? "Elevated" : "Contained")}">
            ${scenario.optimizedMetrics.leadersOverCapacity} over cap.
          </span>
        </div>
      `;
    }).join(""));

    return;
  }

  let rows = getScenarioLeaderRows();

  if (scenarioWorkloadView?.value === "Largest Change") {
    rows = rows.sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 8);
  } else if (scenarioWorkloadView?.value && scenarioWorkloadView.value !== "all") {
    rows = rows.filter(row => row.optimizedStatus === scenarioWorkloadView.value);
  } else {
    rows = rows.sort((a, b) => Number(b.optimizedUtilPct || 0) - Number(a.optimizedUtilPct || 0)).slice(0, 10);
  }

  setText(
    "scenarioWorkloadCaption",
    `${getSingleScenarioName()} · ${scenarioWorkloadView?.options?.[scenarioWorkloadView.selectedIndex]?.text || "Priority Leaders"}`
  );

  renderDualWorkload("workloadList", rows);
}

function renderSensitivitySection() {
  setHtml("sensitivityCards", getAllScenarioNames().map(name => scenarioCard(name)).join(""));

  const rows = getAllScenarioNames().map(name => {
    const s = dashboardData.scenarios[name];
    const m = s.optimizedMetrics;

    return {
      name,
      strategy: s.strategy,
      score: m.objectiveScore,
      violations: m.constraintViolations,
      reassignments: m.reassignments,
      overCapacity: m.leadersOverCapacity,
      use: s.priority
    };
  });

  renderPreviewTable(
    "sensitivityTable",
    "sensitivityTableStatus",
    "toggleSensitivityTable",
    rows,
    "sensitivity",
    row => `
      <tr>
        <td>${row.name}</td>
        <td>${row.strategy}</td>
        <td>${row.score}</td>
        <td>${row.violations}</td>
        <td>${row.reassignments}</td>
        <td>${row.overCapacity}</td>
        <td>${row.use}</td>
      </tr>
    `
  );
}

// ============================================================
// Leader drilldown
// ============================================================

function populateLeaderSelector() {
  if (!drilldownLeaderSelect) return;

  const allNames = new Set();

  dashboardData.leaders.forEach(leader => allNames.add(leader.name));

  getAllScenarioNames().forEach(scenarioName => {
    getScenarioLeaderRows(scenarioName).forEach(leader => {
      if (leader.name) allNames.add(leader.name);
    });
  });

  const leaderNames = [...allNames].sort();

  drilldownLeaderSelect.innerHTML = [
    `<option value="__all">All Leaders Summary</option>`,
    ...leaderNames.map(name => `<option value="${name}">${name}</option>`)
  ].join("");
}

function renderLeaderDrilldown() {
  const selectedLeader = drilldownLeaderSelect?.value || "__all";

  setText(
    "leaderActiveStrategy",
    isCompareAllMode()
      ? "Compare All Scenarios"
      : `${getSingleScenarioName()} · ${getSelectedScenario()?.strategy || ""}`
  );

  if (selectedLeader === "__all") {
    renderAllLeadersSummary();
  } else {
    renderSingleLeader(selectedLeader);
  }
}

function renderAllLeadersSummary() {
  getEl("leaderSummaryMode")?.classList.remove("hidden");
  getEl("singleLeaderMode")?.classList.add("hidden");

  if (isCompareAllMode()) {
    const names = getAllScenarioNames();

    const bestCapacity = [...names].sort((a, b) => {
      return dashboardData.scenarios[a].optimizedMetrics.leadersOverCapacity -
        dashboardData.scenarios[b].optimizedMetrics.leadersOverCapacity;
    })[0];

    const fewestChanges = [...names].sort((a, b) => {
      return dashboardData.scenarios[a].optimizedMetrics.reassignments -
        dashboardData.scenarios[b].optimizedMetrics.reassignments;
    })[0];

    renderKpis("leaderKpis", [
      { label: "Total VP Network", value: dashboardData.currentState.totalLeaders },
      { label: "Baseline Over Cap.", value: dashboardData.currentState.leadersOverCapacity },
      { label: "Best Capacity", value: bestCapacity || "--", note: bestCapacity ? `${dashboardData.scenarios[bestCapacity].optimizedMetrics.leadersOverCapacity} over cap.` : "" },
      { label: "Fewest Changes", value: fewestChanges || "--", note: fewestChanges ? `${dashboardData.scenarios[fewestChanges].optimizedMetrics.reassignments} changes` : "" },
      { label: "Scenarios", value: names.length },
      { label: "Default", value: names.includes("Balanced Growth") ? "Balanced" : names[0] || "--" }
    ]);

    setHtml(
      "leaderScenarioComparison",
      [
        currentStateScenarioCard(),
        ...names.map(name => scenarioCard(name))
      ].join("")
    );

    return;
  }

  const rows = getScenarioLeaderRows();
  const overCapacity = rows.filter(row => row.optimizedStatus === "Over Capacity").length;
  const nearCapacity = rows.filter(row => row.optimizedStatus === "Near Capacity").length;

  const avgUtilization = average(
    rows.map(row => ({ utilization: Number(row.optimizedUtilPct || 0) })),
    "utilization"
  );

  const largestIncrease = [...rows].sort((a, b) => b.change - a.change)[0];
  const largestDecrease = [...rows].sort((a, b) => a.change - b.change)[0];

  renderKpis("leaderKpis", [
    { label: "Total VP Network", value: rows.length },
    { label: "Over Capacity", value: overCapacity },
    { label: "Near Capacity", value: nearCapacity },
    { label: "Avg Utilization", value: `${Math.round(avgUtilization)}%` },
    { label: "Largest Increase", value: largestIncrease?.name || "--", note: largestIncrease ? `+${largestIncrease.change}` : "" },
    { label: "Largest Decrease", value: largestDecrease?.name || "--", note: largestDecrease ? `${largestDecrease.change}` : "" }
  ]);

  setHtml(
    "leaderScenarioComparison",
    [
      currentStateScenarioCard(),
      scenarioCard(getSingleScenarioName())
    ].join("")
  );
}

function renderSingleLeader(leaderName) {
  getEl("leaderSummaryMode")?.classList.add("hidden");
  getEl("singleLeaderMode")?.classList.remove("hidden");

  const leader = getScenarioLeaderRows().find(row => row.name === leaderName);

  if (!leader) {
    renderKpis("leaderKpis", [
      { label: "Selected VP", value: leaderName },
      { label: "Status", value: "No scenario row" },
      { label: "Baseline", value: "--" },
      { label: "Optimized", value: "--" },
      { label: "Capacity", value: "--" },
      { label: "Utilization", value: "--" }
    ]);

    setHtml("leaderWorkloadComparison", "");
    setHtml("leaderPortfolioMix", "");
    setHtml("candidateComparison", "<p>No scenario-specific leader row was found for this VP.</p>");
    setHtml("leaderDetailTable", "");
    return;
  }

  const utilization = `${Math.round(Number(leader.optimizedUtilPct || 0))}%`;

  renderKpis("leaderKpis", [
    { label: "Baseline Workload", value: formatNumber(leader.baseline, 2) },
    { label: "Optimized Workload", value: formatNumber(leader.optimized, 2) },
    { label: "Capacity", value: formatNumber(leader.capacity, 2) },
    { label: "Utilization", value: utilization },
    { label: "Change", value: leader.change > 0 ? `+${leader.change}` : leader.change },
    { label: "Status", value: leader.optimizedStatus }
  ]);

  renderLeaderBars(leader);
  renderLeaderPortfolio(leaderName);
  renderCandidateComparison(leaderName);
  renderLeaderTable(leaderName);
}

function renderLeaderBars(leader) {
  const rows = [
    { label: "Baseline", value: Number(leader.baselineUtilPct || 0), display: `${Math.round(Number(leader.baselineUtilPct || 0))}%` },
    { label: "Optimized", value: Number(leader.optimizedUtilPct || 0), display: `${Math.round(Number(leader.optimizedUtilPct || 0))}%` },
    { label: "Capacity", value: 100, display: "100%" }
  ];

  const max = Math.max(...rows.map(row => Number(row.value || 0)), 120);

  setHtml("leaderWorkloadComparison", rows.map(row => {
    const fillClass = row.value > 100 ? "red" : row.value >= 95 ? "yellow" : "green";

    return `
      <div class="compare-bar-row">
        <span>${row.label}</span>
        <div class="bar-track">
          <div class="bar-fill ${row.label === "Capacity" ? "yellow" : fillClass}" style="width:${(row.value / max) * 100}%"></div>
        </div>
        <strong>${row.display}</strong>
      </div>
    `;
  }).join(""));
}

function getScenarioLeaderDrilldownRows(scenarioName = getSingleScenarioName()) {
  const rows = getScenarioRows(
    dashboardData.rawModelOutputs.scenarioLeaderDrilldown,
    scenarioName
  );

  return rows.length ? rows : toArray(dashboardData.rawModelOutputs.leaderDrilldown);
}

function getLeaderDetailRows(leaderName) {
  const drilldownRows = getScenarioLeaderDrilldownRows();
  const opportunities = getScenarioOpportunityRows();

  const scenarioDetails = buildLeaderDetailsFromRows(drilldownRows, opportunities);

  return scenarioDetails[leaderName] || [];
}

function renderLeaderPortfolio(leaderName) {
  const details = getLeaderDetailRows(leaderName);
  const counts = countBy(details, "serviceLine");

  renderPills(
    "leaderPortfolioMix",
    Object.entries(counts).map(([label, value]) => ({ label, value }))
  );
}

function renderCandidateComparison(leaderName) {
  const candidate = getScenarioOpportunityRows().find(row => row.leader === leaderName && row.altLeader);

  if (!candidate) {
    setHtml("candidateComparison", `
      <p>No high-confidence alternate VP comparison is flagged for this leader in the current scenario.</p>
    `);
    return;
  }

  setHtml("candidateComparison", `
    <div class="summary-duo">
      <div class="summary-column">
        <h3>${candidate.leader}</h3>
        <ul>
          <li>${candidate.id}</li>
          <li>${candidate.serviceLine || "--"} fit</li>
          <li>${candidate.impact}</li>
        </ul>
      </div>
      <div class="summary-column optimized">
        <h3>${candidate.altLeader}</h3>
        <ul>
          <li>Alternative VP</li>
          <li>Manual validation recommended</li>
          <li>Review against capacity and geography</li>
        </ul>
      </div>
    </div>
  `);
}

function renderLeaderTable(leaderName) {
  const rows = getLeaderDetailRows(leaderName);

  renderPreviewTable(
    "leaderDetailTable",
    "leaderTableStatus",
    "toggleLeaderTable",
    rows,
    "leader",
    row => `
      <tr>
        <td>${row.name}</td>
        <td>${row.type}</td>
        <td>${row.serviceLine || "--"}</td>
        <td>${row.facilityType}</td>
        <td>${row.region}</td>
        <td>${row.workload}</td>
        <td><span class="badge ${getBadgeClass(row.status)}">${row.status}</span></td>
      </tr>
    `
  );
}

// ============================================================
// Network
// ============================================================

function buildNetworkData() {
  const scenarioNetwork = getScenarioObject(
    dashboardData.rawModelOutputs.scenarioNetworkNodesEdges,
    getSingleScenarioName(),
    null
  );

  const rawNetwork = scenarioNetwork || dashboardData.rawModelOutputs.networkNodesEdges;

  if (rawNetwork && Array.isArray(rawNetwork.nodes) && Array.isArray(rawNetwork.edges)) {
    const nodes = rawNetwork.nodes.map(node => {
      let type = node.type || node.group || "node";

      if (type === "current") type = "facility";
      if (type === "service_line") type = "service-line";

      return {
        id: node.id,
        label: node.label || node.id,
        type,
        review: Boolean(node.review || node.review_required || node["Review Required"])
      };
    });

    const validNodeIds = new Set(nodes.map(node => String(node.id)));

    const edges = rawNetwork.edges
      .filter(edge => validNodeIds.has(String(edge.source)) && validNodeIds.has(String(edge.target)))
      .map(edge => ({
        source: edge.source,
        target: edge.target,
        relationship: edge.relationship || edge.type || "relationship"
      }));

    return { nodes, edges };
  }

  return {
    nodes: [],
    edges: []
  };
}

function renderNetwork() {
  if (isCompareAllMode()) {
    setText(
      "networkIntro",
      "Compare-all mode summarizes network impact by scenario. Select a single scenario for node-level relationships."
    );

    getEl("networkSingleMode")?.classList.add("hidden");
    getEl("networkAllMode")?.classList.remove("hidden");

    setHtml("networkScenarioSummary", getAllScenarioNames().map(name => scenarioCard(name)).join(""));
    return;
  }

  setText(
    "networkIntro",
    `Network view for ${getSingleScenarioName()} · ${getSelectedScenario()?.strategy || ""}.`
  );

  getEl("networkSingleMode")?.classList.remove("hidden");
  getEl("networkAllMode")?.classList.add("hidden");

  const network = buildNetworkData();

  const nodes = network.nodes.filter(node => {
    if (activeNetworkFilter === "all") return true;
    if (activeNetworkFilter === "review") return node.review;
    return node.type === activeNetworkFilter;
  });

  const visibleNodeIds = new Set(nodes.map(node => String(node.id)));

  setHtml("networkNodes", nodes.map(node => `
    <div class="network-node ${node.type} ${node.review ? "review" : ""}">
      ${node.label || node.id}
    </div>
  `).join(""));

  const edges = network.edges.filter(edge => {
    if (activeNetworkFilter === "all") return true;
    return visibleNodeIds.has(String(edge.source)) || visibleNodeIds.has(String(edge.target));
  });

  setHtml("networkEdges", edges.slice(0, 18).map(edge => `
    <div class="network-edge">
      <strong>${edge.source}</strong> → <strong>${edge.target}</strong>
      <span>(${edge.relationship})</span>
    </div>
  `).join(""));
}

// ============================================================
// Event setup
// ============================================================

function setupEvents() {
  tabButtons.forEach(button => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });

  navCards.forEach(card => {
    card.addEventListener("click", () => switchTab(card.dataset.goTab));
  });

  document.querySelectorAll(".network-filter").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".network-filter").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      activeNetworkFilter = button.dataset.filter;
      renderNetwork();
    });
  });

  scenarioSelect?.addEventListener("change", () => {
    renderScenario();
  });

  scenarioWorkloadView?.addEventListener("change", () => {
    renderWorkloadSection();
    renderLeaderDrilldown();
  });

  opportunitySearch?.addEventListener("input", renderOpportunityTable);
  opportunityReviewFilter?.addEventListener("change", renderOpportunityTable);
  drilldownLeaderSelect?.addEventListener("change", renderLeaderDrilldown);

  getEl("toggleOpportunityTable")?.addEventListener("click", () => {
    expandedTables.opportunities = !expandedTables.opportunities;
    renderOpportunityTable();
  });

  getEl("toggleSensitivityTable")?.addEventListener("click", () => {
    expandedTables.sensitivity = !expandedTables.sensitivity;
    renderSensitivitySection();
  });

  getEl("toggleLeaderTable")?.addEventListener("click", () => {
    expandedTables.leader = !expandedTables.leader;
    renderLeaderDrilldown();
  });
}

// ============================================================
// Initialization
// ============================================================

async function initializeDashboard() {
  try {
    const modelOutputs = await loadModelOutputs();

    const hasRequiredData =
      toArray(modelOutputs.leaderWorkloadSummary).length > 0 &&
      (
        toArray(modelOutputs.scenarioSummaryMetrics).length > 0 ||
        toArray(modelOutputs.sensitivityResults).length > 0 ||
        toArray(modelOutputs.summaryMetrics.scenario_summaries).length > 0
      );

    if (!hasRequiredData) {
      throw new Error("Required notebook model outputs are missing. Check the data/ folder and scenario-aware JSON exports.");
    }

    dashboardData = buildDashboardDataFromModel(modelOutputs);
    window.dashboardData = dashboardData;

    const scenarioNames = getAllScenarioNames();

    if (scenarioSelect) {
      scenarioSelect.innerHTML = [
        ...scenarioNames.map(name => `<option value="${name}">${name}</option>`),
        `<option value="__all">Compare All Scenarios</option>`
      ].join("");

      scenarioSelect.value = scenarioNames.includes("Balanced Growth")
        ? "Balanced Growth"
        : scenarioNames[0] || "__all";
    }

    populateLeaderSelector();
    renderDashboard();

    console.log("Notebook model outputs loaded into dashboard:", dashboardData);
    console.log("Available scenarios:", getAllScenarioNames());
  } catch (error) {
    console.error(error);

    document.body.insertAdjacentHTML(
      "afterbegin",
      `
      <div style="padding:16px;background:#7f1d1d;color:white;font-family:sans-serif;position:sticky;top:0;z-index:9999;">
        Dashboard data failed to load. Check that the notebook-exported JSON files exist in the data/ folder.
      </div>
      `
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupEvents();
  initializeDashboard();
});
