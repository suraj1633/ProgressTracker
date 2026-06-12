const getFavicon = (url) => {
  try {
    return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(url)}&sz=64`;
  } catch {
    return "";
  }
};

export default getFavicon;
