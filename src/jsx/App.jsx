/* eslint-disable no-console */

import React, { Component } from 'react';

import { observer } from 'mobx-react';
// hot reloading:
import { hot } from 'react-hot-loader';

import uiState from './state/uiState';
import dataAPI from './data/dataAPI';

import VisComponent from './components/VisComponent';
import TabBar from './components/TabBar';
import Toggle from './components/Toggle';

import MouseTip from './components/MouseTip';
import SidePanel from './components/SidePanel';
import DynamicMapContainer from './components/DynamicMapContainer';

@observer
class App extends Component {
  render() {
    const { items } = dataAPI;

    return (
      <div>
        <div className="controls">
          <TabBar
            data={uiState.modes}
            property={uiState.mode}
            onChange={id => {
              uiState.mode = id;
            }}
          ></TabBar>
          {/* <Toggle
            selected={uiState.toggleMode}
            onChange={() => {
              uiState.toggleMode = !uiState.toggleMode;
            }}
          >
            toggle
          </Toggle> */}
        </div>
        {dataAPI.ready ? (
          <div>
            <DynamicMapContainer data={items} width={1080} height={1080} />
            {/* <VisComponent data={items} /> */}
            {/* <MouseTip visible>
              {dataAPI.hoveredItem && dataAPI.hoveredItem.id}
            </MouseTip>
            <SidePanel visible>
              {dataAPI.selectedItem && dataAPI.selectedItem.id}
            </SidePanel> */}
          </div>
        ) : (
          <div>Loading…</div>
        )}
      </div>
    );
  }
}

export default hot(module)(App);
