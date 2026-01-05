var express = require("express");
var app = express();
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var multer = require('multer'),
  bodyParser = require('body-parser'),
  path = require('path');
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/productDB");
var fs = require('fs');
var product = require("./model/product.js");
var user = require("./model/user.js");
var course = require("./model/course.js");

var dir = './uploads';
var upload = multer({
  storage: multer.diskStorage({

    destination: function (req, file, callback) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      callback(null, './uploads');
    },
    filename: function (req, file, callback) { callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); }

  }),

  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname)
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      return callback(/*res.end('Only images are allowed')*/ null, false)
    }
    callback(null, true)
  }
});
app.use(cors());
app.use(express.static('uploads'));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: false
}));

app.use("/", (req, res, next) => {
  try {
    if (req.path == "/login" || req.path == "/register" || req.path == "/") {
      next();
    } else {
      /* decode jwt token if authorized*/
      jwt.verify(req.headers.token, 'shhhhh11111', function (err, decoded) {
        if (decoded && decoded.user) {
          req.user = decoded;
          next();
        } else {
          return res.status(401).json({
            errorMessage: 'User unauthorized!',
            status: false
          });
        }
      })
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
})

app.get("/", (req, res) => {
  res.status(200).json({
    status: true,
    title: 'Apis'
  });
});

/* login api */
app.post("/login", (req, res) => {
  try {
    if (req.body && req.body.email && req.body.password) {
      user.find({ email: req.body.email }, (err, data) => {
        if (data.length > 0) {

          if (bcrypt.compareSync(data[0].password, req.body.password)) {
            checkUserAndGenerateToken(data[0], req, res);
          } else {

            res.status(400).json({
              errorMessage: 'Email or password is incorrect!',
              status: false
            });
          }

        } else {
          res.status(400).json({
            errorMessage: 'Email or password is incorrect!',
            status: false
          });
        }
      });
    } else {
      res.status(400).json({
        errorMessage: 'Email and password are required!',
        status: false
      });
    }
  } catch (e) {
    res.status(500).json({
      errorMessage: 'Internal server error!',
      status: false
    });
  }
});

/* register api */
app.post("/register", (req, res) => {
  try {
    if (req.body && req.body.username && req.body.email && req.body.password) {

      user.find({ $or: [{ username: req.body.username }, { email: req.body.email }] }, (err, data) => {

        if (data.length == 0) {

          let User = new user({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
          });
          User.save((err, data) => {
            if (err) {
              res.status(400).json({
                errorMessage: err,
                status: false
              });
            } else {
              res.status(200).json({
                status: true,
                title: 'Registered Successfully.'
              });
            }
          });

        } else {
          const existingField = data[0].email === req.body.email ? 'Email' : 'Username';
          res.status(400).json({
            errorMessage: `${existingField} already exists!`,
            status: false
          });
        }

      });

    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameters first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

function checkUserAndGenerateToken(data, req, res) {
  jwt.sign({ user: data.username, id: data._id }, 'shhhhh11111', { expiresIn: '1d' }, (err, token) => {
    if (err) {
      res.status(400).json({
        status: false,
        errorMessage: err,
      });
    } else {
      res.json({
        message: 'Login Successfully.',
        token: token,
        status: true
      });
    }
  });
}

/* Api to add Product */
app.post("/add-product", upload.any(), (req, res) => {
  try {
    if (req.files && req.body && req.body.name && req.body.desc && req.body.price &&
      req.body.discount) {

      let new_product = new product();
      new_product.name = req.body.name;
      new_product.desc = req.body.desc;
      new_product.price = req.body.price;
      new_product.image = req.files[0].filename;
      new_product.discount = req.body.discount;
      new_product.user_id = req.user.id;
      new_product.save((err, data) => {
        if (err) {
          res.status(400).json({
            errorMessage: err,
            status: false
          });
        } else {
          res.status(200).json({
            status: true,
            title: 'Product Added successfully.'
          });
        }
      });

    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

/* Api to update Product */
app.post("/update-product", upload.any(), (req, res) => {
  try {
    if (req.files && req.body && req.body.name && req.body.desc && req.body.price &&
      req.body.id && req.body.discount) {

      product.findById(req.body.id, (err, new_product) => {

        // if file already exist than remove it
        if (req.files && req.files[0] && req.files[0].filename && new_product.image) {
          var path = `./uploads/${new_product.image}`;
          fs.unlinkSync(path);
        }

        if (req.files && req.files[0] && req.files[0].filename) {
          new_product.image = req.files[0].filename;
        }
        if (req.body.name) {
          new_product.name = req.body.name;
        }
        if (req.body.desc) {
          new_product.desc = req.body.desc;
        }
        if (req.body.price) {
          new_product.price = req.body.price;
        }
        if (req.body.discount) {
          new_product.discount = req.body.discount;
        }

        new_product.save((err, data) => {
          if (err) {
            res.status(400).json({
              errorMessage: err,
              status: false
            });
          } else {
            res.status(200).json({
              status: true,
              title: 'Product updated.'
            });
          }
        });

      });

    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

/* Api to delete Product */
app.post("/delete-product", (req, res) => {
  try {
    if (req.body && req.body.id) {
      product.findByIdAndUpdate(req.body.id, { is_delete: true }, { new: true }, (err, data) => {
        if (data.is_delete) {
          res.status(200).json({
            status: true,
            title: 'Product deleted.'
          });
        } else {
          res.status(400).json({
            errorMessage: err,
            status: false
          });
        }
      });
    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

/*Api to get and search product with pagination and search by name*/
app.get("/get-product", (req, res) => {
  try {
    var query = {};
    query["$and"] = [];
    query["$and"].push({
      is_delete: false,
      user_id: req.user.id
    });
    if (req.query && req.query.search) {
      query["$and"].push({
        name: { $regex: req.query.search }
      });
    }
    var perPage = 5;
    var page = req.query.page || 1;
    product.find(query, { date: 1, name: 1, id: 1, desc: 1, price: 1, discount: 1, image: 1 })
      .skip((perPage * page) - perPage).limit(perPage)
      .then((data) => {
        product.find(query).count()
          .then((count) => {

            if (data && data.length > 0) {
              res.status(200).json({
                status: true,
                title: 'Product retrived.',
                products: data,
                current_page: page,
                total: count,
                pages: Math.ceil(count / perPage),
              });
            } else {
              res.status(400).json({
                errorMessage: 'There is no product!',
                status: false
              });
            }

          });

      }).catch(err => {
        res.status(400).json({
          errorMessage: err.message || err,
          status: false
        });
      });
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }

});

/* API to Add Course */
app.post("/add-course", upload.none(), (req, res) => {
  try {
    if (req.body && req.body.name && req.body.desc && req.body.instructor) {

      let new_course = new course();
      new_course.name = req.body.name; // Course Name
      new_course.desc = req.body.desc; // Description
      new_course.instructor = req.body.instructor; // Instructor
      new_course.user_id = req.user.id; // User ID
      new_course.save((err, data) => {
        if (err) {
          res.status(400).json({
            errorMessage: err,
            status: false
          });
        } else {
          res.status(200).json({
            status: true,
            title: 'Course Added Successfully',
            course: data
          });
        }
      });

    } else {
      res.status(400).json({
        errorMessage: 'Please provide all required fields: name, description, and instructor.',
        status: false
      });
    }
  } catch (e) {
    res.status(500).json({
      errorMessage: 'Internal Server Error',
      status: false
    });
  }
});

/* API to Delete Course */
app.delete("/delete-course/:id", (req, res) => {
  try {
    course.findByIdAndDelete(req.params.id, (err, data) => {
      if (err) {
        res.status(400).json({
          errorMessage: err,
          status: false
        });
      } else {
        res.status(200).json({
          status: true,
          title: 'Course Deleted Successfully',
          course: data
        });
      }
    });
  } catch (e) {
    res.status(500).json({
      errorMessage: 'Internal Server Error',
      status: false
    });
  }
});

/* API to Update Course */
app.put("/update-course/:id", (req, res) => {
  try {
    if (req.body && req.body.name && req.body.desc && req.body.instructor) {
      course.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        desc: req.body.desc,
        instructor: req.body.instructor
      }, { new: true }, (err, data) => {
        if (err) {
          res.status(400).json({
            errorMessage: err,
            status: false
          });
        } else {
          res.status(200).json({
            status: true,
            title: 'Course Updated Successfully',
            course: data
          });
        }
      });
    } else {
      res.status(400).json({
        errorMessage: 'Please provide all required fields: name, description, and instructor.',
        status: false
      });
    }
  } catch (e) {
    res.status(500).json({
      errorMessage: 'Internal Server Error',
      status: false
    });
  }
});

/* API to Get All Courses */
app.get("/get-courses", (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Number of courses per page
    const skip = (page - 1) * limit;

    const search = req.query.search ? { name: { $regex: req.query.search, $options: "i" } } : {};

    course.find(search).skip(skip).limit(limit).exec((err, data) => {
      if (err) {
        res.status(400).json({
          errorMessage: err,
          status: false
        });
      } else {
        course.countDocuments(search, (err, count) => {
          if (err) {
            res.status(400).json({
              errorMessage: err,
              status: false
            });
          } else {
            res.status(200).json({
              status: true,
              courses: data,
              pages: Math.ceil(count / limit)
            });
          }
        });
      }
    });
  } catch (e) {
    res.status(500).json({
      errorMessage: 'Internal Server Error',
      status: false
    });
  }
});

app.listen(2000, () => {
  console.log("Server is Runing On port 2000");
});
