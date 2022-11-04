import {ColoredButton} from "../../shared/ColoredButton";
import {BUNPRO_COLORS} from "../../Constants";

export function BunProPendingReviews({count}: {count: number}) {
    const color = count === 0 ? '#c4c4c4' : BUNPRO_COLORS.blue

    return (
        <ColoredButton variant={'contained'}
                       color={color}
                       onClick={() => window.open("https://www.bunpro.jp/study", "_blank")}
        >
            Reviews: {count}
        </ColoredButton>
    );
}

export default BunProPendingReviews;
