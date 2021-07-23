class DieFaceNotExpectedValueError extends Error {

}

export class Die {
    static readonly faces: number[] = [1, 2, 3, 4, 5, 6];

    private currentFace: number;

    constructor(face?: number) {
        if (!!face && Die.faces.every(dieFace => dieFace != face)) {
            throw new DieFaceNotExpectedValueError();
        }

        this.currentFace = face ?? Die.faces[0];
    }

    private getRandomFace(): number {
        const randomNumber = Math.random();
        const index = Math.floor(randomNumber / (1 / Die.faces.length));
        return Die.faces[index];
    }

    roll(): number {

        this.currentFace = this.getRandomFace();
        return this.currentFace;
    }

    getCurrentFace(): number {
        return this.currentFace;
    }
}
