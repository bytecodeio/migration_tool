import {
    ExtensionContext,
    ExtensionContextData
  } from "@looker/extension-sdk-react"
  import React, { useContext } from "react"

 
const GUID = '57d1d41b14134fddcb7c0e322fb57dc2'

// sample environment parameters below

// const url = 'looker.bytecode.io'
// const api_port = '19999'
// const api_version = '4.0'
// const client_id = 'X'
// const client_secret = 'X'

export const authHandler = async (environment) => {
    const extensionContext = useContext(ExtensionContext)
    // Get access to the extension SDK and the looker API SDK.
    const { extensionSDK, core40SDK } = extensionContext
  
    const {url, api_port, api_version, client_id, client_secret} = environment
    // Need to prevent default processing for event from occurring.
    // The button is rendered in a form and default action is to
    // submit the form.
    // event.preventDefault()

    var body = `{client_id:${encodeURIComponent(client_id)}&client_secret:${encodeURIComponent(client_secret)}}`

    try {
      // A more complex use of the fetch proxy. In this case the
      // content type must be included in the headers as the json server
      // will not process it otherwise.
      // Note the that JSON object in the string MUST be converted to
      // a string.
      let response = await extensionSDK.fetchProxy(
        // `https://${subdomain}.${domain}:${api_port}/api/${api_version}/login?client_id=${client_id}&client_secret=${client_secret}`,
        `https://${url}:${api_port}/api/${api_version}/login?client_id='57d1d41b14134fddcb7c0e322fb57dc2'&redirect_uri='https://bytecodeef.looker.com/extensions/migration_tool::migration_tool/external_api/0'`,

        {
          method: 'POST',
          headers: {
            "Content-Type": 'application/x-www-form-urlencoded;charset=UTF-8',
            "Access-Control-Allow-Origin": "*",
    
          
          },
          body: body
        })
      if (response.ok) {
        console.dir(response)
       } else {
        console.error("Failed to create post", response)
      }
    } catch(error) {
      console.error("An unexpected error occured", error)
    }
  }