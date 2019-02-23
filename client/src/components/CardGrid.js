import React from "react";
import classNames from "classnames";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import CardActions from "@material-ui/core/CardActions";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
  layout: {
    width: "auto",
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(1100 + theme.spacing.unit * 3 * 2)]: {
      width: 1100,
      marginLeft: "auto",
      marginRight: "auto"
    }
  },
  cardGrid: {
    padding: `${theme.spacing.unit * 8}px 0`
  },
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column"
  },
  cardMedia: {
    paddingTop: "56.25%" // 16:9
  },
  cardContent: {
    flexGrow: 1
  }
});

const CardGrid = ({ cards, user, onDownloadImage, onSeeUsage, classes }) => (
  <div className={classNames(classes.layout, classes.cardGrid)}>
    <Grid container spacing={40}>
      {cards.map(card => (
        <Grid item key={card.id} sm={6} md={4} lg={3}>
          <Card className={classes.card}>
            <CardMedia
              className={classes.cardMedia}
              image={card.url}
              title={card.name}
            />
            <CardContent className={classes.cardContent}>
              <Typography gutterBottom variant="h5" component="h2">
                {card.name}
              </Typography>
              <Typography>Uploaded on: {card.date}</Typography>
            </CardContent>
            {user && card.owner != user.uid && (
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => onDownloadImage(card)}
                >
                  Use image
                </Button>
              </CardActions>
            )}
            {user && card.owner == user.uid && (
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => onSeeUsage(card.id)}
                >
                  See usage
                </Button>
              </CardActions>
            )}
          </Card>
        </Grid>
      ))}
    </Grid>
  </div>
);

export default withStyles(styles)(CardGrid);
