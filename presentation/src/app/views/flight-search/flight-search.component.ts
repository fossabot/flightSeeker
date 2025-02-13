import { AirlineService } from '../../web-services/airline/airline.service';
import { AirlineQuery } from '../../classes/airline/airline-query';
import { Airport } from '../../classes/airport/airport';
import { AirportService } from '../../web-services/airport/airport.service';
import { Component, OnInit } from '@angular/core';
import { AirportQuery } from '../../classes/airport/airport-query';
import { Airline } from '../../classes/airline/airline';
import * as moment from 'moment-timezone';
import { isString } from 'util';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-flight-search',
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.scss']
})
export class FlightSearchComponent implements OnInit {

  private $departureAirport: Airport;
  private $arrivalAirport: Airport;
  private $airline: Airline;
  private $departureDate: Date;
  private $departureTime: Date;

  public departureAirports: Airport[];
  public arrivalAirports: Airport[];
  public airlines: Airline[];


  public get departureAirport() {
    return this.$departureAirport;
  }
  public set departureAirport(airport: Airport) {
    this.$departureAirport = airport;
    // this.searchGoingFlight();
  }

  public get arrivalAirport() {
    return this.$arrivalAirport;
  }
  public set arrivalAirport(airport: Airport) {
    this.$arrivalAirport = airport;
    // this.searchGoingFlight();
    this.updateQueryParams();
  }

  public get airline() {
    return this.$airline;
  }
  public set airline(airline: Airline) {
    this.$airline = airline;
    // this.searchGoingFlight();
    this.updateQueryParams();
  }

  public get departureDate() {
    return this.$departureDate;
  }
  public set departureDate(date: Date) {
    this.$departureDate = date;
    // this.searchGoingFlight();
    this.updateQueryParams();
  }

  public get departureTime() {
    return this.$departureTime;
  }
  public set departureTime(date: Date) {
    this.$departureTime = date;
    // this.searchGoingFlight();
    this.updateQueryParams();
  }

  public searchDepartureAirport(airportCriteria: string) {
    this.airportService.search(new AirportQuery({
      'startsWith': airportCriteria,
      'linkedAirportIata': this.arrivalAirport ? this.arrivalAirport.iata : null,
      'byAirlineIata': this.airline ? this.airline.iata : null
    })).subscribe((departureAirports: Airport[] = []) => {
      const matchingDepartureAirport = departureAirports.find(airport => {
        return airport.name.toLowerCase() === airportCriteria.toLowerCase() || airport.iata === airportCriteria;
      });
      if (matchingDepartureAirport) {
        this.departureAirport = matchingDepartureAirport;
      }
      this.departureAirports = departureAirports;
    });
  }

  private setDepartureAirport(airportIata: string) {
    this.airportService.read(airportIata).subscribe((airport: Airport) => {
      this.$departureAirport = airport;
    });
  }

  public searchArrivalAirport(airportCriteria: string) {
    this.airportService.search(new AirportQuery({
      'startsWith': airportCriteria,
      'linkedAirportIata': this.departureAirport ? this.departureAirport.iata : null,
      'byAirlineIata': this.airline ? this.airline.iata : null
    })).subscribe((arrivalAirports: Airport[] = []) => {
      const matchingArrivalAirport = arrivalAirports.find(airport => {
        return airport.name.toLowerCase() === airportCriteria.toLowerCase() || airport.iata === airportCriteria;
      });
      if (matchingArrivalAirport) {
        this.arrivalAirport = matchingArrivalAirport;
      }
      this.arrivalAirports = arrivalAirports;
    });
  }

  private setArrivalAirport(airportIata: string) {
    this.airportService.read(airportIata).subscribe((airport: Airport) => {
      this.$arrivalAirport = airport;
    });
  }

  public searchAirline(airlineCriteria) {
    this.airlineService.search(new AirlineQuery({
      'startsWith': airlineCriteria,
      'fromAirportIata': this.departureAirport ? this.departureAirport.iata : null,
      'toAirportIata': this.arrivalAirport ? this.arrivalAirport.iata : null
    })).subscribe((data: Airline[] = []) => {
      const matchingAirline = data.find(airline => {
        return airline.name.toLowerCase() === airlineCriteria.toLowerCase() || airline.iata === airlineCriteria;
      });
      if (matchingAirline) {
        this.airline = matchingAirline;
      }
      this.airlines = data;
    });
  }

  private setAirline(airlineIata: string) {
    this.airlineService.read(airlineIata).subscribe((airline: Airline) => {
      this.$airline = airline;
    });
  }

  public autoSelectFromList(value: string|any, list: any[]) {
    if ((isString(value) || !value) && list) {
      return list[0];
    }
    return value;
  }

  public switchAirports() {
    const airport = this.departureAirport;
    this.departureAirport = this.arrivalAirport;
    this.arrivalAirport = airport;
  }

  private updateQueryParams() {
    this.router.navigate(['/'], {
      queryParams: {
        from: this.departureAirport && this.departureAirport.iata,
        to: this.arrivalAirport && this.arrivalAirport.iata,
        by: this.airline && this.airline.iata,
        date: this.departureDate && moment(this.departureDate).format('YYYY-MM-DD'),
        time: this.departureTime && moment(this.departureTime).format('HH:mm')
      }
    });
  }

  constructor(
    private airportService: AirportService,
    private airlineService: AirlineService,
    private router: Router,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    const AIRPORT_VALIDATOR = /^[A-Z\d\*]{3}$/i;
    const AIRLINE_VALIDATOR = /^[A-Z\d\*]{2}$/i;
    const DATE_VALIDATOR = /^\d{4}(?:\-\d{2}){2}$/;
    const TIME_VALIDATOR = /^\d{2}:\d{2}$/;
    const FLIGHT_UUID_VALIDATOR = /^([A-Z\d\*]{3})([A-Z\d\*]{3})(\d{8})([A-Z\d\*]{2})(\d+)$/;

    const params = this.activeRoute.snapshot.queryParams;
    const childParams = this.activeRoute.snapshot.firstChild.params;

    if (FLIGHT_UUID_VALIDATOR.test(childParams.flightId)) {
      const parsedUuid = FLIGHT_UUID_VALIDATOR.exec(childParams.flightId);

      this.setDepartureAirport(parsedUuid[1].toUpperCase());
      this.setArrivalAirport(parsedUuid[2].toUpperCase());
      this.setAirline(parsedUuid[4].toUpperCase());
      this.$departureDate = new moment(parsedUuid[3], 'YYYYMMDD').toDate();

    } else {

      if (AIRPORT_VALIDATOR.test(params.from)) {
        this.setDepartureAirport(params.from.toUpperCase());
      }
      if (AIRPORT_VALIDATOR.test(params.to)) {
        this.setArrivalAirport(params.to.toUpperCase());
      }
      if (AIRLINE_VALIDATOR.test(params.by)) {
        this.setAirline(params.by.toUpperCase());
      }
      if (DATE_VALIDATOR.test(params.date) && moment(params.date, 'YYYY-MM-DD').isValid()) {
        this.$departureDate = new moment(params.date, 'YYYY-MM-DD').toDate();
      }
      if (TIME_VALIDATOR.test(params.time) && moment(params.time, 'HH:mm').isValid()) {
        this.$departureTime = new moment(params.time, 'HH:mm').toDate();
      }

    }
  }

}
