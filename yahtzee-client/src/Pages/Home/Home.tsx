import './Home.css'
import YahtzeeWelcome from '../../Components/Welcome/Welcome'
import React from 'react'
import Game from '../../Components/Game/Game'

interface YahtzeeHomeState {
    playing: boolean
}

class YahtzeeHome extends React.Component<{}, YahtzeeHomeState> {

    constructor(props: any) {
        super(props)
        this.state = {
            playing: false
        };

        this.playYahtzee = this.playYahtzee.bind(this);
        this.gameQuit = this.gameQuit.bind(this);
        this.gameFinished = this.gameFinished.bind(this);
        this.gameCompleted = this.gameCompleted.bind(this);
    }

    playYahtzee(): void {
        this.setState({
            playing: true
        });
    }

    gameFinished(): void {
        this.setState({
            playing: false
        });
    }

    gameQuit(): void {
        this.gameFinished();
    }

    gameCompleted(): void {
        this.gameFinished();
    }

    render() {
        return (
            <div className="Yahtzee">
                {
                    this.state.playing
                        ? <Game gameQuit={this.gameQuit} gameCompleted={this.gameCompleted} />
                        : <YahtzeeWelcome onPlay={this.playYahtzee} />
                }
            </div>
        )   
    }
}

export default YahtzeeHome;