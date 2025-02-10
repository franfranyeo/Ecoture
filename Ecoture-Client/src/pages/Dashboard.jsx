import React from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard({ activeSection, setActiveSection }) {
    const navigate = useNavigate();

    return (
        <div>
            <div
                style={{
                    color: 'white',
                    padding: '20px',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                }}
            >
                DASHBOARD
            </div>

            {/* Single Product Management Section */}
            <div
                className={`dashboard-item ${activeSection === 'Product Management' ? 'active' : ''}`}
                onClick={() => setActiveSection('Product Management')}
            >
                Product Management
            </div>

            {/* Add Enquiry Section */}
            <div
                className={`dashboard-item ${activeSection === 'Add Enquiry' ? 'active' : ''}`}
                onClick={() => {
                    setActiveSection('Add Enquiry');
                    navigate('/addenquiry'); // Navigate to Add Enquiry page
                }}
            >
                Add Enquiry
            </div>

            {/* View Enquiry Section */}
            <div
                className={`dashboard-item ${activeSection === 'View Enquiry' ? 'active' : ''}`}
                onClick={() => {
                    setActiveSection('View Enquiry');
                    navigate('/enquiries'); // Navigate to View Enquiries page
                }}
            >
                View Enquiry
            </div>
        </div>
    );
}

export default Dashboard;
