import React from "react";

const styles = {
    labelContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '10px'
    },
    label: {
        fontSize: 'large'
    }
};

type Props = {
    title: string,
    value: string | number
};

function ToolTipLabel({title, value}: Props) {
    return (
        <div style={styles.labelContainer}>
            <div style={styles.label}>{title}</div>
            <div style={styles.label}>{value}</div>
        </div>
    );
}

export default ToolTipLabel;
