import { createContext } from 'react';

const UserContext = createContext({
  user: null,
  setUser: () => {},
  loading: true,
  // refreshMembership: null,
  // refreshUser: null,
});

export default UserContext;
