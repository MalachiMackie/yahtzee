import './GameStart.css'
import React, { ChangeEvent, FormEvent } from "react";

interface GameStartProps {
    onStarted: (name: string) => void,
    defaultName: string
}

interface GameStartState {
    name: string
}

class GameStart extends React.Component<GameStartProps, GameStartState> {

    constructor(props: GameStartProps) {
        super(props);

        this.state = {
            name: this.props.defaultName
        };
        this.onStart = props.onStarted;
    }

    onStart: (name: string) => void;

    onNameChanged(event: ChangeEvent<HTMLInputElement>): void {
        this.setState({
            name: event.target.value
        });
    }

    onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        this.onStart(this.state.name);
    }

    render() {
        return (
            <form className='StartForm' onSubmit={(event) => this.onSubmit(event)}>
                <input type='text' value={this.state.name} onChange={evnt => this.onNameChanged(evnt)}/>
                <button type='submit'>Start Game</button>
            </form>
        )
    }
}

export default GameStart