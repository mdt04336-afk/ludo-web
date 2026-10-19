import React from 'react'
import { Token } from '../App'

type Props = {
  tokens: Token[]
  onTokenClick: (t: Token) => void
  safeSpots: Set<number>
  startPositions: number[]
}

function cellTokens(tokens: Token[], idx: number) {
  return tokens.filter((t) => t.pos === idx)
}

const playerColors = ['#e53935', '#1e88e5', '#43a047', '#fdd835']

export default function Board({ tokens, onTokenClick, safeSpots }: Props) {
  const cells = Array.from({ length: 52 }).map((_, i) => i)

  return (
    <div className="board">
      {cells.map((c) => {
        const tks = cellTokens(tokens, c)
        return (
          <div key={c} className={`cell ${safeSpots.has(c) ? 'safe' : ''}`}>
            <div className="cell-index">{c}</div>
            <div className="tokens">
              {tks.map((tk) => (
                <div
                  key={tk.id}
                  className="token"
                  style={{ background: playerColors[tk.player] }}
                  onClick={() => onTokenClick(tk)}
                  title={`P${tk.player + 1} token ${tk.id}`}
                />
              ))}
            </div>
          </div>
        )
      })}

      <div className="home-areas">
        {[0, 1, 2, 3].map((p) => (
          <div key={p} className="home">
            <div className="home-title">Player {p + 1} home</div>
            <div className="home-tokens">
              {tokens
                .filter((t) => t.player === p && t.pos === -1)
                .map((t) => (
                  <div
                    key={t.id}
                    className="token token-home"
                    style={{ background: playerColors[p] }}
                    onClick={() => onTokenClick(t)}
                  />
                ))}
            </div>
            <div className="finished-count">
              Finished: {tokens.filter((t) => t.player === p && t.finished).length}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
