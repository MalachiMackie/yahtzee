import './DieComponent.css'
import React, { ReactElement } from "react";
import { ReactComponent as DieOne } from '../../Images/die_one.svg';
import { ReactComponent as DieTwo } from '../../Images/die_two.svg';
import { ReactComponent as DieThree } from '../../Images/die_three.svg';
import { ReactComponent as DieFour } from '../../Images/die_four.svg';
import { ReactComponent as DieFive } from '../../Images/die_five.svg';
import { ReactComponent as DieSix } from '../../Images/die_six.svg';
import { ReactComponent as DieOneGreen } from '../../Images/die_one_green.svg';
import { ReactComponent as DieTwoGreen } from '../../Images/die_two_green.svg';
import { ReactComponent as DieThreeGreen } from '../../Images/die_three_green.svg';
import { ReactComponent as DieFourGreen } from '../../Images/die_four_green.svg';
import { ReactComponent as DieFiveGreen } from '../../Images/die_five_green.svg';
import { ReactComponent as DieSixGreen } from '../../Images/die_six_green.svg';

interface DieComponentProps {
    value: number;
    canSelectDie: boolean;
    onSelectionChanged: (selection: boolean) => void;
}

interface DieComponentState {
    selected: boolean
}

class DieComponent extends React.Component<DieComponentProps, DieComponentState>
{

    constructor(props: DieComponentProps) {
        super(props);

        this.state = {selected: false};

        this.onSelectionChanged = props.onSelectionChanged;
    }

    onSelectionChanged: (selection: boolean) => void;

    toggleDie() {
        if (!this.props.canSelectDie)
            return;

        this.setState({
            selected: !this.state.selected
        }, () => this.onSelectionChanged(this.state.selected));
    }

    componentDidUpdate(prevProps: DieComponentProps) {
        if (prevProps.canSelectDie !== this.props.canSelectDie) {
            this.setState({
                selected: false
            });
        }
    }

    private getPlainDie(): ReactElement {
        switch (this.props.value) {
            case 1:
                return <DieOne onClick={() => this.toggleDie()} className={`Die`} />
            case 2:
                return <DieTwo onClick={() => this.toggleDie()} className={`Die`}/>
            case 3:
                return <DieThree onClick={() => this.toggleDie()} className={`Die`}/>
            case 4:
                return <DieFour onClick={() => this.toggleDie()} className={`Die`}/>
            case 5:
                return <DieFive onClick={() => this.toggleDie()} className={`Die`}/>
            case 6:
                return <DieSix onClick={() => this.toggleDie()} className={`Die`}/>
            default:
                throw new Error();
        }
    }

    private getGreenDie(): ReactElement {
        switch (this.props.value) {
            case 1:
                return <DieOneGreen onClick={() => this.toggleDie()} className={`Die`} />
            case 2:
                return <DieTwoGreen onClick={() => this.toggleDie()} className={`Die`}/>
            case 3:
                return <DieThreeGreen onClick={() => this.toggleDie()} className={`Die`}/>
            case 4:
                return <DieFourGreen onClick={() => this.toggleDie()} className={`Die`}/>
            case 5:
                return <DieFiveGreen onClick={() => this.toggleDie()} className={`Die`}/>
            case 6:
                return <DieSixGreen onClick={() => this.toggleDie()} className={`Die`}/>
            default:
                throw new Error();
        }
    }

    getDie(): ReactElement {
        return this.state.selected ? this.getGreenDie() : this.getPlainDie();
    }

    render() {
        return (
            <div className="DieRoot">
                {this.getDie()}
            </div>
        )
    }
}

export default DieComponent;