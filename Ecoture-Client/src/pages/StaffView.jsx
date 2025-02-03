import React, { useState } from 'react';
import Dashboard from './Dashboard';
import AddProduct from './AddProduct';
import Products from './Products';

function StaffView() {
    const [activeSection, setActiveSection] = useState('Product Management'); // Default to Product Management
    const [isAddingProduct, setIsAddingProduct] = useState(false); // To toggle Add Product form

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Navbar placeholder */}
            <div style={{ height: '60px', width: '100%' }}></div>

            {/* Main Layout */}
            <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
                {/* Sidebar */}
                <div className="dashboard">
                    <Dashboard activeSection={activeSection} setActiveSection={setActiveSection} />
                </div>

                {/* Main Content */}
                <div
                    style={{
                        marginLeft: '240px', // Align content to the right of the sidebar
                        padding: '20px',
                        flexGrow: 1,
                        backgroundColor: '#fff',
                    }}
                >
                    {/* Render Product Management */}
                    {activeSection === 'Product Management' && (
                        <>
                            {!isAddingProduct ? (
                                <>
                                    <h1
                                        style={{
                                            color: '#2c3e50',
                                            fontSize: '32px',
                                            fontWeight: 'bold',
                                            marginBottom: '16px',
                                            textAlign: 'left', // Align heading to the left
                                        }}
                                    >
                                        Product Management
                                    </h1>
                                    <Products
                                        onAddProductClick={() => setIsAddingProduct(true)}
                                    />
                                </>
                            ) : (
                                <>
                                    <h1
                                        style={{
                                            color: '#2c3e50',
                                            fontSize: '32px',
                                            marginBottom: '20px',
                                        }}
                                    >
                                        Add Product
                                    </h1>
                                    <button
                                        style={{
                                            backgroundColor: '#f44336',
                                            color: 'white',
                                            padding: '10px 20px',
                                            marginBottom: '20px',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => setIsAddingProduct(false)}
                                    >
                                        Back to Product Management
                                    </button>
                                    <AddProduct /> {/* Render Add Product form */}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StaffView;
