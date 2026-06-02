const getFavicon = (url) => {
  try {
    const domain = new URL(url).hostname;

    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch (error) {
    return "";
  }
};

export default getFavicon;