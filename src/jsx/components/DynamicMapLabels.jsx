import React from 'react';
import { observer } from 'mobx-react';
import { autorun, observable, computed, toJS } from 'mobx';
import { now } from 'mobx-utils';
import { hcl } from 'd3';
import { memoize } from 'lodash';
import * as THREE from 'three';

@observer
class DynamicMapLabels extends React.Component {
  render() {
    const { data, width, height, frame } = this.props;
    const els = data.map(vm => <Item data={vm} key={vm.id} />);
    return (
      <div
        style={{
          pointerEvents: 'none',
          width,
          height,
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {els}
      </div>
    );
  }
}

@observer
class Item extends React.Component {
  componentDidMount() {
    autorun(() => this.tick(now('frame')));
  }
  tick() {
    this.setState({ running: Math.random() });
  }

  render() {
    const {
      data: {
        x,
        y,
        color,
        radius,
        data: { label },
      },
    } = this.props;
    // console.log('render');
    return (
      <div
        style={{
          transform: `translate(${x}px, ${y - 80}px)`,
          maxWidth: `20em`,
          width: 'auto',
          borderLeft: '1px solid #FFF',
          height: '80px',
          position: 'absolute',
          // display: 'flex',
        }}
        // f={this.state && this.state.running}
      >
        <div
          style={{
            display: 'inline-block',
            maxWidth: `20em`,
            color: '#FFFFFF',
            borderRadius: `1px`,
            background: hcl(color).darker(2),
            padding: '.2em .4em',
            textAlign: 'center',
            transform: 'translate(-50%, 0)',
          }}
        >
          {label}
        </div>
      </div>
    );
  }
}

export default DynamicMapLabels;
