import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import CameraIcon from "@material-ui/icons/PhotoCamera";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";
import { load } from "./lib/upload";

import UploadModal from "./UploadModal";

const styles = theme => ({
  appBar: {
    position: "relative"
  },
  icon: {
    marginRight: theme.spacing.unit * 2
  },
  heroUnit: {
    backgroundColor: theme.palette.background.paper
  },
  heroContent: {
    maxWidth: 600,
    margin: "0 auto",
    padding: `${theme.spacing.unit * 8}px 0 ${theme.spacing.unit * 6}px`
  },
  heroButtons: {
    marginTop: theme.spacing.unit * 4
  },
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
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing.unit * 6
  },
  fileInput: {
    display: "none"
  }
});

ui.start("#firebaseui-auth-container", {
  signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID]
  // Other config options...
});

class Album extends React.Component {
  /**
   * Constructor.
   * @param {*} props
   */
  constructor(props) {
    super(props);

    // ...
    this.fileInput = React.createRef();

    // Bind 'this' to be able to reuse it the function itself
    this.handleUploadModalOpen = this.handleUploadModalOpen.bind(this);
    this.handleUploadModalClose = this.handleUploadModalClose.bind(this);

    // Initialize state
    this.state = {
      openUploadDialog: false,
      files: null,
      cards: []
    };
  }

  async componentDidMount() {
    // Load the album
    this.loadAlbum();
  }

  /**
   * Load the album.
   */
  async loadAlbum() {
    const albumData = await load();
    let imgs = [];
    albumData.res.forEach(function(albumImage) {
      imgs.push({
        id: albumImage.id,
        url: "http://localhost:8080/ipfs/" + albumImage.id,
        name: albumImage.name,
        date: albumImage.date
      });
    });
    this.setState({ cards: imgs });
  }

  /**
   * Execute when the modal is open.
   */
  handleUploadModalOpen = () => {
    this.setState({
      openUploadDialog: true,
      files: this.fileInput.current.files
    });
  };

  /**
   * Execute when the modal is closed.
   */
  handleUploadModalClose = () => {
    // Update the state
    this.setState({
      openUploadDialog: false,
      files: null
    });
    this.fileInput.current.value = "";

    // Reload the album when the modal is closed
    this.loadAlbum();
  };

  /**
   * Render the page.
   */
  render() {
    const props = this.props;
    const { classes } = props;

    return (
      <React.Fragment>
        <CssBaseline />
        <AppBar position="static" className={classes.appBar}>
          <Toolbar>
            <CameraIcon className={classes.icon} />
            <Typography variant="h6" color="inherit" noWrap>
              Proof of Ownership
            </Typography>
          </Toolbar>
        </AppBar>
        <main>
          {/* Hero unit */}
          <div className={classes.heroUnit}>
            <div className={classes.heroContent}>
              <Typography
                component="h1"
                variant="h2"
                align="center"
                color="textPrimary"
                gutterBottom
              >
                Proof of Ownership
              </Typography>
              <Typography
                variant="h6"
                align="center"
                color="textSecondary"
                paragraph
              >
                The blockchain enabled photo album storage app.
              </Typography>
              <div className={classes.heroButtons}>
                <Grid container spacing={16} justify="center">
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={e => this.fileInput.current.click()}
                    >
                      Upload your picture
                    </Button>
                    <input
                      className={classes.fileInput}
                      type="file"
                      id="fileSelector"
                      accept="images/*"
                      ref={this.fileInput}
                      onChange={this.handleUploadModalOpen}
                    />
                  </Grid>
                </Grid>
              </div>
            </div>
          </div>
          <div className={classNames(classes.layout, classes.cardGrid)}>
            {/* End hero unit */}
            <Grid container spacing={40}>
              {this.state.cards.map(card => (
                <Grid item key={card.id} sm={6} md={4} lg={3}>
                  <Card className={classes.card}>
                    <CardMedia
                      className={classes.cardMedia}
                      image={card.url} // eslint-disable-line max-len
                      title={card.name}
                    />
                    <CardContent className={classes.cardContent}>
                      <Typography gutterBottom variant="h5" component="h2">
                        {card.name}
                      </Typography>
                      <Typography>Uploaded on: {card.date}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </div>
        </main>
        {/* Footer */}
        <footer className={classes.footer}>
          <Typography variant="h6" align="center" gutterBottom>
            Wesh
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            color="textSecondary"
            component="p"
          >
            Thanks for using our app :)
          </Typography>
        </footer>
        {/* End footer */}
        <UploadModal
          handleClose={this.handleUploadModalClose}
          open={this.state.openUploadDialog}
          files={this.state.files}
        />
      </React.Fragment>
    );
  }
}

Album.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Album);
