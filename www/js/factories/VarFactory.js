var varFactory = function(){
  return {
    getVar:getVar,
    setVar:setVar
  };

  function getVar (key) {
    return window.localStorage.getItem(key);
  }

  function setVar (key, value) {
    if (typeof value === "undefined"){
      window.localStorage.removeItem(key);
    } 
    else {
      window.localStorage.setItem(key, value);
    }
  }
};

module.exports = varFactory;