<template>
  <div 
    id="legend" 
    :style="styleObjectDivPrepared"
  >
    <canvas 
      ref="canvas" 
      :height="canvasHeight" 
      :width="canvasWidth" 
      :style="styleCanvasPrepared" 
    />
    <svg
      :height="styleDiv.height"
      :width="styleDiv.width"
      style="position: absolute; left: 0px; top: 0px;"
    >
      <!-- <g
        v-axis="{'scale': legendScale, 'tickLabels': legendTickLabels}"
        class="axis"
        :transform="`translate(${canvasWidth + 1}, ${styleDiv.margin.top})`"
      /> -->
    </svg>
  </div>
</template>

<script lang="ts">
// Implementation heavily inspired by http://bl.ocks.org/syntagmatic/e8ccca52559796be775553b467593a9fx
import Vue from "vue";
import * as d3 from "d3";

export default Vue.extend({
  name: "ColorLegend",
  directives: {
    axis(el, binding): void {
      const scaleFunction = binding.value.scale;

      const tickLabels = binding.value.tickLabels; 

      const legendAxis = d3
        .axisRight<number>(scaleFunction)
        .tickSize(6)
        .tickFormat((d, i) => tickLabels[i])
        .ticks(tickLabels.length - 1);

      legendAxis(d3.select((el as unknown) as SVGGElement));
    }
  },
  props: ["colorScale", "opacity", "topic"], // eslint-disable-line
  data: function() {
    return {
      styleDiv: {
        height: 200,
        width: 200,
        margin: { top: 10, right: 170, bottom: 10, left: 2 }
      }
    };
  },
  computed: {
    legendTickLabels: function(): string[] {
      return [`0 - low ${this.topic}`, `1 - high ${this.topic}`]
    },
    legendScale: function(): d3.ScaleLinear<number, number> {
      return d3
        .scaleLinear()
        .range([
          this.styleDiv.height -
            this.styleDiv.margin.top -
            this.styleDiv.margin.bottom,
          1
        ])
        .domain(this.colorScale.domain());
    },
    ctx: function(): CanvasRenderingContext2D | null {
      return (this.$refs.canvas as HTMLCanvasElement).getContext("2d");
    },
    styleObjectDivPrepared: function(): object {
      return {
        display: "inline-block",
        position: "relative",
        height: this.styleDiv.height + "px",
        width: this.styleDiv.width + "px"
      };
    },
    styleCanvasPrepared: function(): object {
      return {
        height: this.canvasHeight + "px",
        width: this.canvasWidth + "px",
        border: "1px solid #000",
        position: "absolute",
        top: this.styleDiv.margin.top + "px",
        left: this.styleDiv.margin.left + "px"
      };
    },
    canvasWidth: function(): number {
      return (
        this.styleDiv.width -
        this.styleDiv.margin.left -
        this.styleDiv.margin.right
      );
    },
    canvasHeight: function(): number {
      return (
        this.styleDiv.height -
        this.styleDiv.margin.top -
        this.styleDiv.margin.bottom
      );
    }
  },
  watch: {
    opacity: {
      handler: function(newOpacity): void {
        this.clearCanvas();
        this.renderColorRamp(newOpacity);
      },
    }
  },
  mounted: function() {
    this.renderColorRamp(this.opacity);
  },
  methods: {
    clearCanvas: function(): void {
      const ctx = this.ctx;

      if (ctx != null) {
        ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      }
    },
    addOpacityToColor: function(colorStr: string, opacity: number): string {
      const colorObj = d3.color(colorStr);
      
      if (colorObj != null) {
        colorObj.opacity = opacity;
        return colorObj + "";
      } else {
        throw "colorStr is not a correct CSS color specifier";
      }
      
    },
    renderColorRamp: function(opacity: number): void {
      const ctx = this.ctx;

      if (ctx != null) {
        d3.range(this.styleDiv.height).forEach(i => {
          ctx.fillStyle = this.addOpacityToColor(
            this.colorScale(this.legendScale.invert(i)),
            opacity
          );
          ctx.fillRect(0, i, this.canvasWidth, 1);
        });
      } else {
        throw "No canvas context found";
      }
    }
  },
});
</script>