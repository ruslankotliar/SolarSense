async function authMeteometics() {
    const username = process.env.METEOMATIC_USERNAME;
    const password = process.env.METEOMATIC_PASSWORD;
    
    let headers = new Headers();
    headers.set("Authorization", "Basic " + btoa(username + ":" + password));
  
    return await fetch("https://login.meteomatics.com/api/v1/token", {
      method: "GET",
      headers: headers,
    })
      .then(function (resp) {
        return resp.json();
      })
      .then(function (data) {
        var token = data.access_token;
        return token;
      })
      .catch(function (err) {
        return err;
      });
  }

  export default authMeteometics;