import React, { useContext, useEffect, useState } from 'react';
import { Typography, Box } from '@mui/material';
import UserContext from 'contexts/UserContext';
import ProfileTab from 'components/customer/user/ProfileTab';
import MembershipTab from 'components/customer/user/MembershipTab';
import LoadingContainer from 'components/LoadingScreen';
import AccountSidePanel from 'components/customer/user/AccountSidePanel';
import SecurityTab from 'components/customer/user/SecurityTab';

const Account = () => {
    const { user, setUser } = useContext(UserContext);
    const [selected, setSelected] = useState('Profile');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setLoading(false);
        }
    }, [user]);

    return (
        <>
            <LoadingContainer
                loading={loading}
                message="Please wait, data is being loaded..."
            />
            {!loading && (
                <Box sx={{ backgroundColor: '#f4f4f4', padding: 5 }}>
                    <Typography variant="h4" gutterBottom>
                        Account
                    </Typography>
                    <Box sx={{ flex: 1, display: 'flex', gap: 5 }}>
                        <AccountSidePanel
                            user={user}
                            selected={selected}
                            setSelected={setSelected}
                        />
                        {selected === 'Profile' && <ProfileTab user={user} />}
                        {selected === 'Membership' && <MembershipTab />}
                        {selected === 'Security' && <SecurityTab />}
                    </Box>
                </Box>
            )}
        </>
    );
};

export default Account;
