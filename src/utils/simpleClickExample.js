const experimentClick = async () => {
    const result = await extensionSDK.serverProxy(
      'https://hack.looker.com:19999/api/4.0/login',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        body:
          'client_id=X&client_secret=X',
      }
    )
    console.log({ result })
    const connections = await extensionSDK.fetchProxy(
      'https://hack.looker.com:19999/api/4.0/connections',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${result.body.access_token}`,
        },
      }
    )
    console.log({ connections })
  }