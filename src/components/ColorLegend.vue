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
      <g
        v-axis="{ 'scale': legendScaleSequential }"
        :transform="`translate(${styleDiv.margin.left - 1}, ${styleDiv.margin.top + canvasHeight - 1})`"
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
      const legendAxis = d3
        .axisBottom<number>(scaleFunction)
      legendAxis(d3.select((el as unknown) as SVGGElement));
    }
  },
  props: ["colorScale", "colorScaleType", "opacity", "topic"], // eslint-disable-line
  data: function() {
    return {
      styleDiv: {
        height: 200,
        width: 200,
        margin: { top: 10, right: 10, bottom: 170, left: 2 }
      }
    };
  },
  computed: {
    legendScaleSequential: function(): d3.ScaleLinear<number, number> {
      return d3
        .scaleLinear()
        .domain(this.colorScale.domain())
        .range([
          1,  
          this.styleDiv.width -
            this.styleDiv.margin.left -
            this.styleDiv.margin.right
        ]);
    },
    legendScaleOrdinal: function(): d3.ScaleQuantize<number> {
      return d3
        .scaleQuantize()
        .domain([
          1,  
          this.styleDiv.width -
            this.styleDiv.margin.left -
            this.styleDiv.margin.right
        ])
        .range(this.colorScale.range());
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
    },
    colorScale: {
      handler: function(): void {
        this.clearCanvas();
        this.renderColorRamp(this.opacity);
      },
    },
    colorScaleType: {
      handler: function(): void {
        this.clearCanvas();
        this.renderColorRamp(this.opacity);
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
        throw colorStr + "is not a correct CSS color specifier";
      }
      
    },
    renderColorRamp: function(opacity: number): void {
      const ctx = this.ctx;

      if (ctx != null) {
        d3.range(this.styleDiv.width).forEach(i => {
          let col;
          switch(this.colorScaleType) {
              case 'sequential':
                  col = this.colorScale(this.legendScaleSequential.invert(i));
                  break;
              case 'ordinal':
                  col = this.colorScale(this.legendScaleOrdinal(i));
          }

          ctx.fillStyle = this.addOpacityToColor(  
            col,
            opacity
          );
        
        ctx.fillRect(i, 0, 1, this.canvasHeight);
        });
      } else {
        throw "No canvas context found";
      }
    }
  },
});
</script>