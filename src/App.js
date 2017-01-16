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
      chartData: [],
      chartDateRange: [],
      stockSymbol: ''
    };

    this._handleGetDate = this._handleGetDate.bind(this);
    this._handleStockInputChange = this._handleStockInputChange.bind(this);
    this._handleKeyPress = this._handleKeyPress.bind(this);
    this._handleChartData = this._handleChartData.bind(this);
  }

  _handleChartData() {
    const { stockSymbol } = this.state;
    const startDate = moment().add(-120, 'd').format('YYYY-MM-DD');
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
      &callback=
    `;

      axios.get(api)
      .then(res => {
        console.log('chart data=>', res.data.query.results.quote);
        let data = res.data.query.results.quote;
        data.sort(this._compare);

        const chartData = data.map((point) => {
          return {
            color: Styles.Colors.FOG,
            label: '',
            value: point.Adj_Close
          };
        });

        this.setState({
          chartData,
          chartDateRange: [startDate, endDate]
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
        console.log('got=>', res);

        this.setState({data: res.data.query.results.quote});
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
          <h2>Stock info</h2>
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

        {this.state && this.state.data ? (
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
