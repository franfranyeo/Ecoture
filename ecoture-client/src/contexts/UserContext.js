import { createContext } from "react"

const UserContext = createContext({
    user: null,
    setUser: null,
    refreshMembership: null,
    refreshUser: null,
})

export default UserContext
