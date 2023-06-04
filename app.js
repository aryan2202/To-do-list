const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistdb");

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your To do list !!",
});
const item2 = new Item({
  name: "Hit the + button to add a new list",
});
const item3 = new Item({
  name: "Hit the checkbox to delete the item",
});

const defaultitems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
name : String,
items : [itemsSchema]
});

const List = mongoose.model("List",listSchema);

app.get("/", function (req, res) {
  Item.find({}).then(function (founditems) {
    if (founditems.length === 0) {
      Item.insertMany(defaultitems).then(function () {
        console.log("successfully saved default items");
        res.redirect("/");
      });
    } else {
      res.render("list", { titlelist: "Today", newitem: founditems });
    }
  });
});

app.get("/:custom_name",function(req,res){
  const customname = _.capitalize(req.params.custom_name);
  List.findOne({name:customname}).then(function(foundlist){
    if(!foundlist){
      //("Doesn't exist")

      const list = new List({
        name : customname,
        items : defaultitems
      });
      list.save();
      res.redirect("/"+ customname);

    }
    else{
      res.render("list", { titlelist: foundlist.name, newitem: foundlist.items });
    }
  });
  
})

app.post("/", function (req, res) {
 const item_name = req.body.addlist;
 const list_name = req.body.list;

 const additem = new Item({
  name: item_name
 })
 if(list_name === "Today")
 {
  additem.save();
  res.redirect("/");
 }
 else
 {
  List.findOne({name:list_name}).then(function(foundlist){
    foundlist.items.push(additem);
    foundlist.save();
    res.redirect("/" + list_name);
  })
 }
 
});

app.post("/delete",function(req,res){
const deleteid = req.body.checkbox;
const listname = req.body.listname;
if(listname === "Today")
{
  Item.findByIdAndRemove(deleteid).then(function(){
    console.log("successfully deleted");
    res.redirect("/");
  })
}
else
{
  List.findOneAndUpdate({name:listname},{$pull:{items : {_id : deleteid}}}).then(function(foundlist){
      res.redirect("/"+listname);
  });
}

});

// app.get("/work", function (req, res) {
//   res.render("list", { titlelist: "Work List", newitem: worklist });
// });

app.listen(3000, function () {
  console.log("server is running on port 3000");
});
