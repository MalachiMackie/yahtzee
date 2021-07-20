import React from 'react';
import './Welcome.css';


class YahtzeeHome extends React.Component<{onPlay: () => void}>
{
    render() {
        return (
            <div className="Welcome">
                <h1>Let's play some Yahtzee!</h1>
                <button onClick={this.props.onPlay}>Play</button>
            </div>
        );
    }
}


export default YahtzeeHome;