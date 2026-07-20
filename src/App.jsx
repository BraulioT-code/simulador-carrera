import { useState } from "react";
import { PHASES } from "./data";
import useCareerGame from "./hooks/useCareerGame";
import { SetupScreen, GameScreen } from "./screens";
import { HallOfFame } from "./components";

export default function App() {
  const game = useCareerGame();
  const [showHof, setShowHof] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {game.phase === PHASES.SETUP ? (
        <>
          <SetupScreen onConfirm={game.startGame} onOpenHallOfFame={() => setShowHof(true)} />
          {showHof && <HallOfFame onClose={() => setShowHof(false)} />}
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
