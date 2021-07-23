import React, { ReactElement } from 'react';
import GamePlay from '../GamePlay/GamePlay';
import GameStart from '../GameStart/GameStart';

interface GameProps {
    gameQuit: () => void,
    gameCompleted: () => void
}

interface GameState {
    name: string,
    status: GameStatus
}

enum GameStatus {
    NotStarted,
    InProgress,
    Finished
}

class Game extends React.Component<GameProps, GameState>
{
    constructor(props: GameProps) {
        super(props);

        this.state = {
            name: '',
            status: GameStatus.NotStarted
        };
    }

    isGameInStatus(gameStatus: GameStatus): boolean {
        return this.state.status === gameStatus;
    }

    startGame(name: string): void {
        this.setState({
            name: name,
            status: GameStatus.InProgress
        });
    }

    onQuit() {
        this.setState({
            name: this.state.name,
            status: GameStatus.Finished
        }, () => this.props.gameQuit());
        this.props.gameQuit();
    }

    render() {
        let gameComponent: ReactElement;

        switch (this.state.status) {
            case GameStatus.NotStarted:
                gameComponent = <GameStart defaultName='Charlie' onStarted={name => this.startGame(name)} />
                break;
            case GameStatus.InProgress:
                gameComponent = <GamePlay name={this.state.name} />
                break;
            case GameStatus.Finished:
            default:
                gameComponent = <p>Invalid Game State</p>
                break;
        }

        return (
        <div>
            {
                gameComponent
            }
        </div>
        )
    }
}

export default Game;