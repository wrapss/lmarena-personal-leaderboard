document.addEventListener("DOMContentLoaded", function () {
  let activeTab = "leaderboard";

  function updateLeaderboardDisplay(leaderboard) {
    const leaderboardDiv = document.getElementById("leaderboardContent");
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

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  function loadHistory() {
    const domain = document.getElementById("domainSelect").value;
    const key = `history_${domain}`;

    chrome.storage.local.get([key], function (result) {
      const history = result[key] || [];
      const historyContent = document.getElementById("historyContent");
      historyContent.innerHTML = "";

      if (history.length === 0) {
        historyContent.innerHTML =
          '<p style="text-align: center; color: #666;">No voting history available.</p>';
        return;
      }

      history.reverse().forEach((vote) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "history-item";

        let resultClass =
          vote.winner === "Tie"
            ? "history-tie"
            : vote.winner === "Both Bad"
            ? "history-tie"
            : "history-winner";

        itemDiv.innerHTML = `
         <div class="history-date">${formatDate(vote.date)}</div>
         <div class="history-models">
           <span class="${
             vote.modelA === vote.winner ? "history-winner" : "history-loser"
           }">${vote.modelA}</span>
           vs
           <span class="${
             vote.modelB === vote.winner ? "history-winner" : "history-loser"
           }">${vote.modelB}</span>
         </div>
         <div class="${resultClass}">Result: ${vote.winner}</div>
       `;

        historyContent.appendChild(itemDiv);
      });
    });
  }

  function switchTab(tabName) {
    document.querySelector(`#${activeTab}`).style.display = "none";
    document.querySelector(`#${tabName}`).style.display = "block";

    document
      .querySelector(`.tab[data-tab="${activeTab}"]`)
      .classList.remove("active");
    document
      .querySelector(`.tab[data-tab="${tabName}"]`)
      .classList.add("active");

    activeTab = tabName;

    if (tabName === "history") {
      loadHistory();
    } else {
      loadLeaderboard();
    }
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

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  document
    .getElementById("domainSelect")
    .addEventListener("change", function () {
      if (activeTab === "leaderboard") {
        loadLeaderboard();
      } else {
        loadHistory();
      }
    });

  document.getElementById("exportBtn").addEventListener("click", function () {
    const domain = document.getElementById("domainSelect").value;
    const leaderboardKey = `leaderboard_${domain}`;
    const historyKey = `history_${domain}`;

    chrome.storage.local.get([leaderboardKey, historyKey], function (result) {
      const exportData = {
        leaderboard: result[leaderboardKey] || {},
        history: result[historyKey] || [],
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lmarena_data_${domain}.json`;
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
          const importedData = JSON.parse(e.target.result);
          const domain = document.getElementById("domainSelect").value;
          const leaderboardKey = `leaderboard_${domain}`;
          const historyKey = `history_${domain}`;

          chrome.storage.local.set(
            {
              [leaderboardKey]: importedData.leaderboard || {},
              [historyKey]: importedData.history || [],
            },
            function () {
              if (activeTab === "leaderboard") {
                updateLeaderboardDisplay(importedData.leaderboard || {});
              } else {
                loadHistory();
              }
            }
          );
        } catch (error) {
          alert("Invalid file format");
        }
      };
      reader.readAsText(file);
    }
  });

  document.getElementById("resetBtn").addEventListener("click", function () {
    if (
      confirm("Are you sure you want to reset both leaderboard and history?")
    ) {
      const domain = document.getElementById("domainSelect").value;
      const leaderboardKey = `leaderboard_${domain}`;
      const historyKey = `history_${domain}`;

      chrome.storage.local.set(
        {
          [leaderboardKey]: {},
          [historyKey]: [],
        },
        function () {
          if (activeTab === "leaderboard") {
            updateLeaderboardDisplay({});
          } else {
            loadHistory();
          }
        }
      );
    }
  });

  initializeDomainSelect();
});
