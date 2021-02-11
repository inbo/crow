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
      style="left: 0px; top: 0px;"
    >
      <g
        v-axis="{ 'scale': axisScale, 'tickValues': tickValues, 'numberOfTicks': numberOfTicks, 'lastTickSuffix': lastTickSuffix }"
        :transform="`translate(${styleDiv.margin.left}, ${styleDiv.margin.top + canvasHeight - 1})`"
        style="stroke-width: 0.5px"
      />
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
      const tickValues = binding.value.tickValues;
      const numberOfTicks = binding.value.numberOfTicks;
      const lastTickSuffix = binding.value.lastTickSuffix;

      let legendAxis = d3.axisBottom<number>(scaleFunction);
      if (tickValues) {
        legendAxis.tickValues(tickValues);
      };
      if (numberOfTicks) {
        legendAxis.ticks(numberOfTicks);
      }

      if(lastTickSuffix) {
        // @ts-ignore: outdated D3 type definitions for tickFormat
        legendAxis.tickFormat(function(d, i, n){
          return n[i + 1] ? d : d + " " + lastTickSuffix;
        });
      }

      legendAxis(d3.select((el as unknown) as SVGGElement));
    }
  },
  props: ["colorScale", "colorScaleType", "opacity", "topic", "maxScaleDensity", "tickValues", "numberOfTicks", "lastTickSuffix"], // eslint-disable-line 
  data: function () {
    return {
      styleDiv: {
        height: 60,
        width: 620,
        margin: { top: 15, right: 40, bottom: 20, left: 2 }
      }
    };
  },
  computed: {
    axisScale: function ():
      | d3.ScaleSymLog<number, number>
      | d3.ScaleBand<string> {
      let sc;

      switch (this.colorScaleType) {
        case "sequentialSymLog":
          sc = this.legendScaleSequentialSymLog;
          break;
        default:
          // The axis cannot be build directly from a scaleQuantize, so we build a scaleBand instead
          sc = d3.scaleBand().domain(["0", "1", "2", "3", "4", "5", "6", "7", "8", "> 8"]).range(this.legendScaleOrdinal.domain()) // FIXME: domain should not be hardcoded, but read from colorScale domain....
      }
      return sc;
    },
    legendScaleSequentialSymLog: function (): d3.ScaleSymLog<number, number> {
      return d3
        .scaleSymlog()
        .domain([0, this.maxScaleDensity])
        .range([
          0,
          this.styleDiv.width -
          this.styleDiv.margin.left -
          this.styleDiv.margin.right - 1
        ]);
    },
    legendScaleOrdinal: function (): d3.ScaleQuantize<number> {
      return d3
        .scaleQuantize()
        .domain([
          0,
          this.styleDiv.width -
          this.styleDiv.margin.left -
          this.styleDiv.margin.right - 1
        ])
        .range(this.colorScale.range());
    },
    ctx: function (): CanvasRenderingContext2D | null {
      return (this.$refs.canvas as HTMLCanvasElement).getContext("2d");
    },
    styleObjectDivPrepared: function (): Record<string, unknown> {
      return {
        display: "inline-block",
        position: "relative",
        width: this.styleDiv.width + "px"
      };
    },
    styleCanvasPrepared: function (): Record<string, unknown> {
      return {
        height: this.canvasHeight + "px",
        width: this.canvasWidth + "px",
        border: "1px solid #000",
        position: "absolute",
        top: this.styleDiv.margin.top + "px",
        left: this.styleDiv.margin.left + "px"
      };
    },
    canvasWidth: function (): number {
      return (
        this.styleDiv.width -
        this.styleDiv.margin.left -
        this.styleDiv.margin.right
      );
    },
    canvasHeight: function (): number {
      return (
        this.styleDiv.height -
        this.styleDiv.margin.top -
        this.styleDiv.margin.bottom
      );
    }
  },
  watch: {
    opacity: {
      handler: function (newOpacity): void {
        this.clearCanvas();
        this.renderColorRamp(newOpacity);
      }
    },
    colorScale: {
      handler: function (): void {
        this.clearCanvas();
        this.renderColorRamp(this.opacity);
      }
    },
    colorScaleType: {
      handler: function (): void {
        this.clearCanvas();
        this.renderColorRamp(this.opacity);
      }
    },
    maxScaleDensity: {
      handler: function (): void {
        this.clearCanvas();
        this.renderColorRamp(this.opacity);
      }
    }
  },
  mounted: function () {
    this.renderColorRamp(this.opacity);
  },
  methods: {
    clearCanvas: function (): void {
      const ctx = this.ctx;

      if (ctx != null) {
        ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      }
    },
    addOpacityToColor: function (colorStr: string, opacity: number): string {
      const colorObj = d3.color(colorStr);

      if (colorObj != null) {
        colorObj.opacity = opacity;
        return colorObj + "";
      } else {
        throw colorStr + "is not a correct CSS color specifier";
      }
    },
    renderColorRamp: function (opacity: number): void {
      const ctx = this.ctx;

      if (ctx != null) {
        d3.range(this.styleDiv.width).forEach(i => {
          let col;
          switch (this.colorScaleType) {
            case "sequentialSymLog":
              col = this.colorScale(this.legendScaleSequentialSymLog.invert(i));
              break;
            case "ordinal":
              col = this.legendScaleOrdinal(i);
              break;
          }

          ctx.fillStyle = this.addOpacityToColor(col, opacity);

          ctx.fillRect(i, 0, 1, this.canvasHeight);
        });
      } else {
        throw "No canvas context found";
      }
    }
  }
});
</script>
