//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash")
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-marina:marinochka90@cluster0.hr1hl.mongodb.net/todolistDB", {useNewUrlParser: true}, { useUnifiedTopology: true });

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const itemOne = new Item({
  name: "coding"
});
const itemTwo = new Item({
  name: "cooking"
});
const itemThree = new Item({
  name: "cleaning"
})

const defaultItems = [itemOne, itemTwo, itemThree];

const listSchema = {
  name: String,
  listItems: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

// const day = date.getDate();
  Item.find({}, function(err, foundItems) {
    if(foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if(err) {
          console.log(err);
        } else {
          console.log("all done");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems, date: date.getDate()});
    }
  })
});

app.post("/", function(req, res){

  const newItem = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: newItem
  });

  if(listName === "Today") {
    item.save();
    res.redirect("/")
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.listItems.push(item),
      foundList.save();
      res.redirect("/" + listName)
    })
  }
});

app.post("/deleted", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const customListName = req.body.customListName;

  if(customListName === "Today") {
    Item.findByIdAndDelete({_id: checkedItemId}, function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("all done");
        res.redirect("/")
      }
    })
  } else {
    List.findOneAndUpdate({name: customListName}, {$pull: {listItems: {_id: checkedItemId}}}, function(err, foundList) {
      if(!err) {
        res.redirect("/" + customListName);
      }
    })
  }
})

app.get("/:newList", function(req, res) {
  const newList = _.capitalize(req.params.newList);

  List.findOne({name: newList}, function(err, foundList) {
    if(!err) {
      if(!foundList) {
        const list = new List({
          name: newList,
          listItems: defaultItems
        });
        list.save();
        res.redirect("/" + newList)
      } else {
          res.render("list", {
            listTitle: foundList.name,
            newListItems: foundList.listItems,
            date: date.getDate()
          })
        }
      }
    })
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(4000, function() {
  console.log("Server started on port 3000");
});
