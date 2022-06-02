import {useTheme} from "@mui/material";
import {ColoredButton} from "../../shared/ColoredButton";

export function BunProPendingReviews({count}: {count: number}) {
    const theme = useTheme();
    const color = count === 0 ? '#c4c4c4' : theme.palette.primary.main

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
