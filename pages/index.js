import React, { useState } from "react";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { saveAs } from "file-saver";
import DynamicFormGenerator from "@/components/FormGenerator";

let PizZipUtils = null;
if (typeof window !== "undefined") {
  import("pizzip/utils/index.js").then(function (r) {
    PizZipUtils = r;
  });
}

function loadFile(url, callback) {
  PizZipUtils.getBinaryContent(url, callback);
}

export default function Home() {
  // Phone number pattern for Indian numbers
  const phoneNumberPattern = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
  const [suppliers, setSuppliers] = useState([
    {
      Supplier_Contact_Name: "",
      Supplier_Email_Address: "",
      Supplier_Phone_Number: "",
      Supplier_Title: "",
    },
  ]);
  const [file, setFile] = useState();
  const [resources, setResources] = useState([
    {
      Resource_Designation: "",
      Resource_Name: "",
    },
  ]);

  const [formData, setFormData] = useState({
    Product_Name: "",
    Sequence_Number: null,
    Country: "",
    Customer_Location: "",
    Company_Name: "",
    Start_Date: new Date(),
    End_Date: new Date(),
    Supplier_Name: "",
    suppliers: [],
    resources: [],
  });

  // Handler function to update state when input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (event) => {
    formData.resources = resources;
    formData.suppliers = suppliers;
    setFile(event.target.files[0]);
  };

  const generateDocument = (file) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      const InspectModule = require("docxtemplater/js/inspect-module");
      const iModule = InspectModule();

      const content = event.target.result;
      var zip = new PizZip(content);
      var doc = new Docxtemplater(zip, {
        modules: [iModule],
        delimiters: {
          start: "<",
          end: ">",
        },
      });

      var tags = iModule.getAllTags();
      console.log(tags);

      // Replace the following with your actual data
      doc.setData(formData);

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

      saveAs(out, "output.docx");
    };

    reader.readAsArrayBuffer(file);
  };

  // Handler function to update supplier details
  const handleSupplierChange = (index, name, value) => {
    const newSuppliers = [...suppliers];
    newSuppliers[index] = {
      ...newSuppliers[index],
      [name]: value,
    };
    setSuppliers(newSuppliers);
  };
  const handleResourcesChange = (index, name, value) => {
    const newResources = [...resources];
    newResources[index] = {
      ...newResources[index],
      [name]: value,
    };
    setResources(newResources);
  };

  // Handler function to add a new supplier
  const addSupplier = (e) => {
    e.preventDefault();
    setSuppliers([
      ...suppliers,
      {
        Supplier_Contact_Name: "",
        Supplier_Email_Address: "",
        Supplier_Phone_Number: "",
        Supplier_Title: "",
      },
    ]);
  };
  const addResource = (e) => {
    e.preventDefault();
    setResources([
      ...resources,
      {
        Resource_Designation: "",
        Resource_Name: "",
      },
    ]);
  };
  console.log(resources);
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent the default form submission

    // Perform form validation
    if (
      !formData.Product_Name ||
      !formData.Company_Name ||
      formData.Sequence_Number === null ||
      !formData.Customer_Name ||
      !formData.Country ||
      !formData.Customer_Location ||
      !formData.Supplier_Name ||
      suppliers.some(
        (supplier) =>
          !supplier.Supplier_Contact_Name ||
          !supplier.Supplier_Email_Address ||
          !supplier.Supplier_Email_Address.includes("@") ||
          !supplier.Supplier_Phone_Number.match(phoneNumberPattern) ||
          !supplier.Supplier_Title
      ) ||
      resources.some(
        (resource) => !resource.Resource_Designation || !resource.Resource_Name
      )
    ) {
      alert("Please fill in all required fields with valid data.");
      return;
    }

    if (file) {
      generateDocument(file);
    } else {
      alert("File Not Chosen");
    }
  };
  return (
    <div className="mt-8 max-w-xl mx-auto px-8">
      <h1 className="text-center">
        <span className="block text-xl text-gray-600 leading-tight">
          Welcome to this Website
        </span>
        <span className="block text-5xl font-bold leading-none">
          Word Docx Generator From Template
        </span>
      </h1>
      <div className="p-10">
        <span className="block text-md text-gray-600 leading-tight">
          Certain Criteria's for templates
          <ul>
            <li>
              The placeholder should have a start delimiter as &lt; and end
              delimiter as &gt; For Example - &lt;name&gt;
            </li>
            <li className="flex flex-col">
              The placeholders should not have a space{" "}
              <span> ✖ &lt;first name&gt;</span>{" "}
              <span>✔ &lt;first_name&gt;</span>
            </li>
            <li className="flex flex-col">
              For tables , add a table name with a hash &lt;#table_name&gt; then
              add all the table coloums as normal placeholders and at the last
              coloum add &lt;/&gt;
              <span>
                ✔ &lt;#employess&gt; &lt;first_name&gt; &lt;last_name&gt;
                &lt;/&gt;
              </span>
            </li>
          </ul>
        </span>
      </div>
      <div className="mt-12 p-3 text-center">
        <label
          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          for="file_input"
        >
          Upload file
        </label>
        <input
          class="block p-2 w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          id="file_input"
          type="file"
          onChange={handleFileChange}
          required
        />
      </div>
      {/* { formData!== undefined && <DynamicFormGenerator data={formData} />} */}

      <form class="max-w-md mx-auto">
        <div class="relative z-0 w-full mb-5 group">
          <input
            type="text"
            name="Product_Name"
            id="Product_Name"
            class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" "
            required
            value={formData.Product_Name}
            onChange={handleInputChange}
          />
          <label
            htmlFor="Product_Name"
            class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Product Name
          </label>
        </div>
        <div class="relative z-0 w-full mb-5 group">
          <input
            type="text"
            name="Company_Name"
            id="Company_Name"
            class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" "
            required
            value={formData.Company_Name}
            onChange={handleInputChange}
          />
          <label
            htmlFor="Company_Name"
            class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Company Name
          </label>
        </div>
        <div class="relative z-0 w-full mb-5 group">
          <input
            type="number"
            name="Sequence_Number"
            id="Sequence_Number"
            class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" "
            required
            value={formData.Sequence_Number}
            onChange={handleInputChange}
          />
          <label
            htmlFor="Sequence_Number"
            class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Sequence Number
          </label>
        </div>
        <div class="grid md:grid-cols-1 md:gap-6">
          <div class="relative z-0 w-full mb-5 group">
            <input
              type="text"
              name="Customer_Name"
              id="Customer_Name"
              class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              required
              value={formData.Customer_Name}
              onChange={handleInputChange}
            />
            <label
              htmlFor="Customer_Name"
              class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Customer Name
            </label>
          </div>
          <div class="relative z-0 w-full mb-5 group">
            <input
              type="text"
              name="Country"
              id="Country"
              class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              required
              value={formData.Country}
              onChange={handleInputChange}
            />
            <label
              htmlFor="Country"
              class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Country
            </label>
          </div>
          <div class="relative z-0 w-full mb-5 group">
            <input
              type="text"
              name="Customer_Location"
              id="Customer_Location"
              class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              required
              value={formData.Customer_Location}
              onChange={handleInputChange}
            />
            <label
              htmlFor="Customer_Location"
              class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Customer Location
            </label>
          </div>
        </div>
        <div class="grid md:grid-cols-1 md:gap-6">
          <div class="relative z-0 w-full mb-5 group">
            <input
              type="text"
              // pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
              name="Supplier_Name"
              id="Supplier_Name"
              class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              required
              value={formData.Supplier_Name}
              onChange={handleInputChange}
            />
            <label
              htmlFor="Supplier_Name"
              class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Supplier Name
            </label>
          </div>
          <div class="relative z-0 w-full mb-5 group">
            <input
              type="date"
              name="End_Date"
              id="End_Date"
              class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              required
              value={formData.End_Date}
              onChange={handleInputChange}
            />
            <label
              htmlFor="End_Date"
              class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              End Date
            </label>
          </div>
          <div class="relative z-0 w-full mb-5 group">
            <input
              type="date"
              name="Start_Date"
              id="Start_Date"
              class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              required
              value={formData.Start_Date}
              onChange={handleInputChange}
            />
            <label
              htmlFor="Start_Date"
              class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Start Date
            </label>
          </div>
          <div>
            {suppliers.map((supplier, index) => (
              <div key={index}>
                {/* Input for Supplier Contact Name */}
                <div class="relative z-0 w-full mb-5 group">
                  <input
                    type="text"
                    class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    value={supplier.Supplier_Contact_Name}
                    onChange={(e) =>
                      handleSupplierChange(
                        index,
                        "Supplier_Contact_Name",
                        e.target.value
                      )
                    }
                  />
                  <label class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                    Supplier Contact Name:
                  </label>
                </div>

                {/* Input for Supplier Email Address */}
                <div class="relative z-0 w-full mb-5 group">
                  <input
                    class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    type="email"
                    value={supplier.Supplier_Email_Address}
                    onChange={(e) =>
                      handleSupplierChange(
                        index,
                        "Supplier_Email_Address",
                        e.target.value
                      )
                    }
                  />
                  <label class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                    Supplier Email Address:
                  </label>
                </div>

                {/* Input for Supplier Phone Number */}
                <div class="relative z-0 w-full mb-5 group">
                  <input
                    class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    type="tel"
                    value={supplier.Supplier_Phone_Number}
                    pattern="[0-9]{3}[0-9]{3}[0-9]{4}"
                    onChange={(e) =>
                      handleSupplierChange(
                        index,
                        "Supplier_Phone_Number",
                        e.target.value
                      )
                    }
                  />
                  <label class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                    Supplier Phone Number:
                  </label>
                </div>

                {/* Input for Supplier Title */}
                <div class="relative z-0 w-full mb-5 group">
                  <input
                    class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    type="text"
                    value={supplier.Supplier_Title}
                    onChange={(e) =>
                      handleSupplierChange(
                        index,
                        "Supplier_Title",
                        e.target.value
                      )
                    }
                  />
                  <label class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                    Supplier Title:
                  </label>
                </div>
              </div>
            ))}

            {/* Button to add a new supplier */}

            <button
              type="button"
              class="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
              onClick={(e) => addSupplier(e)}
            >
              Add Supplier
            </button>

            {/* Display the current state for testing purposes */}
            <pre>{JSON.stringify(suppliers, null, 2)}</pre>
          </div>
          <div>
            {resources.map((resources, index) => (
              <div key={index}>
                {/* Input for Supplier Contact Name */}
                <div class="relative z-0 w-full mb-5 group">
                  <input
                    type="text"
                    class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    value={resources.Resource_Designation}
                    onChange={(e) =>
                      handleResourcesChange(
                        index,
                        "Resource_Designation",
                        e.target.value
                      )
                    }
                  />
                  <label class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                    Resource Designation:
                  </label>
                </div>

                <div class="relative z-0 w-full mb-5 group">
                  <input
                    class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    type="text"
                    value={resources.Resource_Name}
                    onChange={(e) =>
                      handleResourcesChange(
                        index,
                        "Resource_Name",
                        e.target.value
                      )
                    }
                  />
                  <label class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                    Resource Name:
                  </label>
                </div>
              </div>
            ))}

            <button
              type="button"
              class="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
              onClick={(e) => addResource(e)}
            >
              Add Resource
            </button>

            <pre>{JSON.stringify(resources, null, 2)}</pre>
          </div>
        </div>
        <button
          className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg px-6 py-4 leading-tight"
          onClick={(e) => handleSubmit(e)}
          type="submit"
        >
          Generate document
        </button>
      </form>
    </div>
  );
}
