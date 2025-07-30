import React, { useState, useEffect } from "react";
import "./App.css";

// THEME COLORS
const COLORS = {
  primary: "#2196f3",
  secondary: "#f44336",
  accent: "#ffeb3b",
  boardBg: "#fff",
  boardShadow: "0 8px 40px 0 rgba(33,150,243,.08)",
  text: "#222",
  faded: "#888",
  x: "#2196f3",
  o: "#f44336",
  winning: "#ffeb3b",
};

// For referencing environment variables for any future needs
const ENV_EXAMPLE = process.env.REACT_APP_SITE_URL || "";

/**
 * Square component used for each cell on board.
 */
function Square({ value, onClick, highlight }) {
  return (
    <button
      className={`ttt-square${highlight ? " highlight" : ""}`}
      onClick={onClick}
      aria-label={value ? `Cell occupied by ${value}` : "Empty cell"}
      tabIndex={0}
      type="button"
    >
      {value === "X" ? (
        <span className="ttt-x">{value}</span>
      ) : value === "O" ? (
        <span className="ttt-o">{value}</span>
      ) : null}
    </button>
  );
}

/**
 * Game board display.
 */
function Board({ squares, onSquareClick, winningLine }) {
  function renderSquare(i) {
    const highlight = winningLine && winningLine.includes(i);
    return (
      <Square
        key={i}
        value={squares[i]}
        onClick={() => onSquareClick(i)}
        highlight={highlight}
      />
    );
  }

  // 3x3 Grid
  return (
    <div className="ttt-board">
      {[0, 1, 2].map((row) => (
        <div className="ttt-board-row" key={row}>
          {Array(3)
            .fill(0)
            .map((_, col) => renderSquare(3 * row + col))}
        </div>
      ))}
    </div>
  );
}

// Utils
function calculateWinner(squares) {
  // Returns [winner, winningLine array]
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // cols
    [0, 4, 8],
    [2, 4, 6], // diags
  ];
  for (const line of lines) {
    const [a, b, c] = line;
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return [squares[a], line];
    }
  }
  return [null, null];
}

function isDraw(squares) {
  return squares.every((v) => v) && !calculateWinner(squares)[0];
}

/**
 * Provides the best move for the computer (minimax, but falls back to first available if user wins soon).
 * Difficulty: always makes optimal move (unbeatable).
 */
function computeAIMove(squares, aiPlayer) {
  // Minimax for tic tac toe (for 3x3, this is fast)
  const human = aiPlayer === "X" ? "O" : "X";

  function minimax(board, depth, isMax) {
    const [winner] = calculateWinner(board);
    if (winner === aiPlayer) return 10 - depth;
    if (winner === human) return depth - 10;
    if (board.every(Boolean)) return 0;

    let best = isMax ? -Infinity : Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = isMax ? aiPlayer : human;
        const score = minimax(board, depth + 1, !isMax);
        board[i] = null;
        best = isMax ? Math.max(best, score) : Math.min(best, score);
      }
    }
    return best;
  }

  let bestScore = -Infinity;
  let move = -1;
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      squares[i] = aiPlayer;
      const score = minimax(squares, 0, false);
      squares[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  if (move === -1) {
    // fallback, shouldn't happen
    move = squares.findIndex((v) => !v);
  }
  return move;
}

// Mode selector
function ModeSelect({ mode, setMode, disabled }) {
  return (
    <div className="ttt-modes">
      <button
        className={`ttt-mode-btn${mode === "pvp" ? " active" : ""}`}
        onClick={() => setMode("pvp")}
        disabled={disabled}
        style={{
          borderColor: COLORS.primary,
          color: COLORS.primary,
        }}
        type="button"
      >
        👤 vs 👤
      </button>
      <button
        className={`ttt-mode-btn${mode === "ai" ? " active" : ""}`}
        onClick={() => setMode("ai")}
        disabled={disabled}
        style={{
          borderColor: COLORS.accent,
          color: COLORS.secondary,
        }}
        type="button"
      >
        👤 vs 🤖
      </button>
    </div>
  );
}

// Game status display
function GameStatus({ status, turn, mode, disableAnim }) {
  let statusText;
  if (status === "draw") statusText = "It's a draw!";
  else if (status === "win")
    statusText =
      turn === "X" ? (
        <span>
          Winner:{" "}
          <span className="ttt-x">X</span>
        </span>
      ) : (
        <span>
          Winner:{" "}
          <span className="ttt-o">O</span>
        </span>
      );
  else
    statusText = (
      <span>
        {mode === "ai" && turn === "O"
          ? "Computer's Turn"
          : `${turn === "X" ? "X" : "O"}'s Turn`}
      </span>
    );

  return (
    <div
      className={`ttt-status${disableAnim ? "" : " ttt-status-anim"}`}
      aria-live="polite"
    >
      {statusText}
    </div>
  );
}

// Scoreboard
function ScoreBoard({ score, mode }) {
  return (
    <div className="ttt-scoreboard" aria-label="Score tracker">
      <div className="ttt-score-x">
        <span className="ttt-x">X</span>
        <span>{score.X}</span>
      </div>
      <div className="ttt-score-o">
        <span className="ttt-o">O</span>
        <span>{score.O}</span>
      </div>
      <div className="ttt-score-d">
        <span className="ttt-d">Draw</span>
        <span>{score.D}</span>
      </div>
    </div>
  );
}

// Controls (Restart + Reset)
function Controls({ onRestart, onReset, disableReset }) {
  return (
    <div className="ttt-controls">
      <button className="ttt-btn ttt-btn-restart" onClick={onRestart} type="button" aria-label="Restart game">
        Restart
      </button>
      <button className="ttt-btn ttt-btn-reset" onClick={onReset} disabled={disableReset} type="button" aria-label="Reset scores">
        Reset Scores
      </button>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  // Theme: always light (set for extensibility)
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
  }, []);

  // Modes: "pvp" (player vs player), "ai" (player vs computer)
  const [mode, setMode] = useState("pvp");

  // Board state: 9 squares, "", "X", or "O"
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, winningLine] = calculateWinner(squares);
  const [status, setStatus] = useState("ongoing"); // "ongoing", "win", "draw"
  const [score, setScore] = useState(() => {
    // From localStorage
    try {
      const data = localStorage.getItem("ttt-score-v2");
      if (data) return JSON.parse(data);
    } catch {
      // nothing
    }
    return { X: 0, O: 0, D: 0 };
  });

  // Anim status blink
  const [disableAnim, setDisableAnim] = useState(false);

  // Whenever score changes, save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("ttt-score-v2", JSON.stringify(score));
    } catch {
      // ignore for privacy/etc
    }
  }, [score]);

  // Check for game over
  useEffect(() => {
    if (winner) {
      setStatus("win");
      setScore((prev) => ({
        ...prev,
        [winner]: (prev[winner] || 0) + 1,
      }));
    } else if (isDraw(squares)) {
      setStatus("draw");
      setScore((prev) => ({
        ...prev,
        D: (prev.D || 0) + 1,
      }));
    } else {
      setStatus("ongoing");
    }
  }, [squares, winner]);

  // Computer move (if it's AI mode, and it's O's turn and game not over)
  useEffect(() => {
    if (
      mode === "ai" &&
      !winner &&
      !isDraw(squares) &&
      !xIsNext /* O's turn (AI is always O) */
    ) {
      setDisableAnim(true);
      const aiTimeout = setTimeout(() => {
        const move = computeAIMove([...squares], "O");
        handleSquareClick(move, true);
        setDisableAnim(false);
      }, 600); // brief "thinking delay"
      return () => clearTimeout(aiTimeout);
    }
    // eslint-disable-next-line
  }, [squares, mode, xIsNext, winner]);

  // Game actions
  // PUBLIC_INTERFACE
  function handleSquareClick(i, isAI = false) {
    if (squares[i] || winner || status === "draw") return;
    if (mode === "ai" && !xIsNext && !isAI) return; // Prevent manual O moves in AI mode

    const squaresNew = squares.slice();
    squaresNew[i] = xIsNext ? "X" : "O";
    setSquares(squaresNew);
    setXIsNext(!xIsNext);
  }

  // PUBLIC_INTERFACE
  function handleRestart() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setDisableAnim(false);
  }

  // PUBLIC_INTERFACE
  function handleReset() {
    setScore({ X: 0, O: 0, D: 0 });
  }

  // PUBLIC_INTERFACE
  function handleModeChange(val) {
    setMode(val);
    handleRestart();
  }

  // Turn
  const turn = xIsNext ? "X" : "O";

  // UI
  return (
    <div className="ttt-app">
      <main className="ttt-main">
        <h1 className="ttt-title" style={{ color: COLORS.primary }}>
          Tic Tac Toe
        </h1>
        <ModeSelect
          mode={mode}
          setMode={handleModeChange}
          disabled={status !== "ongoing"}
        />
        <div className="ttt-board-wrap">
          <Board
            squares={squares}
            onSquareClick={handleSquareClick}
            winningLine={winningLine}
          />
        </div>
        <Controls
          onRestart={handleRestart}
          onReset={handleReset}
          disableReset={score.X === 0 && score.O === 0 && score.D === 0}
        />
        <GameStatus
          status={status}
          turn={winner ? winner : turn}
          mode={mode}
          disableAnim={disableAnim}
        />
        <ScoreBoard score={score} mode={mode} />
      </main>
      <footer className="ttt-footer">
        <span>
          &copy; {new Date().getFullYear()} Modern React Tic Tac Toe &mdash; Minimal UI
        </span>
      </footer>
    </div>
  );
}

export default App;
