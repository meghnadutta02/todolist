//jshint esversion:6
//PASSWORD FOR ADMIN:iPfW8bn8MGFeT4v5
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _=require('lodash');
mongoose.connect("mongodb+srv://admin-meghna:iPfW8bn8MGFeT4v5@meghna.ak9cczv.mongodb.net/todolistDB");
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const itemSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemSchema);
const one = new Item({
  name: "Buy Groceries"
});
const two = new Item({
  name: "Exercise"
});
const listSchema=new mongoose.Schema({
  name:String,
  items:[itemSchema]
});
const List=mongoose.model("List",listSchema);
const day = date.getDate();
app.get("/", function (req, res) {
  
  Item.find(function(err,results){ //{} means find all as the first argument
    if(err)
    console.log(err);
    else
    {
      // if(results.length===0)
      // {
      //   Item.insertMany([one, two], function (err) {
      //     if (err) console.log(err);
      //     else console.log("Success!");
      //   });
      //   res.redirect("/");
      // }
      //else
      //{
      
      for(var i=0;i<results.length;i++)
      {
        console.log(results[i].name);
      }
      res.render("list", { listTitle: day, newListItems:results });
    //}
  }
  })
  
});

app.post("/", function (req, res) {
  const item = req.body.newItem;
  const btnName=req.body.btnList;
  const listItem=new Item({
    name:item
  });
  
  if(btnName===day)
  {
    listItem.save();
  res.redirect("/");
  }
  else
  {
    List.findOne({name:btnName},function(err,result){
       result.items.push(listItem); //because items is an array
       result.save();
       res.redirect("/"+btnName);
    })
  }
});
app.post("/custom",(req,res)=>{
 var custom=req.body.custom;
 res.redirect("/"+custom);
});
app.post("/delete",(req,res)=>{
  var hide=req.body.hide;
  var del=req.body.checked;
  if(hide===day)
  {
  Item.deleteOne({_id:del},function(err){ //findbyIdandRemove can be used
  if(err) console.log(err);
  else console.log("Successfully deleted");
  res.redirect("/"); 
});
}
else
{
  List.findOneAndUpdate({name:hide},{$pull:{items:{_id:del}}},function(err,results)
  {  //pull deletes a document within an array.splice cannot be used here since the elements are documents(containing name and id) .See mongodb pull documentation.ALWAYS USE PULL TO REMOVE ELEMENTS FROM AN ARRAY OF AN OBJECT
    if(err)
    console.log(err);
    else
    {
      res.redirect("/"+hide);
    }
  });
}
});
// splice(start)
// splice(start, deleteCount)
// splice(start, deleteCount, item1)
// splice(start, deleteCount, item1, item2, itemN)

app.get("/:listName",(req,res)=>{
  const Name=_.capitalize(req.params.listName);
  List.findOne({name:Name},function(err,result){
    if(!err)  //if there's no error
    {
      if(!result)
      {
        const x=new List({
          name:Name,
          
        });
        x.save();
        res.redirect("/"+Name);
      }
      else
      {
        res.render("list",{listTitle:Name,newListItems:result.items});
      }
    }
  })
  
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});
