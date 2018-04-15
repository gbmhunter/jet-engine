<template>
  <div class="app" style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
    <h1>Jet Engine PID Control</h1>

    <h2>Jet Engine Model</h2>

    <div style="width: 800px; height: 400px;">
        <canvas id="myChart" width="800" height="400"></canvas>
    </div>

    <p>Run Mode</p>
    <select v-model="selectedRunMode">
      <option v-for="option in runModes" v-bind:value="option.value">
        {{ option.text }}
      </option>
    </select>

    <p>Fuel Flow Rate (L/min)</p>
    <vue-slider 
      ref="slider"
      v-model="fuelFlow_lPmin"
      :min=0 :max=1 :interval=0.01
      :disabled="selectedRunMode === 'CONTROL_RPM_PID'"
      style="width:400px;" />

    <button v-on:click="startStopJetEngineModel">{{ !jetEngineModelRunning ? 'Start' : 'Stop' }}</button>

    <p>Velocity Set-Point (rpm)</p>
    <vue-slider ref="slider" v-model="rotVelSetPoint_rpm" :min=0 :max=100000 :interval=1000 style="width:400px;"></vue-slider>

  </div>
</template>

<script>
/* eslint-disable */
import Chart from 'chart.js';
import vueSlider from 'vue-slider-component'

import {JetEngineModel} from '../scripts/JetEngineModel.js'
import {Pid} from '../scripts/Pid'

export default {
  name: 'HelloWorld',
  components: {
    vueSlider
  },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      jetEngineModel: new JetEngineModel(10000.0, -1.0, 10000),
      fuelFlow_lPmin: 0.0,
      tickRate_s: 0.05,
      updateRate_s: 0.1,
      duration_s: 0.0,

      runModes: [
        { text: 'Control Fuel Rate', value: 'CONTROL_FUEL_RATE' },
        { text: 'Control RPM (PID)', value: 'CONTROL_RPM_PID' }
      ],
      selectedRunMode: 'CONTROL_RPM_PID',

      chartConfig: {
        type: 'line',
        data: {          
          datasets: [{
              label: 'Rotational Velocity',
              backgroundColor: 'rgba(0, 0, 255, 0.5)',
              borderColor: 'rgba(0, 0, 255, 0.5)',
              data: [],
              fill: false,
          }]
        },
        options: {
            scales: {
              xAxes: [{
                    type: 'linear',
                    scaleLabel: {
                      display: true,
                      labelString: "Time (s)"                      
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                      display: true,
                      labelString: "Rotational Velocity (rpm)"                      
                    }
                }]
            }
        }
      },
      chart: null,
      jetEngineModelRunning: false,
      modelTickTimer: null,
      modelUpdateTimer: null,

      rotVelSetPoint_rpm: 0.0,      
      maxNumDataPoints: 100,
      pid: new Pid(0.0006, 0.0006, 0.0),
    }
  },
  methods: {
    addSetPointLine () {
      console.log('Adding set point line to chart.')
      // Add set point line to chart
      this.chartConfig.data.datasets.push({
        label: 'Set Point',
        backgroundColor: 'rgba(255,0,0,.5)',
        borderColor: 'rgba(255,0,0,.5)',
        data: [],
        fill: false,
      })
      this.chart.update()
    },
    startStopJetEngineModel () {

      if(!this.jetEngineModelRunning) {
        this.modelTickTimer = window.setInterval(() => {
            this.tick()
        }, this.tickRate_s*1000.0)

        this.modelUpdateTimer = window.setInterval(() => {
            this.update()
        }, this.updateRate_s*1000.0)

        this.jetEngineModelRunning = true
      } else {
        clearInterval(this.modelTickTimer)
        clearInterval(this.modelUpdateTimer)
        this.jetEngineModelRunning = false
    }

      
    },
    tick () {
      // console.log('tick() called.')
      if(this.selectedRunMode === 'CONTROL_RPM_PID') {
        let rotVel_radPs = this.jetEngineModel.getRotVel_radPs()

        console.log('this.rotVelSetPoint_rpm = ' + this.rotVelSetPoint_rpm)
        let rotVelSetPoint_radPs = (this.rotVelSetPoint_rpm/60.0)*2*Math.PI        

        this.pid.setSetPoint(rotVelSetPoint_radPs)
        this.fuelFlow_lPmin = this.pid.run(rotVel_radPs, this.tickRate_s)
      }

      this.jetEngineModel.update(this.fuelFlow_lPmin, this.tickRate_s)
      
      this.duration_s += this.tickRate_s    
    },
    // This updates the UI. Called by window.setInterval()
    update () {
      let rotVel_radPs = this.jetEngineModel.getRotVel_radPs()
      let rotVel_rpm = (rotVel_radPs/(2*Math.PI)) * 60

      // this.chartConfig.data.labels.push(this.duration_s.toFixed(2))

      // // Limit number of data points
      // if(this.chartConfig.data.labels.length > this.maxNumDataPoints) {
      //   this.chartConfig.data.labels.shift()
      // }
      
      this.chartConfig.data.datasets[0].data.push({x: this.duration_s, y: rotVel_rpm})

      // Limit number of data points
      if(this.chartConfig.data.datasets[0].data.length > this.maxNumDataPoints) {
        this.chartConfig.data.datasets[0].data.shift()
      }

      // If in PID run mode, update set point also
      if(this.selectedRunMode === 'CONTROL_RPM_PID') {
        this.chartConfig.data.datasets[1].data.push({x: this.duration_s, y: this.rotVelSetPoint_rpm})
      }

      // Limit number of data points
      if(this.chartConfig.data.datasets[1].data.length > this.maxNumDataPoints) {
        this.chartConfig.data.datasets[1].data.shift()
      }

      this.chart.update()
    }
  },
  watch: {
    selectedRunMode: function(val) {
      console.log('selectedRunMode changed.')
      if(val === 'CONTROL_RPM_PID') {
        this.addSetPointLine()
      }
    }
  },
  mounted() {
    var ctx = document.getElementById("myChart");
    this.chart = new Chart(ctx, this.chartConfig);

    if(this.selectedRunMode === 'CONTROL_RPM_PID') {
      this.addSetPointLine()
    }

  }
}
/* eslint-enable */
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
