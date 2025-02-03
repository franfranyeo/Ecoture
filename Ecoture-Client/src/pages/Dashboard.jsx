import React from 'react';

function Dashboard({ activeSection, setActiveSection }) {
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
        </div>
    );
}

export default Dashboard;
