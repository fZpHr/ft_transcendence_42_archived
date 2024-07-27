import * as THREE from 'three';
import { CustomBall } from './CustomBall.js';

class CustomGame {
    constructor() {
        this.Customball;
        this.Customplateau;
        this.Custompaddle;
        this.Custommap;
        this.Customscore;
        this.Customanimation;
        this.init();
    }

    init() {
        this.Customball = new CustomBall();
        // this.Customplateau = new CustomPlateau();
        // this.Custompaddle = new CustomPaddle();
        // this.Custommap = new CustomMap();
        // this.Customscore = new CustomScore();
        // this.Customanimation = new CustomAnimation();
    }

    get getCustomBall() {
        return this.Customball;
    }

    set setCustomBall(ball) {
        this.Customball;


    }


}

export {
    CustomGame
};
// CustomGame = new CustomGame();
// CustomGame.getCustomBall();