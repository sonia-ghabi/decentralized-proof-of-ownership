import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import { withStyles } from "@material-ui/core/styles";
import { claimOwnership, checkOwnership } from "../lib/apiHelper";
import firebase from "firebase";

const styles = theme => ({
  previewImage: {
    width: "80%"
  },
  fileInput: {
    display: "none"
  }
});

const ACTION_STATUS = {
  CHECKING: "CHECKING",
  OWNED: "OWNED",
  AVAILABLE: "AVAILABLE",
  CLAIMED: "CLAIMED",
  CLAIMING: "CLAIMING"
};

class UploadModal extends React.Component {
  /**
   * Constructor.
   * @param {*} props
   */
  constructor(props) {
    super(props);

    this.fileInput = React.createRef();

    // Bind 'this' to be able to reuse it the functions itself
    this.claim = this.claim.bind(this);
    this.check = this.check.bind(this);
    this.resetState = this.resetState.bind(this);

    // Initialize the state
    this.state = {
      actionStatus: ACTION_STATUS.CHECKING,
      pictureName: "",
      open: false,
      files: null
    };
  }

  /**
   * Execute when the modal is open.
   */
  handleOpen = () => {
    this.setState({
      open: true,
      files: this.fileInput.current.files
    });
  };

  /**
   * Execute when the modal is closed.
   */
  handleClose = () => {
    // Update the state
    this.setState({
      open: false,
      files: null
    });
    this.fileInput.current.value = "";

    // Call the external onClose handler
    this.props.onClose();
  };

  /**
   * Check if the picture is already owned by someone else.
   */
  async check() {
    if (this.state.files && this.state.files.length) {
      const result = await checkOwnership(this.state.files);
      // The picture is not owned by anyone, the user can claim the ownership
      if (result.status === 404) {
        this.setState({
          actionStatus: ACTION_STATUS.AVAILABLE
        });
      }
      // The user can't claim the ownership for the picture
      else if (result.status === 200) {
        this.setState({
          actionStatus: ACTION_STATUS.OWNED
        });
      }
    }
  }

  /**
   * Claim the ownership for the selected picture.
   */
  async claim() {
    // Update the state
    this.setState({ actionStatus: ACTION_STATUS.CLAIMING });

    // Get the user token
    const token = await firebase
      .auth()
      .currentUser.getIdToken(/* forceRefresh */ true);

    // Make the request to claim the ownership
    const result = await claimOwnership(
      this.state.files,
      this.state.pictureName,
      token
    );

    // Update the status if the request went through successfully
    if (result.status === 200)
      this.setState({ actionStatus: ACTION_STATUS.CLAIMED });
  }

  /**
   * Reset the state.
   */
  resetState() {
    this.setState({
      actionStatus: ACTION_STATUS.CHECKING,
      pictureName: ""
    });
  }

  /**
   * Render the page.
   */
  render() {
    const { classes } = this.props;

    // Get the file from the state
    const file =
      this.state.files && this.state.files.length
        ? URL.createObjectURL(this.state.files[0])
        : null;

    // Set the dialog title
    let dialogTitle;
    switch (this.state.actionStatus) {
      case ACTION_STATUS.CHECKING: {
        dialogTitle = (
          <>
            <CircularProgress id="progress" size={20} /> Checking ownership
          </>
        );
        break;
      }
      case ACTION_STATUS.OWNED: {
        dialogTitle = <>The picture is already owned</>;
        break;
      }
      case ACTION_STATUS.AVAILABLE: {
        dialogTitle = <>The picture is not owned by anyone</>;
        break;
      }
      case ACTION_STATUS.CLAIMED: {
        dialogTitle = <>You're officially the owner of this picture.</>;
        break;
      }
      default:
        dialogTitle = (
          <>
            <CircularProgress id="progress" size={20} /> Processing... Please
            wait
          </>
        );
    }

    // Disable the claim button depending on the status
    const isClaimButtonDisabled =
      !this.state.pictureName ||
      this.state.actionStatus === ACTION_STATUS.OWNED ||
      this.state.actionStatus === ACTION_STATUS.CLAIMING ||
      this.state.actionStatus === ACTION_STATUS.CLAIMED;

    // Disable the text field depending on the status
    const isTextFieldDisabled =
      this.state.actionStatus != ACTION_STATUS.AVAILABLE;

    return (
      <>
        <Button
          variant="contained"
          color="primary"
          onClick={() => this.fileInput.current.click()}
          disabled={this.props.disabled}
        >
          Upload your picture
        </Button>
        <input
          className={classes.fileInput}
          type="file"
          id="fileSelector"
          accept="images/*"
          ref={this.fileInput}
          onChange={this.handleOpen}
        />

        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          onExit={this.resetState}
          onRendered={this.check}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">{dialogTitle}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Enter a name to proceed"
              type="text"
              value={this.state.pictureName}
              onChange={e => this.setState({ pictureName: e.target.value })}
              fullWidth
              disabled={isTextFieldDisabled}
            />
            <img src={file} className={classes.previewImage} />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
            <Button
              onClick={this.claim}
              color="primary"
              disabled={isClaimButtonDisabled}
            >
              Claim ownership
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

export default withStyles(styles)(UploadModal);

/*
handleClose={this.handleUploadModalClose}
open={this.state.open}
files={this.state.files}
*/
