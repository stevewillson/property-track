import React from 'react';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import { processShr } from './helperFunctions';

const ProcessFile = () => {

  const processData = async () => {
    try {
      const importFile = document.getElementById("importDataFile").files[0];
      const fileContents = await readFile(importFile);
      
      parsePDF(fileContents).then(pdfData => {
        debugger
        let csvData = processShr(pdfData);
        exportData(csvData);
      });
      
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

  const parsePDF = (inputData) => {
    //pdfjs.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';
    let loadingTask = pdfjsLib.getDocument(inputData);
    return loadingTask.promise.then(function(pdf) {
      // use *pdf* here
      var maxPages = pdf._pdfInfo.numPages;
      var pageTextPromises = []; // collecting all page promises
      for (var j = 1; j <= maxPages; j++) {
        var page = pdf.getPage(j);
        pageTextPromises.push(page.then(function(page) { // add page promise
          var textContent = page.getTextContent();
          return textContent.then(function(page){ // return content promise
            return page // value for page text
          });
        }));
      }
      // Wait for all pages and sum counts
      
      return Promise.all(pageTextPromises).then(function (pageText) {
        var allPageTextItems = [];
        pageText.forEach(function aggregatePages(pageTextCont) {
          pageTextCont.items.forEach(function aggregatePageText(pageTextItems) {
            allPageTextItems.push(pageTextItems);
          });
        });

        // remove double quotes and whitespace before and after text
        var pageTextTrim = allPageTextItems.map(propItem => propItem.str.replace(/("|,)/g,'').trim());

        // remove blank lines from page text
        var pageTextNoBlanks = pageTextTrim.filter(propItem => (propItem !== ""));
        return pageTextNoBlanks;
      });
    });
  }

  const exportData = (data) => {
    const outData = JSON.stringify(data);
    //Download the file as a JSON formatted text file
    var downloadLink = document.createElement("a");
    var blob = new Blob(["\ufeff", outData]);
    var url = URL.createObjectURL(blob);
    downloadLink.href = url;
    const outFileName = 'property_track_output.csv'
    downloadLink.download = outFileName;  //Name the file here
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }


  return (
    <button onClick={() => processData()}>Process PDF</button>
  );
};

export default ProcessFile;