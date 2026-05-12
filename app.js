const dashboardData = {
  currentState: {
    totalLeaders: 32,
    existingFacilities: 128,
    leadersOverCapacity: 7,
    averageUtilization: "83%",
    highestUtilization: "117%",
    currentRiskAreas: 9,
    serviceLineScope: [
      {
        serviceLine: "EVS",
        facilities: 68,
        activeVPs: 24,
        avgUtilization: "86%",
        avgWorkload: 15.9,
        leadersOverCapacity: 4,
        networkShare: "53%",
        risk: "Elevated"
      },
      {
        serviceLine: "CNS",
        facilities: 60,
        activeVPs: 21,
        avgUtilization: "79%",
        avgWorkload: 14.7,
        leadersOverCapacity: 3,
        networkShare: "47%",
        risk: "Moderate"
      }
    ],
    regionalScope: [
      { region: "Southeast", facilities: 29, activeVPs: 8, avgUtilization: "84%", highestUtilization: "108%", leadersOverCapacity: 2, risk: "Elevated" },
      { region: "Midwest", facilities: 24, activeVPs: 7, avgUtilization: "81%", highestUtilization: "111%", leadersOverCapacity: 1, risk: "Moderate" },
      { region: "West", facilities: 31, activeVPs: 9, avgUtilization: "88%", highestUtilization: "117%", leadersOverCapacity: 2, risk: "Elevated" },
      { region: "Northeast", facilities: 26, activeVPs: 7, avgUtilization: "79%", highestUtilization: "104%", leadersOverCapacity: 1, risk: "Moderate" },
      { region: "Southwest", facilities: 18, activeVPs: 5, avgUtilization: "76%", highestUtilization: "99%", leadersOverCapacity: 1, risk: "Contained" }
    ],
    observations: [
      { title: "Capacity pressure is uneven", body: "A smaller group of VPs carries elevated workload before new growth is absorbed." },
      { title: "EVS has the larger footprint", body: "EVS represents a slightly larger share of current facility coverage and capacity pressure." },
      { title: "Regional coverage varies", body: "The West and Southeast show higher utilization and more visible risk signals." },
      { title: "Reoptimization matters", body: "The baseline structure should be reviewed before assigning future growth." }
    ]
  },

  scenarios: {
    "Balanced Growth": {
      strategy: "Balanced tradeoff",
      priority: "Balance workload, geography, EVS/CNS fit, and disruption",
      recommendationHeadline: "Balanced Growth is the recommended default scenario.",
      recommendationDetail:
        "This scenario provides the strongest overall tradeoff between workload balance, new opportunity absorption, geography, EVS/CNS alignment, and implementation disruption.",
      optimizedMetrics: {
        totalLeaders: 32,
        newOpportunities: 26,
        reassignments: 14,
        leadersOverCapacity: 2,
        averageUtilization: "80%",
        highestUtilization: "103%",
        workloadImprovement: "18%",
        objectiveScore: "0.72",
        constraintViolations: 2
      },
      leaderMultiplier: 0.96,
      changeBias: 0,
      baselineNarrative: [
        "Current assignments show uneven capacity pressure across the VP network.",
        "New opportunities are not yet integrated into the current leadership structure.",
        "Several regions and service-line portfolios require review before growth is absorbed."
      ],
      optimizedNarrative: [
        "All new opportunities are assigned into the leadership network.",
        "Leaders over capacity are reduced while maintaining moderate implementation disruption.",
        "The model balances capacity, geography, EVS/CNS alignment, and reassignment impact."
      ]
    },

    "Capacity Protection": {
      strategy: "Reduce overload risk",
      priority: "Protect VP capacity first",
      recommendationHeadline: "Capacity Protection is strongest when workload risk is the primary concern.",
      recommendationDetail:
        "This scenario prioritizes preventing VP overload, even if it creates more reassignment activity or slightly weaker geographic alignment.",
      optimizedMetrics: {
        totalLeaders: 32,
        newOpportunities: 26,
        reassignments: 19,
        leadersOverCapacity: 1,
        averageUtilization: "78%",
        highestUtilization: "99%",
        workloadImprovement: "24%",
        objectiveScore: "0.69",
        constraintViolations: 1
      },
      leaderMultiplier: 0.91,
      changeBias: -0.6,
      baselineNarrative: [
        "Current assignments leave multiple VPs near or above capacity.",
        "Growth increases the risk of uneven leadership portfolios.",
        "Capacity risk is the dominant constraint in this view."
      ],
      optimizedNarrative: [
        "Only one VP remains above capacity.",
        "The workload curve is flatter across the leadership network.",
        "More reassignment activity is required to achieve the capacity-protection outcome."
      ]
    },

    "Geographic Efficiency": {
      strategy: "Improve territory alignment",
      priority: "Reduce geographic spread and travel burden",
      recommendationHeadline: "Geographic Efficiency creates stronger territory alignment.",
      recommendationDetail:
        "This scenario prioritizes geographic fit and travel burden, but may create more leadership movement than the balanced scenario.",
      optimizedMetrics: {
        totalLeaders: 32,
        newOpportunities: 26,
        reassignments: 21,
        leadersOverCapacity: 3,
        averageUtilization: "82%",
        highestUtilization: "106%",
        workloadImprovement: "14%",
        objectiveScore: "0.77",
        constraintViolations: 3
      },
      leaderMultiplier: 0.99,
      changeBias: 0.2,
      baselineNarrative: [
        "Some VPs carry broad geographic footprints.",
        "New opportunities create additional territory complexity.",
        "The baseline state does not explicitly optimize proximity or territory compactness."
      ],
      optimizedNarrative: [
        "Assignments become more geographically concentrated.",
        "Travel and territory spread are reduced for several VPs.",
        "This scenario requires more movement to improve geographic fit."
      ]
    },

    "Service Line Fit": {
      strategy: "Improve EVS/CNS alignment",
      priority: "Match opportunities to service-line familiarity",
      recommendationHeadline: "Service Line Fit improves EVS and CNS alignment.",
      recommendationDetail:
        "This scenario prioritizes matching facilities and opportunities to VPs with stronger EVS or CNS portfolio alignment.",
      optimizedMetrics: {
        totalLeaders: 32,
        newOpportunities: 26,
        reassignments: 17,
        leadersOverCapacity: 2,
        averageUtilization: "81%",
        highestUtilization: "104%",
        workloadImprovement: "16%",
        objectiveScore: "0.74",
        constraintViolations: 2
      },
      leaderMultiplier: 0.94,
      changeBias: -0.1,
      baselineNarrative: [
        "Current portfolios include mixed EVS and CNS exposure across VPs.",
        "Growth creates new service-line assignment decisions.",
        "The baseline state does not explicitly prioritize EVS/CNS alignment."
      ],
      optimizedNarrative: [
        "More assignments align with VP EVS or CNS portfolio familiarity.",
        "New opportunities are absorbed with stronger operational service-line fit.",
        "Moderate reassignment activity is needed to improve portfolio alignment."
      ]
    },

    "Minimize Disruption": {
      strategy: "Preserve current relationships",
      priority: "Reduce implementation change",
      recommendationHeadline: "Minimize Disruption preserves the most existing relationships.",
      recommendationDetail:
        "This scenario keeps more current assignments intact, but it leaves more capacity pressure unresolved.",
      optimizedMetrics: {
        totalLeaders: 32,
        newOpportunities: 26,
        reassignments: 6,
        leadersOverCapacity: 5,
        averageUtilization: "85%",
        highestUtilization: "112%",
        workloadImprovement: "7%",
        objectiveScore: "0.86",
        constraintViolations: 5
      },
      leaderMultiplier: 1.02,
      changeBias: 0.7,
      baselineNarrative: [
        "Existing VP-facility relationships are largely maintained.",
        "Capacity pressure remains concentrated among several VPs.",
        "Low disruption limits how much the network can rebalance."
      ],
      optimizedNarrative: [
        "Only a small number of reassignments are recommended.",
        "Most current relationships remain intact.",
        "This option may be easiest to implement but leaves more workload risk in place."
      ]
    }
  },

  leaders: [
    { name: "VP-001", baseline: 18.2, capacity: 18, region: "Southeast" },
    { name: "VP-002", baseline: 21.1, capacity: 18, region: "Midwest" },
    { name: "VP-003", baseline: 14.4, capacity: 18, region: "West" },
    { name: "VP-004", baseline: 11.9, capacity: 18, region: "Northeast" },
    { name: "VP-005", baseline: 19.8, capacity: 18, region: "Southwest" },
    { name: "VP-006", baseline: 16.3, capacity: 18, region: "Central" },
    { name: "VP-007", baseline: 20.6, capacity: 18, region: "West" },
    { name: "VP-008", baseline: 13.7, capacity: 18, region: "Northeast" },
    { name: "VP-009", baseline: 12.8, capacity: 18, region: "Midwest" },
    { name: "VP-010", baseline: 17.6, capacity: 18, region: "Southeast" },
    { name: "VP-011", baseline: 15.2, capacity: 18, region: "West" },
    { name: "VP-012", baseline: 10.8, capacity: 18, region: "Southwest" },
    { name: "VP-013", baseline: 18.9, capacity: 18, region: "Central" },
    { name: "VP-014", baseline: 13.2, capacity: 18, region: "Northeast" }
  ],

  opportunities: [
    { id: "Opportunity 001", baseLeader: "VP-004", altLeader: "VP-008", region: "Northeast", serviceLine: "EVS", facilityType: "Acute Care", complexity: "High", workload: 1.8, impact: "Within Capacity", review: true },
    { id: "Opportunity 002", baseLeader: "VP-003", altLeader: "VP-011", region: "West", serviceLine: "CNS", facilityType: "Senior Living", complexity: "Medium", workload: 1.2, impact: "Within Capacity", review: false },
    { id: "Opportunity 003", baseLeader: "VP-012", altLeader: "VP-005", region: "Southwest", serviceLine: "EVS", facilityType: "Rehabilitation", complexity: "High", workload: 1.7, impact: "Available Capacity", review: false },
    { id: "Opportunity 004", baseLeader: "VP-009", altLeader: "VP-002", region: "Midwest", serviceLine: "CNS", facilityType: "Community Hospital", complexity: "Low", workload: 0.8, impact: "Available Capacity", review: false },
    { id: "Opportunity 005", baseLeader: "VP-002", altLeader: "VP-009", region: "Midwest", serviceLine: "EVS", facilityType: "Acute Care", complexity: "High", workload: 1.9, impact: "Over Capacity", review: true },
    { id: "Opportunity 006", baseLeader: "VP-011", altLeader: "VP-003", region: "West", serviceLine: "CNS", facilityType: "Senior Living", complexity: "Medium", workload: 1.1, impact: "Within Capacity", review: false },
    { id: "Opportunity 007", baseLeader: "VP-008", altLeader: "VP-004", region: "Northeast", serviceLine: "EVS", facilityType: "Rehabilitation", complexity: "Medium", workload: 1.4, impact: "Within Capacity", review: false },
    { id: "Opportunity 008", baseLeader: "VP-006", altLeader: "VP-013", region: "Central", serviceLine: "CNS", facilityType: "Acute Care", complexity: "High", workload: 1.6, impact: "Within Capacity", review: true },
    { id: "Opportunity 009", baseLeader: "VP-010", altLeader: "VP-001", region: "Southeast", serviceLine: "EVS", facilityType: "Community Hospital", complexity: "Low", workload: 0.9, impact: "Within Capacity", review: false },
    { id: "Opportunity 010", baseLeader: "VP-001", altLeader: "VP-010", region: "Southeast", serviceLine: "CNS", facilityType: "Acute Care", complexity: "High", workload: 1.5, impact: "Near Capacity", review: true },
    { id: "Opportunity 011", baseLeader: "VP-015", altLeader: "VP-011", region: "West", serviceLine: "EVS", facilityType: "Senior Living", complexity: "Medium", workload: 1.3, impact: "Within Capacity", review: false },
    { id: "Opportunity 012", baseLeader: "VP-016", altLeader: "VP-008", region: "Northeast", serviceLine: "CNS", facilityType: "Community Hospital", complexity: "Low", workload: 0.7, impact: "Available Capacity", review: false },
    { id: "Opportunity 013", baseLeader: "VP-017", altLeader: "VP-010", region: "Southeast", serviceLine: "EVS", facilityType: "Acute Care", complexity: "High", workload: 2.0, impact: "Review Required", review: true },
    { id: "Opportunity 014", baseLeader: "VP-018", altLeader: "VP-009", region: "Midwest", serviceLine: "CNS", facilityType: "Rehabilitation", complexity: "Medium", workload: 1.2, impact: "Within Capacity", review: false },
    { id: "Opportunity 015", baseLeader: "VP-019", altLeader: "VP-011", region: "West", serviceLine: "EVS", facilityType: "Community Hospital", complexity: "Low", workload: 0.9, impact: "Available Capacity", review: false },
    { id: "Opportunity 016", baseLeader: "VP-020", altLeader: "VP-012", region: "Southwest", serviceLine: "CNS", facilityType: "Senior Living", complexity: "High", workload: 1.8, impact: "Near Capacity", review: true },
    { id: "Opportunity 017", baseLeader: "VP-021", altLeader: "VP-006", region: "Central", serviceLine: "EVS", facilityType: "Acute Care", complexity: "Medium", workload: 1.4, impact: "Within Capacity", review: false },
    { id: "Opportunity 018", baseLeader: "VP-022", altLeader: "VP-014", region: "Northeast", serviceLine: "CNS", facilityType: "Community Hospital", complexity: "Medium", workload: 1.1, impact: "Within Capacity", review: false },
    { id: "Opportunity 019", baseLeader: "VP-023", altLeader: "VP-010", region: "Southeast", serviceLine: "EVS", facilityType: "Rehabilitation", complexity: "High", workload: 1.7, impact: "Review Required", review: true },
    { id: "Opportunity 020", baseLeader: "VP-024", altLeader: "VP-011", region: "West", serviceLine: "CNS", facilityType: "Acute Care", complexity: "High", workload: 1.6, impact: "Within Capacity", review: true },
    { id: "Opportunity 021", baseLeader: "VP-025", altLeader: "VP-009", region: "Midwest", serviceLine: "EVS", facilityType: "Senior Living", complexity: "Low", workload: 0.8, impact: "Available Capacity", review: false },
    { id: "Opportunity 022", baseLeader: "VP-026", altLeader: "VP-006", region: "Central", serviceLine: "CNS", facilityType: "Community Hospital", complexity: "Medium", workload: 1.3, impact: "Within Capacity", review: false },
    { id: "Opportunity 023", baseLeader: "VP-027", altLeader: "VP-012", region: "Southwest", serviceLine: "EVS", facilityType: "Acute Care", complexity: "High", workload: 1.9, impact: "Review Required", review: true },
    { id: "Opportunity 024", baseLeader: "VP-028", altLeader: "VP-014", region: "Northeast", serviceLine: "CNS", facilityType: "Senior Living", complexity: "Medium", workload: 1.0, impact: "Within Capacity", review: false },
    { id: "Opportunity 025", baseLeader: "VP-029", altLeader: "VP-010", region: "Southeast", serviceLine: "EVS", facilityType: "Community Hospital", complexity: "Low", workload: 0.7, impact: "Available Capacity", review: false },
    { id: "Opportunity 026", baseLeader: "VP-030", altLeader: "VP-011", region: "West", serviceLine: "CNS", facilityType: "Rehabilitation", complexity: "High", workload: 1.8, impact: "Near Capacity", review: true }
  ],

  leaderDetails: {
    "VP-001": [
      { name: "Facility 101", type: "Existing Facility", serviceLine: "EVS", facilityType: "Acute Care", region: "Southeast", workload: 2.4, status: "Retained" },
      { name: "Facility 117", type: "Existing Facility", serviceLine: "CNS", facilityType: "Senior Living", region: "Southeast", workload: 2.1, status: "Retained" }
    ],
    "VP-002": [
      { name: "Facility 204", type: "Existing Facility", serviceLine: "EVS", facilityType: "Acute Care", region: "Midwest", workload: 2.7, status: "Retained" },
      { name: "Facility 219", type: "Existing Facility", serviceLine: "CNS", facilityType: "Community Hospital", region: "Midwest", workload: 1.8, status: "Reassigned Out" }
    ],
    "VP-003": [
      { name: "Facility 310", type: "Existing Facility", serviceLine: "CNS", facilityType: "Senior Living", region: "West", workload: 2.0, status: "Retained" }
    ],
    "VP-004": [
      { name: "Facility 405", type: "Existing Facility", serviceLine: "EVS", facilityType: "Acute Care", region: "Northeast", workload: 1.6, status: "Retained" }
    ]
  },

  decisionLog: [
    { date: "Phase 1", decision: "Use GitHub Pages for the first UI prototype.", reason: "Fastest way to publish a static executive-facing dashboard.", status: "Complete" },
    { date: "Phase 1", decision: "Keep Colab as the model layer.", reason: "The optimization logic already exists there and can export structured outputs.", status: "Complete" },
    { date: "Phase 2", decision: "Move from one long dashboard to a tabbed portal.", reason: "The project needs separate views for current state, model outputs, drill-down, network, and reporting.", status: "Complete" },
    { date: "Phase 2", decision: "Correct service-line terminology to EVS and CNS.", reason: "Service lines are operational service lines, not facility types.", status: "Complete" },
    { date: "Phase 3", decision: "Make scenario selection the controlling state.", reason: "Scenario choice should influence summary metrics, leader drill-down, workload view, and network relationships.", status: "In Progress" },
    { date: "Phase 3", decision: "Add compare-all scenario mode.", reason: "Executives need to evaluate every optimized scenario against the current state at once.", status: "In Progress" }
  ]
};

const PREVIEW_LIMIT = 5;
let activeNetworkFilter = "all";
let expandedTables = {
  opportunities: false,
  sensitivity: false,
  leader: false,
  decisions: false
};

const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");
const navCards = document.querySelectorAll(".nav-card");
const scenarioSelect = document.getElementById("scenarioSelect");
const scenarioWorkloadView = document.getElementById("scenarioWorkloadView");
const drilldownLeaderSelect = document.getElementById("drilldownLeaderSelect");
const opportunitySearch = document.getElementById("opportunitySearch");
const opportunityReviewFilter = document.getElementById("opportunityReviewFilter");

function getSelectedScenarioName() {
  return scenarioSelect.value;
}

function isCompareAllMode() {
  return getSelectedScenarioName() === "__all";
}

function getSingleScenarioName() {
  return isCompareAllMode() ? "Balanced Growth" : getSelectedScenarioName();
}

function getSelectedScenario() {
  return dashboardData.scenarios[getSingleScenarioName()];
}

function getAllScenarioNames() {
  return Object.keys(dashboardData.scenarios);
}

function switchTab(tabId) {
  tabButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.tab === tabId);
  });

  tabPanels.forEach(panel => {
    panel.classList.toggle("active", panel.id === tabId);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getBadgeClass(value) {
  const text = String(value).toLowerCase();

  if (text.includes("over") || text.includes("review") || text.includes("required") || text.includes("elevated")) {
    return "risk";
  }

  if (text.includes("near") || text.includes("medium") || text.includes("moderate") || text.includes("in progress")) {
    return "warning";
  }

  if (
    text.includes("retained") ||
    text.includes("within") ||
    text.includes("available") ||
    text.includes("added") ||
    text.includes("complete") ||
    text.includes("contained") ||
    text.includes("clear")
  ) {
    return "good";
  }

  return "neutral";
}

function formatPercent(number) {
  return `${Math.round(number)}%`;
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = typeof key === "function" ? key(item) : item[key];
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function average(items, key) {
  if (!items.length) return 0;
  const total = items.reduce((sum, item) => sum + Number(item[key]), 0);
  return total / items.length;
}

function renderKpis(containerId, rows) {
  document.getElementById(containerId).innerHTML = rows.map(row => `
    <div class="metric-card">
      <span>${row.label}</span>
      <strong>${row.value}</strong>
      ${row.note ? `<small>${row.note}</small>` : ""}
    </div>
  `).join("");
}

function renderPills(containerId, rows) {
  document.getElementById(containerId).innerHTML = rows.map(row => `
    <span class="pill">${row.label} <strong>${row.value}</strong></span>
  `).join("");
}

function renderCompactWorkload(containerId, rows, mode = "current") {
  document.getElementById(containerId).innerHTML = rows.map(row => {
    const value = mode === "current" ? row.baseline : row.optimized;
    const utilization = (value / row.capacity) * 100;
    const fillClass = utilization > 100 ? "red" : utilization >= 95 ? "yellow" : "green";
    const status = getStatus(value, row.capacity);

    return `
      <div class="compact-row">
        <strong>${row.name}</strong>
        <div class="bar-track">
          <div class="bar-fill ${fillClass}" style="width:${Math.min(utilization, 120)}%"></div>
        </div>
        <span>${formatPercent(utilization)}</span>
        <span class="badge ${getBadgeClass(status)}">${status}</span>
      </div>
    `;
  }).join("");
}

function renderPreviewTable(tbodyId, statusId, buttonId, rows, expandedKey, renderRow) {
  const expanded = expandedTables[expandedKey];
  const visibleRows = expanded ? rows : rows.slice(0, PREVIEW_LIMIT);

  document.getElementById(tbodyId).innerHTML = visibleRows.map(renderRow).join("");

  const status = document.getElementById(statusId);
  const button = document.getElementById(buttonId);

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

function calculateOptimizedWorkload(leader, scenarioName = getSingleScenarioName()) {
  const scenario = dashboardData.scenarios[scenarioName];
  const numericId = Number(leader.name.replace("VP-", ""));
  const adjustment = ((numericId % 5) - 2) * 0.28;
  const value = leader.baseline * scenario.leaderMultiplier + adjustment + scenario.changeBias;
  return Math.max(8, Number(value.toFixed(1)));
}

function getStatus(workload, capacity) {
  const utilization = workload / capacity;

  if (utilization > 1) return "Over Capacity";
  if (utilization >= 0.95) return "Near Capacity";
  if (utilization <= 0.75) return "Available Capacity";
  return "Within Capacity";
}

function getScenarioLeaderRows(scenarioName = getSingleScenarioName()) {
  return dashboardData.leaders.map(leader => {
    const optimized = calculateOptimizedWorkload(leader, scenarioName);
    const optimizedStatus = getStatus(optimized, leader.capacity);
    const change = Number((optimized - leader.baseline).toFixed(1));

    return {
      ...leader,
      optimized,
      optimizedStatus,
      change
    };
  });
}

function getScenarioOpportunityRows(scenarioName = getSingleScenarioName()) {
  return dashboardData.opportunities.map((row, index) => {
    let leader = row.baseLeader;

    if (scenarioName === "Capacity Protection" && row.review) {
      leader = row.altLeader;
    }

    if (scenarioName === "Geographic Efficiency") {
      leader = row.region === "West" ? "VP-011" :
        row.region === "Southeast" ? "VP-010" :
        row.region === "Midwest" ? "VP-009" :
        row.baseLeader;
    }

    if (scenarioName === "Service Line Fit") {
      leader = row.serviceLine === "EVS"
        ? `VP-${String(((index * 2) % 30) + 1).padStart(3, "0")}`
        : `VP-${String(((index * 2 + 5) % 30) + 1).padStart(3, "0")}`;
    }

    if (scenarioName === "Minimize Disruption") {
      leader = row.baseLeader;
    }

    return {
      ...row,
      leader
    };
  });
}

function renderCurrentState() {
  const cs = dashboardData.currentState;

  renderKpis("currentStateKpis", [
    { label: "Total VP Network", value: cs.totalLeaders },
    { label: "Existing Facilities", value: cs.existingFacilities },
    { label: "Over Capacity", value: cs.leadersOverCapacity },
    { label: "Avg Utilization", value: cs.averageUtilization },
    { label: "Highest Utilization", value: cs.highestUtilization },
    { label: "Risk Areas", value: cs.currentRiskAreas }
  ]);

  const priorityRows = [...dashboardData.leaders]
    .sort((a, b) => (b.baseline / b.capacity) - (a.baseline / a.capacity))
    .slice(0, 8);

  renderCompactWorkload("currentWorkloadList", priorityRows, "current");

  document.getElementById("serviceLineScopeCards").innerHTML = cs.serviceLineScope.map(item => `
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
        <div class="scope-stat"><span>Over Capacity</span><strong>${item.leadersOverCapacity}</strong></div>
        <div class="scope-stat"><span>Risk</span><strong><span class="badge ${getBadgeClass(item.risk)}">${item.risk}</span></strong></div>
      </div>
    </div>
  `).join("");

  document.getElementById("regionalScopeCards").innerHTML = cs.regionalScope.map(item => `
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
  `).join("");

  document.getElementById("currentStateObservations").innerHTML = cs.observations.map(item => `
    <div class="observation-card">
      <h3>${item.title}</h3>
      <p>${item.body}</p>
    </div>
  `).join("");
}

function renderHome() {
  const scenario = dashboardData.scenarios["Balanced Growth"];
  const cs = dashboardData.currentState;

  document.getElementById("homeRecommendationHeadline").textContent = scenario.recommendationHeadline;
  document.getElementById("homeRecommendationDetail").textContent = scenario.recommendationDetail;

  renderKpis("homeKpis", [
    { label: "Total VP Network", value: cs.totalLeaders },
    { label: "Existing Facilities", value: cs.existingFacilities },
    { label: "New Opportunities", value: scenario.optimizedMetrics.newOpportunities },
    { label: "Recommended Changes", value: scenario.optimizedMetrics.reassignments },
    { label: "Capacity Risk", value: `${cs.leadersOverCapacity} → ${scenario.optimizedMetrics.leadersOverCapacity}` },
    { label: "Objective Score", value: scenario.optimizedMetrics.objectiveScore }
  ]);
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

  document.getElementById("summaryTitle").textContent = "Current state vs optimized state";
  document.getElementById("summaryIntro").textContent = "Side-by-side comparison of the baseline network and selected scenario.";
  document.getElementById("recommendationHeadline").textContent = scenario.recommendationHeadline;
  document.getElementById("recommendationDetail").textContent = `${scenario.priority}. ${scenario.recommendationDetail}`;

  document.getElementById("singleScenarioSummary").classList.remove("hidden");
  document.getElementById("allScenarioSummary").classList.add("hidden");

  const comparisons = [
    { label: "Over Capacity", baseline: cs.leadersOverCapacity, optimized: optimized.leadersOverCapacity },
    { label: "Avg Utilization", baseline: cs.averageUtilization, optimized: optimized.averageUtilization },
    { label: "Highest Utilization", baseline: cs.highestUtilization, optimized: optimized.highestUtilization },
    { label: "New Opportunities", baseline: 0, optimized: optimized.newOpportunities },
    { label: "Reassignments", baseline: 0, optimized: optimized.reassignments },
    { label: "Constraint Violations", baseline: cs.currentRiskAreas, optimized: optimized.constraintViolations }
  ];

  document.getElementById("scenarioComparisonCards").innerHTML = comparisons.map(item => `
    <div class="compare-card">
      <span>${item.label}</span>
      <div class="compare-values">
        <div class="compare-value"><small>Current</small><strong>${item.baseline}</strong></div>
        <div class="compare-arrow">→</div>
        <div class="compare-value"><small>Optimized</small><strong>${item.optimized}</strong></div>
      </div>
    </div>
  `).join("");

  document.getElementById("baselineNarrative").innerHTML = scenario.baselineNarrative.map(item => `<li>${item}</li>`).join("");
  document.getElementById("optimizedNarrative").innerHTML = scenario.optimizedNarrative.map(item => `<li>${item}</li>`).join("");
}

function renderAllScenarioMode() {
  document.getElementById("summaryTitle").textContent = "Current state vs all optimized scenarios";
  document.getElementById("summaryIntro").textContent = "Compact comparison of every scenario against the current-state baseline.";
  document.getElementById("recommendationHeadline").textContent = "Compare All Scenarios";
  document.getElementById("recommendationDetail").textContent = "This mode shows each strategy side by side so leadership can compare tradeoffs before drilling into a single recommendation.";

  document.getElementById("singleScenarioSummary").classList.add("hidden");
  document.getElementById("allScenarioSummary").classList.remove("hidden");

  document.getElementById("allScenarioSummary").innerHTML = getAllScenarioNames().map(name => scenarioCard(name)).join("");
}

function scenarioCard(name) {
  const scenario = dashboardData.scenarios[name];
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

function renderOpportunitySection() {
  const rows = getScenarioOpportunityRows();

  const total = rows.length;
  const evs = rows.filter(row => row.serviceLine === "EVS").length;
  const cns = rows.filter(row => row.serviceLine === "CNS").length;
  const highComplexity = rows.filter(row => row.complexity === "High").length;
  const reviewRequired = rows.filter(row => row.review).length;
  const avgWorkload = average(rows, "workload").toFixed(1);
  const regions = Object.keys(countBy(rows, "region")).length;

  renderKpis("opportunityKpis", [
    { label: "Total Opportunities", value: total },
    { label: "EVS", value: evs },
    { label: "CNS", value: cns },
    { label: "High Complexity", value: highComplexity },
    { label: "Avg Workload", value: avgWorkload },
    { label: "Review Required", value: reviewRequired, note: `${regions} regions` }
  ]);

  renderPills("opportunityServiceMix", Object.entries(countBy(rows, "serviceLine")).map(([label, value]) => ({ label, value })));
  renderPills("opportunityRegionMix", Object.entries(countBy(rows, "region")).map(([label, value]) => ({ label, value })));
  renderPills("opportunityComplexityMix", Object.entries(countBy(rows, "complexity")).map(([label, value]) => ({ label, value })));

  renderOpportunityTable();
}

function renderOpportunityTable() {
  const query = opportunitySearch.value.toLowerCase();
  const reviewFilter = opportunityReviewFilter.value;

  const rows = getScenarioOpportunityRows().filter(row => {
    const matchesSearch = [
      row.id,
      row.leader,
      row.region,
      row.serviceLine,
      row.facilityType,
      row.complexity,
      row.impact
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
        <td>${row.region}</td>
        <td>${row.serviceLine}</td>
        <td>${row.facilityType}</td>
        <td>${row.complexity}</td>
        <td>${row.workload}</td>
        <td><span class="badge ${getBadgeClass(row.impact)}">${row.impact}</span></td>
        <td><span class="badge ${row.review ? "risk" : "good"}">${row.review ? "Review Required" : "Clear"}</span></td>
      </tr>
    `
  );
}

function renderWorkloadSection() {
  if (isCompareAllMode()) {
    document.getElementById("scenarioWorkloadCaption").textContent =
      "Compare-all mode summarizes scenario strategy. Select a single scenario for VP-level workload bars.";

    document.getElementById("workloadList").innerHTML = getAllScenarioNames().map(name => {
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
    }).join("");

    return;
  }

  let rows = getScenarioLeaderRows();

  if (scenarioWorkloadView.value === "Largest Change") {
    rows = rows.sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 8);
  } else if (scenarioWorkloadView.value !== "all") {
    rows = rows.filter(row => row.optimizedStatus === scenarioWorkloadView.value);
  } else {
    rows = rows.sort((a, b) => (b.optimized / b.capacity) - (a.optimized / a.capacity)).slice(0, 10);
  }

  document.getElementById("scenarioWorkloadCaption").textContent =
    `${getSingleScenarioName()} · ${scenarioWorkloadView.options[scenarioWorkloadView.selectedIndex].text}`;

  renderCompactWorkload("workloadList", rows, "optimized");
}

function renderSensitivitySection() {
  document.getElementById("sensitivityCards").innerHTML = getAllScenarioNames().map(name => scenarioCard(name)).join("");

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

function populateLeaderSelector() {
  const leaderNames = dashboardData.leaders.map(leader => leader.name);
  drilldownLeaderSelect.innerHTML = [
    `<option value="__all">All Leaders Summary</option>`,
    ...leaderNames.map(name => `<option value="${name}">${name}</option>`)
  ].join("");
}

function renderLeaderDrilldown() {
  const selectedLeader = drilldownLeaderSelect.value;

  document.getElementById("leaderActiveStrategy").textContent = isCompareAllMode()
    ? "Compare All Scenarios"
    : `${getSingleScenarioName()} · ${getSelectedScenario().strategy}`;

  if (selectedLeader === "__all") {
    renderAllLeadersSummary();
  } else {
    renderSingleLeader(selectedLeader);
  }
}

function renderAllLeadersSummary() {
  document.getElementById("leaderSummaryMode").classList.remove("hidden");
  document.getElementById("singleLeaderMode").classList.add("hidden");

  if (isCompareAllMode()) {
    renderKpis("leaderKpis", [
      { label: "Total VP Network", value: dashboardData.currentState.totalLeaders },
      { label: "Baseline Over Cap.", value: dashboardData.currentState.leadersOverCapacity },
      { label: "Best Over Cap.", value: "1", note: "Capacity Protection" },
      { label: "Best Score", value: "0.69", note: "Capacity Protection" },
      { label: "Fewest Changes", value: "6", note: "Minimize Disruption" },
      { label: "Default Strategy", value: "Balanced" }
    ]);

    document.getElementById("leaderScenarioComparison").innerHTML = getAllScenarioNames().map(name => scenarioCard(name)).join("");
    return;
  }

  const rows = getScenarioLeaderRows();
  const overCapacity = rows.filter(row => row.optimizedStatus === "Over Capacity").length;
  const nearCapacity = rows.filter(row => row.optimizedStatus === "Near Capacity").length;
  const avgUtilization = average(rows.map(row => ({ utilization: (row.optimized / row.capacity) * 100 })), "utilization");
  const largestIncrease = [...rows].sort((a, b) => b.change - a.change)[0];
  const largestDecrease = [...rows].sort((a, b) => a.change - b.change)[0];

  renderKpis("leaderKpis", [
    { label: "Priority VP View", value: rows.length, note: "sample displayed" },
    { label: "Over Capacity", value: overCapacity },
    { label: "Near Capacity", value: nearCapacity },
    { label: "Avg Utilization", value: formatPercent(avgUtilization) },
    { label: "Largest Increase", value: largestIncrease.name, note: `+${largestIncrease.change}` },
    { label: "Largest Decrease", value: largestDecrease.name, note: `${largestDecrease.change}` }
  ]);

  document.getElementById("leaderScenarioComparison").innerHTML = `
    <div class="scenario-card">
      <h3>${getSingleScenarioName()}</h3>
      <div class="strategy">${getSelectedScenario().strategy}</div>
      <div class="score-grid">
        <div class="score-item"><span>Over Capacity</span><strong>${overCapacity}</strong></div>
        <div class="score-item"><span>Near Capacity</span><strong>${nearCapacity}</strong></div>
        <div class="score-item"><span>Avg Util.</span><strong>${formatPercent(avgUtilization)}</strong></div>
        <div class="score-item"><span>Strategy</span><strong>${getSelectedScenario().optimizedMetrics.objectiveScore}</strong></div>
      </div>
    </div>
  `;
}

function renderSingleLeader(leaderName) {
  document.getElementById("leaderSummaryMode").classList.add("hidden");
  document.getElementById("singleLeaderMode").classList.remove("hidden");

  const leader = getScenarioLeaderRows().find(row => row.name === leaderName);
  const utilization = formatPercent((leader.optimized / leader.capacity) * 100);

  renderKpis("leaderKpis", [
    { label: "Baseline Workload", value: leader.baseline },
    { label: "Optimized Workload", value: leader.optimized },
    { label: "Capacity", value: leader.capacity },
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
    { label: "Baseline", value: leader.baseline },
    { label: "Optimized", value: leader.optimized },
    { label: "Capacity", value: leader.capacity }
  ];

  const max = Math.max(...rows.map(row => row.value));

  document.getElementById("leaderWorkloadComparison").innerHTML = rows.map(row => `
    <div class="compare-bar-row">
      <span>${row.label}</span>
      <div class="bar-track">
        <div class="bar-fill ${row.label === "Capacity" ? "yellow" : "green"}" style="width:${(row.value / max) * 100}%"></div>
      </div>
      <strong>${row.value}</strong>
    </div>
  `).join("");
}

function getLeaderDetailRows(leaderName) {
  const baseRows = dashboardData.leaderDetails[leaderName] || [];
  const opportunityRows = getScenarioOpportunityRows()
    .filter(row => row.leader === leaderName)
    .map(row => ({
      name: row.id,
      type: "New Opportunity",
      serviceLine: row.serviceLine,
      facilityType: row.facilityType,
      region: row.region,
      workload: row.workload,
      status: row.review ? "Review Required" : "Added"
    }));

  return [...baseRows, ...opportunityRows];
}

function renderLeaderPortfolio(leaderName) {
  const details = getLeaderDetailRows(leaderName);
  const counts = countBy(details, "serviceLine");
  renderPills("leaderPortfolioMix", Object.entries(counts).map(([label, value]) => ({ label, value })));
}

function renderCandidateComparison(leaderName) {
  const candidate = getScenarioOpportunityRows().find(row => row.leader === leaderName && row.altLeader);

  if (!candidate) {
    document.getElementById("candidateComparison").innerHTML = `
      <p>No high-confidence alternate VP comparison is flagged for this leader in the current scenario.</p>
    `;
    return;
  }

  document.getElementById("candidateComparison").innerHTML = `
    <div class="summary-duo">
      <div class="summary-column">
        <h3>${candidate.leader}</h3>
        <ul>
          <li>${candidate.id}</li>
          <li>${candidate.serviceLine} fit</li>
          <li>${candidate.impact}</li>
        </ul>
      </div>
      <div class="summary-column optimized">
        <h3>${candidate.altLeader}</h3>
        <ul>
          <li>Alternative VP</li>
          <li>Same region review</li>
          <li>Manual validation recommended</li>
        </ul>
      </div>
    </div>
  `;
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
        <td>${row.serviceLine}</td>
        <td>${row.facilityType}</td>
        <td>${row.region}</td>
        <td>${row.workload}</td>
        <td><span class="badge ${getBadgeClass(row.status)}">${row.status}</span></td>
      </tr>
    `
  );
}

function buildNetworkData() {
  const opportunities = getScenarioOpportunityRows();

  const leaderNodes = dashboardData.leaders.map(leader => {
    const optimized = calculateOptimizedWorkload(leader);
    return {
      id: leader.name,
      type: "leader",
      review: getStatus(optimized, leader.capacity) === "Over Capacity"
    };
  });

  const opportunityNodes = opportunities.map(row => ({
    id: row.id,
    type: "opportunity",
    review: row.review
  }));

  const serviceLineNodes = [
    { id: "EVS", type: "service-line", review: false },
    { id: "CNS", type: "service-line", review: false }
  ];

  const facilityNodes = [
    { id: "Facility 101", type: "facility", review: false },
    { id: "Facility 204", type: "facility", review: false },
    { id: "Facility 310", type: "facility", review: false },
    { id: "Facility 405", type: "facility", review: false },
    { id: "Facility 704", type: "facility", review: true }
  ];

  const assignmentEdges = opportunities.map(row => ({
    source: row.leader,
    target: row.id,
    relationship: row.review ? "recommended assignment / review" : "recommended assignment"
  }));

  const serviceLineEdges = opportunities.map(row => ({
    source: row.id,
    target: row.serviceLine,
    relationship: "service line"
  }));

  const facilityEdges = [
    { source: "VP-001", target: "Facility 101", relationship: "current assignment" },
    { source: "VP-002", target: "Facility 204", relationship: "current assignment" },
    { source: "VP-003", target: "Facility 310", relationship: "current assignment" },
    { source: "VP-004", target: "Facility 405", relationship: "current assignment" }
  ];

  return {
    nodes: [...leaderNodes, ...facilityNodes, ...opportunityNodes, ...serviceLineNodes],
    edges: [...facilityEdges, ...assignmentEdges, ...serviceLineEdges]
  };
}

function renderNetwork() {
  if (isCompareAllMode()) {
    document.getElementById("networkIntro").textContent =
      "Compare-all mode summarizes network impact by scenario. Select a single scenario for node-level relationships.";
    document.getElementById("networkSingleMode").classList.add("hidden");
    document.getElementById("networkAllMode").classList.remove("hidden");
    document.getElementById("networkScenarioSummary").innerHTML = getAllScenarioNames().map(name => scenarioCard(name)).join("");
    return;
  }

  document.getElementById("networkIntro").textContent =
    `Network view for ${getSingleScenarioName()} · ${getSelectedScenario().strategy}.`;

  document.getElementById("networkSingleMode").classList.remove("hidden");
  document.getElementById("networkAllMode").classList.add("hidden");

  const network = buildNetworkData();

  const nodes = network.nodes.filter(node => {
    if (activeNetworkFilter === "all") return true;
    if (activeNetworkFilter === "review") return node.review;
    return node.type === activeNetworkFilter;
  });

  const visibleNodeIds = new Set(nodes.map(node => node.id));

  document.getElementById("networkNodes").innerHTML = nodes.map(node => `
    <div class="network-node ${node.type} ${node.review ? "review" : ""}">
      ${node.id}
    </div>
  `).join("");

  const edges = network.edges.filter(edge => {
    if (activeNetworkFilter === "all") return true;
    return visibleNodeIds.has(edge.source) || visibleNodeIds.has(edge.target);
  });

  document.getElementById("networkEdges").innerHTML = edges.slice(0, 18).map(edge => `
    <div class="network-edge">
      <strong>${edge.source}</strong> → <strong>${edge.target}</strong>
      <span>(${edge.relationship})</span>
    </div>
  `).join("");
}

function scenarioCard(name) {
  const scenario = dashboardData.scenarios[name];
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

function renderDecisionLog() {
  renderPreviewTable(
    "decisionLogTable",
    "decisionTableStatus",
    "toggleDecisionTable",
    dashboardData.decisionLog,
    "decisions",
    row => `
      <tr>
        <td>${row.date}</td>
        <td>${row.decision}</td>
        <td>${row.reason}</td>
        <td><span class="badge ${getBadgeClass(row.status)}">${row.status}</span></td>
      </tr>
    `
  );
}

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

scenarioSelect.addEventListener("change", renderScenario);
scenarioWorkloadView.addEventListener("change", renderWorkloadSection);
opportunitySearch.addEventListener("input", renderOpportunityTable);
opportunityReviewFilter.addEventListener("change", renderOpportunityTable);
drilldownLeaderSelect.addEventListener("change", renderLeaderDrilldown);

document.getElementById("toggleOpportunityTable").addEventListener("click", () => {
  expandedTables.opportunities = !expandedTables.opportunities;
  renderOpportunityTable();
});

document.getElementById("toggleSensitivityTable").addEventListener("click", () => {
  expandedTables.sensitivity = !expandedTables.sensitivity;
  renderSensitivitySection();
});

document.getElementById("toggleLeaderTable").addEventListener("click", () => {
  expandedTables.leader = !expandedTables.leader;
  renderLeaderDrilldown();
});

document.getElementById("toggleDecisionTable").addEventListener("click", () => {
  expandedTables.decisions = !expandedTables.decisions;
  renderDecisionLog();
});

populateLeaderSelector();
renderHome();
renderCurrentState();
renderScenario();
renderDecisionLog();
