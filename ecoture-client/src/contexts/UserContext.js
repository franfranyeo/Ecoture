import { createContext } from "react"

const UserContext = createContext({
    user: null,
    setUser: null,
    loading: true,
    // refreshMembership: null,
    // refreshUser: null,
})

export default UserContext
