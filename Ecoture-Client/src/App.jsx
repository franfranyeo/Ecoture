import './App.css';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import MyTheme from './themes/MyTheme';
import Navbar from './pages/Navbar';
import CustomerLanding from './pages/CustomerLanding';
import StaffDashboard from './pages/StaffView';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import ProductDetail from './pages/ProductDetail';
import Reviews from './pages/Reviews'; // Use Reviews.jsx now instead of ProductReviews
import Register from './pages/Register';
import Login from './pages/Login';
import http from './http';
import UserContext from './contexts/UserContext';

// AHMED IMPORTS
import Addresses from './pages/Addresses';
import AddAddress from './pages/AddAddress';
import EditAddress from './pages/EditAddress';
import CreditCards from './pages/CreditCards';
import AddCreditCard from './pages/AddCreditCard';
import EditCreditCard from './pages/EditCreditCard';
import MyForm from './pages/MyForm';
import Choice from './pages/Choice'; // New Page
import Confirmation from './pages/Confirmation'; // New Page

// Amelia Imports
import Enquiries from './pages/Enquiries/Enquiries';
import AddEnquiry from './pages/Enquiries/AddEnquiry';
import AddResponse from './pages/Enquiries/AddResponse';
import UpdateEnquiry from './pages/Enquiries/UpdateEnquiry';
import Dashboard from './pages/Enquiries/Dashboard';

function App() {
    const [user, setUser] = useState(null);

    // Check authentication status on load
    useEffect(() => {
        if (localStorage.getItem('accessToken')) {
            http.get('/user/auth').then((res) => {
                setUser(res.data.user);
            });
        }
    }, []);

    const logout = () => {
        localStorage.clear();
        window.location = '/';
    };

    return (
        <UserContext.Provider value={{ user, setUser }}>
            <Router>
                <ThemeProvider theme={MyTheme}>
                    {/* Navbar is always rendered */}
                    <Navbar onLogout={logout} />

                    {/* Main Content Wrapper */}
                    <div
                        style={{
                            marginTop: '126px', 
                            height: 'calc(100vh - 126px)', 
                            overflowY: 'auto', 
                        }}
                    >
                        <Routes>
                            {/* Default route */}
                            <Route
                                path="/"
                                element={user ? <StaffDashboard /> : <CustomerLanding />}
                            />

                            {/* Add Product */}
                            <Route
                                path="/addproduct"
                                element={
                                    <AddProduct
                                        onAddSuccess={() => {
                                            // Navigate back to StaffDashboard after adding a product
                                            window.location.href = '/';
                                        }}
                                    />
                                }
                            />

                            {/* Edit Product */}
                            <Route path="/editproduct/:id" element={<EditProduct />} />

                            {/* Product Detail */}
                            <Route path="/product/:id" element={<ProductDetail />} />

                            {/* Product Reviews */}
                            <Route path="/reviews/:productId" element={<Reviews />} /> {/* Updated route for reviews */}

                            {/* Register */}
                            <Route path="/register" element={<Register />} />

                            {/* Login */}
                            <Route path="/login" element={<Login />} />

                            {/* AHMED CODES */}
                            <Route path="/addresses" element={<Addresses />} />
                            <Route path="/addaddress" element={<AddAddress />} />
                            <Route path="/editaddress/:id" element={<EditAddress />} />
                            <Route path="/creditcards" element={<CreditCards />} />
                            <Route path="/addcreditcard" element={<AddCreditCard />} />
                            <Route path="/editcreditcard/:id" element={<EditCreditCard />} />
                            <Route path="/form" element={<MyForm />} />
                            <Route path="/choice" element={<Choice />} /> {/* New Route */}
                            <Route path="/confirmation" element={<Confirmation />} /> {/* New Route */}

                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/enquiries" element={<Enquiries />} />
                            <Route path="/addenquiry" element={<AddEnquiry />} />
                            <Route path="/addresponse/:id" element={<AddResponse />} />
                            <Route path="/updateenquiry/:id" element={<UpdateEnquiry />} />

                        </Routes>
                    </div>
                </ThemeProvider>
            </Router>
        </UserContext.Provider>
    );
}

export default App;
