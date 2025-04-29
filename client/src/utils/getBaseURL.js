const getBaseURL = () => {
    if (import.meta.env.VITE_PROD === 'production') {
      return '/';
    } else return 'http://localhost:3000';
  };
  
export default getBaseURL;