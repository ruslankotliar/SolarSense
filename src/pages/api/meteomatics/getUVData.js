// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

async function auth() {
  const username = "";
  const password = "";
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
      //console.log("token", token);
      return token;
    })
    .catch(function (err) {
      //console.log("something went wrong", err);
      return err;
    });
}

export default async function handler(req, res) {
  const token = await auth();
  //console.log(token);
  const url = `https://api.meteomatics.com/2024-09-28T13:20:00.000+02:00/t_2m:C/48.3226679,16.181831_48.1179069,16.5775132:1024x1024/geotiff?model=mix&access_token=${token}`;

  try {
    const res = await fetch(url);
    console.log(res);
    const data = await res.json();
    console.log(data);
    res.status(200).json({ message: token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
}
