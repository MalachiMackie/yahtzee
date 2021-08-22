import React, { FC, ReactElement, useEffect, useMemo, useState } from 'react';
import GameService, { GameStatus } from '../../Services/GameService';
import GamePlay from '../GamePlay/GamePlay';
import GameStart from '../GameStart/GameStart';

interface GameProps {
    gameQuit: () => void,
    gameCompleted: () => void
}

const Game: FC<GameProps> = ({gameQuit, gameCompleted}: GameProps) => {

    const gameService = useMemo(() => new GameService(), []);

    const [status, setStatus] = useState(GameStatus.NotStarted);

    gameService.status.subscribe(gsStatus => {
        if (gsStatus !== status) {
            setStatus(gsStatus);
        }
    });

    useEffect(() => {
        if (status === GameStatus.Quit) {
            gameQuit();
        }
        if (status === GameStatus.Completed) {
            gameCompleted();
        }
    }, [status, gameQuit, gameCompleted])

    function startGame(name: string) {
        if (status === GameStatus.NotStarted) {
            gameService.startGame([name]);
        }
    }

    let gameComponent: ReactElement;

        switch (status) {
            case GameStatus.NotStarted:
                gameComponent = <GameStart defaultName='Charlie' onStarted={name => startGame(name)}/>
                break;
            case GameStatus.InProgress:
                gameComponent = <GamePlay gameService={gameService}/>
                break;
            case GameStatus.Quit:
            case GameStatus.Completed:
            default:
                gameComponent = <p>Invalid Game State</p>
                break;
        }

        return (
            <div>{gameComponent}</div>
        )

}

export default Game;