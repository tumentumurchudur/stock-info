import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import moment from 'moment';
import { Styles } from 'mx-react-components';

// material-ui
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

// fetch
import axios from 'axios';

// custom
import StockBasicInfo from './components/StockBasicInfo';
import StockHistoryChart from './components/StockHistoryChart';

injectTapEventPlugin();

class App extends Component {
  constructor() {
    super();

    this.state = {
      data: null,
      chartData: null,
      chartDateRange: [],
      stockSymbol: '',
      apiErrorMsg: ''
    };

    this._handleGetDate = this._handleGetDate.bind(this);
    this._handleStockInputChange = this._handleStockInputChange.bind(this);
    this._handleKeyPress = this._handleKeyPress.bind(this);
    this._handleChartData = this._handleChartData.bind(this);
  }

  _handleChartData() {
    const { stockSymbol } = this.state;
    const startDate = moment().add(-180, 'd').format('YYYY-MM-DD');
    const endDate = moment().format('YYYY-MM-DD');

    if (stockSymbol) {
      const api = `
        http://query.yahooapis.com/v1/public/yql?q=
        select * from   yahoo.finance.historicaldata
                where  symbol    = "${stockSymbol}"
                and    startDate = "${startDate}"
                and    endDate   = "${endDate}"
        &format=json
        &diagnostics=true
        &env=store://datatables.org/alltableswithkeys
    `;

      axios.get(api)
      .then(res => {
        let data = res.data.query.results.quote;

        if (data && data.length) {
          data.sort(this._compare); // TODO: use lodash instead

          const chartData = data.map(point => {
            return {
              color: Styles.Colors.FOG,
              label: '',
              value: point.Adj_Close
            };
          });

          this.setState({
            chartData,
            chartDateRange: [
              moment(startDate).format('MMM YYYY'),
              moment(endDate).format('MMM YYYY')
            ],
            apiErrorMsg: ''
          });
        }
      })
      .catch(() => {
        this.setState({
          data: null,
          chartData: null,
          chartDateRange: [],
          apiErrorMsg: stockSymbol +  ' not found!'
        });
      });
    }
  }

  _compare(a,b) {
    if (a.Date < b.Date)
      return -1;
    if (a.Date > b.Date)
      return 1;
    return 0;
  }

  _handleGetDate() {
    const { stockSymbol } = this.state;
    const api = `
      http://query.yahooapis.com/v1/public/yql?q=select * from yahoo.finance.quotes
      where symbol in ('${stockSymbol}')
      order byMarketCapitalization&format=json&env=http://datatables.org/alltables.env
    `;

    if (stockSymbol) {
      axios.get(api)
      .then(res => {
        if (res) {
          const data = res.data.query.results.quote;

          this.setState({data});
        }
      })
      .catch(err => {
        console.log('error has occured =>', err);
      });
    }
  }

  _handleKeyPress(e) {
    if (e.key === 'Enter') {
      this._handleChartData();
      this._handleGetDate();
    }
  }

  _handleStockInputChange(e) {
    this.setState({
      stockSymbol: e.target.value
    });
  }

  render() {
    const { chartData } = this.state;

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Stock Quote</h2>
        </div>
        <MuiThemeProvider>
          <TextField
            hintText="Enter Stock Symbol"
            onChange={this._handleStockInputChange}
            onKeyPress={this._handleKeyPress}
            value={this.state.stockSymbol}
          />
        </MuiThemeProvider>
        <br/>
        <MuiThemeProvider>
          <RaisedButton label="Get Data" onClick={this._handleGetDate} />
        </MuiThemeProvider>

        <div style={{ margin: 10, color: Styles.Colors.STRAWBERRY }}>
          {this.state.apiErrorMsg}
        </div>

        {this.state && this.state.data && this.state.chartData ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 20, margin: 10, border: '1px solid black' }}>
            <StockBasicInfo data={this.state.data} />
            <StockHistoryChart
              data={this.state.chartData}
              dateRange={this.state.chartDateRange}
              style={{ alignSelf: 'center' }}
            />
          </div>
        ) : null}
      </div>
    );
  }
}

export default App;
