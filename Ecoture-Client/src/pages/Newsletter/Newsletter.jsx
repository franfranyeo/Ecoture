import { useEffect, useState, useRef } from 'react';
import { Box, Card, CardContent, Typography, Grid, Button } from '@mui/material';
import http from 'utils/http';
import EmailEditor from 'react-email-editor';

function Newsletter() {
    const [newsletters, setNewsletters] = useState([]);
    const [loading, setLoading] = useState(false);
    const editorRef = useRef(null);

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
                for (const nl of items) {
                    if (nl.template) {
                        try {
                            const design = JSON.parse(nl.template);
                            const html = await convertDesignToHtml(design);
                            nl.html = html;
                        } catch (err) {
                            console.error("Error parsing or converting template JSON:", err);
                        }
                    }
                }
                if (isMounted) {
                    setNewsletters(items);
                }
            })
            .catch(err => console.error("Error fetching newsletters:", err));

        return () => {
            isMounted = false;
        };
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";  
        const date = new Date(dateString);
        return isNaN(date) ? "Invalid Date" : date.toLocaleDateString();
    };

    const sendNewsletter = async (newsletter) => {
        try {
            setLoading(true);
    
            // Fetch all emails from email list
            const emailListResponse = await http.get('/emaillist');
            const emailList = emailListResponse.data;
    
            if (!emailList.length) {
                alert("No emails found in the email list.");
                setLoading(false);
                return;
            }
    
            const payload = emailList; 

            await http.post(`/newsletter/send/${newsletter.issueId}`, payload);
    
            alert("Newsletter sent successfully!");
        } catch (error) {
            console.error("Error sending newsletter:", error);
            alert("Failed to send newsletter.");
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <Box sx={{ padding: '16px' }}>
            <Typography variant="h4" gutterBottom>
                Newsletters
            </Typography>

            <div style={{ display: 'none' }}>
                <EmailEditor ref={editorRef} />
            </div>

            <Grid container spacing={2}>
                {newsletters.map((nl) => (
                    <Grid item xs={12} sm={6} md={4} key={nl.issueId}>
                        <Card sx={{ height: '100%', position: 'relative' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {nl.issueTitle}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Date Created: {formatDate(nl.dateCreated)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Category: {nl.newsletterCategory}
                                </Typography>

                                {nl.html ? (
                                    <div
                                        style={{
                                            width: '300px',
                                            height: '400px',
                                            overflow: 'hidden',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            margin: '0 auto',
                                            backgroundColor: '#fff'
                                        }}
                                    >
                                        <div
                                            style={{
                                                transform: 'scale(0.5)',
                                                transformOrigin: 'top left',
                                                width: '800px',
                                                height: '800px',
                                                pointerEvents: 'none',
                                            }}
                                            dangerouslySetInnerHTML={{ __html: nl.html }}
                                        />
                                    </div>
                                ) : (
                                    <Typography variant="body2" color="gray">
                                        No template available.
                                    </Typography>
                                )}

                                {/* Send Newsletter Button */}
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{ mt: 2 }}
                                    onClick={() => sendNewsletter(nl)}
                                    disabled={loading}
                                >
                                    {loading ? "Sending..." : "Send Newsletter"}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default Newsletter;
