import { createContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const UserDataContext = createContext();

export const UserContext = ({children}) => {
    const location = useLocation();

    const [userData, setUserData] = useState(() => {
        const storedUser = localStorage.getItem("userData");

        return storedUser
            ? JSON.parse(storedUser)
            : null;
    });

    const [isCandidate, setIsCandidate] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);


    useEffect(() => {

        setIsAuthenticated(localStorage.getItem("accessToken") !== null && localStorage.getItem("accessToken") !== undefined && localStorage.getItem("accessToken") !== "");

        console.log("isAuthenticated:", isAuthenticated);
        console.log("role:", localStorage.getItem("role"));
        const candidateMode =
            !location.pathname.startsWith("/hire");
        if (candidateMode) {
            console.log("Candidate mode");
        } else {
            console.log("Recruiter mode");
        }
        setIsCandidate(candidateMode);

    }, [location.pathname]);

    useEffect(() => {
        if (userData) {
            localStorage.setItem(
                "userData",
                JSON.stringify(userData)
            );
        } else {
            localStorage.removeItem("userData");
        }
    }, [userData]);


    return (
        <UserDataContext.Provider value={{ userData, setUserData, isCandidate, isAuthenticated }}>
            {children}
        </UserDataContext.Provider>
    );
}