import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import CameraIcon from "@material-ui/icons/PhotoCamera";
import SearchIcon from "@material-ui/icons/Search";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import { withStyles } from "@material-ui/core/styles";
import InputBase from "@material-ui/core/InputBase";

import download from "downloadjs";
import firebase from "firebase";

import UploadModal from "./UploadModal";
import SignIn from "./SignIn";

import Database from "../lib/databaseHelper";
import { generateKeys, getUsageRights } from "../lib/apiHelper";
import styles from "./style/Album.style.js";

class Album extends React.Component {
  /**
   * Constructor.
   * @param {*} props
   */
  constructor(props) {
    super(props);

    // ...
    this.fileInput = React.createRef();
    this.auth = firebase.auth();

    // Bind 'this' to be able to reuse it the function itself
    this.handleUploadModalOpen = this.handleUploadModalOpen.bind(this);
    this.handleUploadModalClose = this.handleUploadModalClose.bind(this);
    this.signInClick = this.signInClick.bind(this);
    this.signInClose = this.signInClose.bind(this);
    this.signOut = this.signOut.bind(this);
    this.searchPictures = this.searchPictures.bind(this);
    this.buildCards = this.buildCards.bind(this);
    this.downloadImage = this.downloadImage.bind(this);

    // Initialize state
    this.state = {
      openUploadDialog: false,
      files: null,
      cards: [],
      openSignIn: false,
      user: null,
      searchValue: ""
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
    this.loadMyAlbum();
  };

  /**
   * Action on click of the sign in button.
   */
  signInClick() {
    // Update the state
    this.setState({
      openSignIn: true
    });
  }

  /**
   * Action on close of the sign in pop up.
   */
  async signInClose(isNewUser) {
    // Update the state
    this.setState({
      openSignIn: false,
      user: this.auth.currentUser
    });

    // If the user just signed up, generate the pair of keys
    const token = await this.state.user.getIdToken(true /*force refresh*/);
    if (isNewUser) generateKeys(token);

    // Load the album
    this.loadMyAlbum();
  }

  /**
   * Action on sign out.
   */
  async signOut() {
    await this.auth.signOut();
  }

  /**
   * Search pictures in the global repository
   */
  async searchPictures() {
    const res = await Database.readWithFilter(
      "proof",
      "fileName",
      "==",
      this.state.searchValue
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
        url: "http://localhost:8080/ipfs/" + data.ipfsHash,
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
      console.log(blob.type);
      download(blob, card.originalFileName);
    }
  }

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

    const signIn = this.state.openSignIn ? (
      <SignIn signInSuccess={this.signInClose} />
    ) : null;
    const signButton = !this.state.user ? (
      <Button color="inherit" onClick={this.signInClick}>
        Sign in
      </Button>
    ) : (
      <Button color="inherit" onClick={this.signOut}>
        Sign out
      </Button>
    );

    return (
      <React.Fragment>
        <CssBaseline />
        {signIn}
        <AppBar position="static" className={classes.appBar}>
          <Toolbar>
            <CameraIcon className={classes.icon} />
            <Typography
              className={classes.grow}
              variant="h6"
              color="inherit"
              noWrap
            >
              Proof of Ownership
            </Typography>
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                disabled={this.state.user == null}
                value={this.state.searchValue}
                onChange={this.handleChange("searchValue")}
                onKeyPress={ev => {
                  if (ev.key === "Enter") {
                    this.searchPictures();
                    ev.preventDefault();
                  }
                }}
                placeholder="Search in the global repo"
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput
                }}
              />
            </div>
            {signButton}
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
                      onClick={() => this.fileInput.current.click()}
                      disabled={this.state.user == null}
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
                      image={card.url}
                      title={card.name}
                    />
                    <CardContent className={classes.cardContent}>
                      <Typography gutterBottom variant="h5" component="h2">
                        {card.name}
                      </Typography>
                      <Typography>Uploaded on: {card.date}</Typography>
                    </CardContent>
                    {this.state.user && card.owner != this.state.user.uid && (
                      <CardActions>
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => this.downloadImage(card)}
                        >
                          Use image
                        </Button>
                      </CardActions>
                    )}
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
