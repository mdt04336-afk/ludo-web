import React, { useState } from 'react'
import Board from './components/Board'

export type Token = {
  id: number
  player: number
  pos: number // -1 = at home, 0..51 on main track, -2 = finished, -3 = in finish stretch
  steps: number // steps moved since entering track (0..57)
  finished?: boolean
}

const NUM_PLAYERS = 4
const TOKENS_PER_PLAYER = 4

export default function App() {
  const [players] = useState(NUM_PLAYERS)
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [dice, setDice] = useState<number | null>(null)
  const [tokens, setTokens] = useState<Token[]>(() => {
    const arr: Token[] = []
    for (let p = 0; p < NUM_PLAYERS; p++) {
      for (let t = 0; t < TOKENS_PER_PLAYER; t++) {
        arr.push({ id: p * 10 + t, player: p, pos: -1, steps: 0, finished: false })
      }
    }
    return arr
  })

  const startPositions = [0, 13, 26, 39]
  const safeSpots = new Set([0, 8, 13, 21, 26, 34, 39, 47])

  function rollDice() {
    if (dice !== null) return
    const r = Math.floor(Math.random() * 6) + 1
    setDice(r)

    // If no possible move and not 6 => next player
    const movable = tokens.some((tk) => canMoveToken(tk, r))
    if (!movable && r !== 6) {
      setTimeout(() => {
        setCurrentPlayer((c) => (c + 1) % players)
        setDice(null)
      }, 900)
    }
  }

  function canMoveToken(tk: Token, roll: number) {
    if (tk.player !== currentPlayer) return false
    if (tk.finished) return false
    if (tk.pos === -1) return roll === 6
    // on track or in finish stretch: need exact or not overshoot
    return tk.steps + roll <= 57
  }

  function moveToken(tk: Token) {
    if (dice === null) return
    if (tk.player !== currentPlayer) return
    if (!canMoveToken(tk, dice)) return

    setTokens((prev) => {
      const next = prev.map((p) => ({ ...p }))
      const idx = next.findIndex((t) => t.id === tk.id)
      if (idx === -1) return prev

      if (next[idx].pos === -1 && dice === 6) {
        // enter the board
        next[idx].pos = startPositions[currentPlayer]
        next[idx].steps = 0
      } else if (next[idx].pos >= 0 && !next[idx].finished) {
        const proposed = next[idx].steps + dice
        if (proposed > 57) {
          // invalid move (cannot overshoot finish)
          return prev
        }

        next[idx].steps = proposed

        if (proposed === 57) {
          // finished
          next[idx].finished = true
          next[idx].pos = -2
        } else if (proposed < 52) {
          // still on main track
          next[idx].pos = (next[idx].pos + dice) % 52
        } else {
          // in finish stretch (not displayed on main track)
          next[idx].pos = -3
        }
      }

      // handle capture only on main track positions 0..51
      const landingPos = next[idx].pos
      if (landingPos >= 0 && !safeSpots.has(landingPos)) {
        for (let i = 0; i < next.length; i++) {
          if (
            i !== idx &&
            next[i].pos === landingPos &&
            next[i].player !== currentPlayer
          ) {
            // send opponent token home
            next[i].pos = -1
            next[i].steps = 0
            next[i].finished = false
          }
        }
      }

      return next
    })

    const extraTurn = dice === 6
    setDice(null)

    // check win
    setTimeout(() => {
      const finishedCount = tokens.filter((t) => t.player === currentPlayer && t.finished).length
      if (finishedCount === TOKENS_PER_PLAYER) {
        // winner!
        window.alert(`Player ${currentPlayer + 1} wins!`)
        resetGame()
        return
      }
      if (!extraTurn) setCurrentPlayer((c) => (c + 1) % players)
    }, 50)
  }

  function resetGame() {
    setTokens((prev) => prev.map((t) => ({ ...t, pos: -1, steps: 0, finished: false })))
    setCurrentPlayer(0)
    setDice(null)
  }

  return (
    <div className="app">
      <h1>Ludo Web (MVP)</h1>
      <div className="controls">
        <div>Current: Player {currentPlayer + 1}</div>
        <button onClick={rollDice} disabled={dice !== null}>
          {dice === null ? 'Roll Dice' : `Rolled: ${dice}`}
        </button>
        <button onClick={resetGame}>Reset</button>
      </div>

      <Board
        tokens={tokens}
        onTokenClick={moveToken}
        safeSpots={safeSpots}
        startPositions={startPositions}
      />

      <p className="hint">Click a token of the current player to move it after rolling.</p>
    </div>
  )
}
