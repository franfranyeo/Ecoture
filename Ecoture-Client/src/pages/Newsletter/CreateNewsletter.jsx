import React, { useEffect, useRef, useState } from 'react';
import EmailEditor from 'react-email-editor';
import http from 'utils/http';

import { Box, Button, Typography } from '@mui/material';

// Axios instance for API requests

function CreateNewsletter() {
  const emailEditorRef = useRef(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [contents, setContents] = useState([]);

  useEffect(() => {
    http
      .get('/Content')
      .then((res) => {
        setContents(res.data);
      })
      .catch((err) => {
        console.error('Error fetching contents:', err);
      });
  }, []);

  const handleEditorReady = () => {
    if (!emailEditorRef.current || !emailEditorRef.current.editor) {
      console.error('🚨 Editor is not initialized yet.');
      return;
    }

    console.log('✅ Editor is Ready');

    // Your Custom HTML Email Template
    const customHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #2E86C1; text-align: center; }
              .content { padding: 20px; background: #f4f4f4; }
            </style>
          </head>
          <body>
            <h1>Welcome to Our Newsletter</h1>
            <div class="content">
              <p>This is a fully preloaded custom HTML email template.</p>
              <img src="https://via.placeholder.com/600x200" width="100%" />
            </div>
          </body>
          </html>
        `;

    setTimeout(() => {
      try {
        emailEditorRef.current.editor.setContent(customHTML);
        console.log('🎉 Custom HTML Loaded Successfully!');
      } catch (error) {
        console.error('🚨 Error Injecting HTML:', error);
      }
    }, 1000);
  };

  // ✅ Save Newsletter Content
  const handleSaveNewsletter = () => {
    if (!isEditorReady || !emailEditorRef.current) {
      console.error('🚨 Editor is not ready, cannot save.');
      return;
    }

    emailEditorRef.current.editor.exportHtml((data) => {
      const { design, html } = data;

      // Send to backend API
      http
        .post('/Newsletter', {
          Title: 'My Newsletter',
          EmailBody: html,
          DesignJson: design, // Save design JSON for future edits
        })
        .then((res) => {
          console.log('✅ Newsletter saved successfully:', res.data);
        })
        .catch((err) => {
          console.error('🚨 Error saving newsletter:', err);
        });
    });
  };

  return (
    <Box sx={{ padding: '20px', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ marginBottom: '20px' }}>
        Create Newsletter
      </Typography>

      {/* ✅ Ensure onReady callback is used */}
      <EmailEditor ref={emailEditorRef} onLoad={handleEditorReady} />

      {/* ✅ Save Button */}
      <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: '20px' }}
        onClick={handleSaveNewsletter}
      >
        Save Newsletter
      </Button>
    </Box>
  );
}

export default CreateNewsletter;
