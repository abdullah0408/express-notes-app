import express from "express";
const app = express();
import fs from "fs";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  fs.readdir("./notes", (err, files) => {
    if (err) {
      return res.send(`Error: ${err}`);
    }
    const notesData = [];
    // let filesRead = 0;  // Counter to track how many files have been read

    // // If no files exist, render immediately
    if (files.length === 0) {
        return res.render('index', { files: notesData });
    }

    // files.forEach((file) => {
    //     fs.readFile(`./notes/${file}`, 'utf8', (err, content) => {
    //         if (err) {
    //             return res.send(`Error reading file: ${file}`);
    //         }

    //         // Push file name and first 100 characters of content to notesData
    //         notesData.push({
    //             fileName: file,
    //             content: content.substring(0, 100) // Limit to 100 characters for preview
    //         });

    //         filesRead++;  // Increment the counter after each file is read

    //         // Check if all files have been read
    //         if (filesRead === files.length) {
    //             res.render('index', { files: notesData });
    //         }
    //     });
    // });
    const fileReadPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        fs.readFile(`./notes/${file}`, "utf8", (err, content) => {
          if (err) {
            return reject(err);
          }

          resolve({
            fileName: file,
            content: content.substring(0, 50), // Limit to 100 characters for preview
          });
        });
      });
    });

    Promise.all(fileReadPromises)
      .then((notesData) => {
        res.render("index", { files: notesData.reverse() });
      })
      .catch((err) => {
        res.send(`Error: ${err}`);
      });
  });
});

app.get("/edit/:fileName", (req, res) => {
    fs.readFile(`./notes/${req.params.fileName}`, "utf8", function (err, data) {
        const first = req.params.fileName.slice(0, 19);
        res.render("edit", { content: data, fileName: req.params.fileName });
    });
})

app.post("/edit/:fileName", (req, res) => {
    const first = req.params.fileName.slice(0, 19);
    fs.rename(`./notes/${req.body.previousTitle}`, `./notes/${first}${req.body.newTitle}.txt`, (err) => {
        if (err) {
            res.send(`Error: ${err}`);
        } else {
            fs.writeFile(`./notes/${first}${req.body.newTitle}.txt`, req.body.newdetails, (err) => {
                if (err) {
                    res.send(`Error: ${err}`);
                } else {
                    res.redirect("/");
                }
            })
        }
    })
})

app.get("/delete/:fileName", (req, res) => {
    fs.unlink(`./notes/${req.params.fileName}`, (err) => {
        if (err) {
            res.send(`Error: ${err}`);
        } else {
            res.redirect("/");
        }
    });
})

app.post("/create", (req, res) => {
  const title = req.body.title.replace(" ", "-7-98-");
  const timestamp = new Date().toISOString().replace(/:/g, "-").split(".")[0]; // Format: YYYY-MM-DDTHH-MM-SS
  fs.writeFile(`./notes/${timestamp}${title}.txt`, req.body.details, (err) => {
    if (err) {
      res.send(`Error: ${err}`);
    } else {
      res.redirect("/");
    }
  });
}); 

app.get("/files/:fileName", (req, res) => {
    fs.readFile(`./notes/${req.params.fileName}`, "utf8", function (err, data) {
        res.render("show", { content: data, fileName: req.params.fileName });
    });
});
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log("Server is running on port 3000");
});

//         // Use Promise to handle asynchronous file reading
//         Promise.all(
//             files.map(file => {
//                 return new Promise((resolve, reject) => {
//                     fs.readFile(`./notes/${file}`, 'utf8', (err, content) => {
//                         if (err) {
//                             reject(err);
//                         } else {
//                             // Push an object containing the file name and content
//                             notesData.push({
//                                 fileName: file,
//                                 content: content.substring(0, 100) // Limit to 100 characters for preview
//                             });
//                             resolve();
//                         }
//                     });
//                 });
//             })
//         ).then(() => {
//             // After all files are read, render the page
//             res.render('index', { files: notesData });
//         }).catch(err => {
//             res.send(`Error: ${err}`);
//         });
//     });
// });
