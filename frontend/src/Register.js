import React, { Component } from "react";
import swal from "sweetalert";
import { Button, TextField, Link } from "@material-ui/core";
import { withRouter } from "./utils";
const axios = require("axios");

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      email: '',
      password: '',
      confirm_password: '',
      emailError: ''
    };
  }

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.state.email)) {
      this.setState({ emailError: 'Invalid email format' });
      return false;
    }
    this.setState({ emailError: '' });
    return true;
  };

  register = () => {
    if (!this.validateEmail()) {
      swal({
        text: "Please enter a valid email address.",
        icon: "error",
        type: "error"
      });
      return;
    }

    if (this.state.password !== this.state.confirm_password) {
      swal({
        text: "Passwords do not match!",
        icon: "error",
        type: "error"
      });
      return;
    }

    axios.post('http://localhost:2000/register', {
      username: this.state.username,
      email: this.state.email,
      password: this.state.password,
    }).then((res) => {
      swal({
        text: res.data.title,
        icon: "success",
        type: "success"
      });
      this.props.navigate("/");
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
    });
  }

  render() {
    return (
      <div style={{ marginTop: '200px' }}>
        <div>
          <h2>Register</h2>
        </div>

        <div>
          <TextField
            id="standard-basic"
            type="text"
            autoComplete="off"
            name="username"
            value={this.state.username}
            onChange={this.onChange}
            placeholder="User Name"
            required
          />
          <br /><br />
          <TextField
            id="standard-basic"
            type="email"
            autoComplete="off"
            name="email"
            value={this.state.email}
            onChange={this.onChange}
            onBlur={this.validateEmail}
            placeholder="Email"
            required
          />
          {this.state.emailError && (
            <div style={{ color: 'red', fontSize: '12px' }}>{this.state.emailError}</div>
          )}
          <br /><br />
          <TextField
            id="standard-basic"
            type="password"
            autoComplete="off"
            name="password"
            value={this.state.password}
            onChange={this.onChange}
            placeholder="Password"
            required
          />
          <br /><br />
          <TextField
            id="standard-basic"
            type="password"
            autoComplete="off"
            name="confirm_password"
            value={this.state.confirm_password}
            onChange={this.onChange}
            placeholder="Confirm Password"
            required
          />
          <br /><br />
          <Button
            className="button_style"
            variant="contained"
            color="primary"
            size="small"
            disabled={this.state.username === '' || this.state.password === '' || this.state.email === ''}
            onClick={this.register}
          >
            Register
          </Button> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <Link
            component="button"
            style={{ fontFamily: "inherit", fontSize: "inherit" }}
            onClick={() => {
              this.props.navigate("/");
            }}
          >
            Login
          </Link>
        </div>
      </div>
    );
  }
}

export default withRouter(Register);
