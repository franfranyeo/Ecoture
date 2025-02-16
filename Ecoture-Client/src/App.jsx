import { useEffect, useState } from 'react';
import { useMemo, useRef } from 'react';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import http from 'utils/http';

import { Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { GoogleOAuthProvider } from '@react-oauth/google';

import ChatWidget from './components/ChatWidget';
import ProtectedRoute from './components/admin/ProtectedRoute';
import Navbar from 'components/Navbar';

import UserContext from './contexts/UserContext';

// KEON IMPORTS
import AddProduct from './pages/AddProduct';
import AddAddress from './pages/Checkout/AddAddress';
import AddCreditCard from './pages/Checkout/AddCreditCard';

import Wishlist from './pages/Wishlist';


// AHMED IMPORTS
import Addresses from './pages/Checkout/Addresses';
import Cart from './pages/Checkout/Cart';
import OrderHistory from "./pages/Checkout/OrderHistory";
import RefundRequests from "./pages/Checkout/Refund";
import RefundApproval from "./pages/admin/RefundApproval";
import Choice from './pages/Checkout/Choice';
import Confirmation from './pages/Checkout/Confirmation';
import CreditCards from './pages/Checkout/CreditCards';
import EditAddress from './pages/Checkout/EditAddress';
import EditCreditCard from './pages/Checkout/EditCreditCard';
import MyForm from './pages/Checkout/MyForm';
import CustomerLanding from './pages/CustomerLanding';
import EditProduct from './pages/EditProduct';
import AddEnquiry from './pages/Enquiries/AddEnquiry';
import AddResponse from './pages/Enquiries/AddResponse';
import EnquiriesDashboard from './pages/Enquiries/Dashboard';

// Amelia Imports
import Enquiries from './pages/Enquiries/Enquiries';
import UpdateEnquiry from './pages/Enquiries/UpdateEnquiry';
import AdminChat from './pages/admin/AdminChat';
import CreateNewsletter from './pages/Newsletter/CreateNewsletter';
import SelectContent from './pages/Newsletter/SelectContent';
import ProductDetail from './pages/ProductDetail';
import Products from './pages/Products';

import Reviews from './pages/Reviews';
import Dashboard from './pages/admin/Dashboard';
import StaffDashboard from './pages/admin/products/AdminProducts';
import AdminProducts from './pages/admin/products/AdminProducts';
import AddReward from './pages/admin/rewards/AddReward';
import EditReward from './pages/admin/rewards/EditReward';
import Rewards from './pages/admin/rewards/Rewards';
import ViewReward from './pages/admin/rewards/ViewReward';
import AddUser from './pages/admin/user/AddUser';
import EditUser from './pages/admin/user/EditUser';
import Users from './pages/admin/user/Users';
import ViewUser from './pages/admin/user/ViewUser';
// Fran Imports
import Account from './pages/customer/user/Account';
import ForgotPassword from './pages/customer/user/ForgotPassword';
import Login from './pages/customer/user/Login';
import PrivacyPolicy from './pages/customer/user/PrivacyPolicy';
import Register from './pages/customer/user/Register';
import ResetPassword from './pages/customer/user/ResetPassword';
import TermsOfUse from './pages/customer/user/TermsOfUse';

import './App.css';
import MyTheme from './themes/MyTheme';

function App() {
  // update in the user context too
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isFirstLoad = useRef(true); // tracks first load to avoid API call

  // Retrieve user data from localStorage (if available)
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      if (isFirstLoad.current) {
        isFirstLoad.current = false; // Skip the first load call
        return; // Don't call the API for the first user set
      }

      // Detect if a new login occurred
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser?.userId !== user.userId) {
        isFirstLoad.current = true; // Treat this as a new "first load"
        return; // Skip API call for the new login
      }

      try {
        const updateUser = async () => {
          const updateData = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            mobileNo: user.mobileNo,
            dateofBirth: user.dateofBirth,
            pfpURL: user.pfpURL,
            is2FAEnabled: user.is2FAEnabled,
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified,
            mfaMethods: user.mfaMethods,
          };

          const res = await http.post('/user/edit-profile', updateData);

          if (res.data.user) {
            // Update localStorage with the returned user data
            const updatedUser = {
              ...user,
              ...res.data.user,
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setLoading(false);
          }
        };
        updateUser();
      } catch (err) {
        console.error('Failed to update user profile:', err);
      }
    } else {
      localStorage.removeItem('user');
      isFirstLoad.current = true; // Reset the first load tracker
    }
  }, [user]);

  // Use memoization to avoid unnecessary re-renders
  const value = useMemo(() => ({ user, setUser, loading }), [user]);

  const sharedRoutes = [
    {
      url: '/login',
      component: <Login />,
    },
    {
      url: '/register',
      component: <Register />,
    },
    {
      url: '/reset-password',
      component: <ResetPassword />,
    },
    {
      url: '/forgot-password',
      component: <ForgotPassword />,
    },
    {
      url: '/terms-of-use',
      component: <TermsOfUse />,
    },
    {
      url: '/account',
      component: (
        <Navigate
          to={
            user && user.role == 'Customer'
              ? '/account/profile'
              : '/account/security'
          }
        />
      ),
    },
    {
      url: '/account/:tab',
      component: <Account />,
    },
    {
      url: '/privacy-policy',
      component: <PrivacyPolicy />,
    },
    {
      url: '/unauthorized',
      component: <h1>Unauthorized</h1>,
    },
  ];

  const adminRoutes = [
    {
      url: '/admin/dashboard',
      component: Dashboard,
    },
    {
      url: '/admin/users',
      component: Users,
    },
    {
      url: '/admin/users/:id/view',
      component: ViewUser,
    },
    {
      url: '/admin/users/add',
      component: AddUser,
    },
    {
      url: '/admin/users/:id/edit',
      component: EditUser,
    },
    {
      url: '/admin/rewards',
      component: Rewards,
    },
    {
      url: '/admin/rewards/add',
      component: AddReward,
    },
    {
      url: '/admin/rewards/:id/edit',
      component: EditReward,
    },
    {
      url: '/admin/rewards/:id/view',
      component: ViewReward,
    },
    {
      url: '/admin/products',
      component: AdminProducts,
    },
    {
      url: '/admin/enquiries',
      component: Enquiries,
    },
  ];

  const logout = () => {
    localStorage.clear();
    window.location = '/';
  };
  const isAdmin = user?.role === "Admin";
  const isAdminRoute = window.location.pathname.startsWith("/admin");
  return (
    <GoogleOAuthProvider clientId="455480585598-3f0qgcm01cbr2qp4rm9or035u1g75ur8.apps.googleusercontent.com">
      <UserContext.Provider value={value}>
        <Router>
          <ThemeProvider theme={MyTheme}>
            <ToastContainer />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
              }}
            >
              {/* Navbar is always rendered */}
              <Navbar onLogout={logout} />



              <Routes>
                <Route
                  path="/"
                  element={
                    user?.role == 'Admin' ? (
                      <StaffDashboard />
                    ) : (
                      <CustomerLanding />
                    )
                  }
                />

                {sharedRoutes.map((route, index) => (
                  <Route
                    key={index}
                    path={route.url}
                    element={route.component}
                  />
                ))}
                <Route
                  path="/admin"
                  element={<Navigate to="/admin/dashboard" />}
                />

                {adminRoutes.map((route, index) => (
                  <Route
                    key={index}
                    path={route.url}
                    element={<ProtectedRoute element={route.component} />}
                  />
                ))}

                {/* Keon Product */}
                {/* Category Routes - Products.jsx handles category filtering */}
                <Route path="/category/:categoryName" element={<Products />} />
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
                <Route path="/editproduct/:id" element={<EditProduct />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/reviews/:productId" element={<Reviews />} />
                <Route path="/wishlist" element={<Wishlist />} />

               

                {/* AHMED CODES */}
                <Route path="/addresses" element={<Addresses />} />
                <Route path="/addaddress" element={<AddAddress />} />
                <Route path="/editaddress/:id" element={<EditAddress />} />
                <Route path="/creditcards" element={<CreditCards />} />
                <Route path="/addcreditcard" element={<AddCreditCard />} />
                <Route
                  path="/editcreditcard/:id"
                  element={<EditCreditCard />}
                />
                <Route path="/form" element={<MyForm />} />
                <Route path="/choice" element={<Choice />} />
                <Route path="/confirmation" element={<Confirmation />} />
                <Route path="/order-history" element={<OrderHistory />} />
                <Route path="/refund-requests" element={<RefundRequests />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/admin/refund-approval" element={<ProtectedRoute element={RefundApproval} />} />
                
                {/* Enquiry Management */}
                <Route path="/dashboard" element={<EnquiriesDashboard />} />
                <Route path="/enquiries" element={<Enquiries />} />
                <Route path="/addenquiry" element={<AddEnquiry />} />
                <Route path="/addresponse/:id" element={<AddResponse />} />
                <Route path="/updateenquiry/:id" element={<UpdateEnquiry />} />

                {/* Newsletter Management */}
                <Route
                  path="/createnewsletter"
                  element={<CreateNewsletter />}
                />
                <Route path="/selectcontent" element={<SelectContent />} />

                <Route path="/admin/livechat" element={<ProtectedRoute element={AdminChat} />} />

              </Routes>

              {!isAdmin && !isAdminRoute && <ChatWidget />}
            </Box>
          </ThemeProvider>
        </Router>
      </UserContext.Provider>
    </GoogleOAuthProvider>
  );
}

export default App;
