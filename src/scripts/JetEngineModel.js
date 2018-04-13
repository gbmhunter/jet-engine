/* eslint-disable */
export class JetEngineModel {

    constructor(fuelConstant, dragConstant) {        
        this.fuelConstant = fuelConstant;
        this.dragConstant = dragConstant;
        this.rotVel_radPs = 0.0;
    }

    update(fuelFlow_lPmin, timeStep_s) {
        // console.log('Update called with fuelFlow_lPmin = ' + fuelFlow_lPmin + ', timeStep_s = ' + timeStep_s + '.')

        let rotVelDerivative = this.fuelConstant*fuelFlow_lPmin + this.dragConstant*Math.pow(this.rotVel_radPs, 2)
        // console.log('rotVelDerivative = ' + rotVelDerivative)
        
        let changeInRotVel = rotVelDerivative * timeStep_s
        // console.log('changeInRotVel = ' + changeInRotVel)

        this.rotVel_radPs = this.rotVel_radPs + changeInRotVel
    }

    getRotVel_radPs() {
        return this.rotVel_radPs
    }

}
/* eslint-enable */
