import React from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import http from 'utils/http';

const validationSchema = Yup.object({
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    subject: Yup.string()
        .min(5, 'Subject must be at least 5 characters')
        .required('Subject is required'),
    message: Yup.string()
        .min(10, 'Message must be at least 10 characters')
        .required('Message is required')
});

function AddEnquiry() {
    const navigate = useNavigate();
    const initialValues = {
        email: '',
        subject: '',
        message: ''
    };

    const handleSubmit = (values, { resetForm }) => {
        const newEnquiry = {
            email: values.email,
            subject: values.subject,
            message: values.message
        };
        http.post('/Enquiry', newEnquiry).then(() => {
            alert('Enquiry added successfully!');
            navigate('/enquiries');
        });
        resetForm();
    };

    return (
        <Box sx={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
            <Typography variant="h4" gutterBottom>
                Add Enquiry
            </Typography>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ errors, touched, isSubmitting }) => (
                    <Form>
                        <Box sx={{ marginBottom: '20px' }}>
                            <Field
                                as={TextField}
                                name="email"
                                label="Email"
                                fullWidth
                                margin="normal"
                                variant="outlined"
                                error={touched.email && Boolean(errors.email)}
                                helperText={touched.email && errors.email}
                            />
                        </Box>
                        <Box sx={{ marginBottom: '20px' }}>
                            <Field
                                as={TextField}
                                name="subject"
                                label="Subject"
                                fullWidth
                                margin="normal"
                                variant="outlined"
                                error={
                                    touched.subject && Boolean(errors.subject)
                                }
                                helperText={touched.subject && errors.subject}
                            />
                        </Box>
                        <Box sx={{ marginBottom: '20px' }}>
                            <Field
                                as={TextField}
                                name="message"
                                label="Message"
                                fullWidth
                                multiline
                                rows={4}
                                margin="normal"
                                variant="outlined"
                                error={
                                    touched.message && Boolean(errors.message)
                                }
                                helperText={touched.message && errors.message}
                            />
                        </Box>

                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '10px'
                            }}
                        >
                            <Button
                                type="submit"
                                variant="outlined"
                                color="primary"
                                sx={{
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    borderColor: 'green',
                                    color: 'black',
                                    ':hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                        borderColor: 'black'
                                    }
                                }}
                                disabled={isSubmitting}
                            >
                                Submit
                            </Button>
                            <Button
                                type="button"
                                variant="outlined"
                                color="primary"
                                sx={{
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    borderColor: 'black',
                                    color: 'red',
                                    ':hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                        borderColor: 'black'
                                    }
                                }}
                                onClick={() => navigate('/')}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </Form>
                )}
            </Formik>
        </Box>
    );
}

export default AddEnquiry;
