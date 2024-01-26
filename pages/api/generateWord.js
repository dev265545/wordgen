
import { saveAs } from "file-saver";

import Docxtemplater from "docxtemplater";
import InspectModule from "docxtemplater/js/inspect-module";

let PizZipUtils = null;
if (typeof window !== "undefined") {
  import("pizzip/utils/index.js").then(function (r) {
    PizZipUtils = r;
  });
}

export default async function handler(req, res) {
  const { file } = req.body;

  // Your existing document generation logic here

  // ...

  // Send the generated document as the response

    const reader = new FileReader();
  
    reader.onload = function (event) {
      const InspectModule = require("docxtemplater/js/inspect-module");
  const iModule = InspectModule();
  
      const content = event.target.result;
      var zip = new PizZip(content);
      var doc = new Docxtemplater(zip,{
        modules: [iModule] ,
          delimiters: {
            start: '<',
            end: '>',
          },
      });
  
    
  var tags = iModule.getAllTags();
  console.log(tags);
  setFormData(tags)
      
      // Replace the following with your actual data
      doc.setData({
        Product_Name: "John",
        Sequence_Number : 123,
        Country : "India"
  
      });
  
      try {
        doc.render();
      } catch (error) {
        // Handle render errors
        console.error("Error rendering document:", error);
        return;
      }
  
      var out = doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
  
     
  };
  res.setHeader("Content-Disposition", "attachment; filename=output.docx");
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
  res.status(200).send(out);
}