<template>
    <div>
        <svg class="light-schedule"
             :view-box.camel="[0, 0, width, height]"
             @mousedown.prevent="onMouseDown"
             @mousemove.prevent="onMouseMove"
             @mouseup.prevent="onMouseUp"
             @mouseleave.prevent="onMouseUp"
             @touchstart.prevent="onTouch"
             @touchmove.prevent="onTouch"
             @touchend.prevent="onTouch"
             @touchcancel.prevent="onTouch"
        >
            <g :transform="['translate(' + chart.offset.left, chart.offset.top + ')']">
                <g v-if="currentTimeX > 0">
                    <rect class="current-time-box" :width="currentTimeX" :height="chart.height"></rect>
                    <line class="current-time-line" :x1="currentTimeX" :x2="currentTimeX" :y2="chart.height"></line>
                    <text
                            :x="currentTimeX"
                            :y="dotRadius * 1"
                            :dy="!isMobileScreen? 8 * koofScreenY : -fontHeight / 2 + 4"
                            :dx="chart.width / 2 < currentTimeX ? -2 : 2"
                            class="current-time-text"
                            :style="{'text-anchor' : chart.width / 2 < currentTimeX ? 'end' : 'start'}"
                            :font-size="fontHeight"
                            opacity="0.3"
                    >
                        {{ currentTime | time}}
                    </text>
                </g>

                <g :transform="['translate(0, 0)']">
                    <spectrum
                            :width="chart.width"
                            :height="chart.height"
                            opacity="0.35"
                            :text-height="fontSizeAxisX"
                            v-model="currentSpectrum"
                            :no-animate="animate.spectrumTimer"
                    ></spectrum>
                </g>
                <line
                        v-if="target.x>0 && target.x < chart.width"
                        class="target-line"
                        stroke-dasharray="5, 5"
                        :x1="target.x"
                        :y1="0"
                        :x2="target.x"
                        :y2="chart.height"
                />
                <line
                        v-if="target.y>0 && target.y < chart.height"
                        class="target-line"
                        stroke-dasharray="5, 5"
                        :x1="0"
                        :y1="target.y"
                        :x2="chart.width"
                        :y2="target.y"
                />
                <g class="grid-days">
                    <rect class="axis-border" :width="chart.width - 1" :height="chart.height"></rect>
                    <g
                            v-for="percent in axisY"
                            :transform="['translate(0', percent.y + ')']"
                    >
                        <line :x2="chart.width" y2="0" class="axis-y" opacity="0.1"></line>
                        <text
                                v-if="chart.showPercents"
                                :x="isMobileScreen? 0 : -10"
                                :dy="isMobileScreen? fontSizeAxisY : fontSizeAxisY / 2"
                                :style="{'text-anchor' : isMobileScreen ? 'middle' : 'end'}"
                                :font-size="fontSizeAxisY"
                                :transform="[isMobileScreen ? 'rotate(90)' : '']"
                        >
                            {{percent.percent | percent}}
                        </text>
                    </g>
                    <g
                            v-if="showDaysXAxis"
                    >
                        <g
                                v-for="(xDay, index) in axisXDays"
                                :class="['axis-days', {'even' : !(xDay.number % 2)}]"
                                :transform="['translate(' + xDay.x, '0)']"
                                :key="xDay.number"

                        >
                            <clipPath :id="'clipDay' + xDay.number">
                                <rect :width="xDay.width" :height="chart.height"/>
                            </clipPath>

                            <g
                                    :clip-path="['url(#clipDay'+xDay.number+')']"
                            >

                                <text
                                        :y="chart.height / 2"
                                        :x="xDay.width / 2"
                                        :font-size="fontHeight * 5"
                                        :dy="fontHeight"

                                >
                                    {{xDay.number + 1}}
                                </text>
                            </g>

                            <line
                                    v-if="index > 0"
                                    :y2="chart.height"
                                    :style="{'stroke-width' : dayBorderWidth + 'px'}"
                                    opacity="0"
                            ></line>

                            <rect :width="xDay.width" :height="chart.height" opacity="0" @dblclick="expandDay(xDay)"/>

                        </g>

                    </g>

                    <g
                            v-for="time in axisX"
                            :transform="['translate(' + time.x, '0)']"
                            :key="time.time"
                    >
                        <line :y2="chart.height" x2="0" class="axis-x" opacity="0.1"></line>
                        <text
                                v-if="chart.showTimes"
                                :y="chart.height + fontSizeAxisX"
                                style="text-anchor: middle;"
                                :font-size="fontSizeAxisX"
                        >
                            {{time.time | time}}
                        </text>
                    </g>

                </g>

                <path class="schedulePath" :d="schedulePath"></path>

                <g class="dots">

                    <circle
                            v-for="dot in dots"
                            v-if="isDotVisible(dot)"
                            :class="['dot', {'selected' : dot.selected || isInSelBox(dot)}]"
                            :r="dotRadius"
                            :cx="rebaseX(getChartX(dot))"
                            :cy="rebaseY(getChartY(dot))"
                            @mousedown="onDotMouseDown(dot)"
                    ></circle>
                </g>

                <rect
                        class="selection-box"
                        v-if="selectionBox.isSelectionBox"
                        :x="selBox.x"
                        :y="selBox.y"
                        :width="selBox.width"
                        :height="selBox.height"
                />
            </g>
            <circle
                    v-if="draggingNewDot.isDragging"
                    class="dot"
                    :r="dotRadius"
                    :cx="draggingNewDot.x"
                    :cy="draggingNewDot.y"
            />
            <g class="toolbar" :transform="['translate(' + toolbar.left +','+ toolbar.top + ')']">
                <circle
                        class="dot"
                        :r="dotRadius"
                        :cx="dotRadius + dotRadius / 2"
                        :cy="dotRadius + dotRadius / 2"
                        @mousedown.prevent="onMouseDownNewDot"
                        @mouseup.prevent="onMouseUpNewDot"
                ></circle>
                <text
                        :y="dotRadius * 2"
                        :x="dotRadius * 3 + dotRadius / 2"
                        :dy="dotRadius"
                        class="button ico"
                        :font-size="dotRadius * 3"
                        @mousedown.prevent="onDelete"
                >
                    clear
                </text>
                <text
                        :y="dotRadius * 2"
                        :x="dotRadius * 7 + dotRadius / 2"
                        :dy="dotRadius / 2"
                        class="button ico"
                        :font-size="dotRadius * 2"
                        @mousedown.stop="onCopy"
                >
                    content_copy
                </text>
                <text
                        :y="dotRadius * 2"
                        :x="dotRadius * 10 + dotRadius / 2"
                        :dy="dotRadius / 2"
                        class="button ico"
                        :font-size="dotRadius * 2"
                        @mousedown.stop="onSave"
                >save
                </text>

            </g>
            <channel-editor v-if="!isMobileScreen && isShowChannelsInspector"
                            class="channel-editor"
                            v-model="channelsEditorInterface"
                            :left="width - dotRadius * 4 - dotRadius * 2.5"
                            :top="chart.offset.top + dotRadius * 2.5"
                            :height="chart.height - dotRadius * 2.5 - chart.offset.top"
                            :width="dotRadius * 4"
                            :koofScreenX="koofScreenX"
                            :koofScreenY="koofScreenY"
            ></channel-editor>
        </svg>
        <channel-editor-mbl v-if="isMobileScreen && isShowChannelsInspector"
                            class="channel-editor-mbl"
                            v-model="channelsEditorInterface"
        ></channel-editor-mbl>
        <div>{{chart.offset.top}}, {{dotRadius}}</div>
    </div>
</template>

<script>
import Spectrum from './Spectrum.vue';
import ChannelEditor from './Channels.vue';
import ChannelEditorMbl from './Channels-mbl.vue';

const consts = window.$consts;

export default {

  components: {
    spectrum: Spectrum,
    'channel-editor': ChannelEditor,
    'channel-editor-mbl': ChannelEditorMbl
  },
  created () {
    window.addEventListener('mousewheel', this.proxyScrollEvent);
    window.addEventListener('resize', this.onResize);

    if (!this.$store.state.Lucerna.data.dots) { this.$store.dispatch('Lucerna/data/reload', 'dots'); }

    if (!this.$store.state.Lucerna.data.config) { this.$store.dispatch('Lucerna/data/reload', 'config'); }

    if (!this.$store.state.Lucerna.data.spectrum) { this.$store.dispatch('Lucerna/data/reload', 'spectrum'); }

    this.$bus.$on(consts.EVENTS.DO_SCREEN_REBUILD, (type, messages) => {
      this.onResize();
    });

    this.$bus.$on(consts.EVENTS.STORE_RELOADED, (object) => {
      if (object == 'Lucerna/dots') {
        this.local_dots = this.copyDotsFromVUEX();
      }
    });

    this.$bus.$on(window.$consts.EVENTS.UBUS_MESSAGE, (type, messages) => {
      switch (type) {
        case '$-storage-changed':
          if (messages === 'Lucerna/dots') { this.$store.dispatch('Lucerna/data/reload', 'dots'); } else if (messages === 'Lucerna/spectrum') { this.$store.dispatch('Lucerna/data/reload', 'spectrum'); }
          break;
      }
    });
  },

  destroyed () {
    window.removeEventListener('mousewheel', this.proxyScrollEvent);
    window.removeEventListener('resize', this.onResize);
    clearInterval(this.scrolling.inertTimer);
  },
  mounted () {
    this.onResize();
    this.zoom.value = this.interval.width / this.interval.resolution;
    if (this.intervalStartOffset === null) {
      this.interval.offset = this.currentTime - this.currentTime % this.interval.resolution;
    }
  },
  props: {
    intervalWidth: {
      type: Number,
      required: false,
      default: 86400
    },
    intervalResolution: {
      type: Number,
      required: false,
      default: 86400
    },
    intervalStartOffset: {
      required: false,
      default: null
    },
    channels: {
      type: Array,
      required: true
    }
  },

  watch: {
    intervalWidth (value) {
      this.interval.width = value;
    },

    intervalResolution (value) {
      this.interval.resolution = value;
    },

    intervalStartOffset (value) {
      this.interval.offset = value;
    }
  },

  data () {
    let data = {
      // todo Для тестов
      uid: (new Date()).getTime(),
      receiving: {},
      // todo Для тестов

      clientWidth: null,
      clientHeight: null,
      event: {
        dot: null
      },
      draggingDot: {
        isDragging: false,
        offsetX: 0,
        offsetY: 0,
        clientX: 0,
        clientY: 0
      },
      target: {
        x: null,
        y: null
      },
      selectionBox: {
        isSelectionBox: false,
        timeStart: null,
        timeEnd: null,
        top: null,
        bottom: null
      },
      draggingNewDot: {
        isDragging: false,
        x: 0,
        y: 0
      },
      width: 1000,
      height: 700,
      local_dots: null,
      zoom: {
        value: 1, // Текущий зум
        step: 1.1, // K преращение зума
        // Возможные дискретности времени на оси Х
        time_parts: [60, 300, 600, 1800, 3600, 7200, 14400, 43200, 86400],
        max_parts: 9
      },
      interval: {
        width: this.intervalWidth,
        resolution: this.intervalResolution,
        offset: this.intervalStartOffset ? +this.intervalStartOffset : 0 // Смещение графика слева
      },
      scrolling: {
        isScrolling: false,
        power: 0,
        inertTimer: setInterval(() => {
          if (Math.abs(this.scrolling.power) > 1) {
            this.interval.offset = this.rebaseOffset(
              this.interval.offset + this.scrolling.power / this.dpi
            );
            this.scrolling.power /= 1.04;
          }
        }, 20),
        clientX: 0
      },
      animate: {
        spectrumTimer: null
      }
    };

    data.zoom.value = this.rebaseZoomByParams(data, data.zoom.value);

    return data;
  },

  methods: {
    cloneDots (dots) {
      if (!dots) { return null; }

      let result = [];
      dots.map((dot) => {
        let cloneDot = this.createDot();
        cloneDot.time = +dot.time;
        cloneDot.brightness = +dot.brightness;

        for (let key in dot.spectrum) {
          cloneDot.spectrum[key] = +dot.spectrum[key];
        }
        result.push(cloneDot);
      });

      return result;
    },

    onSave () {
      let cloneDot = this.cloneDots(this.local_dots);

      cloneDot.sort((a, b) => {
        if (a.time < b.time) { return -1; } else if (a.time > b.time) { return 1; }
        return 0;
      });

      cloneDot.map((dot) => {
        dot.time = Math.floor(dot.time);
        dot.brightness = Math.floor(dot.brightness * 100000);
        for (let channel = 0; channel < this.channels.length; channel++) { dot.spectrum[channel] = (dot.spectrum[channel] ? +dot.spectrum[channel] : 0) * 10000; }
      });

      this.$store.commit('Lucerna/data/applyData', {name: 'dots', data: cloneDot});
      this.$store.dispatch('Lucerna/data/post', 'dots');
    },

    createDot (time, brightness, selected) {
      return {
        selected: !!selected,
        time: time,
        brightness: brightness,
        spectrum: (() => {
          let result = {};
          for (let f = 0; f < this.channels.length; f++) { result[f] = brightness; }
          return result;
        })()
      };
    },

    createDroppedDot (isSelected) {
      return this.createDot(
        this.interval.offset + this.rebaseX(this.draggingNewDot.x - this.chart.offset.left) / this.dpi,
        (this.chart.height - this.rebaseY(this.draggingNewDot.y - this.chart.offset.top)) / this.chart.height,
        isSelected
      );
    },

    onTouch (evt) {
      evt.preventDefault();
      if (evt.touches.length > 1 || (evt.type === 'touchend' && evt.touches.length > 0)) { return; }

      let newEvt = document.createEvent('MouseEvents');
      let type = null;
      let touch = null;

      switch (evt.type) {
        case 'touchstart':
          type = 'mousedown';
          touch = evt.changedTouches[0];
          break;
        case 'touchmove':
          type = 'mousemove';
          touch = evt.changedTouches[0];
          break;
        case 'touchend':
          type = 'mouseup';
          touch = evt.changedTouches[0];
          break;
      }

      newEvt.initMouseEvent(type, true, true, document.defaultView, 0,
        touch.screenX, touch.screenY, touch.clientX, touch.clientY,
        evt.ctrlKey, evt.altKey, evt.shiftKey, evt.metaKey, 0, null);

      evt.target.dispatchEvent(newEvt);
    },

    onMouseDownNewDot (event) {
      this.draggingNewDot.isDragging = true;
      this.draggingNewDot.x = event.offsetX * this.koofScreenX;
      this.draggingNewDot.y = event.offsetY * this.koofScreenY;
    },

    onMouseUpNewDot (event) {
      this.draggingDot.isDragging = false;
    },

    isInSelBox (dot) {
      return this.selectionBox.isSelectionBox &&
                    this.rebaseX(this.getChartX(dot)) >= this.selBox.x && this.rebaseX(this.getChartX(dot)) <= this.selBox.x + this.selBox.width &&
                    this.rebaseY(this.getChartY(dot)) >= this.selBox.y && this.rebaseY(this.getChartY(dot)) <= this.selBox.y + this.selBox.height;
    },

    onResize () {
      this.clientWidth = this.$el.clientWidth;
      this.clientHeight = this.$el.clientHeight;
      this.height = this.clientWidth ? this.$el.clientHeight / this.clientWidth * this.width : 0;
    },

    onZoom (delta, event) {
      let oldExposition = this.exposition;

      switch (delta) {
        case -1:
          this.zoom.value = this.rebaseZoom(this.zoom.value / this.zoom.step);
          break;
        case 1:
          this.zoom.value = this.rebaseZoom(this.zoom.value * this.zoom.step);
          break;
      }

      if (this.zoom.value <= 1) { this.zoom.value = 1; }

      this.interval.offset = this.rebaseOffset(
        this.interval.offset +
                    (oldExposition - this.exposition) *
                    ((event.offsetX * this.koofScreenX - this.chart.offset.left) / this.chart.width)
      );
    },

    // Первичный обработчик событий для реализации события zoom
    proxyScrollEvent (event) {
      let e = window.event || event;
      let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

      if (e.path.indexOf(this.$el) >= 0) {
        this.onZoom(delta, e);
        e.preventDefault();
      }
    },

    calcLevelsByBrightness (dot) {
      let max = 0;
      for (let channel = 0; channel < this.channels.length; channel++) {
        if (dot.spectrum[channel] > max) { max = dot.spectrum[channel]; }
      }

      for (let channel = 0; channel < this.channels.length; channel++) { dot.spectrum[channel] = !max ? dot.brightness : dot.brightness * (dot.spectrum[channel] / max); }
    },

    onDotMouseDown (dot) {
      this.draggingDot.isDragging = true;
      this.draggingDot.offsetX = 0;
      this.draggingDot.offsetY = 0;

      this.event.dot = dot;

      if (!this.event.dot.selected && !window.event.shiftKey) {
        this.cleanSelectedDots();
        this.event.dot.selected = true;
      }

      this.event.isShift = window.event.shiftKey;
    },

    onMouseUp () {
      if (this.draggingNewDot.isDragging) {
        if (
          (this.draggingNewDot.y >= this.chart.offset.top) &&
                        (this.draggingNewDot.y <= this.chart.offset.top + this.chart.height) &&
                        (this.draggingNewDot.x >= this.chart.offset.left) &&
                        (this.draggingNewDot.x <= this.chart.offset.left + this.chart.width)
        ) {
          this.cleanSelectedDots();
          this.dots.push(this.createDroppedDot(true));
        }
        this.draggingNewDot.isDragging = false;
      }

      if (this.draggingDot.isDragging && this.draggingDot.offsetX === 0 && this.draggingDot.offsetY == 0) {
        if (!this.event.isShift) { this.cleanSelectedDots(); }

        this.event.dot.selected = !this.event.dot.selected;
      }

      this.dots.map((dot, index) => {
        if (this.selectionBox.isSelectionBox && this.isInSelBox(dot)) { dot.selected = true; }

        if (dot.selected) {
          dot.brightness = (this.chart.height - this.rebaseY(this.getChartY(dot))) / this.chart.height;
          dot.time = this.interval.offset + this.rebaseX(this.getChartX(dot)) / this.dpi;
          this.calcLevelsByBrightness(dot);
        }
      });

      this.draggingDot.isDragging = false;
      this.draggingDot.offsetX = 0;
      this.draggingDot.offsetY = 0;

      this.scrolling.isScrolling = false;
      this.selectionBox.isSelectionBox = false;
    },

    onMouseDown (event) {
      this.draggingDot.clientX = event.clientX;
      this.draggingDot.clientY = event.clientY;

      this.scrolling.clientX = event.clientX;

      this.scrolling.power = 0;

      if (!this.draggingDot.isDragging) {
        if (window.event.shiftKey) {
          this.selectionBox.isSelectionBox = true;
          this.selectionBox.timeStart = this.interval.offset +
                            this.rebaseX(event.offsetX * this.koofScreenX - this.chart.offset.left) / this.dpi;
          this.selectionBox.timeEnd = this.selectionBox.timeStart;

          this.selectionBox.top = event.offsetY * this.koofScreenY - this.chart.offset.top;
          if (this.selectionBox.top < 0) { this.selectionBox.top = 0; }

          this.selectionBox.bottom = this.selectionBox.top;
        } else {
          this.scrolling.isScrolling = true;
        }
      }

      return true;
    },

    onMouseMove (event) {
      this.target.x = event.offsetX * this.koofScreenX - this.chart.offset.left;
      this.target.y = event.offsetY * this.koofScreenY - this.chart.offset.top;

      if (this.draggingNewDot.isDragging) {
        this.draggingNewDot.x = event.offsetX * this.koofScreenX;
        this.draggingNewDot.y = event.offsetY * this.koofScreenY;
        return;
      }

      if (this.draggingDot.isDragging) {
        this.draggingDot.offsetX += (this.draggingDot.clientX - event.clientX) * this.koofScreenX;
        this.draggingDot.offsetY += (this.draggingDot.clientY - event.clientY) * this.koofScreenY;

        if (!this.event.dot.selected) {
          if (!this.event.isShift) { this.cleanSelectedDots(); }

          this.event.dot.selected = this.draggingDot.offsetX !== 0 || this.draggingDot.offsetY !== 0;
        }
      }

      if (this.scrolling.isScrolling) {
        this.scrolling.power = (this.scrolling.clientX - event.clientX) * this.koofScreenX;
        this.interval.offset = this.rebaseOffset(
          this.interval.offset + this.scrolling.power / this.dpi
        );
      }

      if (this.selectionBox.isSelectionBox) {
        this.selectionBox.timeEnd = this.interval.offset +
                        this.rebaseX(event.offsetX * this.koofScreenX - this.chart.offset.left) / this.dpi;
        if (this.selectionBox.timeEnd < this.interval.offset) { this.selectionBox.timeEnd = this.interval.offset; }

        this.selectionBox.bottom = event.offsetY * this.koofScreenY - this.chart.offset.top;
        if (this.selectionBox.bottom > this.chart.height) { this.selectionBox.bottom = this.chart.height; } else if (this.selectionBox.bottom < 0) { this.selectionBox.bottom = 0; }
      }

      this.draggingDot.clientX = event.clientX;
      this.draggingDot.clientY = event.clientY;

      this.scrolling.clientX = event.clientX;

      return true;
    },

    onDelete () {
      let result = [];

      this.dots.map((dot) => {
        if (!dot.selected) { result.push(dot); }
      });

      this.dots = result;
    },

    onCopy () {
      this.dots.map((dot) => {
        if (dot.selected) {
          dot.selected = false;
          let newDot = Object.assign({}, dot);
          newDot.time += this.dotRadius * 2 / this.dpi;
          newDot.selected = true;
          this.dots.push(newDot);
        }
      });
    },

    // Фокусировка на выбранном дне по dblclick
    expandDay (xDay) {
      this.interval.offset = xDay.number * this.interval.resolution;
      this.zoom.value = this.interval.width / this.interval.resolution;
    },

    cleanSelectedDots () {
      this.dots.map(function (dot) {
        dot.selected = false;
      });
    },

    isDotVisible (dot) {
      let realX = this.getChartX(dot);
      return realX >= 0 && realX <= this.chart.width;
    },

    rebaseOffset (offset) {
      if (offset < 0) {
        offset = 0;
      } else if (offset > this.interval.width - this.exposition) {
        offset = this.interval.width - this.exposition;
      }

      return offset;
    },

    rebaseX (x) {
      return x;
    },

    rebaseY (y) {
      return y > this.chart.height ? this.chart.height : (y < 0 ? 0 : y);
    },

    rebaseZoomByParams (params, zoom) {
      let maxPart = params.zoom.time_parts[params.zoom.time_parts.length - 1];
      let minZoom = params.interval.width / (maxPart * params.zoom.max_parts);

      return zoom < minZoom ? minZoom : zoom;
    },

    rebaseZoom (zoom) {
      return this.rebaseZoomByParams(this, zoom);
    },

    getChartXByTime (timestamp) {
      timestamp = timestamp < 0
        ? this.interval.width + (timestamp % this.interval.width)
        : timestamp % this.interval.width;

      return (timestamp - this.interval.offset) * this.dpi;
    },

    getChartX (dot) {
      return this.getChartXByTime(dot.time - (dot.selected ? this.draggingDot.offsetX : 0) / this.dpi);
    },

    getChartY (dot) {
      return (this.chart.height - this.chart.height * dot.brightness) -
                    (dot.selected ? this.draggingDot.offsetY : 0);
    },

    // вычисляет Y точки перехода для границ графика
    //  border  - X перехода
    //  point1, point2 - точки
    calcTransition (border, point1, point2) {
      let leftShoulder = border - Math.min(point1.x, point2.x);
      let width = Math.abs(point1.x - point2.x);
      let koof = leftShoulder / width;
      let height = point1.y - point2.y;

      return point1.y - height * koof;
    },

    copyDotsFromVUEX () {
      let result = this.cloneDots(this.$store.state.Lucerna.data.dots);
      if (result) {
        result.map((dot) => {
          dot.brightness = dot.brightness / 100000;
          for (let channel = 0; channel < this.channels.length; channel++) { dot.spectrum[channel] = (dot.spectrum[channel] ? +dot.spectrum[channel] : 0) * 0.0001; }
        });
      }

      return result;
    }
  },

  computed: {

    chart () {
      let offsetTop = this.dotRadius * 3;
      let offsetLeft = this.isMobileScreen ? this.fontHeight * 1.2 : 60;
      return {
        showPercents: true,
        showTimes: true,
        height: this.height - this.fontSizeAxisX * 1.5 - this.toolbar.height,
        width: this.width - offsetLeft,
        offset: {
          left: offsetLeft,
          top: offsetTop
        }
      };
    },

    toolbar () {
      return {
        left: 60,
        top: 0,
        height: this.dotRadius * 3
      };
    },

    // Return dot for inspection
    theDot () {
      return this.selectedDots.length ? this.selectedDots[0] : this.createDot(0, 0, 0);
    },

    currentSpectrum () {
      let spectrum = {};
      this.channels.map((channel, index) => {
        channel.spectrum.map((wave) => {
          spectrum[wave.wave] = (spectrum[wave.wave] ? spectrum[wave.wave] : 0) +
                            (wave.value * channel.mw * (this.theDot.spectrum[index] ? this.theDot.spectrum[index] : 0));
        });
      });
      return spectrum;
    },
    channelsEditorInterface: {
      get () {
        let result = [];
        if (this.theDot) {
          result.push({
            color: '#FFFFFF',
            level: this.theDot.brightness
          });

          for (let channel in this.theDot.spectrum) {
            if (this.channels[+channel]) {
              result.push({
                color: this.channels[+channel].color,
                level: this.theDot.spectrum[channel]
              });
            }
          }
        }
        return result;
      },
      set (value) {
        if (this.theDot) {
          if (this.animate.spectrumTimer) { clearTimeout(this.animate.spectrumTimer); }

          this.animate.spectrumTimer = setTimeout(() => {
            this.animate.spectrumTimer = null;
          }, 250);

          value.map((channel, index) => {
            if (!index) { this.theDot.brightness = channel.level; } else { this.theDot.spectrum[index - 1] = channel.level; }
          });
        }
      }
    },

    isShowChannelsInspector () {
      return this.selectedDots.length > 0;
    },

    selectedDots () {
      let result = [];
      this.dots.map((dot) => {
        if (dot.selected) { result.push(dot); }
      });
      return result;
    },

    dots: {
      get () {
        if (!this.$store.state.Lucerna.data.dots) { this.$store.dispatch('Lucerna/data/reload', 'dots'); }
        return this.local_dots ? this.local_dots : ((this.local_dots = this.copyDotsFromVUEX()) ? this.local_dots : []);
      },
      set (value) {
        this.local_dots = value;
      }
    },

    dotsForInspection: {
      get () {
        let dots = [];

        this.dots.map((dot) => {
          if (dot.selected) { dots.push(Object.assign({}, dot)); }
        });

        return dots;
      },
      set (value) {
        // todo реализовать

      }
    },

    // Calc selection box
    selBox () {
      let result = {
        x: (
          (this.selectionBox.timeStart < this.selectionBox.timeEnd ? this.selectionBox.timeStart : this.selectionBox.timeEnd) -
                        this.interval.offset
        ) * this.dpi,
        y: this.selectionBox.top < this.selectionBox.bottom ? this.selectionBox.top : this.selectionBox.bottom,
        width: Math.abs(this.selectionBox.timeStart - this.selectionBox.timeEnd) * this.dpi,
        height: Math.abs(this.selectionBox.top - this.selectionBox.bottom)
      };

      if (result.y + result.height > this.chart.height) { result.height = this.chart.height - result.y; }

      return result;
    },

    currentTime () {
      return ((this.hwDateTime.getTime() - this.hwDateTime.getTimezoneOffset() * 60000) / 1000) %
                    this.interval.width;
    },

    // Вычисляет толщину линии перехода между днями
    dayBorderWidth () {
      let width = 3 * (this.zoom.value / 10);

      if (width < 3) { width = 3; } else if (width > 10) { width = 10; }

      return width;
    },

    // Количество точек на секунду с учетом зума
    dpi () {
      return this.chart.width / this.interval.width * this.zoom.value;
    },

    // Экспозиция времени отображаемая на графике с учетом зума
    exposition () {
      return 1 * (this.chart.width / this.dpi).toFixed(5);
    },

    axisY () {
      let step = 20;
      let result = [];

      for (let percent = 100; percent >= 0; percent -= step) {
        result.push({
          y: (100 - percent) * (this.chart.height / 100),
          percent: percent
        });
      }

      return result;
    },

    axisXDays () {
      let result = [];

      for (
        let day = parseInt(this.interval.offset / this.interval.resolution);
        day <= parseInt((this.interval.offset + this.exposition) / this.interval.resolution);
        day++) {
        let xDay = {
          number: day,
          x: (day * this.interval.resolution - this.interval.offset) * this.dpi,
          width: this.interval.resolution * this.dpi
        };

        if (day * this.interval.resolution <= this.interval.offset) {
          xDay.width = (day * this.interval.resolution + this.interval.resolution - this.interval.offset) * this.dpi;
          xDay.x = 0;
        } else if (day * this.interval.resolution + this.interval.resolution > this.interval.offset + this.exposition) {
          xDay.width = this.interval.offset + this.exposition - day * this.interval.resolution;
        }

        if (xDay.x + xDay.width > this.chart.width) { xDay.width = this.chart.width - xDay.x; }

        if (xDay.width < 0) { xDay.width = 0; }

        result.push(xDay);
      }

      return result;
    },

    axisX () {
      let timePart = null;
      let partsNumber = null;
      let result = [];

      this.zoom.time_parts.map((candidate) => {
        let candidatePartsNumber = this.exposition / candidate;

        if (
          (partsNumber == null || candidatePartsNumber > partsNumber) &&
            candidatePartsNumber <= this.zoom.max_parts
        ) {
          timePart = candidate;
          partsNumber = candidatePartsNumber;
        }
      });

      if (!timePart) { timePart = this.zoom.time_parts[this.zoom.time_parts.length - 1] || 1; }

      for (
        let moment = this.interval.offset - (this.interval.offset % timePart);
        moment < this.interval.offset + this.exposition;
        moment += timePart
      ) {
        if (moment <= this.interval.offset) { continue; }

        result.push({
          x: (moment - this.interval.offset) * this.dpi,
          time: moment
        });
      }

      return result;
    },

    currentTimeX () {
      return this.getChartXByTime(this.currentTime);
    },

    schedulePath () {
      let rebaseMap = [];
      let dots = Object.assign([], this.dots);

      if (this.draggingNewDot.isDragging &&
                    (this.draggingNewDot.y >= this.chart.offset.top) &&
                    (this.draggingNewDot.y <= this.chart.offset.top + this.chart.height) &&
                    (this.draggingNewDot.x >= this.chart.offset.left) &&
                    (this.draggingNewDot.x <= this.chart.offset.left + this.chart.width)

      ) { dots.push(this.createDroppedDot()); }

      dots.map((dot) => {
        let x = this.rebaseX(this.getChartX(dot));
        let y = this.rebaseY(this.getChartY(dot));

        rebaseMap.push({
          x: x,
          y: y,
          dot: dot
        });
      });

      rebaseMap.sort(function (a, b) {
        if (a.x > b.x) { return 1; } else if (a.x < b.x) { return -1; }

        return 0;
      });

      // Вычисляем основное тело пути
      // за одно находим точки перехода между границами
      let body = '';

      // Точки перехода слева
      let outsideLeft = null;
      let insideLeft = null;

      // Точки перехода справа
      let outsideRight = null;
      let insideRight = null;

      rebaseMap.map((dot) => {
        if (this.getChartX(dot.dot) < 0) { outsideLeft = dot; } else if (this.getChartX(dot.dot) > (this.chart.width)) {
          outsideRight = !outsideRight ? dot : outsideRight;
        } else {
          if (!insideLeft) { insideLeft = dot; } else { insideRight = dot; }

          body += 'L' + dot.x + ',' + dot.y;
        }
      });

      let prefix = '';
      let postfix = '';

      // Если точек нет, то все просто - график на нуле
      if (!rebaseMap.length) {
        prefix = 'M0,0';
        postfix = 'L' + this.chart.width + ',0';
      } else {
        if (!outsideLeft) {
          outsideLeft = {
            x: -(this.chart.width * this.zoom.value - rebaseMap[rebaseMap.length - 1].x),
            y: rebaseMap[rebaseMap.length - 1].y,
            dot: rebaseMap[rebaseMap.length - 1]
          };
        }

        if (!outsideRight) {
          outsideRight = {
            x: this.chart.width * this.zoom.value + this.interval.offset * this.dpi + rebaseMap[0].x,
            y: rebaseMap[0].y,
            dot: rebaseMap[0]
          };
        }

        insideLeft = insideLeft || insideRight;
        insideRight = insideRight || insideLeft;

        if (!insideLeft && !insideRight) {
          prefix = 'M0,' + this.calcTransition(0, outsideLeft, outsideRight);
          postfix = 'L' + this.chart.width + ',' +
                            this.calcTransition(this.chart.width, outsideLeft, outsideRight);
        } else {
          prefix = 'M0,' + this.calcTransition(0, outsideLeft, insideLeft);
          postfix = 'L' + this.chart.width + ',' +
                            this.calcTransition(this.chart.width, insideRight, outsideRight);
        }
      }

      return prefix + body + postfix;
    },

    showDaysXAxis () {
      return this.interval.width > this.interval.resolution;
    },

    // Коэфициент преобразования реальных точек во внутренние по ширине
    koofScreenX () {
      return (+this.clientWidth) !== 0 ? this.width / this.clientWidth : 0;
    },

    // Коэфициент преобразования реальных точек во внутренние по высоте
    koofScreenY () {
      return (+this.clientHeight) !== 0 ? this.height / this.clientHeight : 0;
    },

    // Радиус точек на графике
    dotRadius () {
      return this.koofScreenX > 0 ? (this.isMobileScreen ? 20 : 10) * this.koofScreenX : 1;
    },

    fontHeight () {
      return this.koofScreenY > 0 ? 16 * this.koofScreenY : 16;
    },

    fontSizeAxisY () {
      return this.fontHeight < (this.chart.offset.left / 6) ? this.chart.offset.left / 6 : this.fontHeight;
    },

    fontSizeAxisX () {
      return this.fontHeight > (this.clientWidth / 16) ? this.clientWidth / 16 : this.fontHeight;
    }

  },

  filters: {
    day (timestamp) {
      return (timestamp - timestamp % 86400) / 86400 + 1;
    },

    time (timestamp) {
      let hours = (timestamp % 86400 - timestamp % 3600) / 3600;
      let mins = (timestamp % 3600 - timestamp % 60) / 60;
      // let secs = timestamp % 60;

      return '' +
                    ('0' + hours).slice(-2) +
                    ':' + ('0' + mins).slice(-2);
      // + (inc_sec ? ':' + ('0' + secs).slice(-2) : '');
    },

    percent (value) {
      return '' + value + '%';
    }
  }
};
</script>

<style lang="less" rel="stylesheet/less">

    .light-schedule {
        .toolbar {
            .button {
                cursor: pointer;
            }

            .button:hover {
                fill: #f00;
            }

            .button.ico {
                font-family: "Material Icons";
                text-rendering: optimizeLegibility;
                font-feature-settings: 'liga' 1;
                font-style: normal;
            }
        }

        /* width: 100%; */
        /* height: auto; */

        .target-line {
            stroke: #00f;
            stroke-width: 1px;
            opacity: 0.3;
        }

        .selection-box {
            stroke: none;
            fill: #000;
            opacity: 0.2;
        }

        .current-time-box {
            stroke: none;
            fill: #000;
            opacity: 0.05;
        }

        .current-time-line {
            stroke: rgb(0, 0, 255);
            stroke-width: 1;
            stroke-opacity: 0.3;
        }

        .axis-y, .axis-x, .axis-border {
            shape-rendering: crispEdges;
            stroke: #000;
            stroke-width: 1px;
            fill: none;

            text {
                font-size: 13px;
                line-height: 18px;
            }
        }

        .grid-days {

            text {
                opacity: 0.6;
                text-anchor: middle;
                fill: #333;
                cursor: default;
            }

            line {
                opacity: 0.3;
                stroke: #333;
            }

        }

        .axis-days {

            text {
                opacity: 0.2;
                text-anchor: middle;
                stroke: #333;
                cursor: default;
            }

            line {
                opacity: 0.3;
                stroke: #333;
            }

        }

        .axis-days.even {

        }

        .dot {
            fill: #0000F5;
            stroke: #FFF;
            cursor: normal;
        }

        .dot:hover, .dot.selected {
            border: 3px;
            border-color: #FF0000;
            fill: #F50000;
        }

        .schedulePath {
            fill: none;
            stroke: #0000F5;
        }

        .channel-editor {
            transition: all 0.1s ease-in;
        }

        .channel-editor-mbl {
            width: 100%;
        }

    }

    .theme--dark .light-schedule {
        .toolbar {
            .button {
                fill: #bbb;
            }
            .button:hover {
                fill: #f00;
            }
        }

        .target-line {
            stroke: #fff;
        }

        .selection-box {
            fill: #000;
        }

        .current-time-box {
            fill: #fff;
        }

        .current-time-text {
            fill: #bbb;
        }

        .current-time-line {
            stroke: rgb(255, 255, 255);
        }

        .axis-y, .axis-x, .axis-border {
            stroke: #000;
        }

        .axis-y, .axis-x, .axis-border {
            stroke: #bbb;
        }

        .grid-days {

            text {
                fill: #bbb;
            }

            line {
                stroke: #bbb;
            }

        }

        .axis-days {

            text {
                stroke: #bbb;
            }

            line {
                stroke: #777;
            }

        }

        .dot {
            fill: #3F51B5;
            stroke: #FFF;
        }

        .dot:hover, .dot.selected {
            border-color: #FF0000;
            fill: #F50000;
        }

        .schedulePath {
            stroke: #fff;
        }

    }

</style>
