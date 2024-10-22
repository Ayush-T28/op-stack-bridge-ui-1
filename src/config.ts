const getConfig = () => {
    const customization = import.meta.env.VITE_CUSTOMIZATION;
    const parsed = JSON.parse(customization as string);
    return parsed;
};

export default getConfig;