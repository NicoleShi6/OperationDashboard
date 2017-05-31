/*
 * Copyright 2015 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *   http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// _widge, the order of execcution, postscript->create-.postMixInProperties-.buildRendering ->postCreate. Create Calls the thress methods following it. 



define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/store/Memory",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "esri/opsdashboard/WidgetConfigurationProxy",
  "dojo/text!./ListWidgetConfigTemplate.html",
  "dijit/form/Select"
], function (declare, lang, Memory, _WidgetBase, _TemplatedMixin,_WidgetsInTemplateMixin,  WidgetConfigurationProxy, templateString) {

  return declare("ListWidgetConfig", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, WidgetConfigurationProxy], {
    templateString: templateString,

//-widgetBase defines a standard property called domNode, which will be a reference to the overall parent node of the widget itself. You can always reference to this node programatically if yu need to do sth(like moe around the entire widget in a document), and it is available by the time postCreat method is called.
//getter, setter
// for the field "foo" in your wiget
 //_getFooAttr:function(){/*do sth*/}
 //_setFooAttr:function(value){/*do sth*/}
 //_WidgetBase, when using an sintance of a widget, to just use stand get() and set(), already pre-defined.
 // assume the widget the widget instance is "myWidget"
 //get the value of field "foo", var value =myWidget.get("foo")
 //Set the value of field "foo", myWidget.set("foo", somevalue)
//[widget].postCreate()
// the most important method when creating your own widget. This is fired after all properies of a widget are defined, and the docuemnt fragment representing the widget is created, but before the gragemnt itself is added to the main document... last minuate modification before the widget is presented to the user
    postCreate:function(){
        this.inherited(arguments); 
        this.displayFieldCombo.set("Block", "VitProg");
    },

  //--Called by the host application when the user has changed the selected data source in the data source selector the function will only be invoked if property "configure.requireDataSOurce" and "useDataFromVIew" in the manifest are set to be True
        //dataSourceProxy, the selected data source
        //dataSourceConfig, the associated data source config
        //dataSourceConfig stores the field that select by the operation view publisher during teh configuration
    dataSourceSelectionChanged: function (dataSourceProxy, dataSourceConfig) {

      this.dataSourceConfig = dataSourceConfig;

        //define data varieable for "dojo/store/memory" return objects
      var alphaNumericFields = [];
      dataSourceProxy.fields.forEach(function (field) {
        switch (field.type) {
          case "esriFieldTypeString":
          case "esriFieldTypeSmallInteger":
          case "esriFieldTypeInteger":
          case "esriFieldTypeSingle":
          case "esriFieldTypeDouble":
                //data stored in alphaNumeriFields, get data pushed into "field"
                //var fruits = ["Banana", "Orange", "Apple", "Mango"];
                //fruits.push("Kiwi");
                //result of fruit: ["Banana", "Orange", "Apple", "Mango", "Kiwi"]
            alphaNumericFields.push(field);
            return;
        }
      });

        //"dojo/store/Memory" provide full read and write capabilites in memory data. The memory store provide an array of javascript object. a synchronous store. All function returen results. NO asynchronous callbacks.
        //"dojo/store/Memory" an in-memory object store that queries, modifies,and accesses client-side in-memory data
        // an array will pass to AlphaNumericFieldsStore
        //Properties, property1, "idProperty", name of property to use an the identifier
        //Properties, property2, "data", array of objects, if the store has a collection of cached objects, it can make this availabele in this property. THis in included so an additional alyer could add referential intergrity cleanup on object deletion
        //
      var alphaNumericFieldsStore = new Memory({
          idProperty: "name",
//alphaNumericFields is the array objects that stores the data
          data: alphaNumericFields
      });

      this.displayFieldCombo.set("store", alphaNumericFieldsStore);

      // Bug in select dijit, we need to clear the option on empty stores
      if (alphaNumericFields.length === 0)
        this.displayFieldCombo.containerNode.innerHTML = "";

      // Set previous field saved in config or set to default
      if (dataSourceConfig.displayField)
        this.displayFieldCombo.set("value", dataSourceConfig.displayField);
      else
        this.displayFieldChanged(this.displayFieldCombo.get("value"));
    },

    displayFieldChanged: function (value) {
      this.dataSourceConfig.displayField = value;
      this.validateConfig();
    },

    validateConfig: function () {
      if (!this.dataSourceConfig.displayField || this.dataSourceConfig.displayField === "")
        return this.readyToPersistConfig(false);

      this.readyToPersistConfig(true);
    }

  });
});
