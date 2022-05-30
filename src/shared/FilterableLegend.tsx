import {Legend, LegendProps} from "@devexpress/dx-react-chart-material-ui";

type Props = {
    filterItems: string[],
} & LegendProps;

function FilterableLegend(props: Props) {
    const filterItems = props.filterItems ?? [];
    const RawItemComponent = props.itemComponent ?? ((props) => (<Legend.Item {...props}/>))

    function FilteredItemComponent(props: JSX.IntrinsicAttributes & Legend.ItemProps) {
        // @ts-ignore
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
