import {Button} from "@mui/material";

export function BunProPendingReviews({count}) {
    return (
        <Button variant="contained"
                onClick={() => window.open("https://www.bunpro.jp/study", "_blank")}
        >
            Reviews: {count}
        </Button>
    );
}

export default BunProPendingReviews;