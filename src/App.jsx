import { PHASES } from "./data";
import useCareerGame from "./hooks/useCareerGame";
import { SetupScreen, GameScreen } from "./screens";

export default function App() {
  const game = useCareerGame();

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff" }}>
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
