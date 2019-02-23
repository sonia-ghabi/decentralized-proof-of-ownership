import React from "react";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";
import download from "downloadjs";
import firebase from "firebase";
import UploadModal from "../components/UploadModal";
import Header from "../components/Header";
import CardGrid from "../components/CardGrid";
import UsageList from "./UsageList";
import Database from "../lib/databaseHelper";
import { getUsageRights } from "../lib/apiHelper";

const styles = theme => ({
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
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing.unit * 6
  },
  grow: {
    flexGrow: 1
  }
});

class Album extends React.Component {
  /**
   * Constructor.
   * @param {*} props
   */
  constructor(props) {
    super(props);

    // Bind 'this' to be able to reuse it the function itself
    this.searchPictures = this.searchPictures.bind(this);
    this.buildCards = this.buildCards.bind(this);
    this.downloadImage = this.downloadImage.bind(this);
    this.handleUsageModalOpen = this.handleUsageModalOpen.bind(this);
    this.handleUsageModalClose = this.handleUsageModalClose.bind(this);
    this.loadMyAlbum = this.loadMyAlbum.bind(this);

    // Initialize state
    this.state = {
      cards: [],

      user: null,
      openUsageDialog: false,
      cardUsers: []
    };

    // Handle sign in/out
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({ user });
        this.loadMyAlbum();
      } else {
        this.setState({ user: null, cards: [], searchValue: "" });
      }
    });
  }

  /**
   * Load the album.
   */
  async loadMyAlbum() {
    // Get the proofs from the database
    const res = await Database.readWithFilter(
      "proof",
      "owner",
      "==",
      this.state.user.uid
    );
    this.buildCards(res);
  }

  /**
   * Search pictures in the global repository
   */
  async searchPictures(searchValue) {
    if (!searchValue) {
      this.loadMyAlbum();
      return;
    }
    const res = await Database.readWithFilter(
      "proof",
      "fileName",
      "==",
      searchValue
    );
    this.buildCards(res);
  }

  /**
   * Build the picture card.
   * @param {*} result
   */
  buildCards(result) {
    const cards = Object.entries(result).map(([id, data]) => {
      return {
        id: id,
        url: process.env.REACT_APP_IPFS_URL + data.ipfsHash,
        name: data.fileName,
        date: new Date(data.date).toLocaleString(),
        owner: data.owner,
        originalFileName: data.originalFileName
      };
    });
    this.setState({ cards });
  }

  /**
   * Download the file from the corresponding card.
   * @param {*} card
   */
  async downloadImage(card) {
    const idToken = await this.state.user.getIdToken(true /*force refresh*/);
    const res = await getUsageRights(card, idToken);
    if (res.status == 200) {
      const blob = await res.blob();
      download(blob, card.originalFileName);
    }
  }

  /**
   * Execute when the modal is open.
   */
  async handleUsageModalOpen(cardId) {
    // Reload the users list
    const res = await Database.readData("proof", cardId);
    this.setState({
      openUsageDialog: true,
      cardUsers: res.users
    });
  }

  /**
   * Execute when the modal is open.
   */
  handleUsageModalClose = () => {
    this.setState({
      openUsageDialog: false
    });
  };

  /**
   * Handles state change.
   */
  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  /**
   * Render the page.
   */
  render() {
    const props = this.props;
    const { classes } = props;

    return (
      <React.Fragment>
        <Header
          onSearch={this.searchPictures}
          disabled={this.state.user == null}
        />
        <main>
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
                    <UploadModal
                      onClose={this.loadMyAlbum}
                      disabled={this.state.user == null}
                    />
                  </Grid>
                </Grid>
              </div>
            </div>
          </div>
          <CardGrid
            user={this.state.user}
            cards={this.state.cards}
            onDownloadImage={this.downloadImage}
            onSeeUsage={this.handleUsageModalOpen}
          />
        </main>
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
        <UsageList
          handleClose={this.handleUsageModalClose}
          open={this.state.openUsageDialog}
          users={this.state.cardUsers}
        />
      </React.Fragment>
    );
  }
}

Album.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Album);
