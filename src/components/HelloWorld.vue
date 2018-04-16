<template>
  <div class="app" style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
    <h1>Jet Engine PID Control</h1>

    <h2>Jet Engine Model</h2>

    <div style="width: 800px; height: 400px;">
        <canvas id="myChart" width="800" height="400"></canvas>
    </div>

    <div id="below-chart" style="display: flex;">
      <div id="controls">
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
          :disabled="selectedRunMode === 'RUN_MODE_PID_MANUAL_RPM_CONTROD'"
          style="width:400px;" />

        <button v-on:click="startStopJetEngineModel">{{ !jetEngineModelRunning ? 'Start' : 'Stop' }}</button>

        <p>Velocity Set-Point (rpm)</p>
        <vue-slider ref="slider" v-model="rotVelSetPoint_rpm" :min=0 :max=100000 :interval=1000 style="width:400px;"></vue-slider>
      </div>

      <div id="pid-constants">
        <p>PID Constants</p>
        <table class="sliders"> 
        <tbody>
            <tr>
              <td>Constant</td>
              <td>Min. Limit</td>
              <td>Max. Limit</td>
              <td>Value</td>
            </tr>
            <tr>
              <td>P</td>
              <td><input v-model="pidConstants.p.min" class="pid-limit"/></td>
              <td><input v-model="pidConstants.p.max" class="pid-limit"/></td>
              <td style="width: 200px;">
                <vue-slider ref="slider" v-model="pidConstants.p.value"
                :min="Number(pidConstants.p.min)" :max="Number(pidConstants.p.max)"
                :interval="(Number(pidConstants.p.max) - Number(pidConstants.p.min)) / 100.0"/></td>
            </tr>
            <tr>
              <td>I</td>
              <td><input v-model="pidConstants.i.min" class="pid-limit"/></td>
              <td><input v-model="pidConstants.i.max" class="pid-limit"/></td>
              <td style="width: 200px;">
                <vue-slider ref="slider" v-model="pidConstants.i.value"
                :min="Number(pidConstants.i.min)" :max="Number(pidConstants.i.max)"
                :interval="(Number(pidConstants.i.max) - Number(pidConstants.i.min)) / 100.0"/>
              </td>
            </tr>
            <tr>
              <td>D</td>
              <td><input v-model="pidConstants.d.min" class="pid-limit"/></td>
              <td><input v-model="pidConstants.d.max" class="pid-limit"/></td>
              <td style="width: 200px;">
                <vue-slider ref="slider" v-model="pidConstants.d.value"
                :min="Number(pidConstants.d.min)" :max="Number(pidConstants.d.max)"
                :interval="(Number(pidConstants.d.max) - Number(pidConstants.d.min)) / 100.0"/>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import Chart from "chart.js";
import vueSlider from "vue-slider-component";

import { JetEngineModel } from "../scripts/JetEngineModel.js";
import { Pid } from "../scripts/Pid";

export default {
  name: "HelloWorld",
  components: {
    vueSlider
  },
  data() {
    return {
      msg: "Welcome to Your Vue.js App",
      jetEngineModel: new JetEngineModel(10000.0, -1.0, 10000),
      fuelFlow_lPmin: 0.0,
      tickRate_s: 0.05,
      updateRate_s: 0.1,
      duration_s: 0.0,

      // Enumeration of run modes. Used to populate select input.
      runModes: [
        {
          text: "Control Fuel Rate (no PID)",
          value: "RUN_MODE_CONTROL_FUEL_RATE"
        },
        {
          text: "Manual RPM Control (PID)",
          value: "RUN_MODE_PID_MANUAL_RPM_CONTROL"
        },
        {
          text: "Auto RPM Step Changes (PID)",
          value: "RUN_MODE_PID_AUTO_RPM_STEP_CHANGES"
        }
      ],
      selectedRunMode: "RUN_MODE_PID_MANUAL_RPM_CONTROL", // Selected run mode (selected by user)

      chartConfig: {
        type: "line",
        data: {
          datasets: [
            {
              label: "Rotational Velocity",
              backgroundColor: "rgba(0, 0, 255, 0.5)",
              borderColor: "rgba(0, 0, 255, 0.5)",
              data: [],
              fill: false
            }
          ]
        },
        options: {
          scales: {
            xAxes: [
              {
                type: "linear",
                scaleLabel: {
                  display: true,
                  labelString: "Time (s)"
                }
              }
            ],
            yAxes: [
              {
                scaleLabel: {
                  display: true,
                  labelString: "Rotational Velocity (rpm)"
                }
              }
            ]
          }
        }
      },
      chart: null,
      jetEngineModelRunning: false,
      modelTickTimer: null,
      modelUpdateTimer: null,

      rotVelSetPoint_rpm: 0.0,
      maxNumDataPoints: 100,
      pid: new Pid(0.0006, 0.0006, 0.0), // PID constants get overriden by values set from sliders
      pidConstants: {
        p: {
          min: 0.0,
          max: 0.001,
          value: 0.0006
        },
        i: {
          min: 0.0,
          max: 0.001,
          value: 0.0006
        },
        d: {
          min: 0.0,
          max: 0.001,
          value: 0.0
        }
      }
    };
  },
  methods: {
    addSetPointLine() {
      console.log("Adding set point line to chart.");
      // Add set point line to chart
      this.chartConfig.data.datasets.push({
        label: "Set Point",
        backgroundColor: "rgba(255,0,0,.5)",
        borderColor: "rgba(255,0,0,.5)",
        data: [],
        fill: false
      });
      this.chart.update();
    },
    performAutoSetPointChange() {
      if (this.rotVelSetPoint_rpm === 0.0) {
        this.rotVelSetPoint_rpm = 60000.0;
      } else {
        this.rotVelSetPoint_rpm = 0.0;
      }
    },
    startStopJetEngineModel() {
      if (!this.jetEngineModelRunning) {
        this.modelTickTimer = window.setInterval(() => {
          this.tick();
        }, this.tickRate_s * 1000.0);

        this.modelUpdateTimer = window.setInterval(() => {
          this.update();
        }, this.updateRate_s * 1000.0);

        this.jetEngineModelRunning = true;
      } else {
        clearInterval(this.modelTickTimer);
        clearInterval(this.modelUpdateTimer);
        this.jetEngineModelRunning = false;
      }
    },
    tick() {
      // console.log('tick() called.')
      if (
        this.selectedRunMode === "RUN_MODE_PID_MANUAL_RPM_CONTROL" ||
        this.selectedRunMode === "RUN_MODE_PID_AUTO_RPM_STEP_CHANGES"
      ) {
        let rotVel_radPs = this.jetEngineModel.getRotVel_radPs();

        console.log("this.rotVelSetPoint_rpm = " + this.rotVelSetPoint_rpm);
        let rotVelSetPoint_radPs = this.rotVelSetPoint_rpm / 60.0 * 2 * Math.PI;

        this.pid.setSetPoint(rotVelSetPoint_radPs);
        this.fuelFlow_lPmin = this.pid.run(rotVel_radPs, this.tickRate_s);
      }

      this.jetEngineModel.update(this.fuelFlow_lPmin, this.tickRate_s);

      this.duration_s += this.tickRate_s;
    },
    // This updates the UI. Called by window.setInterval()
    update() {
      let rotVel_radPs = this.jetEngineModel.getRotVel_radPs();
      let rotVel_rpm = rotVel_radPs / (2 * Math.PI) * 60;

      // this.chartConfig.data.labels.push(this.duration_s.toFixed(2))

      // // Limit number of data points
      // if(this.chartConfig.data.labels.length > this.maxNumDataPoints) {
      //   this.chartConfig.data.labels.shift()
      // }

      this.chartConfig.data.datasets[0].data.push({
        x: this.duration_s,
        y: rotVel_rpm
      });

      // Limit number of data points
      if (
        this.chartConfig.data.datasets[0].data.length > this.maxNumDataPoints
      ) {
        this.chartConfig.data.datasets[0].data.shift();
      }

      // If in PID run mode, update set point also
      if (
        this.selectedRunMode === "RUN_MODE_PID_MANUAL_RPM_CONTROL" ||
        this.selectedRunMode === "RUN_MODE_PID_AUTO_RPM_STEP_CHANGES"
      ) {
        this.chartConfig.data.datasets[1].data.push({
          x: this.duration_s,
          y: this.rotVelSetPoint_rpm
        });
      }

      // Limit number of data points
      if (
        this.chartConfig.data.datasets[1].data.length > this.maxNumDataPoints
      ) {
        this.chartConfig.data.datasets[1].data.shift();
      }

      this.chart.update();
    },

    updatePidConstants() {
      this.pid.setConstants(
        this.pidConstants.p.value,
        this.pidConstants.i.value,
        this.pidConstants.d.value
      );
    }
  },
  watch: {
    selectedRunMode: function(val) {
      console.log("selectedRunMode changed.");
      if (val === "RUN_MODE_PID_MANUAL_RPM_CONTROL") {
        this.addSetPointLine();
      } else if (val === "RUN_MODE_PID_AUTO_RPM_STEP_CHANGES") {
        this.autoStepChangeTimer = window.setInterval(() => {
          this.performAutoSetPointChange();
        }, 4000.0);
      }
    },
    pidConstants: {
      handler(val) {
        console.log("pidConstants changed.");
        this.updatePidConstants();
      },
      deep: true
    }
  },
  mounted() {
    var ctx = document.getElementById("myChart");
    this.chart = new Chart(ctx, this.chartConfig);

    if (this.selectedRunMode === "RUN_MODE_PID_MANUAL_RPM_CONTROL") {
      this.addSetPointLine();
    }

    this.updatePidConstants();
  }
};
/* eslint-enable */
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
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

/* Table with sliders. Make row height large enough that slider value fits into it */
.sliders tr {
  height: 50px;
}

.sliders input {
  width: 50px;
}
</style>
