import React from "react";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import firebase from "firebase";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import firebaseui from "firebaseui";
import { generateKeys } from "../lib/apiHelper";

const styles = theme => ({
  overlay: {
    position: "absolute",
    display: "flex",
    width: "100vw",
    height: "100vh",
    top: "0",
    left: "0",
    justifyContent: "center",
    alignItems: "center",
    zIndex: "99999",
    background: "rgba(0,0,0,0.5)"
  }
});

class SignIn extends React.Component {
  constructor(props) {
    super(props);

    // Configure FirebaseUI.
    this.uiConfig = {
      signInFlow: "popup",
      signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
      callbacks: {
        signInSuccessWithAuthResult: authResult =>
          this.signInSuccess(authResult.additionalUserInfo.isNewUser)
      },
      credentialHelper: firebaseui.auth.CredentialHelper.NONE
    };

    this.state = {
      openSignIn: false
    };

    this.overlay = React.createRef();

    this.signInClick = this.signInClick.bind(this);
    this.signInSuccess = this.signInSuccess.bind(this);
    this.signOut = this.signOut.bind(this);
    this.signInCancel = this.signInCancel.bind(this);
  }

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
   * Action to cancel the sign in.
   */
  signInCancel(e) {
    if (e.target !== this.overlay.current) {
      return;
    }
    // Update the state
    this.setState({
      openSignIn: false
    });
  }

  /**
   * Action on close of the sign in pop up.
   */
  async signInSuccess(isNewUser) {
    // Update the state
    this.setState({
      openSignIn: false
    });

    const user = firebase.auth().currentUser;

    // If the user just signed up, generate the pair of keys
    const token = await user.getIdToken(true /*force refresh*/);
    if (isNewUser) {
      generateKeys(token);
    }
  }

  /**
   * Action on sign out.
   */
  async signOut() {
    await firebase.auth().signOut();
  }

  render() {
    const { classes } = this.props;

    const signButton = !firebase.auth().currentUser ? (
      <Button color="inherit" onClick={this.signInClick}>
        Sign in
      </Button>
    ) : (
      <Button color="inherit" onClick={this.signOut}>
        Sign out
      </Button>
    );

    return (
      <>
        {signButton}
        {this.state.openSignIn && (
          <div
            ref={this.overlay}
            className={classes.overlay}
            onClick={this.signInCancel}
          >
            <StyledFirebaseAuth
              uiConfig={this.uiConfig}
              firebaseAuth={firebase.auth()}
            />
          </div>
        )}
      </>
    );
  }
}

export default withStyles(styles)(SignIn);
