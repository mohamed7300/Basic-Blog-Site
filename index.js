import express from "express";
import * as fs from 'node:fs';
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";



const app = express();
const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

let postsTitlesArray = [];

// boiler plate to be inserted inside newly created pages
const boilerPlate1 = "<%- include(\"../partials/header.ejs\") %><div class=\"d-flex justify-content-center mt-3\"> <div class=\"text-center\"><form action=\"/edit\" method=\"post\"><h1 name=\"posttitle\" id=\"post\">";
const boilerPlate2 = "</h1><p name=\"postbody\">";
const boilerPlate3 = "</p>   <input type=\"text\" hidden id=\"hiddenInput\" name=\"hiddenIn\"><textarea name=\"postTextArea\" hidden id=\"postTextArea\"></textarea> <input type=\"submit\" name=\"editButton\" value=\"Edit or Delete\" class=\"btn btn-primary\"/> </form></div></div><script>    document.getElementById(\"hiddenInput\").value = document.getElementsByTagName(\"h1\")[0].innerText;  document.getElementById(\"postTextArea\").value = document.getElementsByTagName(\"p\")[0].innerText;</script><%- include(\"../partials/footer.ejs\") %>";
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.post("/edit", (req, res) => {
    let postTitle = req.body.hiddenIn;

    let postBody = req.body.postTextArea;

    res.render("edit.ejs", { postTitle: postTitle, postBody: postBody });
});
// route handler for creating posts
app.post("/createpost", (req, res) => {


    let posttitle = req.body.posttitle;
    postsTitlesArray.push(posttitle);

    let postBody = req.body.postbody;
    res.render("index.ejs", { postsTitlesArray: postsTitlesArray });
    fs.writeFile(__dirname + "/views/posts/" + posttitle + '.ejs', `${boilerPlate1} ${posttitle} ${boilerPlate2} ${postBody} ${boilerPlate3}`, function (err) {
        if (err) throw err;
        console.log('Saved!');
    });

});
// route handler when clicking on the home link on the navbar
app.get("/createpost", (req, res) => {

    res.render("index.ejs", { postsTitlesArray: postsTitlesArray });


});

// to display post page when clicked in the homepage
app.get("/posts/*", (req, res) => {
    let path = decodeURIComponent(__dirname + "/views/" + req.path);
    res.render(path);

});

// update or delete the post page according to the button clicked update or delete
app.post("/updateordelete", (req, res) => {

    let postTitle = req.body.posttitle;
    let postBody = req.body.postbody;
    let fileName = req.body.fileName;
    if (req.body.timeToDelete) {

        const index = postsTitlesArray.indexOf(req.body.posttitle);
        if (index > -1) {
            postsTitlesArray.splice(index, 1);
            fs.unlink(__dirname + "/views/posts/" + fileName + '.ejs', (err) => {
                if (err) throw err;
                console.log('Deleted!');
            });
        }

    }
    else {

        fs.writeFile(__dirname + "/views/posts/" + fileName + '.ejs', `${boilerPlate1} ${postTitle} ${boilerPlate2} ${postBody} ${boilerPlate3}`, function (err) {
            if (err) throw err;
            console.log('Updated!');
        });
    }
    // go to the homepage after updating or deleting
    res.render("index.ejs", { postsTitlesArray: postsTitlesArray });
});


app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});