import React, { Component } from 'react';
import {
  Button, TextField, Dialog, DialogActions, LinearProgress,
  DialogTitle, DialogContent, TableBody, Table,
  TableContainer, TableHead, TableRow, TableCell
} from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import swal from 'sweetalert';
import { withRouter } from './utils';
const axios = require('axios');

class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
      token: '',
      openCourseModal: false,
      openCourseEditModal: false,
      id: '',
      name: '',
      desc: '',
      instructor: '',
      page: 1,
      search: '',
      courses: [
        {
          _id: "1",
          name: "Introduction to Programming",
          desc: "Learn the basics of programming.",
          instructor: "John Doe"
        },
        {
          _id: "2",
          name: "Advanced JavaScript",
          desc: "Deep dive into JavaScript concepts.",
          instructor: "Jane Smith"
        },
        {
          _id: "3",
          name: "Web Development",
          desc: "Build modern web applications.",
          instructor: "Alice Johnson"
        }
      ],
      pages: 0,
      loading: false
    };
  }

  componentDidMount = () => {
    let token = localStorage.getItem('token');
    if (!token) {
      this.props.navigate("/login");
    } else {
      this.setState({ token: token }, () => {
        this.getCourses();
      });
    }
  }

  getCourses = () => {
    this.setState({ loading: true });

    let data = `?page=${this.state.page}`;
    if (this.state.search) {
      data = `${data}&search=${this.state.search}`;
    }

    axios.get(`http://localhost:2000/get-courses${data}`, {
      headers: {
        'token': this.state.token
      }
    }).then((res) => {
      this.setState({ loading: false, courses: res.data.courses, pages: res.data.pages });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
    });
  }

  deleteCourse = (id) => {
    axios.delete(`http://localhost:2000/delete-course/${id}`, {
      headers: {
        'token': this.state.token
      }
    }).then((res) => {
      swal({
        text: res.data.title,
        icon: "success",
        type: "success"
      });

      this.getCourses();
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
    });
  }

  pageChange = (e, page) => {
    this.setState({ page: page }, () => {
      this.getCourses();
    });
  }

  logOut = () => {
    localStorage.setItem('token', null);
    // this.props.history.push('/');
    this.props.navigate("/");
  }

  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value }, () => { });
    if (e.target.name == 'search') {
      this.setState({ page: 1 }, () => {
        this.getCourses();
      });
    }
  };

  addCourse = () => {
    const file = new FormData();
    file.append('name', this.state.name); // Course Name
    file.append('desc', this.state.desc); // Description
    file.append('instructor', this.state.instructor); // Instructor

    axios.post('http://localhost:2000/add-course', file, {
      headers: {
        'content-type': 'multipart/form-data',
        'token': this.state.token
      }
    }).then((res) => {

      swal({
        text: res.data.title,
        icon: "success",
        type: "success"
      });

      this.handleCourseClose();
      this.setState({ name: '', desc: '', instructor: '', page: 1 }, () => {
        this.getCourses();
      });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
      this.handleCourseClose();
    });

  }

  updateCourse = () => {
    const updatedCourse = {
      name: this.state.name,
      desc: this.state.desc,
      instructor: this.state.instructor
    };

    axios.put(`http://localhost:2000/update-course/${this.state.id}`, updatedCourse, {
      headers: {
        'token': this.state.token
      }
    }).then((res) => {
      swal({
        text: res.data.title,
        icon: "success",
        type: "success"
      });

      this.handleCourseEditClose();
      this.getCourses();
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
    });
  }

  handleCourseOpen = () => {
    this.setState({
      openCourseModal: true,
      id: '',
      name: '',
      desc: '',
      instructor: ''
    });
  };

  handleCourseClose = () => {
    this.setState({ openCourseModal: false });
  };

  handleCourseEditOpen = (data) => {
    this.setState({
      openCourseEditModal: true,
      id: data._id,
      name: data.name,
      desc: data.desc,
      instructor: data.instructor
    });
  };

  handleCourseEditClose = () => {
    this.setState({ openCourseEditModal: false });
  };

  render() {
    return (
      <div>
        {this.state.loading && <LinearProgress size={40} />}
        <div>
          <h2>Dashboard</h2>
          <Button
            className="button_style"
            variant="contained"
            color="primary"
            size="small"
            onClick={this.handleCourseOpen}
          >
            Add Course
          </Button>
          <Button
            className="button_style"
            variant="contained"
            size="small"
            onClick={this.logOut}
          >
            Log Out
          </Button>
        </div>

        {/* Edit Course */}
        <Dialog
          open={this.state.openCourseEditModal}
          onClose={this.handleCourseClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Edit Course</DialogTitle>
          <DialogContent>
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="name"
              value={this.state.name}
              onChange={this.onChange}
              placeholder="Course Name"
              required
            /><br />
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="desc"
              value={this.state.desc}
              onChange={this.onChange}
              placeholder="Description"
              required
            /><br />
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="instructor"
              value={this.state.instructor}
              onChange={this.onChange}
              placeholder="Instructor"
              required
            /><br /><br />
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleCourseEditClose} color="primary">
              Cancel
            </Button>
            <Button
              disabled={this.state.name == '' || this.state.desc == '' || this.state.instructor == ''}
              onClick={(e) => this.updateCourse()} color="primary" autoFocus>
              Edit Course
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Course */}
        <Dialog
          open={this.state.openCourseModal}
          onClose={this.handleCourseClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Add Course</DialogTitle>
          <DialogContent>
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="name"
              value={this.state.name}
              onChange={this.onChange}
              placeholder="Course Name"
              required
            /><br />
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="desc"
              value={this.state.desc}
              onChange={this.onChange}
              placeholder="Description"
              required
            /><br />
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="instructor"
              value={this.state.instructor}
              onChange={this.onChange}
              placeholder="Instructor"
              required
            /><br /><br />
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleCourseClose} color="primary">
              Cancel
            </Button>
            <Button
              disabled={this.state.name == '' || this.state.desc == '' || this.state.instructor == ''}
              onClick={(e) => this.addCourse()} color="primary" autoFocus>
              Add Course
            </Button>
          </DialogActions>
        </Dialog>

        <br />

        <TableContainer>
          <TextField
            id="standard-basic"
            type="search"
            autoComplete="off"
            name="search"
            value={this.state.search}
            onChange={this.onChange}
            placeholder="Search by course name"
            required
          />
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Name</TableCell>
                <TableCell align="center">Description</TableCell>
                <TableCell align="center">Instructor</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.courses.map((row) => (
                <TableRow key={row._id}>
                  <TableCell align="center" component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell align="center">{row.desc}</TableCell>
                  <TableCell align="center">{row.instructor}</TableCell>
                  <TableCell align="center">
                    <Button
                      className="button_style"
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => this.handleCourseEditOpen(row)}
                    >
                      Edit
                    </Button>
                    <Button
                      className="button_style"
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={() => this.deleteCourse(row._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <br />
          <Pagination count={this.state.pages} page={this.state.page} onChange={this.pageChange} color="primary" />
        </TableContainer>

      </div>
    );
  }
}

export default withRouter(Dashboard);
