import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import DevTools from 'mobx-react-devtools';

import uiState from "state/uiState"
import {observer} from 'mobx-react';

import { startRouter } from 'router';

@observer
class App extends Component {
	constructor(){
		super();
		startRouter();
	}

	render() {
		return (
			<div>
				<h1>{uiState.currentView}</h1>
				{uiState.dataLoaded && <h2>Data loaded</h2>}
				{!uiState.dataLoaded && <h2>Loading…</h2>}
			</div>
		);
	}
};

export default App;