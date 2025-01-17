document.addEventListener("DOMContentLoaded", function () {
  function updateLeaderboardDisplay(leaderboard) {
    const leaderboardDiv = document.getElementById("leaderboard");
    leaderboardDiv.innerHTML = "";
    const sortedModels = Object.entries(leaderboard).sort(
      ([, a], [, b]) => b.wins - b.losses - (a.wins - a.losses)
    );
    if (sortedModels.length === 0) {
      const messageDiv = document.createElement("div");
      messageDiv.style.textAlign = "center";
      messageDiv.style.padding = "20px";
      messageDiv.style.color = "#666";
      messageDiv.innerHTML = `
       <p>You haven't voted yet on this arena.</p>
     `;
      leaderboardDiv.appendChild(messageDiv);
      return;
    }
    sortedModels.forEach(([model, scores]) => {
      const netScore = scores.wins - scores.losses;
      const scoreClass =
        netScore > 0 ? "positive" : netScore < 0 ? "negative" : "neutral";
      const modelDiv = document.createElement("div");
      modelDiv.className = "model-row";
      modelDiv.innerHTML = `
       <span class="model-name">${model}</span>
       <span class="model-stats">
         <span class="win-loss">${scores.wins}W/${scores.losses}L</span>
         <span class="net-score ${scoreClass}">${
        netScore > 0 ? "+" : ""
      }${netScore}</span>
       </span>
     `;
      leaderboardDiv.appendChild(modelDiv);
    });
  }

  function loadLeaderboard() {
    const domain = document.getElementById("domainSelect").value;
    const key = `leaderboard_${domain}`;
    chrome.storage.local.get([key], function (result) {
      const leaderboard = result[key] || {};
      updateLeaderboardDisplay(leaderboard);
    });
  }

  function initializeDomainSelect() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        const url = new URL(tabs[0].url);
        const hostname = url.hostname;
        let defaultDomain = "web.lmarena.ai";

        if (hostname === "chatbot-arena.web.app") {
          defaultDomain = "lmarena.ai";
        } else if (["web.lmarena.ai", "lmarena.ai"].includes(hostname)) {
          defaultDomain = hostname;
        }

        document.getElementById("domainSelect").value = defaultDomain;
        loadLeaderboard();
      }
    });
  }

  document
    .getElementById("domainSelect")
    .addEventListener("change", loadLeaderboard);

  initializeDomainSelect();

  document.getElementById("exportBtn").addEventListener("click", function () {
    const domain = document.getElementById("domainSelect").value;
    const key = `leaderboard_${domain}`;
    chrome.storage.local.get([key], function (result) {
      const leaderboard = result[key] || {};
      const dataStr = JSON.stringify(leaderboard, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lmarena_leaderboard_${domain}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  });

  document.getElementById("importBtn").addEventListener("click", function () {
    document.getElementById("fileInput").click();
  });

  document.getElementById("fileInput").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const importedLeaderboard = JSON.parse(e.target.result);
          const domain = document.getElementById("domainSelect").value;
          const key = `leaderboard_${domain}`;
          chrome.storage.local.set({ [key]: importedLeaderboard }, function () {
            updateLeaderboardDisplay(importedLeaderboard);
          });
        } catch (error) {
          alert("Invalid file format");
        }
      };
      reader.readAsText(file);
    }
  });

  document.getElementById("resetBtn").addEventListener("click", function () {
    if (confirm("Are you sure you want to reset the current leaderboard?")) {
      const domain = document.getElementById("domainSelect").value;
      const key = `leaderboard_${domain}`;
      chrome.storage.local.set({ [key]: {} }, function () {
        updateLeaderboardDisplay({});
      });
    }
  });
});
