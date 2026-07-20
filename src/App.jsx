import { PHASES } from "./data";
import useCareerGame from "./hooks/useCareerGame";
import { SetupScreen, GameScreen } from "./screens";

export default function App() {
  const game = useCareerGame();

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {game.phase === PHASES.SETUP ? (
        <SetupScreen onConfirm={game.startGame} />
      ) : (
        game.player && (
          <GameScreen
            player={game.player}
            history={game.history}
            phase={game.phase}
            offers={game.offers}
            event={game.event}
            message={game.message}
            canStay={game.canStay}
            onPickClub={game.pickClub}
            onSimulate={game.simulate}
            onHandleChoice={game.handleChoice}
            onStay={game.stay}
            onReset={game.reset}
          />
        )
      )}
    </div>
  );
}
