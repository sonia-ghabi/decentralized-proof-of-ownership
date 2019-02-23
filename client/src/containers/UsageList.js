import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";

const styles = theme => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper
  }
});

class UsageList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;

    // Initialize the list
    let list;
    if (this.props.users) {
      list = this.props.users.map(element => (
        <ListItem button key={element}>
          <ListItemText primary={element} />
        </ListItem>
      ));
    } else {
      list = (
        <ListItem button key="noUsers">
          <ListItemText primary="Nobody acquired use rights for this picture yet." />
        </ListItem>
      );
    }

    return (
      <div className={classes.root}>
        <Dialog
          open={this.props.open}
          onClose={this.props.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">
            Id of the users that acquire rights for the image.
          </DialogTitle>
          <List component="nav">{list}</List>
        </Dialog>
      </div>
    );
  }
}

UsageList.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(UsageList);
