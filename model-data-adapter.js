// ============================================================
// model-data-adapter.js
// Bridges notebook-generated JSON outputs into dashboard-ready data
// Use this in the original repo so the old UI can use real model data.
// ============================================================

const MODEL_DATA_PATHS = {
  summaryMetrics: "data/summary_metrics.json",
  leaderWorkloadSummary: "data/leader_workload_summary.json",
  leaderDrilldown: "data/leader_drilldown.json",
  newOpportunities: "data/new_opportunities.json",
  sensitivityResults: "data/sensitivity_results.json",
  networkNodesEdges: "data/network_nodes_edges.json",
  optimizedAssignments: "data/optimized_assignments.json",
  progressReports: "data/progress_reports.json"
};

const VALID_SERVICE_LINES = new Set(["EVS", "CNS"]);

const HOSPITAL_TYPE_VALUES = new Set([
  "PRIMARY CARE",
  "SPECIALTY CARE",
  "ACUTE CARE",
  "OUTPATIENT",
  "INPATIENT",
  "AMBULATORY",
  "HOSPITAL",
  "HEALTH SYSTEM",
  "CLINIC",
  "MEDICAL CENTER"
]);

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

function toArrayValue(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === "") return [];

  if (typeof value === "string") {
    return value
      .split(/[;,|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [value];
}

function normalizeServiceLineValue(value) {
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

  if (HOSPITAL_TYPE_VALUES.has(cleaned)) return "";

  return "";
}

function getCapacityClassFromStatus(status) {
  const normalized = String(status || "").toLowerCase();

  if (
    normalized.includes("over") ||
    normalized.includes("risk") ||
    normalized.includes("exceed")
  ) {
    return "risk";
  }

  if (
    normalized.includes("near") ||
    normalized.includes("watch") ||
    normalized.includes("monitor")
  ) {
    return "warn";
  }

  return "good";
}

function getScenarioNameFromModel(scenario) {
  return pickValue(
    scenario,
    ["scenario_name", "scenarioName", "scenario_label", "scenarioLabel", "name"],
    "Unnamed Scenario"
  );
}

function getScenarioCandidateScore(scenario) {
  return pickNumber(
    scenario,
    ["candidate_score", "candidateScore", "baseline_score", "baselineScore", "total_candidate_score"],
    0
  );
}

function getScenarioOptimizedScore(scenario) {
  return pickNumber(
    scenario,
    ["optimized_score", "optimizedScore", "total_score", "score"],
    0
  );
}

function getScenarioViolations(scenario) {
  return pickNumber(
    scenario,
    ["violations", "capacity_violations", "capacityViolations", "constraint_violations", "reassignment_count"],
    0
  );
}

function getScenarioImprovementPct(scenario) {
  const directValue = pickValue(
    scenario,
    ["capacity_improvement_pct", "capacity_improvement", "percent_improvement"],
    null
  );

  if (directValue !== null && directValue !== undefined) {
    const directNumber = Number(directValue);
    if (Number.isFinite(directNumber)) return directNumber;
  }

  const candidateScore = getScenarioCandidateScore(scenario);
  const optimizedScore = getScenarioOptimizedScore(scenario);

  if (!candidateScore) return 0;

  return ((candidateScore - optimizedScore) / candidateScore) * 100;
}

function getScenarioStabilityRating(scenario) {
  const directValue = pickValue(scenario, ["stability_rating", "stability"], null);

  if (directValue) return directValue;

  const violations = getScenarioViolations(scenario);

  if (violations <= 10) return "High";
  if (violations <= 30) return "Medium";

  return "Needs Review";
}

function normalizeLeaderForOriginalDashboard(leader, drilldownMatch = {}) {
  const merged = {
    ...drilldownMatch,
    ...leader
  };

  const serviceMix = pickValue(merged, ["Service Mix", "service_mix"], {});
  let serviceLineSource = pickValue(
    merged,
    [
      "service_lines",
      "serviceLine",
      "Service Lines",
      "Service_Lines",
      "Service Line",
      "service_line"
    ],
    []
  );

  if (
    (!serviceLineSource || toArrayValue(serviceLineSource).length === 0) &&
    serviceMix &&
    typeof serviceMix === "object" &&
    !Array.isArray(serviceMix)
  ) {
    serviceLineSource = Object.keys(serviceMix);
  }

  const serviceLines = [...new Set(
    toArrayValue(serviceLineSource)
      .map(normalizeServiceLineValue)
      .filter(Boolean)
  )];

  const baselineWorkload = pickNumber(
    merged,
    [
      "baseline_workload",
      "Baseline Workload",
      "Base Workload",
      "base Workload",
      "Current Workload",
      "current_workload"
    ],
    0
  );

  const optimizedWorkload = pickNumber(
    merged,
    [
      "optimized_workload",
      "Optimized Workload",
      "Final Workload",
      "final_workload"
    ],
    baselineWorkload
  );

  const leaderName = pickValue(
    merged,
    ["leader_name", "Leader", "VP Name", "VP ID", "VP", "name"],
    "Unknown Leader"
  );

  const region = pickValue(
    merged,
    ["region", "Region", "Market", "Division"],
    "--"
  );

  const capacityStatus = pickValue(
    merged,
    ["capacity_status", "Capacity Status", "status"],
    "Within Capacity"
  );

  const facilityCount = pickNumber(
    merged,
    [
      "facility_count",
      "Facility Count",
      "Optimized Facility Count",
      "Current Facility Count",
      "base Facility Count",
      "Base Facility Count"
    ],
    0
  );

  const assignedOpportunities = toArrayValue(
    pickValue(merged, ["assigned_opportunities", "Assigned Opportunities"], [])
  );

  const reviewFlags = toArrayValue(
    pickValue(merged, ["review_flags", "Review Flags"], [])
  );

  return {
    // Frontend-friendly names
    id: pickValue(merged, ["VP ID", "leader_id", "id"], leaderName),
    name: leaderName,
    leaderName,
    leader_name: leaderName,
    region,
    serviceLines,
    service_lines: serviceLines,
    baselineWorkload,
    baseline_workload: baselineWorkload,
    optimizedWorkload,
    optimized_workload: optimizedWorkload,
    capacityStatus,
    capacity_status: capacityStatus,
    capacityClass: getCapacityClassFromStatus(capacityStatus),
    facilityCount,
    facility_count: facilityCount,
    assignedOpportunities,
    assigned_opportunities: assignedOpportunities,
    reviewFlags,
    review_flags: reviewFlags,

    // Preserve original fields too
    ...merged
  };
}

function normalizeOpportunityForOriginalDashboard(opp) {
  const name = pickValue(
    opp,
    ["opportunity_name", "Opportunity Name", "Facility ID", "entity", "name"],
    "Unnamed Opportunity"
  );

  const recommendedVp = pickValue(
    opp,
    [
      "recommended_vp",
      "Recommended VP",
      "Assigned VP",
      "assigned_vp",
      "assigned_leader",
      "Assigned Leader",
      "Optimized VP"
    ],
    "--"
  );

  const serviceLine = normalizeServiceLineValue(
    pickValue(opp, ["service_line", "serviceLine", "Service Line"], "")
  );

  const score = pickNumber(
    opp,
    [
      "assignment_score",
      "Assignment Score",
      "Assignment Cost",
      "score",
      "Score",
      "optimized_score"
    ],
    0
  );

  return {
    id: pickValue(opp, ["Opportunity ID", "opportunity_id", "Facility ID", "id"], name),
    name,
    opportunityName: name,
    opportunity_name: name,
    recommendedVp,
    recommended_vp: recommendedVp,
    assignedLeader: recommendedVp,
    assigned_leader: recommendedVp,
    serviceLine,
    service_line: serviceLine,
    score,
    assignment_score: score,
    region: pickValue(opp, ["region", "Region", "Market"], "--"),
    ...opp
  };
}

function normalizeScenarioForOriginalDashboard(scenario) {
  const name = getScenarioNameFromModel(scenario);
  const candidateScore = getScenarioCandidateScore(scenario);
  const optimizedScore = getScenarioOptimizedScore(scenario);
  const improvementPct = getScenarioImprovementPct(scenario);
  const violations = getScenarioViolations(scenario);

  return {
    name,
    scenarioName: name,
    scenario_name: name,

    currentScore: candidateScore,
    baselineScore: candidateScore,
    candidateScore,
    candidate_score: candidateScore,

    optimizedScore,
    optimized_score: optimizedScore,
    totalScore: optimizedScore,
    total_score: optimizedScore,

    improvementPct,
    capacityImprovementPct: improvementPct,
    capacity_improvement_pct: improvementPct,

    violations,
    capacityViolations: violations,
    capacity_violations: violations,

    reassignmentCount: violations,
    reassignment_count: violations,

    stabilityRating: getScenarioStabilityRating(scenario),
    stability_rating: getScenarioStabilityRating(scenario),

    distanceWeight: pickNumber(scenario, ["distance_weight", "distanceWeight"], 0),
    complexityWeight: pickNumber(scenario, ["complexity_weight", "complexityWeight"], 0),
    serviceLinePenalty: pickNumber(scenario, ["sl_penalty", "service_line_penalty"], 0),
    reassignmentPenalty: pickNumber(scenario, ["reassignment_penalty", "reassignmentPenalty"], 0),
    overloadWeight: pickNumber(scenario, ["overload_weight", "overloadWeight"], 0),

    // Values for old-style battery charts
    batteryScore: Math.max(0, Math.min(100, improvementPct)),
    batteryRisk: Math.max(0, Math.min(100, 100 - violations)),
    batteryStability:
      getScenarioStabilityRating(scenario) === "High"
        ? 90
        : getScenarioStabilityRating(scenario) === "Medium"
          ? 65
          : 35,

    ...scenario
  };
}

function normalizeNetworkForOriginalDashboard(network) {
  const rawNodes = toArrayValue(network?.nodes);
  const rawEdges = toArrayValue(network?.edges);

  const nodes = rawNodes
    .map((node) => {
      let type = pickValue(node, ["type", "group"], "");

      if (type === "current") type = "facility";

      if (type === "service_line") {
        const serviceLabel = normalizeServiceLineValue(
          pickValue(node, ["label", "name", "id"], "")
        );

        if (!serviceLabel || !VALID_SERVICE_LINES.has(serviceLabel)) return null;

        return {
          ...node,
          type,
          group: type,
          label: serviceLabel,
          name: serviceLabel
        };
      }

      return {
        ...node,
        type,
        group: type,
        label: pickValue(node, ["label", "name", "id"], "Unnamed Node"),
        name: pickValue(node, ["name", "label", "id"], "Unnamed Node")
      };
    })
    .filter(Boolean);

  const nodeIds = new Set(nodes.map((node) => String(node.id)));

  const edges = rawEdges.filter((edge) => {
    return nodeIds.has(String(edge.source)) && nodeIds.has(String(edge.target));
  });

  return {
    nodes,
    edges
  };
}

function buildOriginalDashboardData(modelOutputs) {
  const summary = modelOutputs.summaryMetrics || {};
  const rawLeaderSummary = toArrayValue(modelOutputs.leaderWorkloadSummary);
  const rawDrilldown = toArrayValue(modelOutputs.leaderDrilldown);
  const rawOpportunities = toArrayValue(modelOutputs.newOpportunities);
  const rawScenarios = toArrayValue(modelOutputs.sensitivityResults);

  const drilldownByLeader = new Map(
    rawDrilldown.map((leader) => {
      const key = pickValue(leader, ["Leader", "leader_name", "VP ID", "VP Name"], "");
      return [String(key), leader];
    })
  );

  const leaders = rawLeaderSummary.map((leader) => {
    const key = pickValue(leader, ["Leader", "leader_name", "VP ID", "VP Name"], "");
    const drilldownMatch = drilldownByLeader.get(String(key)) || {};
    return normalizeLeaderForOriginalDashboard(leader, drilldownMatch);
  });

  const drilldownLeaders = rawDrilldown.map((leader) => {
    const key = pickValue(leader, ["Leader", "leader_name", "VP ID", "VP Name"], "");
    const summaryMatch =
      rawLeaderSummary.find((item) => {
        const itemKey = pickValue(item, ["Leader", "leader_name", "VP ID", "VP Name"], "");
        return String(itemKey) === String(key);
      }) || {};

    return normalizeLeaderForOriginalDashboard(summaryMatch, leader);
  });

  const opportunities = rawOpportunities.map(normalizeOpportunityForOriginalDashboard);
  const scenarios = rawScenarios.map(normalizeScenarioForOriginalDashboard);
  const network = normalizeNetworkForOriginalDashboard(modelOutputs.networkNodesEdges);

  const overCapacity = leaders.filter((leader) => leader.capacityClass === "risk").length;
  const nearCapacity = leaders.filter((leader) => leader.capacityClass === "warn").length;

  const baselineAvg = leaders.length
    ? leaders.reduce((sum, leader) => sum + Number(leader.baselineWorkload || 0), 0) / leaders.length
    : 0;

  const optimizedAvg = leaders.length
    ? leaders.reduce((sum, leader) => sum + Number(leader.optimizedWorkload || 0), 0) / leaders.length
    : 0;

  return {
    summary,
    metrics: {
      totalLeaders: summary.total_leaders ?? summary.leader_count ?? leaders.length,
      totalFacilities: summary.total_facilities ?? summary.current_facility_count ?? 0,
      totalOpportunities:
        summary.total_new_opportunities ??
        summary.new_opportunity_count ??
        opportunities.length,
      overCapacity,
      nearCapacity,
      capacityWatch: overCapacity + nearCapacity,
      baselineAvg,
      optimizedAvg,
      recommendation:
        summary.recommendation_summary ||
        summary.recommendation ||
        "Model outputs loaded from notebook-generated dashboard exports."
    },
    leaders,
    leaderSummary: leaders,
    leaderWorkloadSummary: leaders,
    leaderDrilldown: drilldownLeaders.length ? drilldownLeaders : leaders,
    opportunities,
    newOpportunities: opportunities,
    scenarios,
    sensitivityResults: scenarios,
    network,
    networkNodesEdges: network,
    optimizedAssignments: toArrayValue(modelOutputs.optimizedAssignments),
    progressReports: toArrayValue(modelOutputs.progressReports)
  };
}

async function loadModelOutputs() {
  const modelOutputs = {
    summaryMetrics: await fetchModelJson(MODEL_DATA_PATHS.summaryMetrics, {}),
    leaderWorkloadSummary: await fetchModelJson(MODEL_DATA_PATHS.leaderWorkloadSummary, []),
    leaderDrilldown: await fetchModelJson(MODEL_DATA_PATHS.leaderDrilldown, []),
    newOpportunities: await fetchModelJson(MODEL_DATA_PATHS.newOpportunities, []),
    sensitivityResults: await fetchModelJson(MODEL_DATA_PATHS.sensitivityResults, []),
    networkNodesEdges: await fetchModelJson(MODEL_DATA_PATHS.networkNodesEdges, { nodes: [], edges: [] }),
    optimizedAssignments: await fetchModelJson(MODEL_DATA_PATHS.optimizedAssignments, []),
    progressReports: await fetchModelJson(MODEL_DATA_PATHS.progressReports, [])
  };

  const adaptedData = buildOriginalDashboardData(modelOutputs);

  // Expose several names so the original repo has a better chance
  // of working without a full rewrite.
  window.modelOutputs = modelOutputs;
  window.dashboardData = adaptedData;
  window.realDashboardData = adaptedData;
  window.mockData = adaptedData;
  window.appData = adaptedData;

  return adaptedData;
}
