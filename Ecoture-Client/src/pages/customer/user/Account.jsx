import { useContext, useEffect, useState } from 'react';
import http from 'utils/http';

import { Box, Typography } from '@mui/material';

import LoadingContainer from 'components/LoadingScreen';
import AccountSidePanel from 'components/customer/user/AccountSidePanel';
import MembershipTab from 'components/customer/user/MembershipTab';
import ProfileTab from 'components/customer/user/ProfileTab';
import SecurityTab from 'components/customer/user/SecurityTab';

import UserContext from 'contexts/UserContext';

const Account = () => {
  const { user, setUser } = useContext(UserContext);
  const [selected, setSelected] = useState('Profile');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    http
      .get('/user')
      .then((res) => {
        console.log(res.data);
        const { mfaMethods, user } = res.data;
        const fetchUser = { ...user, mfaMethods };
        localStorage.setItem('user', JSON.stringify(fetchUser));
        setUser(fetchUser);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [setUser]);

  return (
    <>
      <LoadingContainer
        loading={loading}
        message="Please wait, data is being loaded..."
      />
      {!loading && (
        <Box sx={{ backgroundColor: '#f4f4f4', padding: 5, minHeight: '100%' }}>
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
