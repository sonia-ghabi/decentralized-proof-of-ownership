import React, { Component } from "react";
import InputBase from "@material-ui/core/InputBase";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import CssBaseline from "@material-ui/core/CssBaseline";
import CameraIcon from "@material-ui/icons/PhotoCamera";
import SearchIcon from "@material-ui/icons/Search";
import AppBar from "@material-ui/core/AppBar";
import { withStyles } from "@material-ui/core/styles";
import { fade } from "@material-ui/core/styles/colorManipulator";
import SignIn from "./SignIn";

const styles = theme => ({
  appBar: {
    //position: "relative"
  },
  toolbar: {
    position: "static"
  },
  icon: {
    marginRight: theme.spacing.unit * 2
  },
  grow: {
    flexGrow: 1
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25)
    },
    marginRight: theme.spacing.unit * 2,
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing.unit * 3,
      width: "auto"
    }
  },
  searchIcon: {
    width: theme.spacing.unit * 9,
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  inputRoot: {
    color: "inherit",
    width: "100%"
  },
  inputInput: {
    paddingTop: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit * 10,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: 200
    }
  }
});

class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchValue: ""
    };
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  render() {
    const { classes } = this.props;

    return (
      <>
        <CssBaseline />
        <AppBar position="static" className={classes.appBar}>
          <Toolbar className={classes.toolbar}>
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
                disabled={this.props.disabled}
                value={this.state.searchValue}
                onChange={this.handleChange("searchValue")}
                onKeyPress={ev => {
                  if (ev.key === "Enter") {
                    this.props.onSearch(this.state.searchValue);
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
            <SignIn />
          </Toolbar>
        </AppBar>
      </>
    );
  }
}

export default withStyles(styles)(Header);
