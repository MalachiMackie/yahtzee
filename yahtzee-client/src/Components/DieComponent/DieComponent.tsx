import './DieComponent.css'
import { FC, ReactElement } from "react";
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
    selected: boolean;
    canSelectDie: boolean;
    onSelectionChanged: (selection: boolean) => void;
}

const DieComponent: FC<DieComponentProps> = ({value, selected, canSelectDie, onSelectionChanged}: DieComponentProps) => {

    const toggleDie = () => {
        if (!canSelectDie)
            return;

        onSelectionChanged(!selected);
    }

    function getPlainDie(): ReactElement {
        switch (value) {
            case 1:
                return <DieOne onClick={() => toggleDie()} className={`Die`} />
            case 2:
                return <DieTwo onClick={() => toggleDie()} className={`Die`}/>
            case 3:
                return <DieThree onClick={() => toggleDie()} className={`Die`}/>
            case 4:
                return <DieFour onClick={() => toggleDie()} className={`Die`}/>
            case 5:
                return <DieFive onClick={() => toggleDie()} className={`Die`}/>
            case 6:
                return <DieSix onClick={() => toggleDie()} className={`Die`}/>
            default:
                throw new Error();
        }
    }

    function getGreenDie(): ReactElement {
        switch (value) {
            case 1:
                return <DieOneGreen onClick={() => toggleDie()} className={`Die`} />
            case 2:
                return <DieTwoGreen onClick={() => toggleDie()} className={`Die`}/>
            case 3:
                return <DieThreeGreen onClick={() => toggleDie()} className={`Die`}/>
            case 4:
                return <DieFourGreen onClick={() => toggleDie()} className={`Die`}/>
            case 5:
                return <DieFiveGreen onClick={() => toggleDie()} className={`Die`}/>
            case 6:
                return <DieSixGreen onClick={() => toggleDie()} className={`Die`}/>
            default:
                throw new Error();
        }
    }

    return (
        <div className="DieRoot">
            {selected ? getGreenDie() : getPlainDie()}
        </div>
    )
}

export default DieComponent;