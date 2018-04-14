<template>
  <div class="app" style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
    <h1>Jet Engine PID Control</h1>

    <h2>Jet Engine Model</h2>
    <div style="width: 800px; height: 400px;">
        <canvas id="myChart" width="800" height="400"></canvas>
    </div>
    <p>Fuel Flow Rate (L/min)</p>
    <vue-slider ref="slider" v-model="fuelFlow_lPmin" :min=0 :max=1 :interval=0.01 style="width:400px;"></vue-slider>

    <h2>PID Control</h2>

  </div>
</template>

<script>
/* eslint-disable */
import Chart from 'chart.js';
import vueSlider from 'vue-slider-component'

import {JetEngineModel} from '../scripts/JetEngineModel.js'

export default {
  name: 'HelloWorld',
  components: {
    vueSlider
  },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      jetEngineModel: new JetEngineModel(10000.0, -1.0, 1000),
      fuelFlow_lPmin: 0.0,
      updateRate_s: 0.1,
      duration_s: 0.0,
      chartConfig: {
        type: 'line',
        data: {
                labels: [],
                datasets: [{
                    label: 'Rotational Velocity',
                    backgroundColor: 'rgba(54,73,93,.5)',
                    borderColor: 'rgba(54,73,93,.5)',
                    data: [],
                    fill: false,
                }]
        },
        options: {
            scales: {
              xAxes: [{
                    scaleLabel: {
                      display: true,
                      labelString: "Time (s)"                      
                    },
                    ticks: {
                        beginAtZero:true
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                      display: true,
                      labelString: "Rotational Velocity (rpm)"                      
                    },
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
      },
      chart: null,
      maxNumDataPoints: 100,
    }
  },
  methods: {
    tick () {
        // console.log('tick() called.')
        this.jetEngineModel.update(this.fuelFlow_lPmin, this.updateRate_s)

        let rotVel_radPs = this.jetEngineModel.getRotVel_radPs()

        this.duration_s += this.updateRate_s

        let rotVel_rpm = (rotVel_radPs/(2*Math.PI)) * 60

        this.chartConfig.data.labels.push(this.duration_s.toFixed(2))

        // Limit number of data points
        if(this.chartConfig.data.labels.length > this.maxNumDataPoints) {
          this.chartConfig.data.labels.shift()
        }

        this.chartConfig.data.datasets[0].data.push(rotVel_rpm)

        // Limit number of data points
        if(this.chartConfig.data.datasets[0].data.length > this.maxNumDataPoints) {
          this.chartConfig.data.datasets[0].data.shift()
        }

        this.chart.update()
    }
  },
  mounted() {
    var ctx = document.getElementById("myChart");
    this.chart = new Chart(ctx, this.chartConfig);

    window.setInterval(() => {
        this.now = Math.trunc((new Date()).getTime() / 1000);
        this.tick()
    }, this.updateRate_s*1000.0);
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
