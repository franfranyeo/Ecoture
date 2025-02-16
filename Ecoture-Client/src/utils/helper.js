export const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Get the local date in YYYY-MM-DD format
    return date.toLocaleDateString('en-CA'); // en-CA locale gives YYYY-MM-DD format
};

// Helper function to format date for submission
export const formatDateForSubmission = (dateString) => {
    if (!dateString) return null;
    // Create date at noon UTC to avoid timezone issues
    const date = new Date(dateString + 'T12:00:00Z');
    return date.toISOString();
};
