<template>
  <div class="app">
    <h2>JetEngine</h2>
    <div style="width: 400px; height: 400px;">
        <canvas id="myChart" width="400" height="400"></canvas>
    </div>
    <vue-slider ref="slider" v-model="fuelFlow_lPmin" style="width:400px;"></vue-slider>
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
      jetEngineModel: new JetEngineModel(1.0, -1.0),
      fuelFlow_lPmin: 1.0,
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
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
      },
      chart: null
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
        this.chartConfig.data.datasets[0].data.push(rotVel_rpm)
        this.chart.update()
    }
  },
  mounted() {
    var ctx = document.getElementById("myChart");
    ctx.width = 400
    ctx.height = 400
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
