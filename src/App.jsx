import { useState } from "react";
import { PHASES } from "./data";
import useCareerGame from "./hooks/useCareerGame";
import { SetupScreen, GameScreen } from "./screens";
import { HallOfFame, Leaderboard } from "./components";

export default function App() {
  const game = useCareerGame();
  const [showHof, setShowHof] = useState(false);
  const [showRanking, setShowRanking] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {game.phase === PHASES.SETUP ? (
        <>
          <SetupScreen
            onConfirm={game.startGame}
            onOpenHallOfFame={() => setShowHof(true)}
            onOpenRanking={() => setShowRanking(true)}
          />
          {showHof && <HallOfFame onClose={() => setShowHof(false)} />}
          {showRanking && <Leaderboard onClose={() => setShowRanking(false)} />}
        </>
      ) : (
        game.player && (
          <GameScreen
            player={game.player}
            history={game.history}
            phase={game.phase}
            offers={game.offers}
            event={game.event}
            message={game.message}
            headline={game.headline}
            canStay={game.canStay}
            celebration={game.celebration}
            realisticMode={game.realisticMode}
            autoSimulating={game.autoSimulating}
            onPickClub={game.pickClub}
            onSimulate={game.simulate}
            onHandleChoice={game.handleChoice}
            onStay={game.stay}
            onReset={game.reset}
            onDismissCelebration={game.dismissCelebration}
          />
        )
      )}
    </div>
  );
}
