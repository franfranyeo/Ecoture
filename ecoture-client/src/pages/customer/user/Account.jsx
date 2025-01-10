import React, { useContext, useEffect, useState } from 'react';
import { Typography, Box } from '@mui/material';
import UserContext from 'contexts/UserContext';
import Profile from '../../../components/user/Profile';
import Membership from '../../../components/user/Membership';
import LoadingContainer from '../../../components/LoadingScreen';
import AccountSidePanel from 'components/user/AccountSidePanel';

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
                        {selected === 'Profile' && <Profile user={user} />}
                        {selected === 'Membership' && <Membership />}
                    </Box>
                </Box>
            )}
        </>
    );
};

export default Account;
