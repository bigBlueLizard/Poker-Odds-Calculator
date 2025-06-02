import React, { useState } from "react";
import { OddsCalculator, CardGroup } from "poker-odds-calculator";

// Card data
const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
const suits = ["c", "d", "h", "s"];
const cardImages = {};

// Generate card image paths
ranks.forEach(rank => {
  suits.forEach(suit => {
    const card = `${rank}${suit}`;
    cardImages[card] = `/cards/${card}.svg`;
  });
});

const initialPlayers = [
  { name: "Player 1", cards: [], isSelecting: false },
  { name: "Player 2", cards: [], isSelecting: false },
];

export default function App() {
  const [players, setPlayers] = useState(initialPlayers);
  const [board, setBoard] = useState([]);
  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentSelector, setCurrentSelector] = useState(null);

  const handleCardSelect = (card) => {
    if (currentSelector === null) return;

    if (currentSelector === "board") {
      if (board.length < 5) {
        setBoard([...board, card]);
      }
    } else {
      const [playerIndex, cardSlot] = currentSelector;
      const updatedPlayers = [...players];
      
      if (!updatedPlayers[playerIndex].cards) {
        updatedPlayers[playerIndex].cards = [];
      }
      
      updatedPlayers[playerIndex].cards[cardSlot] = card;
      setPlayers(updatedPlayers);
    }
    
    setCurrentSelector(null);
  };

  const handleAddPlayer = () => {
    if (players.length >= 6) return;
    setPlayers([...players, { 
      name: `Player ${players.length + 1}`, 
      cards: [],
      isSelecting: false
    }]);
  };

  const handleRemovePlayer = (index) => {
    if (players.length <= 2) return;
    const updated = [...players];
    updated.splice(index, 1);
    setPlayers(updated);
  };

  const removeBoardCard = (index) => {
    const updated = [...board];
    updated.splice(index, 1);
    setBoard(updated);
  };

  const calculateOdds = async () => {
    setIsCalculating(true);
    try {
      // Validate all players have 2 cards
      if (players.some(p => p.cards.length !== 2)) {
        throw new Error("All players must have 2 cards");
      }

      // Validate board has 0, 3, 4, or 5 cards
      if (![0, 3, 4, 5].includes(board.length)) {
        throw new Error("Board must have 0, 3, 4, or 5 cards");
      }

      const hands = players.map(p => 
        CardGroup.fromString(p.cards.join("").toUpperCase())
      );
      
      const boardCards = board.length > 0 
        ? CardGroup.fromString(board.join("").toUpperCase())
        : null;

      const result = await OddsCalculator.calculate(hands, boardCards);
      
      setResults(result.equities.map((eq) => ({
        win: eq.getEquity(),
        tie: eq.getTiePercentage(),
      })));
    } catch (e) {
      alert(e.message || "Error calculating odds");
    } finally {
      setIsCalculating(false);
    }
  };

  const resetAll = () => {
    setPlayers(initialPlayers);
    setBoard([]);
    setResults(null);
  };

  return (
    <>
      <style>
        {`
          /* Poker Odds Calculator Custom CSS */

          /* Base styles and reset */
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          body {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            line-height: 1.6;
            color: #ffffff;
          }

          /* Main container */
          .poker-calculator {
            min-height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%);
            color: white;
          }

          .poker-container {
            max-width: 1152px;
            margin: 0 auto;
            padding: 2rem 1rem;
          }

          /* Header styles */
          .poker-header {
            text-align: center;
            margin-bottom: 3rem;
          }

          .poker-title {
            font-size: 3rem;
            font-weight: bold;
            background: linear-gradient(to right, #c084fc, #f472b6, #ef4444);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 1rem;
          }

          .poker-subtitle {
            color: #d1d5db;
            font-size: 1.125rem;
          }

          /* Modal styles */
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 50;
            padding: 1rem;
          }

          .modal-content {
            background: linear-gradient(135deg, #374151, #111827);
            padding: 1.5rem;
            border-radius: 1rem;
            width: 100%;
            max-width: 64rem;
            border: 1px solid #4b5563;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }

          .modal-title {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 1.5rem;
            text-align: center;
            background: linear-gradient(to right, #60a5fa, #a855f7);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          /* Card selection styles */
          .card-scroller {
            overflow-x: auto;
            padding-bottom: 1rem;
          }

          .card-container {
            display: flex;
            gap: 0.5rem;
            width: max-content;
            padding: 0 0.5rem;
          }

          .card-button {
            width: 3rem;
            height: 4.2rem;
            background: linear-gradient(to bottom, #ffffff, #f3f4f6);
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #d1d5db;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            flex-shrink: 0;
          }

          .card-button:hover {
            background: linear-gradient(to bottom, #dbeafe, #bfdbfe);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            transform: scale(1.05);
          }

          .card-image {
            width: 2.5rem;
            height: 3.75rem;
            object-fit: contain;
          }

          /* Grid layout */
          .main-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          @media (min-width: 1024px) {
            .main-grid {
              grid-template-columns: 1fr 1fr;
            }
          }

          /* Card sections */
          .card-section {
            background: linear-gradient(135deg, rgba(55, 65, 81, 0.5), rgba(17, 24, 39, 0.5));
            backdrop-filter: blur(4px);
            padding: 1.5rem;
            border-radius: 1rem;
            border: 1px solid #4b5563;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }

          .section-title {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 1.5rem;
            text-align: center;
          }

          .players-title {
            background: linear-gradient(to right, #4ade80, #60a5fa);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .board-title {
            background: linear-gradient(to right, #facc15, #fb923c);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .results-title {
            background: linear-gradient(to right, #c084fc, #f472b6);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          /* Player rows */
          .player-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem;
            background: rgba(55, 65, 81, 0.5);
            border-radius: 0.75rem;
            border: 1px solid #4b5563;
            margin-bottom: 1rem;
          }

          .player-info {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .player-name {
            font-size: 1.125rem;
            font-weight: 600;
            color: #d8b4fe;
            min-width: 5rem;
          }

          .player-cards {
            display: flex;
            gap: 0.5rem;
          }

          .player-card {
            width: 3.5rem;
            height: 4.8rem;
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .player-card:hover {
            transform: scale(1.05);
          }

          .player-card-selected {
            background: linear-gradient(to bottom, #059669, #047857);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }

          .player-card-empty {
            background: linear-gradient(to bottom, #4b5563, #374151);
            border: 2px dashed #6b7280;
          }

          .player-card-empty:hover {
            background: linear-gradient(to bottom, #6b7280, #4b5563);
          }

          .player-card-image {
            width: 3rem;
            height: 4.2rem;
            object-fit: contain;
          }

          .card-placeholder {
            font-size: 1.5rem;
            color: #9ca3af;
          }

          /* Board cards */
          .board-container {
            display: flex;
            justify-content: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
          }

          .board-card {
            position: relative;
          }

          .board-card:hover .remove-card {
            opacity: 1;
          }

          .board-card-image {
            width: 3.5rem;
            height: 4.8rem;
            background: linear-gradient(to bottom, #ffffff, #f3f4f6);
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }

          .board-card-image img {
            width: 3rem;
            height: 4.2rem;
            object-fit: contain;
          }

          .add-board-card {
            width: 3.5rem;
            height: 4.8rem;
            background: linear-gradient(to bottom, #4b5563, #374151);
            border: 2px dashed #6b7280;
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #9ca3af;
            font-size: 1.5rem;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .add-board-card:hover {
            background: linear-gradient(to bottom, #6b7280, #4b5563);
            transform: scale(1.05);
          }

          .remove-card {
            position: absolute;
            top: -0.5rem;
            right: -0.5rem;
            width: 1.5rem;
            height: 1.5rem;
            background: linear-gradient(to right, #ef4444, #dc2626);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: bold;
            cursor: pointer;
            opacity: 0;
            transition: all 0.2s ease;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }

          .remove-card:hover {
            transform: scale(1.1);
          }

          /* Buttons */
          .button-group {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin: 2rem 0;
          }

          .btn {
            padding: 0.75rem 1.5rem;
            border-radius: 0.75rem;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: all 0.2s ease;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }

          .btn:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }

          .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
          }

          .btn-primary {
            background: linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899);
            color: white;
            padding: 1rem 2rem;
            font-size: 1.125rem;
          }

          .btn-success {
            background: linear-gradient(to right, #10b981, #059669);
            color: white;
          }

          .btn-secondary {
            background: linear-gradient(to right, #6b7280, #4b5563);
            color: white;
          }

          .btn-danger {
            background: linear-gradient(to right, #ef4444, #dc2626);
            color: white;
          }

          .btn-cancel {
            background: linear-gradient(to right, #ef4444, #dc2626);
            color: white;
            padding: 0.75rem 1.5rem;
          }

          /* Loading spinner */
          .spinner {
            animation: spin 1s linear infinite;
            width: 1.25rem;
            height: 1.25rem;
            margin-right: 0.75rem;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          /* Results section */
          .results-container {
            background: linear-gradient(135deg, rgba(55, 65, 81, 0.5), rgba(17, 24, 39, 0.5));
            backdrop-filter: blur(4px);
            padding: 1.5rem;
            border-radius: 1rem;
            border: 1px solid #4b5563;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }

          .result-card {
            background: linear-gradient(to right, rgba(55, 65, 81, 0.8), rgba(17, 24, 39, 0.8));
            padding: 1.5rem;
            border-radius: 0.75rem;
            border: 1px solid #4b5563;
            margin-bottom: 1rem;
            transition: all 0.2s ease;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }

          .result-card:hover {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }

          .result-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;
          }

          .result-player-name {
            font-size: 1.25rem;
            font-weight: bold;
            color: #d8b4fe;
          }

          .result-cards {
            display: flex;
            gap: 0.5rem;
          }

          .result-card-image {
            width: 2.5rem;
            height: 3.5rem;
            background: white;
            border-radius: 0.25rem;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .result-card-image img {
            width: 2.25rem;
            height: 3rem;
            object-fit: contain;
          }

          .result-stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }

          .stat-box {
            padding: 1rem;
            border-radius: 0.5rem;
            border: 1px solid;
          }

          .win-stat {
            background: rgba(34, 197, 94, 0.2);
            border-color: rgba(34, 197, 94, 0.3);
          }

          .tie-stat {
            background: rgba(234, 179, 8, 0.2);
            border-color: rgba(234, 179, 8, 0.3);
          }

          .stat-label {
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: 0.25rem;
          }

          .win-label {
            color: #4ade80;
          }

          .tie-label {
            color: #facc15;
          }

          .stat-value {
            font-size: 1.5rem;
            font-weight: bold;
          }

          .win-value {
            color: #86efac;
          }

          .tie-value {
            color: #fde047;
          }

          /* Progress bar */
          .progress-container {
            margin-top: 1rem;
          }

          .progress-bar {
            background: #374151;
            border-radius: 9999px;
            height: 0.75rem;
            overflow: hidden;
          }

          .progress-fill {
            background: linear-gradient(to right, #10b981, #4ade80);
            height: 100%;
            transition: width 1s ease-out;
          }

          /* Utilities */
          .text-center { text-align: center; }
          .mb-1 { margin-bottom: 0.25rem; }
          .mb-2 { margin-bottom: 0.5rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mb-6 { margin-bottom: 1.5rem; }
          .mt-4 { margin-top: 1rem; }
          .mt-6 { margin-top: 1.5rem; }

          /* Responsive adjustments */
          @media (max-width: 768px) {
            .poker-title {
              font-size: 2rem;
            }
            
            .poker-container {
              padding: 1rem;
            }
            
            .player-row {
              flex-direction: column;
              align-items: flex-start;
              gap: 1rem;
            }
            
            .button-group {
              flex-direction: column;
              align-items: center;
            }
            
            .result-stats {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>
      
      <div className="poker-calculator">
        <div className="poker-container">
          {/* Header */}
          <div className="poker-header">
            <h1 className="poker-title">
              Poker Odds Calculator
            </h1>
            <p className="poker-subtitle">Calculate your winning probabilities with precision</p>
          </div>

          {/* Card Selection Modal */}
          {currentSelector !== null && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2 className="modal-title">
                  Select {currentSelector === "board" ? "Board" : "Player"} Card
                </h2>
                
                {/* Horizontal scrollable card container */}
                <div className="card-scroller">
                  <div className="card-container">
                    {ranks.map(rank => (
                      suits.map(suit => {
                        const card = `${rank}${suit}`;
                        return (
                          <button
                            key={card}
                            className="card-button"
                            onClick={() => handleCardSelect(card)}
                          >
                            <img 
                              src={cardImages[card]} 
                              alt={card} 
                              className="card-image"
                            />
                          </button>
                        );
                      })
                    ))}
                  </div>
                </div>
                
                <div className="text-center mt-6">
                  <button
                    className="btn btn-cancel"
                    onClick={() => setCurrentSelector(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="main-grid">
            {/* Left Column - Players and Board */}
            <div>
              {/* Players Section */}
              <div className="card-section mb-4">
                <h2 className="section-title players-title">
                  Players
                </h2>
                <div>
                  {players.map((player, index) => (
                    <div key={index} className="player-row">
                      <div className="player-info">
                        <span className="player-name">{player.name}</span>
                        
                        <div className="player-cards">
                          {[0, 1].map(slot => (
                            <button
                              key={slot}
                              className={`player-card ${
                                player.cards[slot] 
                                  ? "player-card-selected" 
                                  : "player-card-empty"
                              }`}
                              onClick={() => setCurrentSelector([index, slot])}
                            >
                              {player.cards[slot] ? (
                                <img 
                                  src={cardImages[player.cards[slot]]} 
                                  alt={player.cards[slot]} 
                                  className="player-card-image"
                                />
                              ) : (
                                <span className="card-placeholder">?</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {players.length > 2 && (
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleRemovePlayer(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Board Cards */}
              <div className="card-section mb-4">
                <h2 className="section-title board-title">
                  Community Cards
                </h2>
                <div className="board-container">
                  {board.map((card, index) => (
                    <div key={index} className="board-card">
                      <div className="board-card-image">
                        <img 
                          src={cardImages[card]} 
                          alt={card} 
                        />
                      </div>
                      <button
                        className="remove-card"
                        onClick={() => removeBoardCard(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {board.length < 5 && (
                    <button
                      className="add-board-card"
                      onClick={() => setCurrentSelector("board")}
                    >
                      +
                    </button>
                  )}
                </div>
                <p className="text-center poker-subtitle">Click + to add flop/turn/river cards</p>
              </div>

              {/* Action Buttons */}
              <div className="button-group">
                <button
                  className="btn btn-success"
                  onClick={handleAddPlayer}
                  disabled={players.length >= 6}
                >
                  + Add Player
                </button>
                
                <button
                  className="btn btn-secondary"
                  onClick={resetAll}
                >
                  Reset All
                </button>
              </div>

              {/* Calculate Button */}
              <div className="text-center">
                <button
                  className="btn btn-primary"
                  onClick={calculateOdds}
                  disabled={isCalculating || players.some(p => p.cards.length !== 2)}
                >
                  {isCalculating ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Calculating...
                    </span>
                  ) : (
                    "🎯 Calculate Odds"
                  )}
                </button>
              </div>
            </div>

            {/* Right Column - Results */}
            <div>
              {results && (
                <div className="results-container">
                  <h2 className="section-title results-title">
                    🏆 Results
                  </h2>
                  <div>
                    {results.map((res, i) => (
                      <div key={i} className="result-card">
                        <div className="result-header">
                          <span className="result-player-name">{players[i].name}</span>
                          <div className="result-cards">
                            {players[i].cards.map((card, idx) => (
                              <div key={idx} className="result-card-image">
                                <img 
                                  src={cardImages[card]} 
                                  alt={card} 
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="result-stats">
                          <div className="stat-box win-stat">
                            <div className="stat-label win-label">Win Probability</div>
                            <div className="stat-value win-value">{res.win.toFixed(2)}%</div>
                          </div>
                          <div className="stat-box tie-stat">
                            <div className="stat-label tie-label">Tie Probability</div>
                            <div className="stat-value tie-value">{res.tie.toFixed(2)}%</div>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="progress-container">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ width: `${res.win}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}