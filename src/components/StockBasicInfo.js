import React from 'react';
import { Styles } from 'mx-react-components';

const fields = [
    { title: 'Name:', name: 'Name' },
    { title: 'Ask:', name: 'Ask' },
    { title: 'Days Range:', name: 'DaysRange' },
    { title: 'Dividend Yield:', name: 'DividendYield' },
    { title: 'Year High:', name: 'YearHigh' },
    { title: 'Year Low:', name: 'YearLow' },
    { title: 'Change:', name: 'Change'}
];

const styles = {
    component: {
        border: '1px solid ' + Styles.Colors.ASH,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        margin: 10
    },
    row: {
        display: 'flex',
        padding: 5
    },
    title: {
        fontFamily: Styles.Fonts.REGULAR,
        fontSize: Styles.FontSizes.MEDIUM,
        color: Styles.Colors.ASH,
        textAlign: 'left',
        width: 120
    },
    value: {
        fontFamily: Styles.Fonts.SEMIBOLD,
        fontSize: Styles.FontSizes.LARGE,
        color: Styles.Colors.CHARCOAL
    }
};

const upSrc = 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Green_Arrow_Up_Darker.svg';
const downSrc = 'https://upload.wikimedia.org/wikipedia/commons/0/04/Red_Arrow_Down.svg';

const StockBasicInfo = ({ data }) => (
    <div style={styles.component}>
        {fields.map((field, index) => {
            return (
                <div key={index} style={styles.row}>
                    <span style={styles.title}>{field.title}</span>
                    <span style={styles.value}>{data[field.name] || 'N/A'}</span>
                    {field.name === 'Change' ? (
                        <img
                            style={{ width: 15, height: 15, marginLeft: 5 }}
                            src={data[field.name].charAt(0) === '+' ? upSrc : downSrc}
                        />
                    ) : null}
                </div>
            )
        })}
    </div>
);

StockBasicInfo.propTypes = {
    data: React.PropTypes.object.isRequired
};

export default StockBasicInfo;