import { Airport } from '../airport/airport';
import * as moment from 'moment';
import { Moment, Duration } from 'moment-timezone';

export class FlightVector {
  public airport: Airport;
  public dateTime: Moment;
  public delay: Duration;
  public offset: string;
  public terminal: string|number;


  constructor (obj?: any) {
    if (obj) {
      this.airport = new Airport(obj.airport);
      this.offset = moment().utcOffset(obj.offset || 0).format('Z');
      this.dateTime = obj.dateTime ? moment(obj.dateTime) : undefined;
      this.terminal = obj.terminal;
      this.delay = moment.duration(obj.delay || 'PT0S');

      if (this.dateTime && this.offset) {
        this.dateTime = this.dateTime.utcOffset(this.offset);
      }

      if (this.dateTime && this.delay) {
        this.dateTime.add(this.delay);
      }
    }
  }
}
