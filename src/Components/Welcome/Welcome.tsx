import { FC } from 'react';
import './Welcome.css';

const YahtzeeHome: FC<{onPlay: () => void}> = ({onPlay}) => {
    return (
        <div className="Welcome">
            <h1>Let's play some Yahtzee!</h1>
            <button onClick={() => onPlay()}>Play</button>
        </div>
    );
}


export default YahtzeeHome;