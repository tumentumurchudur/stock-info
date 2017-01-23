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
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

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
      chartSelectedRange: -7,
      stockSymbol: '',
      apiErrorMsg: ''
    };

    this._handleGetDate = this._handleGetDate.bind(this);
    this._handleStockInputChange = this._handleStockInputChange.bind(this);
    this._handleKeyPress = this._handleKeyPress.bind(this);
    this._handleChartData = this._handleChartData.bind(this);
  }

  _handleChartData(value = -7) {
    const { stockSymbol, chartOptions } = this.state;
    const startDate = moment().add(value, 'd').format('YYYY-MM-DD')
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
            apiErrorMsg: '',
            chartSelectedRange: value
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
    const { chartData, chartDateRange, chartSelectedRange, data } = this.state;

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

        {this.state && data && chartData ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 20, margin: 10, border: '1px solid black' }}>
            <StockBasicInfo data={data} />
            <StockHistoryChart
              data={chartData}
              dateRange={chartDateRange}
              style={{ alignSelf: 'center' }}
            />
            <MuiThemeProvider>
              <SelectField
                floatingLabelText="Select Period:"
                value={chartSelectedRange}
                onChange={(event, index, value) => {
                  this._handleChartData(value);
                }}
              >
                <MenuItem value={-7} primaryText="Last Week" />
                <MenuItem value={-30} primaryText="Last Month" />
                <MenuItem value={-90} primaryText="Last 3 months" />
                <MenuItem value={-180} primaryText="Last 6 months" />
                <MenuItem value={-365} primaryText="Last Year" />
              </SelectField>
            </MuiThemeProvider>
          </div>
        ) : null}
      </div>
    );
  }
}

export default App;
