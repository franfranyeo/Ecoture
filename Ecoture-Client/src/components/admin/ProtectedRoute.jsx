import React from 'react';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import UserContext from 'contexts/UserContext';
import AdminLayout from './AdminLayout';
import NotFound from '../../pages/NotFound';

const ADMIN_ROLE = [0, 1]; // Adjust to your backend role mapping

const ProtectedRoute = ({ element: Component, ...rest }) => {
    const { user } = useContext(UserContext);

    if (!user) {
        return <div>Loading user...</div>;
    }

    if (!ADMIN_ROLE.includes(user.role)) {
        return <NotFound />;
    }

    return (
        <AdminLayout>
            <Component {...rest} />
        </AdminLayout>
    );
};

export default ProtectedRoute;
