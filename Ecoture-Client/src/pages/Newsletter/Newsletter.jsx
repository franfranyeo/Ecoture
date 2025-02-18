import { useEffect, useState, useRef } from 'react';
import { Box, Card, CardContent, CardActions, Typography, Grid, Button, } from '@mui/material';
import http from 'utils/http';
import EmailEditor from 'react-email-editor';

function Newsletter() {
  const [newsletters, setNewsletters] = useState([]);
  const editorRef = useRef(null);

  const getEmailList = async () => {
    try {
      const res = await http.get('/emaillist');
      return res.data; // Assuming res.data contains an array of email strings
    } catch (error) {
      console.error("Error fetching email list:", error);
      alert("Failed to fetch email list. Please try again.");
      return []; // Return an empty array if there's an error
    }
  };

  const sendEmails = async (id, subject, template) => {
    const recipientEmails = await getEmailList();

    const payload = {
      recipientEmails: recipientEmails,
      subject: subject,
      template: template
    };
  
    await http.post(`/newsletter/send/${id}`, payload)
      .then(async (res) => {
        console.log(res);
        alert("Emails sent!");
      })
      .catch(error => {
        console.error("Error sending emails:", error);
        alert("Failed to send emails. Please try again.");
      });
  };

  // Convert a single JSON design to HTML using the hidden editor
  const convertDesignToHtml = (design) => {
    return new Promise((resolve, reject) => {
      if (!editorRef.current?.editor) {
        return reject(new Error("Editor not ready"));
      }
      editorRef.current.editor.loadDesign(design, () => {
        editorRef.current.editor.exportHtml(({ html }) => {
          resolve(html);
        });
      });
    });
  };

  useEffect(() => {
    let isMounted = true;
    http.get('/newsletter')
      .then(async (res) => {
        const items = res.data;
        // for (const nl of items) {
        //   if (nl.template) {
        //     try {
        //       const design = JSON.parse(nl.template);
        //       const html = await convertDesignToHtml(design);
        //       nl.html = html; 
        //     } catch (err) {
        //       console.error("Error parsing or converting template JSON:", err);
        //     }
        //   }
        // }
        if (isMounted) {
          setNewsletters(items);
        }
      })
      .catch(err => console.error("Error fetching newsletters:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Box sx={{ padding: '16px' }}>
      <Typography variant="h4" gutterBottom>
        Newsletters
      </Typography>

      {/* Hidden email editor for converting JSON -> HTML */}
      <div style={{ display: 'none' }}>
        <EmailEditor ref={editorRef} />
      </div>

      <Grid container spacing={2}>
        {newsletters.map((nl) => (
          <Grid item xs={12} sm={6} md={4} key={nl.issueId}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {nl.issueTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date Sent: {new Date(nl.dateSent).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Category: {nl.newsletterCategory}
                </Typography>

                {nl.html ? (
                  /* Outer container: fixed size, no scrollbars */
                  <div
                    style={{
                      width: '300px',        // Adjust to desired bounding box
                      height: '400px',       // Adjust to desired bounding box
                      overflow: 'hidden',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      margin: '0 auto',      // center horizontally (optional)
                      backgroundColor: '#fff'
                    }}
                  >
                    {/* Inner container: scaled down so it fits in outer container */}
                    <div
                      style={{
                        transform: 'scale(0.5)',         // adjust scale factor
                        transformOrigin: 'top left',
                        width: '600px',                  // must be outer.width / scale
                        height: '800px',                 // must be outer.height / scale
                        pointerEvents: 'none',           // so it doesn’t respond to mouse
                      }}
                      dangerouslySetInnerHTML={{ __html: nl.html }}
                    />
                  </div>
                ) : (
                  <Typography variant="body2" color="gray">
                    No template available.
                  </Typography>
                )}
              </CardContent>

              <CardActions>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    sendEmails(nl.issueId, nl.issueTitle, nl.html);
                  }}>
                  Send
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Newsletter;
