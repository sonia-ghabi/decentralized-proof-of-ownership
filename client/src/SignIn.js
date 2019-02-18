import React from "react";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import firebase from "firebase";
import { withStyles } from "@material-ui/core/styles";
import firebaseui from "firebaseui";

const styles = theme => ({
  overlay: {
    position: "absolute",
    display: "flex",
    width: "100vw",
    height: "100vh",
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
      // Popup signin flow rather than redirect flow.
      signInFlow: "popup",
      // We will display Google and Facebook as auth providers.
      signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
      callbacks: {
        signInSuccess() {
          props.signInSuccess();
        }
      },
      credentialHelper: firebaseui.auth.CredentialHelper.NONE
    };
  }

  render() {
    const props = this.props;
    const { classes } = props;
    return (
      <div className={classes.overlay}>
        <StyledFirebaseAuth
          uiConfig={this.uiConfig}
          firebaseAuth={firebase.auth()}
        />
      </div>
    );
  }
}

export default withStyles(styles)(SignIn);
