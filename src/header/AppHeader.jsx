import { Grid, Typography } from "@material-ui/core";
import { useTheme } from "styled-components";


function AppHeader() {
    const theme = useTheme();
    return (
        <Grid container  style={{background: theme.palette.background.paper}}>
              <Grid item>
                  <Typography variant={'h4'} color={'textPrimary'}  style={{margin: '5px'}}>
                      Nihongo Stats
                  </Typography>
            
            </Grid>
        </Grid>
    );
}

export default AppHeader;