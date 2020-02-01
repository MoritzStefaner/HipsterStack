/* eslint-disable no-console */
import { computed, autorun } from 'mobx';
import { dataSet } from './dataStore';
import { hcl } from 'd3';

class DataAPI {
  @computed
  get ready() {
    return this.items.length > 0;
  }

  @computed get items() {
    return dataSet.current().map((d, i) => {
      const vec = [d.sweet - d.sour, d.meaty - d.bitter];
      const length = Math.sqrt(vec[0] ** 2 + vec[1] ** 2);
      const angle = (180 * Math.atan2(vec[1], vec[0])) / Math.PI;
      // console.log(vec, length, angle);
      return {
        ...d,
        id: i,
        color: hcl(
          Math.floor(angle + 720) % 360,
          Math.min(Math.sqrt(length) * 35, 220),
          80,
        ),
      };
    });
  }
}

const dataAPI = new DataAPI();
autorun(() => {
  console.log(dataAPI.items[0]);
});
export default dataAPI;
