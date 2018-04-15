/* eslint-disable */
export class Pid {
    constructor(pConstant, iConstant, dConstant, maxITerm) {
        this.pConstant = pConstant
        this.iConstant = iConstant
        this.dConstant = dConstant

        this.maxITerm = maxITerm

        this.setPoint = 0.0
        this.iValue = 0.0
        this.previousError = 0.0
    }

    setSetPoint(value) {
        console.log('setSetPoint() called. value = ' + value)
        this.setPoint = value
    }

    setConstants(pConstant, iConstant, dConstant) {
        console.log('setConstants() called. pConstant = ' + pConstant + ', iConstant = ' + iConstant + ', dConstant = ' + dConstant)
        this.pConstant = pConstant
        this.iConstant = iConstant
        this.dConstant = dConstant
    }

    run(currentValue, deltaTime_s) {  
        
        console.log('Pid.run() called. currentValue = ' + currentValue + ', deltaTime_s = ' + deltaTime_s)

        // Error positive if we need to "go forward"
        let error = this.setPoint - currentValue
        console.log('error = ' + error)

        // Porportional control
        let pValue = error * this.pConstant
        console.log('pValue = ' + pValue)

        // Integral control
        this.iValue += error*deltaTime_s*this.iConstant
        console.log('iValue (before limiting) = ' + this.iValue)

        // Limit integral control
        if(this.iValue > this.maxITerm)
            this.iValue = this.maxITerm
        else if(this.iValue < -this.maxITerm)
            this.iValue = -this.maxITerm

        console.log('iValue (after limiting) = ' + this.iValue)

        // Derivative control
        let deltaError = error - this.previousError

        let dValue = deltaError*this.dConstant
        console.log('dValue = ' + dValue)

        let output = pValue + this.iValue + dValue 
        console.log('output = ' + output)

        this.previousError = error

        return output

    }
}
/* eslint-enable */
