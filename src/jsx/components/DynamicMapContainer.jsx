import React from 'react';
import { observer } from 'mobx-react';
import { autorun, observable, computed, extendObservable, action } from 'mobx';
import { now } from 'mobx-utils';
import { random, range, memoize, keyBy, orderBy } from 'lodash';
import {
  interpolateMagma,
  scaleLinear,
  forceCenter,
  forceCollide,
  forceSimulation,
  forceX,
  forceY,
  forceManyBody,
  extent,
  max,
} from 'd3';

// import DynamicMap from './DynamicMapThree';
// import DynamicMap from './DynamicMapPixi';
import DynamicMap from './DynamicMapPixiFiber';
// import DynamicMap from './DynamicMapHtml';
// import DynamicMap from './DynamicMapSVG';
import DynamicMapLabels from './DynamicMapLabels';
import dataAPI from '../data/dataAPI';
import uiState from '../state/uiState';
// import StationsAndConnectionsView from './StationsAndConnectionsView';

@observer
class DynamicMapContainer extends React.Component {
  data = [];

  @observable.shallow displayItems = [];

  @observable hoveredItemId = null;
  @computed get hoveredItem() {
    return this.displayItems.find(d => d.id === this.hoveredItemId);
  }
  @computed get displayItemsWithLabels() {
    return this.hoveredItemId
      ? this.displayItems.filter(d => d.id === this.hoveredItemId).slice()
      : [];
    // : orderBy(this.displayItems, 'target.radius')
    //     .reverse()
    //     .slice(0, 5);
  }

  @action.bound clickAction(id) {}

  @action.bound hoverAction(id) {
    this.hoveredItemId = id;
  }

  @observable frame = 0;

  createDisplayItem = o => ({
    data: o,
    id: o.id,
    x: 960,
    y: 0,
    radius: 5,
    trail: [],
    color: o.color,
    labelVisible: false,
    target: { x: 960, y: 540, radius: 1 },
  });

  layout = {};

  radiusExtent = [3, 20];

  strengthScale = scaleLinear()
    .domain(this.radiusExtent)
    .range([0.03, 0.07])
    .clamp(true);

  xScale = scaleLinear();
  yScale = scaleLinear();
  radiusScale = scaleLinear().range(this.radiusExtent);

  tick(now) {
    this.frame = now;
    this.displayItems.forEach(d => {
      d.radius = d.target.radius;
    });

    this.forceCollide.radius(n => n.target.radius + 5);
    this.forceX.strength(n => this.strengthScale(n.target.radius));
    this.forceY.strength(n => this.strengthScale(n.target.radius));
  }

  layoutCounter = 0;

  refreshLayout() {
    console.log('refreshLayout');
    const { data, children, width, height } = this.props;
    let x, y, r;

    const padding = 100;
    const W = Math.min(width, height) - padding * 2;
    const X_OFF = (width - W - padding * 2) / 2 + padding;
    const Y_OFF = (height - W - padding * 2) / 2 + padding;

    switch (uiState.mode) {
      case 'similarity':
        x = d => d.data.x;
        y = d => d.data.y;
        r = d => d.data.time;

        this.xScale
          .domain(extent(this.displayItems, x))
          .range([X_OFF, X_OFF + W]);

        this.yScale
          .domain(extent(this.displayItems, y))
          .range([Y_OFF, Y_OFF + W]);

        this.radiusScale.domain([0, max(this.displayItems, r)]);

        this.displayItems.forEach(d => {
          d.target.x = this.xScale(x(d));
          d.target.y = this.yScale(y(d));
          d.target.radius = this.radiusScale(r(d));
        });

        break;
      case 'time':
        x = d => Math.sqrt(d.data.time);
        y = d => Math.random();
        r = d => d.data.time;

        this.xScale
          .domain(extent(this.displayItems, x))
          .range([padding, X_OFF + W]);

        this.yScale
          .domain(extent(this.displayItems, y))
          .range([padding, Y_OFF + W]);

        this.radiusScale.domain([0, max(this.displayItems, r)]);

        this.displayItems.forEach(d => {
          d.target.x = this.xScale(x(d));
          d.target.y = this.yScale(y(d));
          d.target.radius = this.radiusScale(r(d));
        });

        break;
      case 'sweet-sour-vs-meaty-bitter':
        x = d => d.data.sweet - d.data.sour;
        y = d => d.data.meaty - d.data.bitter;
        r = d => d.data.time;

        this.xScale
          .domain(extent(this.displayItems, x))
          .range([padding, X_OFF + W]);

        this.yScale
          .domain(extent(this.displayItems, y))
          .range([Y_OFF, Y_OFF + W]);

        this.radiusScale.domain([0, max(this.displayItems, r)]);

        this.displayItems.forEach(d => {
          d.target.x = this.xScale(x(d));
          d.target.y = this.yScale(y(d));
          d.target.radius = this.radiusScale(r(d));
        });

        break;
      default:
    }

    this.forceX.x(d => d.target.x);
    this.forceY.y(d => d.target.y);
    this.sim.alpha(1).restart();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) this.updateDisplayItems();
  }

  componentDidMount() {
    this.updateDisplayItems();
    this.initForce();
    autorun(() => this.tick(now('frame')));
    autorun(() => this.refreshLayout(uiState.mode));
    this.refreshLayout();

    this.setState({ running: true });
  }

  updateDisplayItems() {
    this.displayItems = this.props.data.map(this.createDisplayItem);
  }

  initForce() {
    const fc = forceCenter(this.props.width / 2, this.props.height / 2);
    // const fmb = forceManyBody()
    //   .strength(-10)
    //   .distanceMin(10);
    this.forceX = forceX()
      .x(d => d.target.x)
      .strength(0.2);
    this.forceY = forceY()
      .y(d => d.target.y)
      .strength(0.2);
    this.forceCollide = forceCollide()
      .radius(n => n.radius + 3)
      .strength(0.6);
    this.sim = forceSimulation(this.displayItems)
      .alphaDecay(0.005)
      .alphaMin(0.01)
      .velocityDecay(0.4)
      // .force('center', fc)
      .force('collide', this.forceCollide)
      // .force('charge', fmb)
      .force('x', this.forceX)
      .force('y', this.forceY);

    // this.sim.start();
  }

  render() {
    const { data, children, width, height } = this.props;
    // console.log(this.displayItems.length);
    return (
      <div style={{ display: 'flex' }}>
        <div style={{ position: 'relative' }}>
          <DynamicMap
            data={this.displayItems}
            width={width}
            height={height}
            clickAction={this.clickAction}
            hoverAction={this.hoverAction}
          />
          <DynamicMapLabels
            data={this.displayItemsWithLabels}
            width={width}
            height={height}
          />
        </div>
      </div>
    );
  }
}
export default DynamicMapContainer;
