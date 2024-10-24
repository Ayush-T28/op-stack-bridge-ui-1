const customization = import.meta.env.VITE_CUSTOMIZATION;
const parsed = JSON.parse(customization as string);

const getConfig = {
    ...parsed,
    backendUrl: 'http://localhost:3009'
};

export default getConfig;