import React from 'react';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import { processShr } from './helperFunctions';
import { processPhr } from './helperFunctions';
import XLSX from 'xlsx';

const ProcessFile = () => {

  const processData = async () => {
    try {
      const importFile = document.getElementById("importDataFile").files[0];
      const fileContents = await readFile(importFile);

      // try to read the contents of the file
      const pdfData = await parsePDF(fileContents);

      let jsonData = '';
      let textContent = pdfData.textContent;
      let annotText = pdfData.annotContent;
      // check to see if the parsed PDF text includes 'Sub Hand Receipt'
      if (textContent.includes('Sub Hand Receipt')){
        jsonData = processShr(textContent);
        exportToXlsx(jsonData.items, 'property_track.xlsx');
      // check to see if the parsed PDF text includes 'Primary Hand Receipt'
      } else if (textContent.includes('Primary Hand Receipt')) {
          // also get the annotations for the pdf

          jsonData = processPhr(textContent, annotText);
          exportToXlsx(jsonData.items, 'property_track.xlsx');
      }      
    } catch (e) {
      console.log(e.message);
    }
  };

  // read the binary contents of the file
  const readFile = file => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onerror = () => {
        reader.abort();
        reject(new DOMException('Problem parsing input file.'));
      };
      reader.onload = readerEvent => {
        resolve(new Uint8Array(readerEvent.target.result)); // this is the content!        
      }
      reader.readAsArrayBuffer(file);
    });
  };

  const parsePDF = async (inputData) => {
    // first, try to extract annotations from the PDF, then extract the text content
    //pdfjs.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';
    let loadingTask = await pdfjsLib.getDocument({
      data: inputData
    });
    const results = await loadingTask.promise;
    // use *pdf* here
    var maxPages = results._pdfInfo.numPages;
    var allPageTextItems = [];
    var allPageAnnotItems = [];
      
    for (var j = 1; j <= maxPages; j++) {
      var page = await results.getPage(j);
      const textContent = await page.getTextContent();
      const annotContent = await page.getAnnotations();
      allPageTextItems.push(...textContent.items);
      allPageAnnotItems.push(...annotContent);
    }

    // remove double quotes and whitespace before and after text
    var pageTextTrim = allPageTextItems.map(propItem => propItem.str.replace(/("|,)/g,'').trim());

    // remove blank lines from page text
    var pageTextNoBlanks = pageTextTrim.filter(propItem => (propItem !== ""));

    // remove double quotes and whitespace before and after text
    var valsOfInterest = allPageAnnotItems.map(el => { 
      return {
        "alternativeText": el.alternativeText,
        "fieldName": el.fieldName,
        "fieldValue": el.fieldValue
      };
    });
    var noNullVals = valsOfInterest.filter(el => el.fieldValue != null);
    var pageAnnotTrim = noNullVals.map(item => {
      return {
        "fieldValue": item.fieldValue.replace(/("|,)/g,'').trim(),
        "fieldName": item.fieldName,
        "alternativeText": item.alternativeText,
      };
    });

    // remove blank lines from page text
    var pageAnnotNoBlanks = pageAnnotTrim.filter(propItem => (propItem.fieldValue !== ""));

    return {"textContent": pageTextNoBlanks, "annotContent": pageAnnotNoBlanks};
  };

  const exportToXlsx = (content, fileName) => {
    /* add to workbook */
    let wb = XLSX.utils.book_new();      
    let ws = XLSX.utils.json_to_sheet(content);
    XLSX.utils.book_append_sheet(wb, ws, 'Property Tracker');

    /* write workbook */
    XLSX.writeFile(wb, fileName);
  };

  return (
    <button onClick={() => processData()}>Process PDF</button>
  );
};

export default ProcessFile;