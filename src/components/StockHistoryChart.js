import React from 'react';
import { BarChart } from 'mx-react-components';

const styles = {
    component: {
        display: 'block'
    }
};

const StockHistoryChart = ({ data, style }) => (
    <div style={Object.assign(styles.component, style)}>
        <BarChart data={data} height={150} width={380} />
    </div>
);

StockHistoryChart.propTypes = {
    data: React.PropTypes.array,
    style: React.PropTypes.object
};

export default StockHistoryChart;