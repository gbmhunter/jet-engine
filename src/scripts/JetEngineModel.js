/* eslint-disable */
export class JetEngineModel {

    constructor(fuelConstant, dragConstant, maxAccel_radPss) {        
        this.fuelConstant = fuelConstant;
        this.dragConstant = dragConstant;
        this.maxAccel_radPss = maxAccel_radPss
        this.rotVel_radPs = 0.0;
    }

    update(fuelFlow_lPmin, timeStep_s) {
        // console.log('Update called with fuelFlow_lPmin = ' + fuelFlow_lPmin + ', timeStep_s = ' + timeStep_s + '.')

        // Ffuel - Fdrag = ma
        let rotAccel = this.fuelConstant*fuelFlow_lPmin + this.dragConstant*Math.pow(this.rotVel_radPs, 1)
        console.log('rotAccel = ' + rotAccel)

        if(rotAccel > this.maxAccel_radPss)
            rotAccel = this.maxAccel_radPss
        else if(rotAccel < -this.maxAccel_radPss)
            rotAccel = -this.maxAccel_radPss
        
        let changeInRotVel = rotAccel * timeStep_s
        // console.log('changeInRotVel = ' + changeInRotVel)

        this.rotVel_radPs = this.rotVel_radPs + changeInRotVel
    }

    getRotVel_radPs() {
        return this.rotVel_radPs
    }

}
/* eslint-enable */
