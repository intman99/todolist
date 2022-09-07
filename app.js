const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://DavidZoike:jfadWBfP08jNYbR6@todolist.7udmlz9.mongodb.net/todolistDB")

const itemsSchema = new mongoose.Schema({
  name: String
})

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todoList"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<-- Hit this delete an item"
});

const defaultItems = [item1, item2, item3];


const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, results) {
    if (err) {
      console.log(err)
    } else if (results.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err)
        } else {
          console.log("Insert confirmed!")
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today" ,
        newListItems: results
      });
    }
  });
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save()
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    })
  }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox
  const listName = req.body.listName

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("Id found and remove confirmed!")
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName)
      }
    })
  }
});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName)

  List.findOne({
    name: customListName
  }, function(err, usedList) {
    if (!usedList) {
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save()
      res.redirect("/" + customListName);
    } else {
      res.render("list", {
        listTitle: usedList.name,
        newListItems: usedList.items
      });
    }
  });



});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(process.env.PORT);

app.listen(3001, function() {
  console.log("Server started on port 3000");
});
