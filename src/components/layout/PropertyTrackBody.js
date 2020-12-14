import React from 'react';
import '../../assets/App.css';
import ProcessFile from '../ProcessFile/ProcessFile';

const PropertyTrackBody = () => {

  return (
    <React.Fragment>
      <h2>Instructions</h2>
      <ol>
        <li>Download a GCSS-A Hand Receipt.</li>
        <li><p>Click the "Choose PDF" button and select the hand receipt.</p></li>
        <input 
          type="file" 
          id="importDataFile"
        />
        <li>Click the "Process PDF" button to generate an Excel Property Tracker.</li>
        <ProcessFile />
      </ol>
    </React.Fragment>
  );
};

export default PropertyTrackBody;
