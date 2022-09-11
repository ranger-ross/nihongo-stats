import {Card, CardContent} from "@mui/material";
import {ReactNode} from "react";

type SimpleCardProps = {
    children: ReactNode
    title?: string
}

/**
 * A simple wrapper for the MUI Card.
 */
export function SimpleCard({children, title}: SimpleCardProps) {
    return (
        <Card title={title}>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    );
}
