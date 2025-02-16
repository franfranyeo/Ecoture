import { useRef } from 'react';
import EmailEditor from 'react-email-editor';
import sampleDesign from './sampleDesign.json';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

function CreateNewsletter() {
  const navigate = useNavigate();
  const emailEditorRef = useRef(null);

  const handleEditorReady = () => {
    console.log('Email editor ready. Loaded design JSON:', sampleDesign);

    setTimeout(() => {
      if (emailEditorRef.current?.editor) {
        emailEditorRef.current.editor.loadDesign(sampleDesign, () => {
          console.log('Design loaded successfully!');
        });
      } else {
        console.error('Editor instance is not available.');
      }
    }, 1000);
  };

  return (
    <div>
      {/* <Button onClick={() => {
        emailEditorRef.current.editor?.saveDesign((design) => {
          console.log('saveDesign', design);
          alert('Design JSON has been logged in your developer console.');
        });
      }}>
        Print JSON
      </Button> */}
      <EmailEditor
        ref={emailEditorRef}
        onReady={handleEditorReady}
        minHeight={700}
        options={{
          customFonts: [
            {
              name: 'Open Sans',
              url: 'https://fonts.googleapis.com/css?family=Open+Sans',
              family: 'Open Sans, sans-serif'
            },
            {
              name: 'Lobster',
              url: 'https://fonts.googleapis.com/css?family=Lobster',
              family: 'Lobster, cursive'
            }
          ]
        }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('/addnewsletter')}
        style={{ marginTop: '16px' }}
      >
        Add Newsletter
      </Button>
    </div>
  );
}

export default CreateNewsletter;
