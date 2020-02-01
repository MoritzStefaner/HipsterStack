/* eslint-disable no-param-reassign, no-console */
import { lazyObservable } from 'mobx-utils';
import { json } from 'd3';
import { range } from 'lodash';

import dataPath from '../../data/data.json';

const dataSet = {current: ()=>dataPath};

// lazyObservable(
//   sink =>
//     json(dataPath).then(result => {
//       sink(
//         result
//           ? result.map(d => ({
//               id: String(d),
//             }))
//           : [],
//       );
//     }),
//   [],
// );

// test if dynamic updates work
// setInterval(() => dataSet.refresh(), 5000);

export { dataSet }; // eslint-disable-line
