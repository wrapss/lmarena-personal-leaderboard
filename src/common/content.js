const CONFIG = {
  selectors: {
    web: {
      models: ".-mt-px.font-bold.text-sm",
    },
    arena: {
      models: ".MuiTypography-root.MuiTypography-body1.css-1qsgly2",
    },
    lmarena: {
      modelA: "#model_selector_md h3",
      modelB: "#model_selector_md h3",
    },
    votes: {
      right: ["b is better", "right is better"],
      left: ["a is better", "left is better"],
      tie: ["tie"],
      bad: ["both are bad"],
    },
  },
  domains: {
    arena: "chatbot-arena.web.app",
    main: "lmarena.ai",
    web: "web.lmarena.ai",
  },
  delay: 2000,
};

console.log("Extension LMSYS Vote Tracker is active");

function getModelNames() {
  try {
    if (window.location.hostname === CONFIG.domains.arena) {
      const models = [];
      document
        .querySelectorAll(CONFIG.selectors.arena.models)
        .forEach((container) => {
          const modelText = container.textContent.trim();
          if (modelText) {
            models.push(modelText);
          }
        });
      return models;
    } else if (window.location.hostname === CONFIG.domains.main) {
      const modelA = document
        .querySelector(CONFIG.selectors.lmarena.modelA)
        .textContent.replace("Model A: ", "");
      const modelB = document
        .querySelectorAll(CONFIG.selectors.lmarena.modelB)[1]
        .textContent.replace("Model B: ", "");
      return [modelA, modelB];
    } else if (window.location.hostname === CONFIG.domains.web) {
      const models = [];
      document
        .querySelectorAll(CONFIG.selectors.web.models)
        .forEach((container) => {
          const modelText = container.textContent.trim();
          if (modelText) {
            models.push(modelText);
          }
        });
      return models;
    }
  } catch {
    return [];
  }
}

function updateLeaderboard(winner, loser, models) {
  if (!models.length || models.includes(undefined)) {
    return;
  }
  const domain =
    window.location.hostname === CONFIG.domains.arena
      ? CONFIG.domains.main
      : window.location.hostname;
  const key = `leaderboard_${domain}`;
  chrome.storage.local.get([key], function (result) {
    let leaderboard = result[key] || {};
    if (winner === "Tie") {
      leaderboard[models[0]] = leaderboard[models[0]] || { wins: 0, losses: 0 };
      leaderboard[models[1]] = leaderboard[models[1]] || { wins: 0, losses: 0 };
      leaderboard[models[0]].wins++;
      leaderboard[models[1]].wins++;
    } else if (winner !== "Both Bad") {
      leaderboard[winner] = leaderboard[winner] || { wins: 0, losses: 0 };
      leaderboard[loser] = leaderboard[loser] || { wins: 0, losses: 0 };
      leaderboard[winner].wins++;
      leaderboard[loser].losses++;
    }
    chrome.storage.local.set({ [key]: leaderboard });
  });
}

function updateHistory(winner, loser, models) {
  const domain =
    window.location.hostname === CONFIG.domains.arena
      ? CONFIG.domains.main
      : window.location.hostname;
  const key = `history_${domain}`;

  chrome.storage.local.get([key], function (result) {
    let history = result[key] || [];

    const vote = {
      date: new Date().toISOString(),
      modelA: models[0],
      modelB: models[1],
      winner: winner,
      loser: loser,
    };

    history.push(vote);
    chrome.storage.local.set({ [key]: history });
  });
}

document.addEventListener("click", function (e) {
  console.log("e.target.textContent", e.target.textContent);
  const isRightVote = CONFIG.selectors.votes.right.some((text) =>
    e.target.textContent.toLowerCase().includes(text)
  );
  const isLeftVote = CONFIG.selectors.votes.left.some((text) =>
    e.target.textContent.toLowerCase().includes(text)
  );
  const isTieVote = CONFIG.selectors.votes.tie.some((text) =>
    e.target.textContent.toLowerCase().includes(text)
  );
  const isBothBadVote = CONFIG.selectors.votes.bad.some((text) =>
    e.target.textContent.toLowerCase().includes(text)
  );
  console.log("isRightVote", isRightVote);
  console.log("isLeftVote", isLeftVote);
  console.log("isTieVote", isTieVote);
  console.log("isBothBadVote", isBothBadVote);

  if (isRightVote || isLeftVote || isTieVote || isBothBadVote) {
    setTimeout(() => {
      const models = getModelNames();
      console.log("models", models);
      let winner = null;
      let loser = null;
      if (isLeftVote) {
        winner = models[0];
        loser = models[1];
      } else if (isRightVote) {
        winner = models[1];
        loser = models[0];
      } else if (isTieVote) {
        winner = "Tie";
        loser = "Tie";
      } else if (isBothBadVote) {
        winner = "Both Bad";
        loser = "Both Bad";
      }
      updateHistory(winner, loser, models);
      updateLeaderboard(winner, loser, models);
    }, CONFIG.delay);
  }
});
