import { createContext, useEffect, useState, useCallback } from "react";
import http from "../config/AxiosHelper";

export const SiteConfigContext = createContext();

const DEFAULT_CONFIGS = {
    general_website_name: "IT Job Hunt",
    general_company_name: "IT Job Hunt",
    general_support_email: "support@ithunt.com",
    general_contact_number: "",
    general_time_zone: "UTC",
};

export const SiteConfigProvider = ({ children }) => {
    const [configs, setConfigs] = useState(DEFAULT_CONFIGS);
    const [loaded, setLoaded] = useState(false);

    const loadConfigs = useCallback(async () => {
        try {
            const response = await http.get("/public/config");
            setConfigs((prev) => ({
                ...prev,
                ...response.data,
            }));
        } catch (error) {
            console.warn("Failed to load site config, using defaults:", error);
        } finally {
            setLoaded(true);
        }
    }, []);

    useEffect(() => {
        loadConfigs();
    }, [loadConfigs]);

    // Update document title when configs change
    useEffect(() => {
        if (!loaded) return;

        const websiteName = configs.general_website_name || "IT Job Hunt";
        document.title = websiteName;
    }, [configs, loaded]);

    const refreshConfigs = useCallback(() => {
        loadConfigs();
    }, [loadConfigs]);

    const getConfig = useCallback(
        (key) => {
            return configs[key];
        },
        [configs]
    );

    const websiteName = configs.general_website_name || "IT Job Hunt";
    const companyName = configs.general_company_name || "IT Job Hunt";
    const supportEmail = configs.general_support_email || "";
    const contactNumber = configs.general_contact_number || "";
    const timeZone = configs.general_time_zone || "UTC";

    return (
        <SiteConfigContext.Provider
            value={{
                configs,
                loaded,
                refreshConfigs,
                getConfig,
                websiteName,
                companyName,
                supportEmail,
                contactNumber,
                timeZone,
            }}
        >
            {children}
        </SiteConfigContext.Provider>
    );
};
