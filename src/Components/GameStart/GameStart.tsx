import './GameStart.css'
import { FC, FormEvent, useState } from "react";

interface GameStartProps {
    onStarted: (name: string) => void,
    defaultName: string
}

const GameStart: FC<GameStartProps> = ({onStarted, defaultName}) => {
    const [name, setName] = useState(defaultName);

    const onNameChanged = (updatedName: string) => {
        setName(updatedName);
    }

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onStarted(name);
    }

    return (
        <form className='StartForm' onSubmit={(event) => onSubmit(event)}>
            <input type='text' value={name} onChange={evnt => onNameChanged(evnt.target.value)}/>
            <button type='submit'>Start Game</button>
        </form>
    )
}

export default GameStart