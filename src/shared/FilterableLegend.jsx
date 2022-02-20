import {Legend} from "@devexpress/dx-react-chart-material-ui";
import React from "react";

function FilterableLegend(props) {
    const filterItems = props.filterItems ?? [];
    const RawItemComponent = props.itemComponent ?? ((props) => (<Legend.Item {...props}/>))

    function FilteredItemComponent(props) {
        const isVisible = !filterItems.includes(props.children[1]?.props.text);
        return (
            isVisible ? (<RawItemComponent {...props}/>) : null
        );
    }

    return (
        <Legend {...props} itemComponent={FilteredItemComponent}/>
    )
}

export default FilterableLegend;
