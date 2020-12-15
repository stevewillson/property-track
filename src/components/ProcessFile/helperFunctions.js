

class PropertyItem {
  // propertyinfo contains uic, item, model, sn, location, quantity, date, and notes
  constructor(uic, lin, nsn, nomenclature, ui, oh_qty, sn, date_seen, notes, monthly_cyclic) {
      this.uic = uic;
      this.lin = lin;
      this.nsn = nsn;
      this.nomenclature = nomenclature;
      this.ui = ui;
      this.oh_qty = oh_qty;
      this.sn = sn;
      this.date_seen = date_seen;
      this.notes = notes;
      this.monthly_cyclic = monthly_cyclic;
}

displaySingleSnItems() {
  var singleSnOut = {};
  singleSnOut.count = this.sn.length;
  singleSnOut.items = [];
            
  // if the SN array length is 0, then output the item
  if (this.sn.length === 0) {
    singleSnOut.count = 1;
    singleSnOut.items.push(new PropertyItem(
      this.uic,
      this.lin,
      this.nsn,
      this.nomenclature,
      this.ui,
      this.oh_qty,
      "",
      "",
      "",
      "",
    ))
    return singleSnOut;
  }

  for (let index = 0; index < this.sn.length; index++) {
    singleSnOut.items.push(new PropertyItem(
      this.uic,
      this.lin,
      this.nsn,
      this.nomenclature,
      this.ui,
      1,
      this.sn[index],
      "",
      "",
      "",
    ))
  }
  return singleSnOut;
  }
}

function separateByMPO(textArray) {        
  var mpoArray = [];
  mpoArray[0] = [];
  
  var mpoIndex = 0;
  var firstMPO = true;
            
  textArray.forEach( function(textElement) {
    // if text == MPO then start the MPO object
    // end the object once the next MPO is reached, or the end of the document

    if (textElement === "MPO") {
      if (firstMPO !== true) {
        mpoIndex = mpoIndex + 1;
      }
      firstMPO = false;
      mpoArray[mpoIndex] = [];
    }
    if (firstMPO !== true) {
      mpoArray[mpoIndex].push(textElement);
    }
  })
  return mpoArray;
}

function separateByNSN(mpoElement) {

  var nsnArray = [];
  var nsnIndex = 0;
  var firstNSN = true;

  // NSN + 6 = NSN number
  // NSN Description + 6 = Nomenclature
  // UI + 6 = UI
  // OH Qty + 6 = oh_qty
  // first SysNo + 6 = first_sn
  // if there is no SN, then the next element will be NSN or MPO
  // if the UI is KT, then there is a 'SysNo' field
  var sn_position = false;
  var containsSysNo = false;

  var lin = mpoElement[3].split(" ")[0];
      
  for  ( let index = 0; index < mpoElement.length; index++ ) {
    if (mpoElement[index] === "NSN") {
      if (firstNSN !== true) {
        nsnIndex = nsnIndex + 1;
        // if the current index points to 'NSN' not in a SN block
        sn_position = false;
      }
      firstNSN = false;
      let ui = mpoElement[index + 8];
      nsnArray[nsnIndex] = {
        "lin": lin,
        "nsn": mpoElement[index + 6],
        "nomenclature": mpoElement[index + 7],
        "ui": ui,
        "oh_qty": mpoElement[index + 11],
      }
      if (ui === "KT") {
        containsSysNo = true;
      }
    }

    // look for a SN block
    // SN blocks have 'SysNo SerNo/RegNo/LotNo SysNo SerNo/RegNo/LotNo SysNo SerNo/RegNo/LotNo'
    if (mpoElement[index] === "SysNo") {
      index = index + 6
      sn_position = true;
      nsnArray[nsnIndex].sn = [];
    }

    if (sn_position === true) {
      // if the SNs are spread over two pages
      if (mpoElement[index] === "Sub Hand Receipt") {
        index = index + 20;
        // if on a page boundary and no more SNs, 
        // then continue to see if there is another NSN in the MPO
        if (index > mpoElement.length) {
          continue;
        }
      }
      if (mpoElement[index] === "From") {
        sn_position = false;
        // this is the last item, it is no longer a sn block, but continue to check if there are 
        // more 'NSN' entries in the rest of the MPO entry
        continue; 
      }
      // the SN block contains the 'SysNo' field also, add one to the index to
      // only get the SN, don't include the SysNo
      if (containsSysNo === true) {
        index = index + 1;
      }
      // in a sn block, add the entry to the sn array 
      // expect a SN to not have any spaces
      nsnArray[nsnIndex]["sn"].push(mpoElement[index]);
    }
  }
  return nsnArray
}

function addCyclicDates(jsonIn) {        
  // reverse order of the cyclic numbers to inventory per month
  var cyclicNumbers = [
    "S60290", 
    "S05003", 
    "N00000", 
    "G00000", 
    "B67840", 
    "70224N", 
    "70223N", 
    "70210N", 
    "70209N",
    "000000",
  ]

  var months = [
    "Oct",
    "Sep",
    "Aug",
    "Jul",
    "Jun",
    "May",
    "Apr",
    "Mar",
    "Feb",
    "Jan",   
  ]

  // iterate through the items in the jsonIn array
  for (let index = 0; index < jsonIn.items.length; index++) {
      for (let j = 0; j < cyclicNumbers.length; j++) {
          if (jsonIn.items[index].lin >= cyclicNumbers[j]) {
              jsonIn.items[index].monthly_cyclic = months[j];
              break;
          }
      }
  }
  return jsonIn;
}

export const processShr = (pdfData) => {
  // extract the UIC from the text
  var uicIndex = pdfData.indexOf("UIC:");
  var currentUic = pdfData[uicIndex + 1].split(" ").slice(-1)[0];
  
  // separate property items by MPO
  var mpoArray = separateByMPO(pdfData);

  var nsnArray = [];

  // take an MPO array, then split the MPO array by NSN
  mpoArray.forEach(function(mpoElement) {
    nsnArray.push(...separateByNSN(mpoElement));
  });

  // separate each nsn element
  var propertyItemJson = {
    "count": 0,
    "items": []
  };

  nsnArray.forEach(function createPropertyItems(nsnItem) {
    propertyItemJson.items.push(new PropertyItem(
      currentUic,
      nsnItem.lin,
      nsnItem.nsn,
      nsnItem.nomenclature,
      nsnItem.ui,
      nsnItem.oh_qty,
      nsnItem.sn || "",
      "",
      "",
      "",
    ))
    propertyItemJson.count = propertyItemJson.count + 1;
  })

  // separate items with SNs to multiple lines,
  // 1 line for each SN
  var singlePropItems = {};
  singlePropItems.count = 0;
  singlePropItems.items = [];
  var singleSnOut = {};
  propertyItemJson.items.forEach(function dispBySingleSn(propItem){
    singleSnOut = propItem.displaySingleSnItems()
    singlePropItems.count = singlePropItems.count + singleSnOut.count
    singlePropItems.items = singlePropItems.items.concat(singleSnOut.items); 
  })

  // iterate through the items of the singlePropItems jsonObject
  // add 'monthly_cyclic' information
  var singlePropItemsCyclic = addCyclicDates(singlePropItems);
  return singlePropItemsCyclic;
}
