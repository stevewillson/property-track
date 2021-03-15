import React from 'react';
import '../../assets/App.css';
import ProcessFile from '../ProcessFile/ProcessFile';

const inputStyle = {
  display: 'none'
}

const PropertyTrackBody = () => {

  return (
    <React.Fragment>
      <h2>Instructions</h2>
      <ol>
        <li>Download a GCSS-A Hand Receipt (either a Primary Hand Receipt or Sub Hand Receipt).</li>
        <input 
          type="file" 
          id="importDataFile"
          style={inputStyle}
        />
        <li>Click the "Select and Process PDF" button to select the PDF and generate an Excel Property Tracker.</li>
        <ProcessFile />
      </ol>
      <p>Note: If a Sub Hand Receipt does not process, you may need to digitally sign the SHR and retry.</p>
    </React.Fragment>
  );
};

export default PropertyTrackBody;
